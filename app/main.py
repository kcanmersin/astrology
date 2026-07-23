import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.endpoints import router as api_router
from app.db.database import init_db

tags_metadata = [
    {
        "name": "System Info",
        "description": "API sağlık durumu, sürüm bilgileri ve desteklenen ev hesaplama sistemleri.",
    },
    {
        "name": "AI Astrological Analysis",
        "description": "Groq LLM Otomatik Model Fallback kuyruğu (Llama 3.3 70B, Llama 3.1 8B, Mixtral, Gemma 2) ile derin astroloji analizi.",
    },
    {
        "name": "Natal Charts",
        "description": "NASA seviyesinde Swiss Ephemeris doğruluk hesaplaması ile bireysel doğum haritası ve gezegen konumları (JSON).",
    },
    {
        "name": "Synastry",
        "description": "İki harita arasındaki açısal uyum ve ilişki analizleri (Synastry JSON).",
    },
    {
        "name": "Transits",
        "description": "Herhangi bir tarih için doğum haritası üzerindeki gökyüzü transitleri (Transit JSON).",
    },
    {
        "name": "SVG Graphics",
        "description": "Vektörel harita çizimleri (Natal & Synastry SVG çıktıları).",
    },
]

app = FastAPI(
    title="Kerykeion Astrology Engine API",
    description="""
### 🌌 NASA Seviyesinde Doğrulukla Astrolojik Harita, AI Yorum & JSON Servisi

Açık kaynak kodlu **Kerykeion** kütüphanesi, **Groq AI (Llama 3.3 70B Fallback)** ve **Neon PostgreSQL** veritabanı ile yüksek hassasiyetli astroloji analizi sunar.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for mobile devices and web applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database tables on application startup
@app.on_event("startup")
def on_startup():
    try:
        init_db()
        print("Neon PostgreSQL tables initialized successfully.")
    except Exception as e:
        print(f"Database initialization notice: {e}")

# Static Files Directory
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Serve Interactive Web UI at Root Route
@app.get("/", include_in_schema=False)
def serve_ui():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Kerykeion Astrology Calculation API Active. Visit /docs for OpenAPI documentation."}

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
