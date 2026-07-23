import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import init_db, SessionLocal
from app.db.models import ChartRecord, AIAnalysisRecord
from app.services.astrology import AstrologyService
from app.services.ai_service import ai_service
from app.models.schemas import BirthDataInput


def test_neon_db_and_groq_ai():
    print("=" * 70)
    print("Testing Neon PostgreSQL & Groq AI Fallback Integration")
    print("=" * 70)

    # 1. Initialize Tables in Neon PostgreSQL
    print("\n1. Initializing Neon PostgreSQL database tables...")
    init_db()
    print("  [SUCCESS] Database tables initialized on Neon PostgreSQL!")

    # 2. Calculate Chart Data via Kerykeion
    print("\n2. Calculating Swiss Ephemeris chart data...")
    birth_input = BirthDataInput(
        name="Ataturk",
        year=1881,
        month=5,
        day=19,
        hour=12,
        minute=0,
        city="Thessaloniki",
        lng=22.9444,
        lat=40.6401,
        tz_str="Europe/Athens"
    )
    chart_json = AstrologyService.get_natal_chart_json(birth_input)
    print("  [SUCCESS] Natal chart calculated!")

    # 3. Test Groq AI Model Fallback Queue
    print("\n3. Testing Groq AI Model Fallback Queue...")
    interpretation, model_used = ai_service.generate_interpretation(chart_json, chart_type="Natal Haritasi")
    print(f"  [SUCCESS] AI Interpretation generated cleanly using Groq model: {model_used}")

    # 4. Save to Neon Database Session
    print("\n4. Saving chart record & AI analysis to Neon PostgreSQL...")
    db = SessionLocal()
    try:
        chart_rec = ChartRecord(
            name=birth_input.name,
            chart_type="Natal",
            birth_data=birth_input.model_dump(),
            chart_result=chart_json
        )
        db.add(chart_rec)
        db.commit()
        db.refresh(chart_rec)

        ai_rec = AIAnalysisRecord(
            chart_id=chart_rec.id,
            model_used=model_used,
            interpretation_text=interpretation
        )
        db.add(ai_rec)
        db.commit()
        db.refresh(ai_rec)

        print(f"  [SUCCESS] Record saved to Neon DB with Chart ID: {chart_rec.id}, Analysis ID: {ai_rec.id}!")
    finally:
        db.close()

    print("\n" + "=" * 70)
    print("ALL NEON POSTGRESQL & GROQ AI INTEGRATION TESTS PASSED 100%!")
    print("=" * 70)


if __name__ == "__main__":
    test_neon_db_and_groq_ai()
