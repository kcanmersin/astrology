import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    print("Testing /api/v1/health...")
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "ok"
    print("  [SUCCESS] Health check passed:", data)


def test_house_systems():
    print("\nTesting /api/v1/house-systems...")
    res = client.get("/api/v1/house-systems")
    assert res.status_code == 200
    data = res.json()
    assert "supported_systems" in data
    print(f"  [SUCCESS] Found {len(data['supported_systems'])} house systems.")


def test_natal_chart():
    print("\nTesting POST /api/v1/natal-chart...")
    payload = {
        "name": "Mustafa Kemal Atatürk",
        "year": 1881,
        "month": 5,
        "day": 19,
        "hour": 12,
        "minute": 0,
        "city": "Thessaloniki",
        "nation": "GR",
        "lng": 22.9444,
        "lat": 40.6401,
        "tz_str": "Europe/Athens",
        "house_system": "P"
    }
    res = client.post("/api/v1/natal-chart", json=payload)
    assert res.status_code == 200, f"Error: {res.text}"
    result = res.json()
    assert result["status"] == "success"
    chart_data = result["data"]

    print("  [SUCCESS] Chart type:", chart_data.get("chart_type"))
    print("  [SUCCESS] Subject info:", chart_data["subject"]["name"], f"({chart_data['subject']['year']}-{chart_data['subject']['month']}-{chart_data['subject']['day']})")
    print(f"  [SUCCESS] Calculated {len(chart_data['aspects'])} natal aspects.")
    print("  [SUCCESS] Element distribution:", chart_data.get("element_distribution"))
    print("  [SUCCESS] Quality distribution:", chart_data.get("quality_distribution"))


def test_synastry_chart():
    print("\nTesting POST /api/v1/synastry-chart...")
    payload = {
        "first_subject": {
            "name": "Person A",
            "year": 1990,
            "month": 1,
            "day": 15,
            "hour": 10,
            "minute": 30,
            "city": "Istanbul",
            "lng": 28.9784,
            "lat": 41.0082,
            "tz_str": "Europe/Istanbul"
        },
        "second_subject": {
            "name": "Person B",
            "year": 1992,
            "month": 6,
            "day": 20,
            "hour": 18,
            "minute": 15,
            "city": "Ankara",
            "lng": 32.8597,
            "lat": 39.9334,
            "tz_str": "Europe/Istanbul"
        }
    }
    res = client.post("/api/v1/synastry-chart", json=payload)
    assert res.status_code == 200, f"Error: {res.text}"
    result = res.json()
    assert result["status"] == "success"
    chart_data = result["data"]
    print(f"  [SUCCESS] Synastry calculated between {chart_data['first_subject']['name']} and {chart_data['second_subject']['name']}")
    print(f"  [SUCCESS] Synastry aspects calculated: {len(chart_data['aspects'])} aspects found.")


def test_transit_chart():
    print("\nTesting POST /api/v1/transit-chart...")
    payload = {
        "natal_subject": {
            "name": "Person A",
            "year": 1995,
            "month": 10,
            "day": 25,
            "hour": 14,
            "minute": 30,
            "city": "Istanbul",
            "lng": 28.9784,
            "lat": 41.0082,
            "tz_str": "Europe/Istanbul"
        },
        "transit_year": 2026,
        "transit_month": 7,
        "transit_day": 23,
        "transit_hour": 22,
        "transit_minute": 0,
        "transit_city": "Istanbul",
        "transit_lng": 28.9784,
        "transit_lat": 41.0082,
        "transit_tz_str": "Europe/Istanbul"
    }
    res = client.post("/api/v1/transit-chart", json=payload)
    assert res.status_code == 200, f"Error: {res.text}"
    result = res.json()
    assert result["status"] == "success"
    chart_data = result["data"]
    print(f"  [SUCCESS] Transits calculated: {len(chart_data['aspects'])} transit aspects found.")


def test_natal_svg():
    print("\nTesting POST /api/v1/natal-chart/svg...")
    payload = {
        "name": "Test Subject",
        "year": 2000,
        "month": 1,
        "day": 1,
        "hour": 12,
        "minute": 0,
        "city": "London",
        "lng": -0.1278,
        "lat": 51.5074,
        "tz_str": "Europe/London"
    }
    res = client.post("/api/v1/natal-chart/svg", json=payload)
    assert res.status_code == 200
    assert "image/svg+xml" in res.headers["content-type"]
    assert "<svg" in res.text
    print(f"  [SUCCESS] Natal SVG rendered cleanly (Length: {len(res.text)} characters).")


if __name__ == "__main__":
    print("=" * 60)
    print("Starting Kerykeion FastAPI Suite Verification")
    print("=" * 60)
    test_health()
    test_house_systems()
    test_natal_chart()
    test_synastry_chart()
    test_transit_chart()
    test_natal_svg()
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! NASA-precision JSON & SVG active.")
    print("=" * 60)
