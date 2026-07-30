import os
import random
import requests
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date, datetime

try:
    from .model_loader import model, encoder
    from .schemas import CropInput, UserRegister, SendOTPRequest, VerifyOTPRequest
    from .farm_schema import Farm
    from .irrigation_report_schema import IrrigationReport
    from .auth import CurrentUser, create_access_token, get_current_user
    from .database.models import save_prediction, register_user, store_otp, verify_otp, create_farm, get_farm_by_id, get_farms_by_user, get_irrigation_report_by_date, save_irrigation_report
    from .database import connection
    from irrigation.irrigation_service import IrrigationService
except ImportError:
    from model_loader import model, encoder
    from schemas import CropInput, UserRegister, SendOTPRequest, VerifyOTPRequest
    from farm_schema import Farm
    from irrigation_report_schema import IrrigationReport
    from auth import CurrentUser, create_access_token, get_current_user
    from database.models import save_prediction, register_user, store_otp, verify_otp, create_farm, get_farm_by_id, get_farms_by_user, get_irrigation_report_by_date, save_irrigation_report
    from database import connection
    from irrigation.irrigation_service import IrrigationService

router = APIRouter()


@router.get("/farm/{farm_id}/irrigation/report", response_model=IrrigationReport)
def get_irrigation_report(
    farm_id: str,
    report_date: date = Query(default_factory=date.today),
    current_user: CurrentUser = Depends(get_current_user)
):
    farm = get_farm_by_id(farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.get("user_id") != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this farm")

    report = get_irrigation_report_by_date(farm_id, report_date.isoformat())
    if not report:
        raise HTTPException(
            status_code=404,
            detail=f"No irrigation report found for date {report_date.isoformat()}",
        )

    report.pop("_id", None)
    return report


@router.get("/farm/{farm_id}/irrigation", response_model=IrrigationReport)
def get_irrigation_plan(
    farm_id: str,
    report_date: date = Query(default_factory=date.today),
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

    report_date_value = report_date.isoformat()
    saved_report = get_irrigation_report_by_date(farm_id, report_date_value)
    if saved_report:
        saved_report.pop("_id", None)
        return saved_report

    # No report exists for this date, so generate the irrigation and NDVI analysis once.
    result = IrrigationService.generate_irrigation_plan(farm_id)

    if result.get("success") is False:
        raise HTTPException(
            status_code=404,
            detail=result["message"]
        )

    report = IrrigationReport(
        farm_id=farm_id,
        report_date=report_date_value,
        crop_name=result["crop_name"],
        location=result["location"],
        weather=result["weather"],
        satellite=result["satellite"],
        soil_moisture=result["soil_moisture"],
        water_requirement=result["water_requirement"],
        recommendation=result["recommendation"],
    )
    save_irrigation_report(report.model_dump())
    return report


@router.post("/farm/{farm_id}/irrigation/report", status_code=201)
def create_irrigation_report(
    farm_id: str,
    report: IrrigationReport,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Store a complete irrigation report for a farm owned by the caller."""
    if report.farm_id != farm_id:
        raise HTTPException(
            status_code=400,
            detail="The farm_id in the request body must match the URL farm_id.",
        )

    farm = get_farm_by_id(farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.get("user_id") != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not have access to this farm")

    existing_report = get_irrigation_report_by_date(
        farm_id,
        report.report_date,
    )
    if existing_report:
        return {
            "message": "Irrigation report already exists for this date",
            "report_id": existing_report["_id"],
        }

    result = save_irrigation_report(report.model_dump())
    return {
        "message": "Irrigation report created successfully",
        "report_id": str(result.inserted_id),
    }

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
