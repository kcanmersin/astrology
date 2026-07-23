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
const CARD_W = (SW - 40 - 12) / 2; // 2 column grid width

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

      {/* ── Collapsible Form ── */}
      <TouchableOpacity style={s.sectionHeader} onPress={() => setFormOpen(!formOpen)} activeOpacity={0.7}>
        <View>
          <Text style={s.sectionTitle}>Doğum Bilgileri</Text>
          {!formOpen && <Text style={s.sectionMeta}>{name || 'Danışan'} · {day}.{month}.{year} · {city}</Text>}
        </View>
        <Text style={s.chevron}>{formOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {formOpen && (
        <View style={s.formCard}>
          <Text style={s.formDesc}>Haritanızı oluşturmak için doğum detaylarını girin.</Text>

          <Text style={s.lbl}>Ad Soyad</Text>
          <TextInput style={s.inp} value={name} onChangeText={setName}
            placeholder="İsteğe bağlı" placeholderTextColor="#3F3F46" />

          <View style={s.fieldGrid}>
            <View style={s.fieldHalf}>
              <Text style={s.lbl}>Tarih</Text>
              <View style={s.dateRow}>
                <TextInput style={[s.inp, s.dateInp]} value={day} onChangeText={setDay} keyboardType="numeric" placeholder="GG" placeholderTextColor="#3F3F46" />
                <Text style={s.dateSep}>/</Text>
                <TextInput style={[s.inp, s.dateInp]} value={month} onChangeText={setMonth} keyboardType="numeric" placeholder="AA" placeholderTextColor="#3F3F46" />
                <Text style={s.dateSep}>/</Text>
                <TextInput style={[s.inp, { flex: 1.4 }]} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="YYYY" placeholderTextColor="#3F3F46" />
              </View>
            </View>
            <View style={s.fieldHalf}>
              <Text style={s.lbl}>Saat</Text>
              <View style={s.dateRow}>
                <TextInput style={[s.inp, s.dateInp]} value={hour} onChangeText={setHour} keyboardType="numeric" placeholder="SS" placeholderTextColor="#3F3F46" />
                <Text style={s.dateSep}>:</Text>
                <TextInput style={[s.inp, s.dateInp]} value={minute} onChangeText={setMinute} keyboardType="numeric" placeholder="DD" placeholderTextColor="#3F3F46" />
              </View>
            </View>
          </View>

          <Text style={s.lbl}>Konum</Text>
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
              : <Text style={s.primaryBtnTxt}>Haritayı Hesapla</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Chart Wheel ── */}
      {svgXml && (
        <View style={s.card}>
          <View style={s.cardTopRow}>
            <Text style={s.cardTitle}>Doğum Haritası</Text>
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

      {/* ── Element Distribution (visual bar + numbers) ── */}
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

      {/* ── Planets Grid (2-column) ── */}
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

/* ─────── Styles ─────── */
const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#07070A' },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  /* Section header (collapsible) */
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#1A1A21', marginBottom: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FAFAFA' },
  sectionMeta: { fontSize: 11, color: '#52525B', marginTop: 3 },
  chevron: { fontSize: 10, color: '#52525B' },

  /* Form card */
  formCard: {
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#1A1A21', marginBottom: 12,
    borderTopLeftRadius: 0, borderTopRightRadius: 0,
  },
  formDesc: { fontSize: 12, color: '#3F3F46', marginBottom: 14, lineHeight: 17 },

  /* Labels & Inputs */
  lbl: { fontSize: 11, fontWeight: '600', color: '#52525B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 14 },
  inp: {
    backgroundColor: '#07070A', borderWidth: 1, borderColor: '#1E1E26',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12,
    color: '#FAFAFA', fontSize: 15, fontWeight: '500',
  },

  /* Date/Time inline row */
  fieldGrid: { flexDirection: 'row', gap: 14 },
  fieldHalf: { flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateInp: { flex: 1, textAlign: 'center', paddingHorizontal: 4 },
  dateSep: { fontSize: 16, color: '#27272A', fontWeight: '600' },

  /* Chips */
  chipScroll: { marginTop: 4, marginBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#111116', borderWidth: 1, borderColor: '#1E1E26', marginRight: 8,
  },
  chipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTxt: { color: '#52525B', fontSize: 13, fontWeight: '600' },
  chipTxtOn: { color: '#FAFAFA' },

  /* Buttons */
  primaryBtn: {
    marginTop: 18, backgroundColor: '#7C3AED', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnTxt: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },
  btnGroup: { flexDirection: 'row', gap: 6 },
  smallBtn: {
    backgroundColor: '#111116', borderWidth: 1, borderColor: '#1E1E26',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 7,
  },
  smallBtnTxt: { color: '#71717A', fontSize: 12, fontWeight: '600' },

  /* Generic card */
  card: {
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAFA' },

  /* SVG */
  svgContainer: { alignItems: 'center', backgroundColor: '#07070A', borderRadius: 10, padding: 8 },

  /* Element distribution */
  elGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  elItem: { width: (SW - 32 - 32 - 10) / 2, backgroundColor: '#111116', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#1A1A21' },
  elTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  elDot: { width: 6, height: 6, borderRadius: 3 },
  elLabel: { fontSize: 12, fontWeight: '600', color: '#A1A1AA' },
  elPct: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  elTrack: { height: 4, backgroundColor: '#1A1A21', borderRadius: 2 },
  elFill: { height: 4, borderRadius: 2 },

  /* Planet grid */
  planetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  planetCard: {
    width: (SW - 32 - 32 - 8) / 2,
    backgroundColor: '#111116', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  planetTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  planetSymbol: { fontSize: 24, fontWeight: '300' },
  planetName: { fontSize: 13, fontWeight: '700', color: '#E4E4E7' },
  planetSign: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  planetBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planetDeg: { fontSize: 12, color: '#52525B', fontWeight: '600' },
  planetHouse: { fontSize: 10, fontWeight: '700', color: '#3F3F46', backgroundColor: '#1A1A21', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
});
