import re
from typing import Dict, Any
from kerykeion import (
    AstrologicalSubjectFactory,
    ChartDataFactory,
    KerykeionChartSVG
)
from app.models.schemas import BirthDataInput, SynastryInput, TransitInput


class AstrologyService:
    """Service layer providing astrological chart calculations and SVG rendering via Kerykeion 5."""

    @staticmethod
    def create_subject(data: BirthDataInput):
        """Create a Kerykeion AstrologicalSubject from BirthDataInput."""
        online_mode = data.lat is None or data.lng is None

        return AstrologicalSubjectFactory.from_birth_data(
            name=data.name,
            year=data.year,
            month=data.month,
            day=data.day,
            hour=data.hour,
            minute=data.minute,
            city=data.city or "Unknown",
            nation=data.nation or "XX",
            lng=data.lng if data.lng is not None else 0.0,
            lat=data.lat if data.lat is not None else 0.0,
            tz_str=data.tz_str,
            houses_system_identifier=data.house_system,
            online=online_mode
        )

    @classmethod
    def get_natal_chart_json(cls, data: BirthDataInput) -> Dict[str, Any]:
        """Generate full natal chart JSON data using ChartDataFactory."""
        subject = cls.create_subject(data)
        chart_model = ChartDataFactory.create_natal_chart_data(subject)
        return chart_model.model_dump()

    @classmethod
    def get_synastry_chart_json(cls, data: SynastryInput) -> Dict[str, Any]:
        """Generate synastry (compatibility) chart JSON between two subjects."""
        subj1 = cls.create_subject(data.first_subject)
        subj2 = cls.create_subject(data.second_subject)

        chart_model = ChartDataFactory.create_synastry_chart_data(subj1, subj2)
        return chart_model.model_dump()

    @classmethod
    def get_transit_chart_json(cls, data: TransitInput) -> Dict[str, Any]:
        """Generate transit chart JSON for natal subject at a target transit date."""
        natal_subj = cls.create_subject(data.natal_subject)

        transit_birth_data = BirthDataInput(
            name=f"Transit for {data.natal_subject.name}",
            year=data.transit_year,
            month=data.transit_month,
            day=data.transit_day,
            hour=data.transit_hour,
            minute=data.transit_minute,
            city=data.transit_city,
            nation=data.transit_nation,
            lng=data.transit_lng,
            lat=data.transit_lat,
            tz_str=data.transit_tz_str
        )
        transit_subj = cls.create_subject(transit_birth_data)

        chart_model = ChartDataFactory.create_transit_chart_data(natal_subj, transit_subj)
        return chart_model.model_dump()

    @classmethod
    def get_natal_svg(cls, data: BirthDataInput) -> str:
        """Generate SVG vector graphic string for natal chart with inline mobile-compatible CSS colors."""
        subject = cls.create_subject(data)
        chart = KerykeionChartSVG(subject, chart_type="Natal")
        chart.makeSVG()
        return cls._clean_svg_for_mobile(str(chart.template))

    @classmethod
    def get_synastry_svg(cls, data: SynastryInput) -> str:
        """Generate SVG vector graphic string for synastry chart with inline mobile-compatible CSS colors."""
        subj1 = cls.create_subject(data.first_subject)
        subj2 = cls.create_subject(data.second_subject)
        chart = KerykeionChartSVG(subj1, chart_type="Synastry", second_obj=subj2)
        chart.makeSVG()
        return cls._clean_svg_for_mobile(str(chart.template))

    @staticmethod
    def _clean_svg_for_mobile(svg_str: str) -> str:
        """Replaces CSS var(...) references with explicit hex colors for React Native SVG mobile rendering."""
        color_map = {
            'var(--kerykeion-chart-color-paper-0)': '#0A0A1E',
            'var(--kerykeion-chart-color-paper-1)': '#141432',
            'var(--kerykeion-chart-color-sun)': '#FFD700',
            'var(--kerykeion-chart-color-moon)': '#F0F4F8',
            'var(--kerykeion-chart-color-mercury)': '#A78BFA',
            'var(--kerykeion-chart-color-venus)': '#F472B6',
            'var(--kerykeion-chart-color-mars)': '#EF4444',
            'var(--kerykeion-chart-color-jupiter)': '#F97316',
            'var(--kerykeion-chart-color-saturn)': '#EAB308',
            'var(--kerykeion-chart-color-uranus)': '#14B8A6',
            'var(--kerykeion-chart-color-neptune)': '#3B82F6',
            'var(--kerykeion-chart-color-pluto)': '#8B5CF6',
            'var(--kerykeion-chart-color-chiron)': '#10B981',
            'var(--kerykeion-chart-color-true-node)': '#EAB308',
            'var(--kerykeion-chart-color-mean-node)': '#EAB308',
            'var(--kerykeion-chart-color-first-house)': '#FFD700',
            'var(--kerykeion-chart-color-fourth-house)': '#3B82F6',
            'var(--kerykeion-chart-color-seventh-house)': '#F472B6',
            'var(--kerykeion-chart-color-tenth-house)': '#10B981',
            'var(--kerykeion-chart-color-fire-percentage)': '#FF4E50',
            'var(--kerykeion-chart-color-earth-percentage)': '#11998e',
            'var(--kerykeion-chart-color-air-percentage)': '#00B4DB',
            'var(--kerykeion-chart-color-water-percentage)': '#8E2DE2',
            'var(--kerykeion-chart-color-cardinal-percentage)': '#FF0080',
            'var(--kerykeion-chart-color-fixed-percentage)': '#7928CA',
            'var(--kerykeion-chart-color-mutable-percentage)': '#00DFD8',
            'var(--kerykeion-chart-color-conjunction)': '#10B981',
            'var(--kerykeion-chart-color-opposition)': '#EF4444',
            'var(--kerykeion-chart-color-trine)': '#3B82F6',
            'var(--kerykeion-chart-color-square)': '#F97316',
            'var(--kerykeion-chart-color-sextile)': '#8B5CF6',
        }

        # Extract definitions from style tag
        styles = re.findall(r'(--kerykeion-chart-color-[a-z0-9-_]+)\s*:\s*([^;\}]+);', svg_str)
        for var_name, color_val in styles:
            color_map[f'var({var_name})'] = color_val.strip()

        # Replace defined variables
        for var_name, color_val in color_map.items():
            svg_str = svg_str.replace(var_name, color_val)

        # Fallback any remaining var(...) expressions
        svg_str = re.sub(r'var\(--[a-z0-9-_]+\)', '#94A3B8', svg_str)
        return svg_str


SUPPORTED_HOUSE_SYSTEMS = {
    "P": "Placidus (Default, semi-arc system)",
    "K": "Koch (Birthplace house system)",
    "O": "Porphyry (Tri-section of quadrant system)",
    "R": "Regiomontanus (Space house system)",
    "C": "Campanus (Prime vertical system)",
    "E": "Equal (Ascendant equal division)",
    "W": "Whole Sign (Sign-is-house system)",
    "V": "Vehlow (Equal system centered on Ascendant)",
    "X": "Axial Rotation / Meridian system",
    "H": "Horizon / Azimuthal system",
    "T": "Polich/Page ('Topocentric' system)",
    "B": "Alcabitius",
    "M": "Morinus",
    "A": "Equal (MC equal division)"
}
