import joblib
import numpy as np
from pathlib import Path

_saved = Path(__file__).resolve().parent.parent.parent / "backend" / "saved_models"

model = joblib.load(_saved / "crop_model.pkl")
encoder = joblib.load(_saved / "label_encoder.pkl")

sample = np.array([[90, 42, 43, 20.8, 82, 6.5, 202]])

prediction = model.predict(sample)

crop = encoder.inverse_transform(prediction)

print("Recommended Crop :", crop[0])
