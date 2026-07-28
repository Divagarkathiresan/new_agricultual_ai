from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Location(BaseModel):
    latitude: float
    longitude: float


class Area(BaseModel):
    value: float
    unit: str = "acre"


class Farm(BaseModel):
    user_id: str

    farm_name: str

    crop_name: str

    area: Area

    location: Location

    # Polygon Coordinates
    # Example:
    # [
    #   [80.2701, 13.0824],
    #   [80.2708, 13.0825],
    #   [80.2707, 13.0831],
    #   [80.2700, 13.0830]
    # ]
    boundary: Optional[List[List[float]]] = None

    soil_type: Optional[str] = None

    irrigation_type: Optional[str] = None

    planting_date: Optional[datetime] = None

    description: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)


    class Config:
        pass


class SatelliteReport(BaseModel):
    farm_id: str
    image_date: datetime
    average_ndvi: float
    health_score: int
    healthy_area: float
    status: str
    ndvi_image_url: str
    recommendation: str
    created_at: datetime = Field(default_factory=datetime.utcnow)