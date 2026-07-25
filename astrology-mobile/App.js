import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WelcomeScreen from './src/screens/WelcomeScreen';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import AIScreen from './src/screens/AIScreen';
import SavedScreen from './src/screens/SavedScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [userEmail, setUserEmail] = useState(null);

  // For Web platform: render the exact HTML Web UI matching user's mockup!
  if (Platform.OS === 'web') {
    return <WebEpicUI activeTab={activeTab} setActiveTab={setActiveTab} userEmail={userEmail} setUserEmail={setUserEmail} />;
  }

  // Native Mobile UI
  const screen = (() => {
    switch (activeTab) {
      case 'welcome':  return <WelcomeScreen onStart={() => setActiveTab('natal')} onLoginSuccess={(e) => { setUserEmail(e); setActiveTab('natal'); }} />;
      case 'natal':    return <NatalScreen />;
      case 'synastry': return <SynastryScreen />;
      case 'ai':       return <AIScreen />;
      case 'saved':    return <SavedScreen />;
      default:         return <NatalScreen />;
    }
  })();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#070714" />
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>LUMINA ASTRA</Text>
            <Text style={styles.brandSub}>{userEmail ? `👤 ${userEmail}` : 'Kozmik Astroloji Engine'}</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}><Text style={styles.badgeText}>Swiss Eph.</Text></View>
            <View style={[styles.badge, styles.badgeAccent]}><Text style={[styles.badgeText, styles.badgeAccentText]}>Groq AI</Text></View>
          </View>
        </View>

        <View style={styles.content}>{screen}</View>

        <NativeTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function NativeTabBar({ activeTab, setActiveTab }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: 'natal',    label: 'Harita', sub: 'Natal' },
    { key: 'synastry', label: 'Uyum',   sub: 'Synastry' },
    { key: 'ai',       label: 'AI',     sub: 'Groq LLM' },
    { key: 'saved',    label: 'Arşiv',  sub: 'Kayıtlar' },
    { key: 'welcome',  label: 'Profil', sub: 'Hesap' },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.6}
          >
            <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            <Text style={[styles.tabSub, active && styles.tabSubActive]}>{tab.sub}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ==================== SVG CLEAN & CROP HELPER ==================== */
function cleanAndCropSvgForWeb(svgStr) {
  if (!svgStr) return '';
  let cleaned = svgStr.replace(/var\(\s*(--[a-z0-9-_]+)\s*\)/gi, 'var($1)');

  const colorMap = {
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
  };
  for (const [v, c] of Object.entries(colorMap)) { cleaned = cleaned.replaceAll(v, c); }
  cleaned = cleaned.replace(/var\(--[a-z0-9-_]+\)/gi, '#94A3B8');

  // Crop viewBox to focus 100% on the central 360-degree astrological wheel
  cleaned = cleaned.replace(/viewBox=['"][^'"]*['"]/gi, "viewBox='95 35 490 490'");

  const cssHide = `
  <style>
    g[kr\\:node="Top_Left_Text"],
    g[kr\\:node="Elements_Percentages"],
    g[kr\\:node="Qualities_Percentages"],
    g[kr\\:node="Bottom_Left_Text"],
    g[kr\\:node="Houses_And_Planets_Grid"],
    g[kr\\:node="Aspect_Grid"],
    g[kr\\:node="Main_Planet_Grid"],
    text[kr\\:node="Chart_Title"] { display: none !important; }
    rect[style*="fill:#ffffff"], rect[style*="fill: #ffffff"], rect[fill="#ffffff"] { fill: transparent !important; }
  </style>
  `;
  return cleaned.replace('</svg>', cssHide + '</svg>');
}

/* ==================== MARKDOWN PARSER HELPER ==================== */
function parseMarkdownToSections(mdStr) {
  if (!mdStr) return [];
  const rawSections = mdStr.split(/(?=###|\n##\s)/g);
  return rawSections.map((sec, i) => {
    const lines = sec.trim().split('\n');
    let title = lines[0].replace(/^#+\s*/, '').replace(/^[^\w\sğüşıöçĞÜŞİÖÇ]+/, '').trim();
    if (!title) title = `Kozmik Bölüm ${i + 1}`;
    const body = lines.slice(1).join('\n').trim() || sec.trim();
    return { id: i, title, body };
  });
}

/* ==================== WEB EPIC UI COMPONENT ==================== */
function WebEpicUI({ activeTab, setActiveTab, userEmail, setUserEmail }) {
  useEffect(() => {
    const canvas = document.getElementById('shader-bg') || document.createElement('canvas');
    canvas.id = 'shader-bg';
    if (!document.body.contains(canvas)) document.body.prepend(canvas);

    const gl = canvas.getContext('webgl');
    if (gl) {
      const vsSource = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() { v_texCoord = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
      `;
      const fsSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;

        float noise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

        void main() {
          vec2 uv = v_texCoord;
          vec3 color = vec3(0.01, 0.02, 0.05);
          float n = 0.0; vec2 st = uv * 3.5;
          for(int i=0; i<4; i++) { n += noise(st + u_time * 0.05) * (1.0 / float(i+1)); st *= 1.8; }
          color += vec3(0.08, 0.04, 0.15) * n * 0.4;
          float stars = pow(noise(uv * 40.0 + sin(u_time * 0.02)), 25.0);
          color += vec3(stars) * (0.4 + 0.6 * sin(u_time * 0.5 + uv.x * 8.0));
          float dist = distance(uv, vec2(0.5));
          color *= 1.1 - smoothstep(0.4, 1.0, dist);
          gl_FragColor = vec4(color, 1.0);
        }
      `;
      const cs = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, cs(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

      const pLoc = gl.getAttribLocation(prog, 'position');
      const tLoc = gl.getUniformLocation(prog, 'u_time');
      const rLoc = gl.getUniformLocation(prog, 'u_resolution');

      const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; gl.viewport(0, 0, canvas.width, canvas.height); };
      window.addEventListener('resize', resize);
      resize();

      let reqId;
      const render = (t) => {
        gl.useProgram(prog);
        gl.enableVertexAttribArray(pLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(tLoc, t * 0.001);
        gl.uniform2f(rLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        reqId = requestAnimationFrame(render);
      };
      reqId = requestAnimationFrame(render);

      return () => { cancelAnimationFrame(reqId); window.removeEventListener('resize', resize); };
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0B0D17', color: '#e2e2e2' }}>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 backdrop-blur-xl border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('welcome')}>
          <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-widest uppercase">Lumina Astra</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://astrology-k5kd.onrender.com/docs" target="_blank" rel="noreferrer" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 glass-card text-on-surface-variant hover:text-secondary transition-colors">
            Swagger API Docs
          </a>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-32 px-4 md:px-8 max-w-6xl mx-auto w-full flex-1">
        {activeTab === 'welcome' && <WebWelcomeView onStart={() => setActiveTab('natal')} onLoginSuccess={(e) => { setUserEmail(e); setActiveTab('natal'); }} />}
        {activeTab === 'natal' && <WebNatalView />}
        {activeTab === 'synastry' && <WebSynastryView />}
        {activeTab === 'saved' && <WebArchiveView onNewAnalysis={() => setActiveTab('natal')} />}
      </main>

      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 backdrop-blur-3xl border-t border-white/5 bg-black/40">
        <button onClick={() => setActiveTab('natal')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'natal' ? 'text-secondary font-bold' : 'text-on-surface/60 hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'natal' ? "'FILL' 1" : "'FILL' 0" }}>explore</span>
          <span className="text-[11px]">Harita</span>
        </button>
        <button onClick={() => setActiveTab('synastry')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'synastry' ? 'text-secondary font-bold' : 'text-on-surface/60 hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'synastry' ? "'FILL' 1" : "'FILL' 0" }}>star_half</span>
          <span className="text-[11px]">Uyum</span>
        </button>
        <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'saved' ? 'text-tertiary font-bold' : 'text-on-surface/60 hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'saved' ? "'FILL' 1" : "'FILL' 0" }}>inventory_2</span>
          <span className="text-[11px]">Arşiv</span>
        </button>
        <button onClick={() => setActiveTab('welcome')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'welcome' ? 'text-secondary font-bold' : 'text-on-surface/60 hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'welcome' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span className="text-[11px]">Profil</span>
        </button>
      </nav>
    </div>
  );
}

/* ==================== WEB WELCOME VIEW ==================== */
function WebWelcomeView({ onStart, onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const container = document.getElementById('astrolabe-3d-web');
    if (!container || typeof window.THREE === 'undefined') return;

    const scene = new window.THREE.Scene();
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 320;
    const camera = new window.THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    const group = new window.THREE.Group();
    scene.add(group);

    const mat = new window.THREE.MeshPhongMaterial({ color: 0xddb7ff, emissive: 0x622599, shininess: 100, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 3; i++) {
      const geom = new window.THREE.TorusGeometry(2 + i * 0.8, 0.02, 16, 100);
      const ring = new window.THREE.Mesh(geom, mat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      group.add(ring);
    }
    const sunGeom = new window.THREE.SphereGeometry(0.5, 32, 32);
    const sunMat = new window.THREE.MeshBasicMaterial({ color: 0xffd700 });
    group.add(new window.THREE.Mesh(sunGeom, sunMat));

    const light = new window.THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new window.THREE.AmbientLight(0x404040));
    camera.position.z = 8;

    let reqId;
    const anim = () => {
      group.rotation.y += 0.005;
      group.rotation.x += 0.003;
      group.position.y = Math.sin(Date.now() * 0.001) * 0.2;
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(anim);
    };
    anim();

    return () => { cancelAnimationFrame(reqId); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); };
  }, [showLogin]);

  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto py-4">
      {!showLogin ? (
        <>
          <div id="astrolabe-3d-web" className="w-full h-72 relative flex items-center justify-center mb-4"></div>
          <h2 className="font-headline text-4xl font-bold text-on-surface mb-3">Kozmos Sizi Bekliyor</h2>
          <p className="text-on-surface-variant font-body text-base mb-8 max-w-md">
            Kadim astroloji bilgeliği ile modern veri biliminin kesiştiği noktada kendi yıldız haritanızı keşfedin.
          </p>

          <button onClick={onStart} className="w-full py-5 bg-secondary-container text-secondary font-headline font-bold text-xl rounded-xl shadow-[0_0_30px_rgba(98,37,153,0.5)] hover:shadow-[0_0_40px_rgba(98,37,153,0.7)] hover:scale-[1.02] active:scale-95 transition-all mb-4 border border-white/10 flex items-center justify-center gap-3">
            Kozmik Yolculuğunuza Başlayın <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <button onClick={() => setShowLogin(true)} className="text-on-surface-variant hover:text-tertiary transition-colors text-sm mb-10">
            Zaten bir hesabınız var mı? <span className="text-tertiary font-bold">Giriş Yapın</span>
          </button>

          <div className="grid grid-cols-2 gap-4 w-full text-left">
            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="material-symbols-outlined text-tertiary text-3xl">auto_graph</span>
              <h4 className="font-label-caps text-xs font-bold text-tertiary tracking-widest">ANALİZ</h4>
              <p className="text-xs text-on-surface-variant">Detaylı natal harita ve Swiss Ephemeris dereceleri.</p>
            </div>
            <div className="glass-card p-5 rounded-2xl space-y-2">
              <span className="material-symbols-outlined text-secondary text-3xl">psychology_alt</span>
              <h4 className="font-label-caps text-xs font-bold text-secondary tracking-widest">KEŞİF</h4>
              <p className="text-xs text-on-surface-variant">Kişisel potansiyelinizi yıldızlarla görün.</p>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card w-full p-8 rounded-3xl space-y-6 text-left">
          <div>
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-1">Tekrar Hoş Geldiniz</h2>
            <p className="text-xs text-on-surface-variant">Yıldızların altındaki yerinize geri dönün.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onLoginSuccess(email || 'demo@luminaastra.com'); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">E-POSTA ADRESİ</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kozmos@luminaastra.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" required/>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">ŞİFRE</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-tertiary/50" required/>
            </div>
            <button type="submit" className="w-full py-4 bg-secondary-container text-secondary font-headline font-bold text-lg rounded-xl hover:shadow-[0_0_25px_rgba(98,37,153,0.4)] transition-all border border-white/10">
              Giriş Yap
            </button>
          </form>
          <button onClick={() => setShowLogin(false)} className="w-full text-center text-xs text-tertiary hover:underline">
            Geri Dön
          </button>
        </div>
      )}
    </div>
  );
}

/* ==================== WEB NATAL VIEW ==================== */
function WebNatalView() {
  const [name, setName] = useState('Mustafa Kemal Atatürk');
  const [year, setYear] = useState('1881');
  const [month, setMonth] = useState('5');
  const [day, setDay] = useState('19');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('0');
  const [lat, setLat] = useState('40.6401');
  const [lng, setLng] = useState('22.9444');
  const [loading, setLoading] = useState(false);
  const [svg, setSvg] = useState(null);
  const [natalData, setNatalData] = useState(null);
  const [aiSections, setAiSections] = useState([]);
  const [aiModel, setAiModel] = useState('');
  const [openAccordion, setOpenAccordion] = useState(0);

  const calculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setSvg(null); setNatalData(null); setAiSections([]);
    const payload = { name, year: +year, month: +month, day: +day, hour: +hour, minute: +minute, city: 'PresetCity', nation: 'TR', lat: +lat, lng: +lng, tz_str: 'Europe/Istanbul', house_system: 'P' };
    try {
      const [jsonRes, svgRes, aiRes] = await Promise.all([
        fetch('https://astrology-k5kd.onrender.com/api/v1/natal-chart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch('https://astrology-k5kd.onrender.com/api/v1/natal-chart/svg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch('https://astrology-k5kd.onrender.com/api/v1/ai-interpretation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      ]);
      const json = await jsonRes.json();
      const svgText = await svgRes.text();
      const aiData = await aiRes.json();

      setNatalData(json.data);
      setSvg(cleanAndCropSvgForWeb(svgText));
      if (aiData.status === 'success') {
        setAiSections(parseMarkdownToSections(aiData.ai_interpretation));
        setAiModel(aiData.model_used);
      }
    } catch (err) { alert('Hata: ' + err.message); }
    finally { setLoading(false); }
  };

  const sunSign = natalData?.sun?.sign || 'Boğa / Aslan';
  const sunPos = natalData?.sun?.position ? `${natalData.sun.position.toFixed(1)}°` : '';
  const moonSign = natalData?.moon?.sign || 'Akrep / Balık';
  const moonPos = natalData?.moon?.position ? `${natalData.moon.position.toFixed(1)}°` : '';
  const ascSign = natalData?.first_house?.sign || 'Oğlak / Terazi';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-2">Kozmik İmzanızı Keşfedin</h2>
        <p className="text-on-surface-variant font-body text-sm md:text-base italic">Doğum anınızdaki göksel hizalanmaları analiz ederek kaderinizin derinliklerine inelim.</p>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
        <form onSubmit={calculate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-primary/80 uppercase mb-1">Tam İsim</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-secondary/50" required/>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-primary/80 uppercase mb-1">Hızlı Şehir</label>
              <div className="flex gap-2 py-1">
                <button type="button" onClick={() => { setLat('41.0082'); setLng('28.9784'); }} className="px-3 py-1.5 glass-card rounded-lg text-xs font-semibold hover:border-secondary">İstanbul</button>
                <button type="button" onClick={() => { setLat('39.9334'); setLng('32.8597'); }} className="px-3 py-1.5 glass-card rounded-lg text-xs font-semibold hover:border-secondary">Ankara</button>
                <button type="button" onClick={() => { setLat('40.6401'); setLng('22.9444'); }} className="px-3 py-1.5 glass-card rounded-lg text-xs font-semibold hover:border-secondary">Selanik</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Yıl" className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center text-sm" required/>
            <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Ay" className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center text-sm" required/>
            <input type="number" value={day} onChange={(e) => setDay(e.target.value)} placeholder="Gün" className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center text-sm" required/>
            <input type="number" value={hour} onChange={(e) => setHour(e.target.value)} placeholder="Saat" className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center text-sm" required/>
            <input type="number" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="Dk" className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center text-sm" required/>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-secondary-container text-secondary font-headline font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(98,37,153,0.5)] hover:shadow-[0_0_40px_rgba(98,37,153,0.7)] transition-all flex items-center justify-center gap-2">
            {loading ? '🌌 İsviçre Efemerisleri & AI Hesaplıyor...' : '✨ Haritayı Oluştur & Derin Analiz Et'}
          </button>
        </form>
      </div>

      {/* Dynamic Big Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
          </div>
          <span className="text-xs font-semibold text-secondary uppercase mb-1">Güneş Burcu</span>
          <h3 className="font-headline text-2xl font-bold text-on-surface">{sunSign} {sunPos}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Özgüven, temel karakter ve liderlik potansiyeli.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
          </div>
          <span className="text-xs font-semibold text-primary uppercase mb-1">Ay Burcu</span>
          <h3 className="font-headline text-2xl font-bold text-on-surface">{moonSign} {moonPos}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Derin duygusal dünya ve bilinçdışı sezgiler.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-tertiary/20 rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>north_east</span>
          </div>
          <span className="text-xs font-semibold text-tertiary uppercase mb-1">Yükselen (ASC)</span>
          <h3 className="font-headline text-2xl font-bold text-on-surface">{ascSign}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Dış dünya maskesi, fiziksel beden ve ilk izlenim.</p>
        </div>
      </div>

      {/* High-Definition Cleaned & Cropped SVG Chart Wheel */}
      {svg && (
        <div className="glass-card rounded-3xl p-6 text-center space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-headline text-xl font-bold text-on-surface">Doğum Haritası Çarkı</h3>
            <span className="text-xs font-bold text-tertiary bg-tertiary/10 border border-tertiary/30 px-3 py-1 rounded-full">360° İsviçre Efemerisi</span>
          </div>
          <div className="flex justify-center items-center w-full overflow-hidden py-2" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      )}

      {/* Styled Accordion Groq AI Report */}
      {aiSections.length > 0 && (
        <div className="glass-card rounded-3xl overflow-hidden space-y-0">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Derinlemesine Groq AI Analizi</h3>
              <p className="text-xs text-on-surface-variant italic">Göksel konumların bütünsel psikolojik yorumu</p>
            </div>
            <span className="bg-secondary/10 border border-secondary/30 text-secondary text-xs font-bold px-3.5 py-1.5 rounded-full">{aiModel || 'Llama 3.3 70B'}</span>
          </div>

          <div className="divide-y divide-white/5">
            {aiSections.map((sec, idx) => {
              const isOpen = openAccordion === idx;
              return (
                <div key={sec.id} className="accordion-item">
                  <button onClick={() => setOpenAccordion(isOpen ? -1 : idx)} className="w-full flex justify-between items-center p-6 hover:bg-white/5 transition-all text-left group">
                    <span className="font-body text-base font-semibold text-on-surface group-hover:text-secondary transition-colors flex items-center gap-4">
                      <span className="w-7 h-7 rounded-full border border-secondary/50 flex items-center justify-center text-xs font-bold text-secondary">0{idx + 1}</span>
                      {sec.title}
                    </span>
                    <span className={`material-symbols-outlined transition-transform duration-300 text-on-surface-variant ${isOpen ? 'rotate-180 text-secondary' : ''}`}>expand_more</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-on-surface-variant/90 text-sm leading-relaxed ml-11 border-l-2 border-secondary/30 whitespace-pre-line">
                      {sec.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== WEB SYNASTRY VIEW ==================== */
function WebSynastryView() {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(84);
  const [svg, setSvg] = useState(null);

  const calc = async () => {
    setLoading(true);
    const payload = {
      first_subject: { name: 'Zeynep', year: 1992, month: 5, day: 14, hour: 4, minute: 30, city: 'Istanbul', nation: 'TR', lat: 41.0082, lng: 28.9784, tz_str: 'Europe/Istanbul' },
      second_subject: { name: 'Can', year: 1990, month: 11, day: 20, hour: 18, minute: 15, city: 'Ankara', nation: 'TR', lat: 39.9334, lng: 32.8597, tz_str: 'Europe/Istanbul' }
    };
    try {
      const res = await fetch('https://astrology-k5kd.onrender.com/api/v1/synastry-chart/svg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const svgText = await res.text();
      setSvg(cleanAndCropSvgForWeb(svgText)); setScore(84);
    } catch (e) { alert('Hata: ' + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-2">Uyum Analizi (Synastry)</h2>
        <p className="text-on-surface-variant font-body text-sm md:text-base">Yıldızların rehberliğinde iki ruhun arasındaki kozmik bağı keşfedin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6 space-y-3">
          <h3 className="font-headline text-lg font-bold text-tertiary">Birinci Kişi</h3>
          <input type="text" defaultValue="Zeynep" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" defaultValue="1992-05-14" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs" />
            <input type="time" defaultValue="04:30" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 space-y-3">
          <h3 className="font-headline text-lg font-bold text-secondary">İkinci Kişi</h3>
          <input type="text" defaultValue="Can" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" defaultValue="1990-11-20" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs" />
            <input type="time" defaultValue="18:15" className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs" />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={calc} disabled={loading} className="px-10 py-4 bg-secondary-container text-secondary font-headline font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(98,37,153,0.5)] hover:scale-[1.02] transition-all">
          {loading ? 'Hesaplanıyor...' : 'Uyum Analizini Başlat ✨'}
        </button>
      </div>

      {score && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-36 h-36 rounded-full border-4 border-secondary flex flex-col items-center justify-center mb-4 bg-secondary/10 shadow-[0_0_20px_rgba(221,183,255,0.4)]">
              <span className="font-headline text-4xl font-extrabold text-on-surface">%{score}</span>
              <span className="text-[10px] font-bold text-tertiary tracking-widest mt-1">UYUM</span>
            </div>
            <h4 className="font-headline text-lg font-bold text-on-surface mb-1">Kozmik Uyum Yüksek</h4>
            <p className="text-xs text-on-surface-variant">Ruhsal ve zihinsel düzeyde güçlü bir rezonans görülüyor.</p>
          </div>

          <div className="md:col-span-2 glass-card rounded-3xl p-6 space-y-4">
            <h4 className="font-headline text-base font-bold text-tertiary uppercase tracking-wider">YAPAY ZEKA UYUM RAPORU</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Ay ve Venüs yerleşimleri, taraflar arasında derin bir şefkat ve empati bağının olduğunu işaret ediyor. Duygusal ihtiyaçlar karşılıklı olarak seziliyor. Venüs-Jüpiter olumlu açısı neşe ve büyüme odaklı birlikteliği simgeliyor.
            </p>
          </div>
        </div>
      )}

      {svg && (
        <div className="glass-card rounded-3xl p-6 text-center space-y-4">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Synastry Uyum Çarkı</h3>
          <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center" />
        </div>
      )}
    </div>
  );
}

/* ==================== WEB ARCHIVE VIEW ==================== */
function WebArchiveView({ onNewAnalysis }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline text-3xl font-bold text-on-surface mb-1">Kozmik Arşiv</h2>
        <p className="text-on-surface-variant text-sm">Kaydedilmiş tüm natal haritalarınız ve uyum analizleriniz burada saklanır.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button className="px-4 py-1.5 rounded-full bg-tertiary text-black text-xs font-bold shadow-lg">TÜMÜ</button>
        <button className="px-4 py-1.5 rounded-full glass-card text-on-surface-variant text-xs font-bold hover:text-on-surface">NATAL HARİTALAR</button>
        <button className="px-4 py-1.5 rounded-full glass-card text-on-surface-variant text-xs font-bold hover:text-on-surface">UYUM RAPORLARI</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-3 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-on-surface-variant bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase">Natal</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-on-surface">Selim Yılmaz</h3>
          <p className="text-xs text-on-surface-variant">14 May 1992 • 04:30</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-on-surface-variant">Boğa</span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-on-surface-variant">Yükselen Akrep</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-3 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 px-3 py-1 rounded-full border border-tertiary/20 uppercase">Uyum</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-on-surface">Zeynep & Can</h3>
          <p className="text-xs text-on-surface-variant">2 saat önce kaydedildi</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold">%84 Uyum</span>
          </div>
        </div>

        <div onClick={onNewAnalysis} className="cosmic-border p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] hover:border-secondary transition-all">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-secondary text-2xl">+</div>
          <h4 className="font-headline text-lg font-bold text-on-surface">Yeni Analiz</h4>
          <p className="text-xs text-on-surface-variant mt-1">Harita veya uyum raporu ekleyin</p>
        </div>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070714' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(7,7,20,0.95)' },
  brand: { fontSize: 17, fontWeight: '800', color: '#FAFAFA', letterSpacing: 2.5 },
  brandSub: { fontSize: 10, color: '#A1A1AA', fontWeight: '500', letterSpacing: 1, marginTop: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, backgroundColor: '#14142B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#A1A1AA', letterSpacing: 0.3 },
  badgeAccent: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  badgeAccentText: { color: '#F5F3FF', fontWeight: '800' },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: '#0E0E1F', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 10, paddingHorizontal: 6 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, minHeight: 56, justifyContent: 'center' },
  tabActive: { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  tabIndicator: { width: 18, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 5 },
  tabIndicatorActive: { backgroundColor: '#7C3AED' },
  tabLabel: { fontSize: 12, fontWeight: '700', color: '#52525B' },
  tabLabelActive: { color: '#FAFAFA' },
  tabSub: { fontSize: 8, fontWeight: '500', color: '#3F3F46', marginTop: 2 },
  tabSubActive: { color: '#A1A1AA' },
});
