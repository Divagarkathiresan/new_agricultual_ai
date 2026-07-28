from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
from pathlib import Path

try:
    from .routes import router
    from .database import connection as db_conn
    from .database.connection import connect
except ImportError:
    from routes import router
    import database.connection as db_conn
    from database.connection import connect

app = FastAPI(
    title="Smart Agriculture Advisory API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
def startup():
    try:
        connect()
        db_conn.client.admin.command("ping")
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

    # cred_path = Path(__file__).resolve().parent.parent / "firebase_service_account.json"
    # cred = credentials.Certificate(str(cred_path))
    # firebase_admin.initialize_app(cred)
    # print("✅ Firebase initialized successfully")


@app.get("/")
def home():

    return {
        "message": "Smart Agriculture Advisory API is Running"
    }
