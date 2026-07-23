from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class ChartRecord(Base):
    __tablename__ = "chart_records"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    chart_type = Column(String(50), default="Natal")
    birth_data = Column(JSON, nullable=False)
    chart_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("AIAnalysisRecord", back_populates="chart", cascade="all, delete-orphan")


class AIAnalysisRecord(Base):
    __tablename__ = "ai_analysis_records"

    id = Column(Integer, primary_key=True, index=True)
    chart_id = Column(Integer, ForeignKey("chart_records.id", ondelete="CASCADE"), nullable=False)
    model_used = Column(String(100), nullable=False)
    interpretation_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    chart = relationship("ChartRecord", back_populates="analyses")
