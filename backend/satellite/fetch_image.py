import os

import ee
import geemap

from config import initialize_gee


def fetch_satellite_image(latitude, longitude):

    initialize_gee()

    # Create output folder
    os.makedirs("output", exist_ok=True)

    # -----------------------------
    # Create Region of Interest
    # -----------------------------

    point = ee.Geometry.Point([longitude, latitude])

    roi = point.buffer(500).bounds()

    # -----------------------------
    # Fetch latest Sentinel-2 image
    # -----------------------------

    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(roi)
        .filterDate("2025-01-01", "2025-12-31")
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 10))
        .sort("system:time_start", False)
        .first()
    )

    if image is None:
        print("No satellite image found.")
        return

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

    print("\nOpen this URL in your browser:\n")
    print(url)


if __name__ == "__main__":

    # Example Location
    latitude = 13.0827
    longitude = 80.2707

    fetch_satellite_image(latitude, longitude)