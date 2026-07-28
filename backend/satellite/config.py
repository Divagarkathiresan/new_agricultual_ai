import ee

PROJECT_ID = "smart-agriculture-ai-503703"

def initialize_gee():
    try:
        ee.Initialize(project=PROJECT_ID)
        print("✅ Google Earth Engine initialized successfully.")
    except Exception as e:
        print("❌ Failed to initialize Earth Engine")
        print(e)