from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from app.models.schemas import (
    BirthDataInput, SynastryInput, TransitInput,
    HealthCheckResponse
)
from app.services.astrology import AstrologyService, SUPPORTED_HOUSE_SYSTEMS
from app.services.ai_service import ai_service
from app.db.database import get_db
from app.db.models import ChartRecord, AIAnalysisRecord

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["System Info"],
    summary="Check API Status",
    description="Returns the health status and engine version of the Astrology API."
)
def get_health_status():
    return HealthCheckResponse()


@router.get(
    "/house-systems",
    tags=["System Info"],
    summary="List Supported House Systems",
    description="Returns all supported Swiss Ephemeris house calculation systems and their single-letter codes."
)
def get_house_systems():
    return {
        "status": "success",
        "default_house_system": "P (Placidus)",
        "supported_systems": SUPPORTED_HOUSE_SYSTEMS
    }


@router.post(
    "/natal-chart",
    tags=["Natal Charts"],
    summary="Calculate Natal Birth Chart JSON",
    description="Calculates natal chart parameters via Swiss Ephemeris."
)
def calculate_natal_chart(data: BirthDataInput, db: Session = Depends(get_db)):
    try:
        chart_data = AstrologyService.get_natal_chart_json(data)
        
        # Save record to Neon PostgreSQL
        record = ChartRecord(
            name=data.name,
            chart_type="Natal",
            birth_data=data.model_dump(),
            chart_result=chart_data
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "status": "success",
            "record_id": record.id,
            "message": f"Natal chart calculated and saved for {data.name}",
            "data": chart_data
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to calculate natal chart: {str(e)}")


@router.post(
    "/ai-interpretation",
    tags=["AI Astrological Analysis"],
    summary="Calculate Natal Chart & Generate Groq AI Interpretation",
    description="""
Calculates Swiss Ephemeris natal chart data and passes it to Groq AI Fallback Queue for deep astrological analysis.
Saves both chart data and AI report into Neon PostgreSQL database.
    """
)
def generate_natal_ai_interpretation(data: BirthDataInput, db: Session = Depends(get_db)):
    try:
        # 1. Calculate Chart JSON
        chart_data = AstrologyService.get_natal_chart_json(data)

        # 2. Save Chart to Neon DB
        chart_rec = ChartRecord(
            name=data.name,
            chart_type="Natal",
            birth_data=data.model_dump(),
            chart_result=chart_data
        )
        db.add(chart_rec)
        db.commit()
        db.refresh(chart_rec)

        # 3. Generate AI Interpretation using Groq Fallback Queue
        interpretation, model_used = ai_service.generate_interpretation(chart_data, chart_type="Natal")

        # 4. Save AI Analysis to Neon DB
        ai_rec = AIAnalysisRecord(
            chart_id=chart_rec.id,
            model_used=model_used,
            interpretation_text=interpretation
        )
        db.add(ai_rec)
        db.commit()
        db.refresh(ai_rec)

        return {
            "status": "success",
            "chart_id": chart_rec.id,
            "analysis_id": ai_rec.id,
            "model_used": model_used,
            "chart_data": chart_data,
            "ai_interpretation": interpretation
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"AI Interpretation failed: {str(e)}")


@router.post(
    "/synastry-chart",
    tags=["Synastry"],
    summary="Calculate Synastry Compatibility JSON"
)
def calculate_synastry_chart(data: SynastryInput, db: Session = Depends(get_db)):
    try:
        synastry_data = AstrologyService.get_synastry_chart_json(data)
        record = ChartRecord(
            name=f"{data.first_subject.name} & {data.second_subject.name}",
            chart_type="Synastry",
            birth_data=data.model_dump(),
            chart_result=synastry_data
        )
        db.add(record)
        db.commit()

        return {
            "status": "success",
            "data": synastry_data
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to calculate synastry chart: {str(e)}")


@router.post(
    "/synastry-ai",
    tags=["AI Astrological Analysis"],
    summary="Calculate Synastry Chart & Generate Groq AI Compatibility Report"
)
def generate_synastry_ai_interpretation(data: SynastryInput, db: Session = Depends(get_db)):
    try:
        synastry_data = AstrologyService.get_synastry_chart_json(data)

        chart_rec = ChartRecord(
            name=f"{data.first_subject.name} & {data.second_subject.name}",
            chart_type="Synastry",
            birth_data=data.model_dump(),
            chart_result=synastry_data
        )
        db.add(chart_rec)
        db.commit()
        db.refresh(chart_rec)

        interpretation, model_used = ai_service.generate_interpretation(synastry_data, chart_type="Synastry Uyum")

        ai_rec = AIAnalysisRecord(
            chart_id=chart_rec.id,
            model_used=model_used,
            interpretation_text=interpretation
        )
        db.add(ai_rec)
        db.commit()

        return {
            "status": "success",
            "chart_id": chart_rec.id,
            "model_used": model_used,
            "synastry_data": synastry_data,
            "ai_interpretation": interpretation
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Synastry AI interpretation failed: {str(e)}")


@router.post("/transit-chart", tags=["Transits"], summary="Calculate Transit Chart JSON")
def calculate_transit_chart(data: TransitInput):
    try:
        transit_data = AstrologyService.get_transit_chart_json(data)
        return {"status": "success", "data": transit_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to calculate transit chart: {str(e)}")


@router.post("/natal-chart/svg", tags=["SVG Graphics"], summary="Render Natal Chart SVG")
def render_natal_svg(data: BirthDataInput):
    try:
        svg_content = AstrologyService.get_natal_svg(data)
        return Response(content=svg_content, media_type="image/svg+xml")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate SVG chart: {str(e)}")


@router.post("/synastry-chart/svg", tags=["SVG Graphics"], summary="Render Synastry Chart SVG")
def render_synastry_svg(data: SynastryInput):
    try:
        svg_content = AstrologyService.get_synastry_svg(data)
        return Response(content=svg_content, media_type="image/svg+xml")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate synastry SVG chart: {str(e)}")
