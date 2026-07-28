from . import connection
from datetime import datetime, timedelta

def save_prediction(data):
    return connection.predictions_collection.insert_one(data)

def register_user(data):
    return connection.users_collection.insert_one(data)

def store_otp(phone: str, otp: str):
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    connection.otp_collection.replace_one(
        {"phone": phone},
        {"phone": phone, "otp": otp, "expires_at": expires_at.isoformat()},
        upsert=True
    )

def verify_otp(phone: str, otp: str):
    record = connection.otp_collection.find_one({"phone": phone})
    if not record:
        return "not_found"
    if datetime.utcnow() > datetime.fromisoformat(record["expires_at"]):
        return "expired"
    if record["otp"] != otp:
        return "invalid"
    return "success"

def create_farm(data: dict):
    return connection.farms_collection.insert_one(data)

def get_farm_by_id(farm_id: str):
    from bson import ObjectId
    return connection.farms_collection.find_one({"_id": ObjectId(farm_id)})

def save_satellite_report(data: dict):
    return connection.satellite_reports_collection.insert_one(data)