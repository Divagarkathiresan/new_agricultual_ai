import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = None
users_collection = None
predictions_collection = None
otp_collection = None
farms_collection = None
satellite_reports_collection = None

def connect():
    global client, users_collection, predictions_collection, otp_collection, farms_collection, satellite_reports_collection
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    users_collection = db["users"]
    predictions_collection = db["predictions"]
    otp_collection = db["otp_collection"]
    farms_collection = db["farms"]
    satellite_reports_collection = db["satellite_reports"]