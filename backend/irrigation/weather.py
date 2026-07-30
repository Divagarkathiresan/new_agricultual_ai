import requests


class WeatherService:

    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def get_weather(latitude: float, longitude: float):

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "rain",
                "wind_speed_10m"
            ],
            "daily": [
                "precipitation_probability_max"
            ],
            "forecast_days": 1,
            "timezone": "auto"
        }

        try:

            response = requests.get(
                WeatherService.BASE_URL,
                params=params,
                timeout=10
            )

            response.raise_for_status()

            data = response.json()

            current = data["current"]
            daily = data["daily"]

            return {
                "temperature": current["temperature_2m"],
                "humidity": current["relative_humidity_2m"],
                "rainfall": current["rain"],
                "wind_speed": current["wind_speed_10m"],
                "rain_probability": daily["precipitation_probability_max"][0]
            }

        except Exception as e:

            print("Weather API Error:", e)

            return {
                "temperature": None,
                "humidity": None,
                "rainfall": None,
                "wind_speed": None,
                "rain_probability": None
            }