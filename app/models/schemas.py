from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class BirthDataInput(BaseModel):
    """Subject birth data input for chart calculations."""
    name: str = Field("Subject", description="Name of the person or entity")
    year: int = Field(..., example=1995, description="Year of birth (YYYY)")
    month: int = Field(..., ge=1, le=12, example=10, description="Month of birth (1-12)")
    day: int = Field(..., ge=1, le=31, example=25, description="Day of birth (1-31)")
    hour: int = Field(12, ge=0, le=23, example=14, description="Hour of birth (0-23)")
    minute: int = Field(0, ge=0, le=59, example=30, description="Minute of birth (0-59)")
    city: Optional[str] = Field("Istanbul", description="City of birth (used for online geocoding if lat/lng missing)")
    nation: Optional[str] = Field("TR", description="Country code or country name")
    lng: Optional[float] = Field(28.9784, ge=-180.0, le=180.0, description="Longitude (-180 to 180)")
    lat: Optional[float] = Field(41.0082, ge=-90.0, le=90.0, description="Latitude (-90 to 90)")
    tz_str: str = Field("Europe/Istanbul", description="Timezone name (e.g. Europe/Istanbul, UTC, America/New_York)")
    house_system: str = Field("P", description="House calculation system code (P=Placidus, W=Whole Sign, K=Koch, E=Equal, etc.)")


class SynastryInput(BaseModel):
    """Input parameters for calculating synastry (compatibility) chart between two people."""
    first_subject: BirthDataInput
    second_subject: BirthDataInput


class TransitInput(BaseModel):
    """Input parameters for calculating transit chart at a specific date and location."""
    natal_subject: BirthDataInput
    transit_year: int = Field(..., example=2026, description="Transit Year (YYYY)")
    transit_month: int = Field(..., ge=1, le=12, example=7, description="Transit Month (1-12)")
    transit_day: int = Field(..., ge=1, le=31, example=23, description="Transit Day (1-31)")
    transit_hour: int = Field(12, ge=0, le=23, example=12, description="Transit Hour (0-23)")
    transit_minute: int = Field(0, ge=0, le=59, example=0, description="Transit Minute (0-59)")
    transit_city: Optional[str] = Field("Istanbul", description="Transit location city")
    transit_nation: Optional[str] = Field("TR", description="Transit location nation")
    transit_lng: Optional[float] = Field(28.9784, ge=-180.0, le=180.0, description="Transit Longitude")
    transit_lat: Optional[float] = Field(41.0082, ge=-90.0, le=90.0, description="Transit Latitude")
    transit_tz_str: str = Field("Europe/Istanbul", description="Transit Timezone name")


class SVGOptionsInput(BaseModel):
    """Options for rendering chart SVG graphics."""
    birth_data: BirthDataInput
    chart_type: str = Field("Natal", description="Chart type: Natal, Synastry, Transit")
    theme: str = Field("classic", description="Color theme for chart SVG: classic, dark, light")


class HealthCheckResponse(BaseModel):
    status: str = Field("ok", example="ok")
    app_name: str = Field("Kerykeion Astrology API")
    version: str = Field("1.0.0")
    engine: str = Field("Kerykeion Swiss Ephemeris Engine (NASA Precision)")


class PlanetPosition(BaseModel):
    name: str
    sign: str
    sign_num: int
    position: float
    abs_pos: float
    house: Optional[str] = None
    retrograde: bool = False


class HousePosition(BaseModel):
    name: str
    sign: str
    position: float
    abs_pos: float


class AspectData(BaseModel):
    p1_name: str
    p2_name: str
    aspect: str
    orbit: float
    aspect_degrees: float
    diff: float


class ChartResponse(BaseModel):
    subject: Dict[str, Any]
    planets: List[Dict[str, Any]]
    houses: List[Dict[str, Any]]
    aspects: List[Dict[str, Any]]
    element_balance: Optional[Dict[str, Any]] = None
    modality_balance: Optional[Dict[str, Any]] = None
