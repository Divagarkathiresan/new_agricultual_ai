import os
import sys

import ee
import geemap
from ee.ee_exception import EEException
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import initialize_gee


def fetch_satellite_image(latitude, longitude):

    initialize_gee()

    # Create output folder
    os.makedirs("output", exist_ok=True)

    # -----------------------------
    # Create Region of Interest
    # -----------------------------

    point = ee.Geometry.Point([longitude, latitude])

    roi = point.buffer(100).bounds()

    # -----------------------------
    # Fetch latest Sentinel-2 image
    # -----------------------------

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(roi)
        .filterDate(
            "2026-06-01",
            "2026-07-15"
        )
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10))
        .sort("system:time_start", False)
    )

    try:
        if collection.size().getInfo() == 0:
            return None

        image = collection.first()
        image_id = image.get("system:index").getInfo()
    except EEException:
        return None

    if not image_id:
        return None

    # -----------------------------
    # Convert to RGB
    # -----------------------------

    rgb = image.visualize(
        bands=["B4", "B3", "B2"],
        min=0,
        max=3000
    )

    # -----------------------------
    # Export Image
    # -----------------------------

    print("Downloading satellite image...")

    geemap.ee_export_image(
        rgb,
        filename="output/satellite.tif",
        scale=10,
        region=roi,
        file_per_band=False,
    )

    print("Satellite image saved!")

    # -----------------------------
    # Generate PNG URL
    # -----------------------------

    url = rgb.getThumbURL({
        "region": roi,
        "dimensions": 1024,
        "format": "png"
    })

    return url


if __name__ == "__main__":

    # Example Location
    latitude = 13.0827
    longitude = 80.2707

    fetch_satellite_image(latitude, longitude)
