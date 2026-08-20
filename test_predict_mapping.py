from backend.app.routes import remap_recommended_crop


def test_remap_recommended_crop():
    assert remap_recommended_crop("rice") == "pepper"
    assert remap_recommended_crop("maize") == "potato"
    assert remap_recommended_crop("pomegranate") == "tomato"
    assert remap_recommended_crop("wheat") == "wheat"
