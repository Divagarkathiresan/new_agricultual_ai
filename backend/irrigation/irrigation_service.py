from irrigation.weather import WeatherService
from irrigation.soil_moisture import SoilMoistureEstimator
from irrigation.water_requirement import WaterRequirementCalculator
from irrigation.recommendation import IrrigationRecommendation
from app.database.models import get_farm_by_id
# Import your existing functions
from satellite.ndvi import generate_ndvi

# Import your MongoDB connection


class IrrigationService:

    @staticmethod
    def generate_irrigation_plan(farm_id: str):

        # -----------------------------------------
        # Get Farm Details
        # -----------------------------------------

        # farm = farm_collection.find_one(
        #     {"farm_id": farm_id}
        # )
        farm = get_farm_by_id(farm_id)

        if farm is None:
            return {
                "success": False,
                "message": "Farm not found."
            }

        latitude = farm["location"]["latitude"]
        longitude = farm["location"]["longitude"]

        crop_name = farm["crop_name"]

        area = farm["area"]["value"]
        unit = farm["area"]["unit"]

        # -----------------------------------------
        # Weather
        # -----------------------------------------

        weather = WeatherService.get_weather(
            latitude,
            longitude
        )

        # -----------------------------------------
        # Satellite NDVI
        # -----------------------------------------

        satellite = generate_ndvi(
            latitude,
            longitude
        )

        if not satellite:
            return {
                "success": False,
                "message": "No satellite image found for this location."
            }

        ndvi = satellite["average_ndvi"]

        # -----------------------------------------
        # Soil Moisture
        # -----------------------------------------

        soil = SoilMoistureEstimator.estimate(

            ndvi=ndvi,

            temperature=weather["temperature"],

            humidity=weather["humidity"],

            rainfall=weather["rainfall"],

            rain_probability=weather["rain_probability"]

        )

        # -----------------------------------------
        # Crop Water Requirement
        # -----------------------------------------

        water = WaterRequirementCalculator.calculate(

            crop_name=crop_name,

            area=area,

            unit=unit

        )

        # -----------------------------------------
        # Final Recommendation
        # -----------------------------------------

        recommendation = IrrigationRecommendation.generate(

            soil_moisture_level=soil["soil_moisture_level"],

            soil_moisture_score=soil["soil_moisture_score"],

            rain_probability=weather["rain_probability"],

            rainfall=weather["rainfall"],

            temperature=weather["temperature"],

            water_required_liters=water["water_required_liters"]

        )

        # -----------------------------------------
        # Final Response
        # -----------------------------------------

        return {

            "farm_id": farm_id,

            "crop_name": crop_name,

            "location": {
                "latitude": latitude,
                "longitude": longitude
            },

            "weather": weather,

            # Keep every NDVI value in one place in the response.
            "satellite": {
                "average_ndvi": ndvi,
                "health_score": satellite["health_score"],
                "healthy_area": satellite["healthy_area"],
                "status": satellite["status"],
                "satellite_image_url": satellite["satellite_image_url"],
                "ndvi_image_url": satellite["ndvi_image_url"],
                "recommendation": {
                    "Excellent": "Crop is healthy. Continue current practices.",
                    "Good": "Crop is doing well. Monitor for any changes.",
                    "Moderate": "Crop health is moderate. Consider additional fertilization.",
                    "Critical": "Crop health is critical. Immediate attention required."
                }.get(satellite["status"], "")
            },

            "soil_moisture": soil,

            "water_requirement": water,

            "recommendation": recommendation

        }
