"""MongoDB document schema for consolidated irrigation reports."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Weather(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    rain_probability: float


class Satellite(BaseModel):
    average_ndvi: float
    health_score: int
    healthy_area: float
    status: str
    satellite_image_url: str
    ndvi_image_url: str
    recommendation: str


class SoilMoisture(BaseModel):
    soil_moisture_score: int
    soil_moisture_level: str


class WaterRequirement(BaseModel):
    crop: str
    farm_area: float
    unit: str
    water_requirement_mm_per_day: float
    water_required_liters: float


class Recommendation(BaseModel):
    irrigation_status: str
    recommendation: str
    best_irrigation_time: str
    soil_moisture_level: str
    soil_moisture_score: int
    estimated_water_required_liters: float
    estimated_water_saved_liters: float
    generated_at: datetime


class IrrigationReport(BaseModel):
    """Document stored in MongoDB's irrigation_reports collection."""

    farm_id: str
    report_date: str
    crop_name: str
    location: dict
    weather: Weather
    satellite: Satellite
    soil_moisture: SoilMoisture
    water_requirement: WaterRequirement
    recommendation: Recommendation
    crop_day: Optional[int] = None
    crop_stage: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
