import joblib
from pathlib import Path

_saved = Path(__file__).resolve().parent.parent / "saved_models"

model = joblib.load(_saved / "crop_model.pkl")
encoder = joblib.load(_saved / "label_encoder.pkl")