document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('natal-form');
    const svgContainer = document.getElementById('svg-container');
    const btnCalc = document.getElementById('btn-calc');
    const btnAi = document.getElementById('btn-ai');
    const aiCard = document.getElementById('ai-card');
    const aiOutput = document.getElementById('ai-output');
    const aiModelBadge = document.getElementById('ai-model-badge');

    // Preset buttons logic
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('lat').value = btn.dataset.lat;
            document.getElementById('lng').value = btn.dataset.lng;
        });
    });

    function getFormData() {
        return {
            name: document.getElementById('name').value,
            year: parseInt(document.getElementById('year').value),
            month: parseInt(document.getElementById('month').value),
            day: parseInt(document.getElementById('day').value),
            hour: parseInt(document.getElementById('hour').value),
            minute: parseInt(document.getElementById('minute').value),
            city: "PresetCity",
            nation: "TR",
            lat: parseFloat(document.getElementById('lat').value),
            lng: parseFloat(document.getElementById('lng').value),
            tz_str: "Europe/Istanbul",
            house_system: "P"
        };
    }

    // Render SVG
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = getFormData();
        
        btnCalc.disabled = true;
        svgContainer.innerHTML = '<p class="placeholder-text">🌌 İsviçre Efemerisleri İle Çiziliyor...</p>';

        try {
            const res = await fetch('/api/v1/natal-chart/svg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const svgText = await res.text();
            svgContainer.innerHTML = svgText;
        } catch (err) {
            svgContainer.innerHTML = `<p class="error-text">Hata oluştu: ${err.message}</p>`;
        } finally {
            btnCalc.disabled = false;
        }
    });

    // Generate AI Interpretation
    btnAi.addEventListener('click', async () => {
        const payload = getFormData();

        btnAi.disabled = true;
        aiCard.style.display = 'block';
        aiOutput.innerHTML = '<p class="placeholder-text">✨ Groq AI Modelleri Haritanızı Analiz Ediyor (Otomatik Fallback Aktif)...</p>';

        try {
            const res = await fetch('/api/v1/ai-interpretation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.status === 'success') {
                aiModelBadge.textContent = data.model_used;
                aiOutput.innerHTML = marked.parse(data.ai_interpretation);
            } else {
                aiOutput.innerHTML = `<p class="error-text">Hata: ${data.detail || 'Analiz üretilemedi.'}</p>`;
            }
        } catch (err) {
            aiOutput.innerHTML = `<p class="error-text">AI servisine ulaşılamadı: ${err.message}</p>`;
        } finally {
            btnAi.disabled = false;
        }
    });
});
