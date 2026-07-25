document.addEventListener('DOMContentLoaded', () => {
    initShaderBg();
    init3DAstrolabe();
    initTabNavigation();
    initPresetButtons();
    initNatalForm();
    initSynastryForm();
    renderArchive();
});

/* ==================== 1. WEBGL COSMIC SHADER BACKGROUND ==================== */
function initShaderBg() {
    const canvas = document.getElementById('shader-bg');
    if (!canvas) return;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;

        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = v_texCoord;
            vec3 color = vec3(0.02, 0.03, 0.08);
            
            float n = 0.0;
            vec2 st = uv * 3.0;
            for(int i=0; i<3; i++) {
                n += noise(st + u_time * 0.05) * (1.0 / float(i+1));
                st *= 2.0;
            }
            
            vec3 nebula = vec3(0.08, 0.03, 0.16) * n * 0.5;
            color += nebula;
            
            float stars = pow(noise(uv * 45.0 + sin(u_time * 0.03)), 22.0);
            color += vec3(stars) * (0.4 + 0.6 * sin(u_time * 0.5 + uv.x * 8.0));
            
            float dist = distance(uv, vec2(0.5));
            color *= 1.1 - smoothstep(0.4, 1.0, dist);
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    function render(time) {
        gl.useProgram(program);
        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/* ==================== 2. THREE.JS 3D ASTROLABE ==================== */
function init3DAstrolabe() {
    const container = document.getElementById('astrolabe-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const material = new THREE.MeshPhongMaterial({
        color: 0xddb7ff,
        emissive: 0x622599,
        shininess: 100,
        transparent: true,
        opacity: 0.85
    });

    // Metallic Torus Rings
    for (let i = 0; i < 3; i++) {
        const geometry = new THREE.TorusGeometry(1.8 + i * 0.7, 0.02, 16, 100);
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        group.add(ring);
    }

    // Glowing Sun Center
    const sunGeom = new THREE.SphereGeometry(0.45, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const sun = new THREE.Mesh(sunGeom, sunMat);
    group.add(sun);

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 7;

    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.004;
        group.rotation.x += 0.002;
        group.position.y = Math.sin(Date.now() * 0.001) * 0.15;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth || 300;
        const h = container.clientHeight || 300;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

/* ==================== 3. TAB NAVIGATION ==================== */
function initTabNavigation() {
    window.showTab = function(tabName) {
        document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
        const target = document.getElementById(`view-${tabName}`);
        if (target) target.classList.remove('hidden');

        // Update nav icon styles
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('text-secondary');
            item.classList.add('text-on-surface/50');
            const icon = item.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 0";
        });

        const activeNav = document.getElementById(`nav-${tabName}`);
        if (activeNav) {
            activeNav.classList.remove('text-on-surface/50');
            activeNav.classList.add('text-secondary');
            const icon = activeNav.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        }

        if (tabName === 'archive') {
            renderArchive();
        }
    };
}

/* ==================== 4. PRESET BUTTONS ==================== */
function initPresetButtons() {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('natal-lat').value = btn.dataset.lat;
            document.getElementById('natal-lng').value = btn.dataset.lng;
        });
    });
}

/* ==================== 5. NATAL FORM & AI ==================== */
const ZODIAC_TR = {
  Ari: 'Koç', Tau: 'Boğa', Gem: 'İkizler', Can: 'Yengeç',
  Leo: 'Aslan', Vir: 'Başak', Lib: 'Terazi', Sco: 'Akrep',
  Sag: 'Yay', Cap: 'Oğlak', Aqu: 'Kova', Pis: 'Balık'
};

function getNatalPayload() {
    return {
        name: document.getElementById('natal-name').value || 'Danışan',
        year: parseInt(document.getElementById('natal-year').value),
        month: parseInt(document.getElementById('natal-month').value),
        day: parseInt(document.getElementById('natal-day').value),
        hour: parseInt(document.getElementById('natal-hour').value),
        minute: parseInt(document.getElementById('natal-minute').value),
        city: "Istanbul",
        nation: "TR",
        lat: parseFloat(document.getElementById('natal-lat').value),
        lng: parseFloat(document.getElementById('natal-lng').value),
        tz_str: "Europe/Istanbul",
        house_system: "P"
    };
}

function initNatalForm() {
    const natalForm = document.getElementById('natal-form');
    const btnCalc = document.getElementById('btn-natal-calc');
    const btnAi = document.getElementById('btn-natal-ai');
    const svgContainer = document.getElementById('svg-natal-container');
    const aiCard = document.getElementById('ai-natal-card');
    const aiOutput = document.getElementById('ai-natal-output');
    const aiBadge = document.getElementById('ai-model-badge');

    // Calculate Natal JSON & SVG
    natalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = getNatalPayload();
        btnCalc.disabled = true;
        svgContainer.innerHTML = '<div class="text-tertiary text-sm italic font-medium animate-pulse">🌌 Swiss Ephemeris İle Harita Çiziliyor...</div>';

        try {
            const [jsonRes, svgRes] = await Promise.all([
                fetch('/api/v1/natal-chart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }),
                fetch('/api/v1/natal-chart/svg', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            ]);

            const json = await jsonRes.json();
            const svgText = await svgRes.text();

            svgContainer.innerHTML = svgText;

            // Update Big Three cards
            if (json.data && json.data.subject) {
                const subj = json.data.subject;
                if (subj.sun) {
                    document.getElementById('card-sun-sign').textContent = ZODIAC_TR[subj.sun.sign] || subj.sun.sign;
                    document.getElementById('card-sun-deg').textContent = `${(subj.sun.position || 0).toFixed(1)}° (${subj.sun.house}. Ev)`;
                }
                if (subj.moon) {
                    document.getElementById('card-moon-sign').textContent = ZODIAC_TR[subj.moon.sign] || subj.moon.sign;
                    document.getElementById('card-moon-deg').textContent = `${(subj.moon.position || 0).toFixed(1)}° (${subj.moon.house}. Ev)`;
                }
                if (subj.first_house) {
                    document.getElementById('card-asc-sign').textContent = ZODIAC_TR[subj.first_house.sign] || subj.first_house.sign;
                    document.getElementById('card-asc-deg').textContent = `${(subj.first_house.position || 0).toFixed(1)}°`;
                }

                saveToArchive({
                    type: 'Natal',
                    name: payload.name,
                    date: `${payload.day}/${payload.month}/${payload.year}`,
                    sun: ZODIAC_TR[subj.sun?.sign] || 'Güneş',
                    asc: ZODIAC_TR[subj.first_house?.sign] || 'Yükselen',
                    payload
                });
            }
        } catch (err) {
            svgContainer.innerHTML = `<p class="text-rose-400 text-sm">Hata: ${err.message}</p>`;
        } finally {
            btnCalc.disabled = false;
        }
    });

    // AI Interpretation
    btnAi.addEventListener('click', async () => {
        const payload = getNatalPayload();
        btnAi.disabled = true;
        aiCard.classList.remove('hidden');
        aiOutput.innerHTML = '<div class="text-secondary text-sm italic font-medium animate-pulse">🤖 Groq LLM Astroloji Modelleri Haritayı Analiz Ediyor...</div>';

        try {
            const res = await fetch('/api/v1/ai-interpretation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.status === 'success') {
                aiBadge.textContent = data.model_used || 'Groq LLM';
                aiOutput.innerHTML = marked.parse(data.ai_interpretation);
                aiCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                aiOutput.innerHTML = `<p class="text-rose-400 text-sm">Hata: ${data.detail || 'Analiz oluşturulamadı.'}</p>`;
            }
        } catch (err) {
            aiOutput.innerHTML = `<p class="text-rose-400 text-sm">AI Bağlantı Hatası: ${err.message}</p>`;
        } finally {
            btnAi.disabled = false;
        }
    });
}

/* ==================== 6. SYNASTRY FORM & AI ==================== */
function initSynastryForm() {
    const synForm = document.getElementById('synastry-form');
    const btnCalc = document.getElementById('btn-synastry-calc');
    const resultsContainer = document.getElementById('synastry-results');
    const svgContainer = document.getElementById('svg-synastry-container');
    const aiOutput = document.getElementById('ai-synastry-output');
    const aiBadge = document.getElementById('ai-syn-model-badge');

    synForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            first_subject: {
                name: document.getElementById('syn-name1').value || 'Kişi A',
                year: parseInt(document.getElementById('syn-y1').value),
                month: parseInt(document.getElementById('syn-m1').value),
                day: parseInt(document.getElementById('syn-d1').value),
                hour: parseInt(document.getElementById('syn-h1').value),
                minute: parseInt(document.getElementById('syn-mi1').value),
                city: "Istanbul", nation: "TR", lat: 41.0082, lng: 28.9784, tz_str: "Europe/Istanbul"
            },
            second_subject: {
                name: document.getElementById('syn-name2').value || 'Kişi B',
                year: parseInt(document.getElementById('syn-y2').value),
                month: parseInt(document.getElementById('syn-m2').value),
                day: parseInt(document.getElementById('syn-d2').value),
                hour: parseInt(document.getElementById('syn-h2').value),
                minute: parseInt(document.getElementById('syn-mi2').value),
                city: "Ankara", nation: "TR", lat: 39.9334, lng: 32.8597, tz_str: "Europe/Istanbul"
            }
        };

        btnCalc.disabled = true;
        resultsContainer.classList.remove('hidden');
        svgContainer.innerHTML = '<div class="text-tertiary text-sm italic animate-pulse">💞 Synastry Uyum Çarkı Çiziliyor...</div>';
        aiOutput.innerHTML = '<div class="text-secondary text-sm italic animate-pulse">🤖 Groq AI İlişki Yorumu Üretiliyor...</div>';

        try {
            const [svgRes, aiRes] = await Promise.all([
                fetch('/api/v1/synastry-chart/svg', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }),
                fetch('/api/v1/synastry-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            ]);

            const svgText = await svgRes.text();
            const aiData = await aiRes.json();

            svgContainer.innerHTML = svgText;

            if (aiData.status === 'success') {
                aiBadge.textContent = aiData.model_used || 'Groq LLM';
                aiOutput.innerHTML = marked.parse(aiData.ai_interpretation);
            } else {
                aiOutput.innerHTML = `<p class="text-rose-400 text-sm">AI Hata: ${aiData.detail || 'Analiz üretilemedi.'}</p>`;
            }

            saveToArchive({
                type: 'Uyum',
                name: `${payload.first_subject.name} & ${payload.second_subject.name}`,
                date: new Date().toLocaleDateString('tr-TR'),
                score: '84%',
                payload
            });
        } catch (err) {
            svgContainer.innerHTML = `<p class="text-rose-400 text-sm">Hata: ${err.message}</p>`;
        } finally {
            btnCalc.disabled = false;
        }
    });
}

/* ==================== 7. ARCHIVE MANAGEMENT ==================== */
function saveToArchive(item) {
    try {
        const raw = localStorage.getItem('lumina_archive');
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(item);
        localStorage.setItem('lumina_archive', JSON.stringify(list));
    } catch (e) {
        console.error('Save archive failed:', e);
    }
}

function renderArchive(filter = 'all') {
    const grid = document.getElementById('archive-grid');
    if (!grid) return;

    const raw = localStorage.getItem('lumina_archive');
    const list = raw ? JSON.parse(raw) : [];

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full cosmic-border p-8 rounded-3xl text-center space-y-3 glass-card">
                <div class="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center text-3xl text-on-surface-variant">
                    inventory_2
                </div>
                <h4 class="font-headline text-lg font-bold text-on-surface">Henüz Kayıtlı Analiz Yok</h4>
                <p class="text-xs text-on-surface-variant max-w-sm mx-auto">Natal veya Uyum sekmesinden yeni bir harita hesapladığınızda analizleriniz otomatik olarak buraya kaydedilir.</p>
                <button type="button" onclick="showTab('natal')" class="cosmic-btn text-white px-6 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2">
                    Yeni Harita Oluştur <span class="material-symbols-outlined text-sm">add_circle</span>
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map((item, idx) => `
        <div class="glass-card p-5 rounded-2xl relative group space-y-3">
            <div class="flex justify-between items-start">
                <span class="text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-white/10 ${item.type === 'Natal' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'}">
                    ${item.type}
                </span>
                <button onclick="deleteArchiveItem(${idx})" class="text-on-surface-variant hover:text-rose-400 text-xs">✕</button>
            </div>
            <div>
                <h4 class="font-headline text-lg font-bold text-on-surface">${item.name}</h4>
                <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-xs">calendar_today</span> ${item.date}
                </p>
            </div>
            <div class="flex gap-2">
                ${item.sun ? `<span class="px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-on-surface-variant border border-white/5">${item.sun}</span>` : ''}
                ${item.asc ? `<span class="px-2.5 py-1 rounded-full bg-white/5 text-[11px] text-on-surface-variant border border-white/5">Yükselen ${item.asc}</span>` : ''}
                ${item.score ? `<span class="px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary text-[11px] font-bold border border-tertiary/20">${item.score} Uyum</span>` : ''}
            </div>
        </div>
    `).join('');
}

window.filterArchive = function(filter) {
    renderArchive(filter);
};

window.deleteArchiveItem = function(idx) {
    const raw = localStorage.getItem('lumina_archive');
    if (!raw) return;
    const list = JSON.parse(raw);
    list.splice(idx, 1);
    localStorage.setItem('lumina_archive', JSON.stringify(list));
    renderArchive();
};

window.clearArchive = function() {
    if (confirm('Tüm arşiv kalıcı olarak silinecek. Emin misiniz?')) {
        localStorage.removeItem('lumina_archive');
        renderArchive();
    }
};
