# 🌌 Kerykeion Astrology FastAPI Service

NASA seviyesinde doğrulukla hesaplama yapan açık kaynak kodlu **Kerykeion** (Swiss Ephemeris) kütüphanesi üzerine inşa edilmiş, modüler ve yüksek performanslı **FastAPI** servis mimarisi.

---

## 🌟 Özellikler

- **Natal Chart (Doğum Haritası) JSON**: Gezegen pozisyonları, evler, açılar, element (Ateş, Toprak, Hava, Su) ve nitelik (Öncü, Sabit, Değişken) dengeleri.
- **Synastry Chart (İlişki Uyum Haritası) JSON**: İki kişi arasındaki gezegen etkileşimleri ve uyum açıları.
- **Transit Chart (Anlık Gökyüzü Transiti) JSON**: Anlık veya belirli bir tarihteki transitlerin doğum haritası üzerindeki etkileri.
- **SVG Vektörel Çizim**: Natal ve Synastry haritaları için doğrudan tarayıcı veya mobil ekranda gösterilebilir SVG çıktısı.
- **Ev Sistemleri**: Placidus, Whole Sign, Koch, Equal, Regiomontanus ve 10+ ev sistemi desteği.
- **Özelleştirilmiş Swagger UI**: `/docs` ve `/redoc` üzerinde interaktif dokümantasyon ve canlı API testi.

---

## 🚀 Hızlı Başlangıç

### 1. Sanal Ortamı Aktifleştirme

```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate
```

### 2. Bağımlılıkları Yükleme (Gerekirse)

```bash
pip install -r requirements.txt
```

### 3. Uygulamayı Başlatma

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Başlatıldıktan sonra tarayıcınızda aşağıdaki adresleri açabilirsiniz:
- **Swagger Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Visualization**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **API Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 🧪 Testleri Çalıştırma

API doğrulamalarını çalıştırmak için:

```bash
.\.venv\Scripts\python test_api.py
```

---

## 📌 Endpoint Özeti

| Metot | Endpoint | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/` | API karşılama ve endpoint rehberi |
| `GET` | `/api/v1/health` | Servis sağlık durumu kontrolü |
| `GET` | `/api/v1/house-systems` | Desteklenen ev sistemleri ve kodları |
| `POST` | `/api/v1/natal-chart` | Doğum haritası detaylı JSON verisi |
| `POST` | `/api/v1/synastry-chart` | İki kişi arası uyum (Synastry) JSON verisi |
| `POST` | `/api/v1/transit-chart` | Anlık/Tarihsel transit harita JSON verisi |
| `POST` | `/api/v1/natal-chart/svg` | Doğum haritası SVG vektör grafiği |
| `POST` | `/api/v1/synastry-chart/svg` | Uyum haritası SVG vektör grafiği |

---

## 📝 Örnek İstek (POST `/api/v1/natal-chart`)

```json
{
  "name": "Ahmet Yılmaz",
  "year": 1995,
  "month": 10,
  "day": 25,
  "hour": 14,
  "minute": 30,
  "city": "Istanbul",
  "nation": "TR",
  "lng": 28.9784,
  "lat": 41.0082,
  "tz_str": "Europe/Istanbul",
  "house_system": "P"
}
```

---

## 📜 Lisans

- Proje bağımlılıkları ve Kerykeion açık kaynak **AGPL-3.0** lisansı altındadır.
