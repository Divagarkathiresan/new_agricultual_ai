import os
import ee
import geemap
from datetime import datetime, timedelta

from config import initialize_gee

def calculate_health_score(avg_ndvi):

    if avg_ndvi >= 0.75:
        return 100, "Excellent"

    elif avg_ndvi >= 0.60:
        return 85, "Good"

    elif avg_ndvi >= 0.40:
        return 65, "Moderate"

    else:
        return 40, "Critical"

def generate_ndvi(latitude, longitude):

    initialize_gee()

    os.makedirs("output", exist_ok=True)

    # ----------------------------
    # Farm Area
    # ----------------------------

    point = ee.Geometry.Point([longitude, latitude])

    roi = point.buffer(500).bounds()

    # ----------------------------
    # Get Latest Sentinel Image
    # ----------------------------

    end = datetime.utcnow()
    start = end - timedelta(days=30)

    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(roi)
        .filterDate(start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d"))
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .sort("system:time_start", False)
        .first()
    )

    if image is None:
        # print("No image found.")
        return

    # ----------------------------
    # NDVI
    # ----------------------------

    ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")

    # ----------------------------
    # Color Palette
    # ----------------------------

    ndvi_rgb = ndvi.visualize(
        min=0,
        max=1,
        palette=[
            "red",
            "yellow",
            "green"
        ]
    )

    # ----------------------------
    # Export GeoTIFF
    # ----------------------------

    geemap.ee_export_image(
        ndvi,
        filename="output/ndvi.tif",
        scale=10,
        region=roi
    )

    # print("NDVI GeoTIFF exported.")

    # ----------------------------
    # Generate PNG URL
    # ----------------------------

    url = ndvi_rgb.getThumbURL({
        "region": roi,
        "dimensions": 1024,
        "format": "png"
    })

    # print("\nOpen this URL in browser:\n")
    # print(url)

    stats = ndvi.reduceRegion(
    reducer=ee.Reducer.mean(),
    geometry=roi,
    scale=10,
    maxPixels=1e9
    )

    average_ndvi = stats.get("NDVI").getInfo()

    # print(f"\nAverage NDVI : {average_ndvi:.3f}")

    # ---------------------------------------
    # Health Score
    # ---------------------------------------

    score, status = calculate_health_score(average_ndvi)

    # print("Health Score :", score)
    # print("Status :", status)

    # ---------------------------------------
    # Healthy Area Percentage
    # ---------------------------------------

    healthy_mask = ndvi.gte(0.5)

    healthy_stats = healthy_mask.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=roi,
        scale=10,
        maxPixels=1e9
    )

    healthy_percentage = healthy_stats.get("NDVI").getInfo() * 100

    # print("Healthy Area :", round(healthy_percentage, 2), "%")

    return {
        "average_ndvi": round(average_ndvi, 3),
        "health_score": score,
        "status": status,
        "healthy_area": round(healthy_percentage, 2),
        "ndvi_image_url": url
    }

if __name__ == "__main__":

    latitude = 13.0827
    longitude = 80.2707

    print(generate_ndvi(latitude, longitude))