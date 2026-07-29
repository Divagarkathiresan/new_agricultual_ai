import os
import sys
import random
import requests
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from datetime import date, datetime
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent / "satellite"))
from ndvi import generate_ndvi

try:
    from .model_loader import model, encoder
    from .schemas import CropInput, UserRegister, SendOTPRequest, VerifyOTPRequest
    from .farm_schema import Farm
    from .auth import CurrentUser, create_access_token, get_current_user
    from .database.models import save_prediction, register_user, store_otp, verify_otp, create_farm, get_farm_by_id, save_satellite_report
    from .database import connection
except ImportError:
    from model_loader import model, encoder
    from schemas import CropInput, UserRegister, SendOTPRequest, VerifyOTPRequest
    from farm_schema import Farm
    from auth import CurrentUser, create_access_token, get_current_user
    from database.models import save_prediction, register_user, store_otp, verify_otp, create_farm, get_farm_by_id, save_satellite_report
    from database import connection

router = APIRouter()


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

    return {
        "recommended_crop": crop[0]
    }


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

    # OTP verification is the application's login step.
    user = connection.users_collection.find_one({"phone": data.phone})
    user_id = user.get("uid", data.phone) if user else data.phone
    if user:
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


@router.post("/farm")
def add_farm(data: Farm, current_user: CurrentUser = Depends(get_current_user)):
    farm = data.model_dump()
    farm["user_id"] = current_user.user_id
    result = create_farm(farm)
    return {"message": "Farm created successfully", "farm_id": str(result.inserted_id)}


@router.post("/farm/{farm_id}/ndvi")
def run_ndvi(farm_id: str, current_user: CurrentUser = Depends(get_current_user)):
    farm = get_farm_by_id(farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.get("user_id") != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this farm")

    latitude = farm["location"]["latitude"]
    longitude = farm["location"]["longitude"]

    result = generate_ndvi(latitude, longitude)
    if not result:
        raise HTTPException(status_code=500, detail="No satellite image found for this location")

    recommendation_map = {
        "Excellent": "Crop is healthy. Continue current practices.",
        "Good": "Crop is doing well. Monitor for any changes.",
        "Moderate": "Crop health is moderate. Consider additional fertilization.",
        "Critical": "Crop health is critical. Immediate attention required."
    }

    report = {
        "farm_id": farm_id,
        "image_date": datetime.utcnow().isoformat(),
        "average_ndvi": result["average_ndvi"],
        "health_score": result["health_score"],
        "healthy_area": result["healthy_area"],
        "status": result["status"],
        "ndvi_image_url": result["ndvi_image_url"],
        "recommendation": recommendation_map.get(result["status"], ""),
        "created_at": datetime.utcnow().isoformat()
    }

    save_satellite_report(report)

    report.pop("_id", None)
    return report
