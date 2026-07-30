import os
import random
import requests
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from datetime import date, datetime

try:
    from .model_loader import model, encoder
    from .schemas import CropInput, UserRegister, SendOTPRequest, VerifyOTPRequest
    from .farm_schema import Farm
    from .auth import CurrentUser, create_access_token, get_current_user
    from .database.models import save_prediction, register_user, store_otp, verify_otp, create_farm, get_farm_by_id, get_farms_by_user, save_satellite_report
    from .database import connection
    from irrigation.irrigation_service import IrrigationService
except ImportError:
    from model_loader import model, encoder
    from schemas import CropInput, UserRegister, SendOTPRequest, VerifyOTPRequest
    from farm_schema import Farm
    from auth import CurrentUser, create_access_token, get_current_user
    from database.models import save_prediction, register_user, store_otp, verify_otp, create_farm, get_farm_by_id, get_farms_by_user, save_satellite_report
    from database import connection
    from irrigation.irrigation_service import IrrigationService

router = APIRouter()


@router.get("/farm/{farm_id}/irrigation")
def get_irrigation_plan(
    farm_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):

    # Check whether the farm exists
    farm = get_farm_by_id(farm_id)

    if not farm:
        raise HTTPException(
            status_code=404,
            detail="Farm not found"
        )

    # Ensure the logged-in user owns this farm
    if farm.get("user_id") != current_user.user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this farm"
        )

    # This also generates the NDVI/satellite analysis, so it is calculated once.
    result = IrrigationService.generate_irrigation_plan(farm_id)

    if result.get("success") is False:
        raise HTTPException(
            status_code=404,
            detail=result["message"]
        )

    satellite = result["satellite"]
    report = {
        "farm_id": farm_id,
        "image_date": datetime.utcnow().isoformat(),
        "average_ndvi": satellite["average_ndvi"],
        "health_score": satellite["health_score"],
        "healthy_area": satellite["healthy_area"],
        "status": satellite["status"],
        "satellite_image_url": satellite["satellite_image_url"],
        "ndvi_image_url": satellite["ndvi_image_url"],
        "recommendation": satellite["recommendation"],
        "created_at": datetime.utcnow().isoformat(),
    }
    save_satellite_report(report)

    return result

@router.post("/predict")
def predict_crop(data: CropInput, current_user: CurrentUser = Depends(get_current_user)):

    sample = pd.DataFrame({
        "N": [data.N],
        "P": [data.P],
        "K": [data.K],
        "temperature": [data.temperature],
        "humidity": [data.humidity],
        "ph": [data.ph],
        "rainfall": [data.rainfall]
    })

    prediction = model.predict(sample)
    crop = encoder.inverse_transform(prediction)

    prediction_data = {
        "user_id": current_user.user_id,
        "phone": data.phone,
        "N": data.N,
        "P": data.P,
        "K": data.K,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "ph": data.ph,
        "rainfall": data.rainfall,
        "recommended_crop": crop[0]
    }

    save_prediction(prediction_data)

    return {"recommended_crop": crop[0]}


@router.post("/register")
def register(data: UserRegister, current_user: CurrentUser = Depends(get_current_user)):
    if data.uid != current_user.user_id:
        raise HTTPException(status_code=403, detail="You can only register your own user ID")
    user = {
        "uid": data.uid,
        "phone": data.phone,
        "name": data.name,
        "created_at": str(date.today())
    }
    register_user(user)
    return {"message": "User registered successfully"}


@router.post("/auth/send-otp")
def send_otp(data: SendOTPRequest):
    otp = str(random.randint(100000, 999999))

    api_key = os.getenv("FAST2SMS_API_KEY")

    response = requests.post(
        "https://www.fast2sms.com/dev/bulkV2",
        headers={"authorization": api_key},
        json={
            "message": otp,
            "route": "q",
            "numbers": data.phone
        }
    )

    if response.status_code != 200 or not response.json().get("return"):
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    store_otp(data.phone, otp)

    return {"success": True, "message": "OTP sent successfully"}


@router.post("/auth/verify-otp")
def check_otp(data: VerifyOTPRequest):
    result = verify_otp(data.phone, data.otp)

    if result == "not_found":
        raise HTTPException(status_code=404, detail="Phone number not found")
    if result == "expired":
        raise HTTPException(status_code=410, detail="OTP has expired")
    if result == "invalid":
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user = connection.users_collection.find_one({"phone": data.phone})
    if not user or not user.get("uid"):
        raise HTTPException(status_code=404, detail="User not registered")

    user_id = str(user["_id"])
    connection.users_collection.update_one(
        {"_id": user["_id"]}, {"$set": {"last_login": datetime.utcnow()}}
    )

    return {
        "success": True,
        "message": "OTP verified successfully",
        "userId": user_id,
        "access_token": create_access_token(user_id),
        "token_type": "bearer",
    }


@router.get("/farms")
def get_user_farms(current_user: CurrentUser = Depends(get_current_user)):
    farms = get_farms_by_user(current_user.user_id)
    return {"farms": farms}


@router.post("/farm")
def add_farm(data: Farm, current_user: CurrentUser = Depends(get_current_user)):
    farm = data.model_dump()
    farm["user_id"] = current_user.user_id
    result = create_farm(farm)
    return {"message": "Farm created successfully", "farm_id": str(result.inserted_id)}
