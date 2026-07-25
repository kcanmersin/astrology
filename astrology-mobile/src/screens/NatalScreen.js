import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNatalChart, fetchNatalSVG } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

const { width: SW } = Dimensions.get('window');

const ZODIAC = {
  Ari: 'Koç', Tau: 'Boğa', Gem: 'İkizler', Can: 'Yengeç',
  Leo: 'Aslan', Vir: 'Başak', Lib: 'Terazi', Sco: 'Akrep',
  Sag: 'Yay', Cap: 'Oğlak', Aqu: 'Kova', Pis: 'Balık',
};

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', True_Node: '☊', Mean_Lilith: '⚸',
};

const PLANET_COLORS = {
  Sun: '#FACC15', Moon: '#E2E8F0', Mercury: '#A78BFA', Venus: '#F472B6',
  Mars: '#EF4444', Jupiter: '#FB923C', Saturn: '#A3A3A3', Uranus: '#2DD4BF',
  Neptune: '#60A5FA', Pluto: '#C084FC', Chiron: '#34D399', True_Node: '#FDE047',
};

const CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara',   lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir',    lat: 38.4237, lng: 27.1428 },
  { name: 'Selanik',  lat: 40.6401, lng: 22.9444 },
  { name: 'London',   lat: 51.5074, lng: -0.1278 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
];

const EL_COLORS = { fire: '#EF4444', earth: '#22C55E', air: '#38BDF8', water: '#8B5CF6' };

export default function NatalScreen() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('1995');
  const [month, setMonth] = useState('10');
  const [day, setDay] = useState('25');
  const [hour, setHour] = useState('14');
  const [minute, setMinute] = useState('30');
  const [lat, setLat] = useState('41.0082');
  const [lng, setLng] = useState('28.9784');
  const [city, setCity] = useState('İstanbul');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [svgXml, setSvgXml] = useState(null);
  const [formOpen, setFormOpen] = useState(true);

  const mkPayload = () => ({
    name: name || 'Danışan', year: +year, month: +month, day: +day,
    hour: +hour, minute: +minute, city, nation: 'TR',
    lat: parseFloat(lat), lng: parseFloat(lng),
    tz_str: 'Europe/Istanbul', house_system: 'P',
  });

  const calculate = async () => {
    setLoading(true); setChartData(null); setSvgXml(null);
    try {
      const p = mkPayload();
      const [json, svg] = await Promise.all([fetchNatalChart(p), fetchNatalSVG(p)]);
      setChartData(json.data);
      setSvgXml(cleanSvgForMobile(svg));
      setFormOpen(false);
    } catch (e) { Alert.alert('Hata', e.message); }
    finally { setLoading(false); }
  };

  const save = async () => {
    try {
      const p = { name: name || 'Danışan', year, month, day, hour, minute, lat, lng, city, savedAt: new Date().toISOString() };
      const raw = await AsyncStorage.getItem('saved_charts');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(p);
      await AsyncStorage.setItem('saved_charts', JSON.stringify(list));
      Alert.alert('Kaydedildi', `${p.name} profili kayıtlara eklendi.`);
    } catch { Alert.alert('Hata', 'Kaydetme başarısız.'); }
  };

  const subj = chartData?.subject;
  const el = chartData?.element_distribution;
  const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','chiron','true_node'];

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>

      {/* ── Title Banner ── */}
      <View style={s.banner}>
        <Text style={s.bannerTitle}>Kozmik İmzanızı Keşfedin</Text>
        <Text style={s.bannerSub}>Swiss Ephemeris NASA doğruluk standartlarında harita analizi.</Text>
      </View>

      {/* ── Form Card ── */}
      <TouchableOpacity style={s.sectionHeader} onPress={() => setFormOpen(!formOpen)} activeOpacity={0.7}>
        <View>
          <Text style={s.sectionTitle}>Doğum Bilgileri Girişi</Text>
          {!formOpen && <Text style={s.sectionMeta}>{name || 'Danışan'} · {day}.{month}.{year} · {city}</Text>}
        </View>
        <Text style={s.chevron}>{formOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {formOpen && (
        <View style={s.formCard}>
          <Text style={s.lbl}>Ad Soyad / Etiket</Text>
          <TextInput style={s.inp} value={name} onChangeText={setName}
            placeholder="İsteğe bağlı" placeholderTextColor="#3F3F46" />

          <View style={s.fieldGrid}>
            <View style={s.fieldHalf}>
              <Text style={s.lbl}>Doğum Tarihi</Text>
              <View style={s.dateRow}>
                <TextInput style={[s.inp, s.dateInp]} value={day} onChangeText={setDay} keyboardType="numeric" placeholder="GG" placeholderTextColor="#3F3F46" />
                <Text style={s.dateSep}>/</Text>
                <TextInput style={[s.inp, s.dateInp]} value={month} onChangeText={setMonth} keyboardType="numeric" placeholder="AA" placeholderTextColor="#3F3F46" />
                <Text style={s.dateSep}>/</Text>
                <TextInput style={[s.inp, { flex: 1.4 }]} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="YYYY" placeholderTextColor="#3F3F46" />
              </View>
            </View>
            <View style={s.fieldHalf}>
              <Text style={s.lbl}>Doğum Saat</Text>
              <View style={s.dateRow}>
                <TextInput style={[s.inp, s.dateInp]} value={hour} onChangeText={setHour} keyboardType="numeric" placeholder="SS" placeholderTextColor="#3F3F46" />
                <Text style={s.dateSep}>:</Text>
                <TextInput style={[s.inp, s.dateInp]} value={minute} onChangeText={setMinute} keyboardType="numeric" placeholder="DD" placeholderTextColor="#3F3F46" />
              </View>
            </View>
          </View>

          <Text style={s.lbl}>Konum Seçimi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
            {CITIES.map(c => (
              <TouchableOpacity key={c.name}
                style={[s.chip, city === c.name && s.chipOn]}
                onPress={() => { setLat(c.lat.toString()); setLng(c.lng.toString()); setCity(c.name); }}>
                <Text style={[s.chipTxt, city === c.name && s.chipTxtOn]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={s.primaryBtn} onPress={calculate} disabled={loading} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={s.primaryBtnTxt}>🌌 Haritayı Çiz & Hesapla</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Big Three Cards (Güneş, Ay, Yükselen) ── */}
      {subj && (
        <View style={s.bigThreeGrid}>
          <View style={[s.bigThreeCard, { borderColor: '#FACC15' }]}>
            <Text style={s.bigThreeIcon}>☉</Text>
            <Text style={s.bigThreeLabel}>GÜNEŞ</Text>
            <Text style={s.bigThreeSign}>{ZODIAC[subj.sun?.sign] || subj.sun?.sign || '—'}</Text>
            <Text style={s.bigThreeDeg}>{(subj.sun?.position || 0).toFixed(1)}° ({subj.sun?.house}. Ev)</Text>
          </View>

          <View style={[s.bigThreeCard, { borderColor: '#A78BFA' }]}>
            <Text style={s.bigThreeIcon}>☽</Text>
            <Text style={s.bigThreeLabel}>AY</Text>
            <Text style={s.bigThreeSign}>{ZODIAC[subj.moon?.sign] || subj.moon?.sign || '—'}</Text>
            <Text style={s.bigThreeDeg}>{(subj.moon?.position || 0).toFixed(1)}° ({subj.moon?.house}. Ev)</Text>
          </View>

          <View style={[s.bigThreeCard, { borderColor: '#34D399' }]}>
            <Text style={s.bigThreeIcon}>⇡</Text>
            <Text style={s.bigThreeLabel}>YÜKSELEN</Text>
            <Text style={s.bigThreeSign}>{ZODIAC[subj.first_house?.sign] || subj.first_house?.sign || '—'}</Text>
            <Text style={s.bigThreeDeg}>{(subj.first_house?.position || 0).toFixed(1)}°</Text>
          </View>
        </View>
      )}

      {/* ── Chart Wheel SVG ── */}
      {svgXml && (
        <View style={s.card}>
          <View style={s.cardTopRow}>
            <Text style={s.cardTitle}>Doğum Haritası Çarkı</Text>
            <View style={s.btnGroup}>
              <TouchableOpacity style={s.smallBtn} onPress={() => setFormOpen(true)}>
                <Text style={s.smallBtnTxt}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.smallBtn} onPress={save}>
                <Text style={s.smallBtnTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.svgContainer}>
            <SvgXml xml={svgXml} width={SW - 64} height={SW - 64} />
          </View>
        </View>
      )}

      {/* ── Element Distribution ── */}
      {el && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Element Dağılımı</Text>
          <View style={s.elGrid}>
            {[
              { key: 'fire', label: 'Ateş', pct: el.fire_percentage },
              { key: 'earth', label: 'Toprak', pct: el.earth_percentage },
              { key: 'air', label: 'Hava', pct: el.air_percentage },
              { key: 'water', label: 'Su', pct: el.water_percentage },
            ].map(e => (
              <View key={e.key} style={s.elItem}>
                <View style={s.elTop}>
                  <View style={[s.elDot, { backgroundColor: EL_COLORS[e.key] }]} />
                  <Text style={s.elLabel}>{e.label}</Text>
                </View>
                <Text style={[s.elPct, { color: EL_COLORS[e.key] }]}>{e.pct ?? 0}%</Text>
                <View style={s.elTrack}>
                  <View style={[s.elFill, { width: `${Math.max(e.pct ?? 0, 3)}%`, backgroundColor: EL_COLORS[e.key] }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Planets Grid ── */}
      {subj && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Gezegen Konumları</Text>
          <View style={s.planetGrid}>
            {planets.map(key => {
              const p = subj[key];
              if (!p || typeof p !== 'object') return null;
              const col = PLANET_COLORS[p.name] || '#A1A1AA';
              return (
                <View key={key} style={s.planetCard}>
                  <View style={s.planetTop}>
                    <Text style={[s.planetSymbol, { color: col }]}>{PLANET_SYMBOLS[p.name] || '·'}</Text>
                    <View>
                      <Text style={s.planetName}>{p.name}{p.retrograde ? ' R' : ''}</Text>
                      <Text style={[s.planetSign, { color: col }]}>{ZODIAC[p.sign] || p.sign}</Text>
                    </View>
                  </View>
                  <View style={s.planetBottom}>
                    <Text style={s.planetDeg}>{(p.position ?? 0).toFixed(1)}°</Text>
                    {p.house != null && <Text style={s.planetHouse}>Ev {p.house}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#070714' },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  banner: { marginBottom: 14, alignItems: 'center' },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#FAFAFA', letterSpacing: 0.5 },
  bannerSub: { fontSize: 11, color: '#A1A1AA', marginTop: 3, textAlign: 'center' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0E0E1F', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAFA' },
  sectionMeta: { fontSize: 11, color: '#A1A1AA', marginTop: 3 },
  chevron: { fontSize: 10, color: '#A1A1AA' },

  formCard: {
    backgroundColor: '#0E0E1F', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12,
    borderTopLeftRadius: 0, borderTopRightRadius: 0,
  },

  lbl: { fontSize: 10, fontWeight: '700', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginTop: 12 },
  inp: {
    backgroundColor: '#070714', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    color: '#FAFAFA', fontSize: 14, fontWeight: '500',
  },

  fieldGrid: { flexDirection: 'row', gap: 12 },
  fieldHalf: { flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateInp: { flex: 1, textAlign: 'center', paddingHorizontal: 4 },
  dateSep: { fontSize: 14, color: '#3F3F46', fontWeight: '600' },

  chipScroll: { marginTop: 4, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#14142B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: 6,
  },
  chipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTxt: { color: '#A1A1AA', fontSize: 12, fontWeight: '600' },
  chipTxtOn: { color: '#FAFAFA' },

  primaryBtn: {
    marginTop: 16, backgroundColor: '#7C3AED', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  primaryBtnTxt: { color: '#FAFAFA', fontSize: 14, fontWeight: '700' },

  bigThreeGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  bigThreeCard: {
    flex: 1, backgroundColor: '#0E0E1F', borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1.5,
  },
  bigThreeIcon: { fontSize: 20, marginBottom: 2, color: '#FFD700' },
  bigThreeLabel: { fontSize: 9, fontWeight: '800', color: '#A1A1AA', letterSpacing: 0.8 },
  bigThreeSign: { fontSize: 14, fontWeight: '800', color: '#FAFAFA', marginTop: 2 },
  bigThreeDeg: { fontSize: 9, color: '#71717A', marginTop: 2 },

  btnGroup: { flexDirection: 'row', gap: 6 },
  smallBtn: {
    backgroundColor: '#14142B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  smallBtnTxt: { color: '#A1A1AA', fontSize: 11, fontWeight: '600' },

  card: {
    backgroundColor: '#0E0E1F', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAFA' },

  svgContainer: { alignItems: 'center', backgroundColor: '#070714', borderRadius: 10, padding: 8 },

  elGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  elItem: { width: (SW - 32 - 32 - 8) / 2, backgroundColor: '#14142B', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  elTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  elDot: { width: 6, height: 6, borderRadius: 3 },
  elLabel: { fontSize: 12, fontWeight: '600', color: '#A1A1AA' },
  elPct: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  elTrack: { height: 4, backgroundColor: '#070714', borderRadius: 2 },
  elFill: { height: 4, borderRadius: 2 },

  planetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  planetCard: {
    width: (SW - 32 - 32 - 8) / 2,
    backgroundColor: '#14142B', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  planetTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  planetSymbol: { fontSize: 22, fontWeight: '300' },
  planetName: { fontSize: 12, fontWeight: '700', color: '#E4E4E7' },
  planetSign: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  planetBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planetDeg: { fontSize: 11, color: '#71717A', fontWeight: '600' },
  planetHouse: { fontSize: 9, fontWeight: '700', color: '#A1A1AA', backgroundColor: '#070714', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
});
