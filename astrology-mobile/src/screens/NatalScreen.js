import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNatalChart, fetchNatalSVG, fetchAIInterpretation } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

const { width: SCREEN_W } = Dimensions.get('window');

const ZODIAC_TR = {
  Ari: '♈ Koç', Tau: '♉ Boğa', Gem: '♊ İkizler', Can: '♋ Yengeç',
  Leo: '♌ Aslan', Vir: '♍ Başak', Lib: '♎ Terazi', Sco: '♏ Akrep',
  Sag: '♐ Yay', Cap: '♑ Oğlak', Aqu: '♒ Kova', Pis: '♓ Balık'
};

const PLANET_EMOJI = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', True_Node: '☊', Mean_Lilith: '⚸',
};

const PRESETS = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara',   lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir',    lat: 38.4237, lng: 27.1428 },
  { name: 'Selanik',  lat: 40.6401, lng: 22.9444 },
  { name: 'London',   lat: 51.5074, lng: -0.1278 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
];

export default function NatalScreen() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('1995');
  const [month, setMonth] = useState('10');
  const [day, setDay] = useState('25');
  const [hour, setHour] = useState('14');
  const [minute, setMinute] = useState('30');
  const [lat, setLat] = useState('41.0082');
  const [lng, setLng] = useState('28.9784');
  const [selectedCity, setSelectedCity] = useState('İstanbul');

  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [svgXml, setSvgXml] = useState(null);

  const getPayload = () => ({
    name: name || 'Danışan',
    year: parseInt(year), month: parseInt(month), day: parseInt(day),
    hour: parseInt(hour), minute: parseInt(minute),
    city: selectedCity, nation: 'TR',
    lat: parseFloat(lat), lng: parseFloat(lng),
    tz_str: 'Europe/Istanbul', house_system: 'P'
  });

  const handleCalculate = async () => {
    setLoading(true);
    setChartData(null);
    setSvgXml(null);
    try {
      const payload = getPayload();
      const [jsonRes, svgRes] = await Promise.all([
        fetchNatalChart(payload),
        fetchNatalSVG(payload)
      ]);
      setChartData(jsonRes.data);
      setSvgXml(cleanSvgForMobile(svgRes));
    } catch (err) {
      Alert.alert('Bağlantı Hatası', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const profile = { name: name || 'Danışan', year, month, day, hour, minute, lat, lng, city: selectedCity, savedAt: new Date().toISOString() };
      const raw = await AsyncStorage.getItem('saved_charts');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(profile);
      await AsyncStorage.setItem('saved_charts', JSON.stringify(list));
      Alert.alert('Kaydedildi ✨', `${profile.name} profili başarıyla saklandı.`);
    } catch { Alert.alert('Hata', 'Kaydetme başarısız.'); }
  };

  const subj = chartData?.subject;
  const elDist = chartData?.element_distribution;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
      {/* ── Form Card ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>⭐ Doğum Bilgileri</Text>

        <TextInput style={s.input} value={name} onChangeText={setName}
          placeholder="Ad Soyad (isteğe bağlı)" placeholderTextColor="#475569" />

        <View style={s.row3}>
          <Field label="Yıl"  value={year}   set={setYear} />
          <Field label="Ay"   value={month}  set={setMonth} />
          <Field label="Gün"  value={day}    set={setDay} />
        </View>
        <View style={s.row2}>
          <Field label="Saat (0-23)" value={hour}   set={setHour} />
          <Field label="Dakika"      value={minute} set={setMinute} />
        </View>

        <Text style={s.label}>📍 Şehir</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {PRESETS.map(p => (
            <TouchableOpacity key={p.name}
              style={[s.chip, selectedCity === p.name && s.chipActive]}
              onPress={() => { setLat(p.lat.toString()); setLng(p.lng.toString()); setSelectedCity(p.name); }}>
              <Text style={[s.chipText, selectedCity === p.name && s.chipTextActive]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={s.btnPrimary} onPress={handleCalculate} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={s.btnPrimaryText}>🌌  Haritayı Hesapla & Çiz</Text>}
        </TouchableOpacity>
      </View>

      {/* ── SVG Wheel ── */}
      {svgXml && (
        <View style={s.card}>
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>🎨 Doğum Haritası Çarkı</Text>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Text style={s.saveBtnText}>💾 Kaydet</Text>
            </TouchableOpacity>
          </View>
          <View style={s.svgBox}>
            <SvgXml xml={svgXml} width={SCREEN_W - 64} height={SCREEN_W - 64} />
          </View>
        </View>
      )}

      {/* ── Planet Grid ── */}
      {subj && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>🪐 Gezegen Konumları</Text>
          <View style={s.planetGrid}>
            {['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','chiron','true_node'].map(key => {
              const p = subj[key];
              if (!p || typeof p !== 'object') return null;
              const emoji = PLANET_EMOJI[p.name] || '🪐';
              const sign = ZODIAC_TR[p.sign] || p.sign || '';
              return (
                <View key={key} style={s.planetCard}>
                  <Text style={s.planetEmoji}>{emoji}</Text>
                  <Text style={s.planetName}>{p.name}{p.retrograde ? ' ℞' : ''}</Text>
                  <Text style={s.planetSign}>{sign}</Text>
                  <Text style={s.planetDeg}>{(p.position ?? 0).toFixed(1)}°</Text>
                  {p.house != null && <Text style={s.planetHouse}>Ev {p.house}</Text>}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Element Bars ── */}
      {elDist && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>🔥 Element & Nitelik Dengesi</Text>
          <ElBar label="Ateş 🔥"   pct={elDist.fire_percentage}  color="#FF4E50" />
          <ElBar label="Toprak 🌍" pct={elDist.earth_percentage} color="#11998e" />
          <ElBar label="Hava 💨"   pct={elDist.air_percentage}   color="#00B4DB" />
          <ElBar label="Su 🌊"    pct={elDist.water_percentage}  color="#8E2DE2" />
        </View>
      )}
    </ScrollView>
  );
}

/* ── Tiny helpers ── */
function Field({ label, value, set }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} value={value} onChangeText={set} keyboardType="numeric" />
    </View>
  );
}

function ElBar({ label, pct, color }) {
  const w = Math.max(pct ?? 0, 2);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={s.barHeader}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={s.barPct}>{pct ?? 0}%</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${w}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

/* ── Styles ── */
const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#05051A' },
  scrollContent: { padding: 14, paddingBottom: 32 },

  card: {
    backgroundColor: 'rgba(14,14,38,0.92)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#FFD700', marginBottom: 12, letterSpacing: 0.3 },

  label: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6, marginBottom: 3 },
  input: {
    backgroundColor: '#0F0F2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F1F5F9',
    fontSize: 14,
  },
  row3: { flexDirection: 'row', gap: 8 },
  row2: { flexDirection: 'row', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 6,
  },
  chipActive: { backgroundColor: 'rgba(0,223,216,0.15)', borderColor: '#00DFD8' },
  chipText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#00DFD8' },

  btnPrimary: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#7928CA',
  },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  saveBtn: { backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  saveBtnText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },

  svgBox: { alignItems: 'center', marginTop: 8, backgroundColor: '#05051A', borderRadius: 14, padding: 6 },

  planetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planetCard: {
    alignItems: 'center',
    width: (SCREEN_W - 28 - 16 - 24) / 4,
    backgroundColor: '#0F0F2E',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  planetEmoji: { fontSize: 22, marginBottom: 2 },
  planetName: { color: '#F1F5F9', fontSize: 10, fontWeight: '700' },
  planetSign: { color: '#00DFD8', fontSize: 9, marginTop: 1 },
  planetDeg: { color: '#94A3B8', fontSize: 9 },
  planetHouse: { color: '#FFD700', fontSize: 8, fontWeight: '700', marginTop: 1 },

  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  barLabel: { color: '#CBD5E1', fontSize: 12 },
  barPct: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  barTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4 },
  barFill: { height: 7, borderRadius: 4 },
});
