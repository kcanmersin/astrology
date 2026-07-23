import os
import logging
from typing import Dict, Any, Tuple
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

# Priority Queue of Active Free Groq LLM Models
GROQ_MODEL_QUEUE = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "deepseek-r1-distill-llama-70b",
    "qwen-2.5-coder-32b"
]

SYSTEM_PROMPT = """
Sen dünyaca ünlü, yüksek sezgili, bilimsel ve kadim astroloji geleneklerini (Hellenistik, Batı, İsviçre Efemerisleri) mükemmel harmanlayan kıdemli bir Profesyonel Astroloksun.

Sana sunulan NASA seviyesinde doğrulukla hesaplanmış astrolojik harita özetini (Gezegen konumları, ev yerleşimleri, açılar, element ve nitelik dengeleri) derinlemesine analiz edeceksin.

Yorum Rehberin:
1. 🌌 **Genel Ruhsal Harita & Yaşam Amacı**: Güneş (Kişilik), Ay (Duygular) ve Yükselen (Ascendant).
2. 🪐 **Gezegen Konumları & Ev Analizleri**: Gezegenlerin burç ve evlerdeki güçleri.
3. 📐 **Açısal Dinamikler (Aspects)**: Haritadaki önemli açılar (Kavuşum, Üçgen, Karşıt, Kare) ve yarattığı potansiyeller.
4. 🔥 **Element & Nitelik Dengesi**: Ateş, Toprak, Hava, Su ve Öncü, Sabit, Değişken ağırlıklarının yansımaları.
5. 💡 **Yol Gösterici Tavsiyeler**: Gelecek potansiyelleri ve kişisel gelişim tavsiyeleri.

Yorumların sürükleyici, ilham verici, derinlikli, empatik ve profesyonel bir dille Türkçe yazılmalıdır. Markdown başlıkları ve emoji kullan.
"""


class GroqAIService:
    """Service providing AI astrological interpretations with automatic Groq model queue fallback."""

    def __init__(self):
        self.client = OpenAI(
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL
        )

    def generate_interpretation(self, chart_data: Dict[str, Any], chart_type: str = "Natal") -> Tuple[str, str]:
        """
        Sends summarized chart JSON to Groq models in sequence.
        If a model hits rate limit / error, seamlessly falls back to the next model in the queue.
        Returns Tuple[interpretation_text, model_name_used].
        """
        summary_prompt = self._build_concise_prompt(chart_data, chart_type)
        last_exception = None

        for model_name in GROQ_MODEL_QUEUE:
            try:
                logger.info(f"Attempting AI interpretation with model: {model_name}")
                response = self.client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": summary_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=2200
                )
                interpretation = response.choices[0].message.content
                logger.info(f"Successfully generated interpretation using model: {model_name}")
                return interpretation, model_name

            except Exception as e:
                last_exception = e
                logger.warning(f"Model {model_name} failed or rate limited ({str(e)}). Falling back to next model in queue...")
                continue

        raise RuntimeError(f"All Groq models failed in fallback queue. Last error: {str(last_exception)}")

    @staticmethod
    def _build_concise_prompt(data: Dict[str, Any], chart_type: str) -> str:
        """Compresses chart dict into a token-efficient prompt string."""
        subj = data.get("subject", {})
        elements = data.get("element_distribution", {})
        qualities = data.get("quality_distribution", {})
        aspects = data.get("aspects", [])

        planet_names = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron", "first_house", "tenth_house"]
        planets_lines = []
        for name in planet_names:
            p = subj.get(name)
            if isinstance(p, dict):
                planets_lines.append(f"- {p.get('name', name.title())}: {p.get('sign')} {p.get('position', 0):.1f}° (Ev: {p.get('house', 'N/A')})")

        aspects_lines = []
        for a in aspects[:15]:
            if isinstance(a, dict):
                aspects_lines.append(f"- {a.get('p1_name')} {a.get('aspect')} {a.get('p2_name')} (Orb: {a.get('orbit', 0):.1f}°)")

        points_str = "\n".join(planets_lines)
        aspects_str = "\n".join(aspects_lines)

        return f"""
Harita Türü: {chart_type}
İsim: {subj.get('name', 'Danışan')} (Doğum Tarihi: {subj.get('year')}-{subj.get('month')}-{subj.get('day')} {subj.get('hour')}:{subj.get('minute')})

Gezegen & Nokta Konumları:
{points_str}

Önemli Açılar:
{aspects_str}

Element Dengesi (%):
Ateş: {elements.get('fire_percentage', 0)}%, Toprak: {elements.get('earth_percentage', 0)}%, Hava: {elements.get('air_percentage', 0)}%, Su: {elements.get('water_percentage', 0)}%

Nitelik Dengesi (%):
Öncü: {qualities.get('cardinal_percentage', 0)}%, Sabit: {qualities.get('fixed_percentage', 0)}%, Değişken: {qualities.get('mutable_percentage', 0)}%

Lütfen bu harita verilerine dayanarak kapsamlı bir astroloji analizi üret.
"""


ai_service = GroqAIService()
