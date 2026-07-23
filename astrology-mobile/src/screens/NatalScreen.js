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

const CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara',   lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir',    lat: 38.4237, lng: 27.1428 },
  { name: 'Selanik',  lat: 40.6401, lng: 22.9444 },
  { name: 'London',   lat: 51.5074, lng: -0.1278 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
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
  const [city, setCity] = useState('İstanbul');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [svgXml, setSvgXml] = useState(null);

  const payload = () => ({
    name: name || 'Danışan', year: +year, month: +month, day: +day,
    hour: +hour, minute: +minute, city, nation: 'TR',
    lat: parseFloat(lat), lng: parseFloat(lng),
    tz_str: 'Europe/Istanbul', house_system: 'P',
  });

  const calculate = async () => {
    setLoading(true); setChartData(null); setSvgXml(null);
    try {
      const [json, svg] = await Promise.all([
        fetchNatalChart(payload()), fetchNatalSVG(payload()),
      ]);
      setChartData(json.data);
      setSvgXml(cleanSvgForMobile(svg));
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

  return (
    <ScrollView style={t.bg} contentContainerStyle={t.pad}>
      {/* ── Form ── */}
      <View style={t.section}>
        <Text style={t.heading}>Doğum Bilgileri</Text>
        <Text style={t.desc}>Haritanızı oluşturmak için doğum detaylarını girin.</Text>

        <Text style={t.lbl}>Ad Soyad</Text>
        <TextInput style={t.inp} value={name} onChangeText={setName}
          placeholder="İsteğe bağlı" placeholderTextColor="#3F3F46" />

        <View style={t.row}>
          <Inp label="Yıl" val={year} set={setYear} />
          <Inp label="Ay" val={month} set={setMonth} />
          <Inp label="Gün" val={day} set={setDay} />
        </View>
        <View style={t.row}>
          <Inp label="Saat" val={hour} set={setHour} />
          <Inp label="Dakika" val={minute} set={setMinute} />
        </View>

        <Text style={t.lbl}>Konum</Text>
        <View style={t.chips}>
          {CITIES.map(c => (
            <TouchableOpacity key={c.name}
              style={[t.chip, city === c.name && t.chipOn]}
              onPress={() => { setLat(c.lat.toString()); setLng(c.lng.toString()); setCity(c.name); }}>
              <Text style={[t.chipTxt, city === c.name && t.chipTxtOn]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={t.btn} onPress={calculate} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={t.btnTxt}>Haritayı Hesapla</Text>}
        </TouchableOpacity>
      </View>

      {/* ── Chart Wheel ── */}
      {svgXml && (
        <View style={t.section}>
          <View style={t.rowBetween}>
            <Text style={t.heading}>Doğum Haritası</Text>
            <TouchableOpacity style={t.btnSmall} onPress={save}>
              <Text style={t.btnSmallTxt}>Kaydet</Text>
            </TouchableOpacity>
          </View>
          <View style={t.svgWrap}>
            <SvgXml xml={svgXml} width={SW - 72} height={SW - 72} />
          </View>
        </View>
      )}

      {/* ── Planets ── */}
      {subj && (
        <View style={t.section}>
          <Text style={t.heading}>Gezegen Konumları</Text>
          <View style={t.table}>
            <View style={t.tableHead}>
              <Text style={[t.th, { flex: 0.5 }]}></Text>
              <Text style={[t.th, { flex: 1.5 }]}>Gezegen</Text>
              <Text style={[t.th, { flex: 1.5 }]}>Burç</Text>
              <Text style={[t.th, { flex: 1 }]}>Derece</Text>
              <Text style={[t.th, { flex: 0.5 }]}>Ev</Text>
            </View>
            {['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto','chiron','true_node'].map(key => {
              const p = subj[key];
              if (!p || typeof p !== 'object') return null;
              return (
                <View key={key} style={t.tableRow}>
                  <Text style={[t.td, t.symbol, { flex: 0.5 }]}>{PLANET_SYMBOLS[p.name] || '·'}</Text>
                  <Text style={[t.td, { flex: 1.5, color: '#E4E4E7' }]}>
                    {p.name}{p.retrograde ? '  R' : ''}
                  </Text>
                  <Text style={[t.td, { flex: 1.5, color: '#A78BFA' }]}>{ZODIAC[p.sign] || p.sign}</Text>
                  <Text style={[t.td, { flex: 1, color: '#71717A' }]}>{(p.position ?? 0).toFixed(1)}°</Text>
                  <Text style={[t.td, { flex: 0.5, color: '#71717A' }]}>{p.house ?? '–'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Elements ── */}
      {el && (
        <View style={[t.section, { marginBottom: 32 }]}>
          <Text style={t.heading}>Element Dağılımı</Text>
          <Bar label="Ateş"   pct={el.fire_percentage}  color="#EF4444" />
          <Bar label="Toprak" pct={el.earth_percentage} color="#22C55E" />
          <Bar label="Hava"   pct={el.air_percentage}   color="#38BDF8" />
          <Bar label="Su"     pct={el.water_percentage}  color="#8B5CF6" />
        </View>
      )}
    </ScrollView>
  );
}

function Inp({ label, val, set }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={t.lbl}>{label}</Text>
      <TextInput style={t.inp} value={val} onChangeText={set} keyboardType="numeric" />
    </View>
  );
}

function Bar({ label, pct, color }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={t.barHead}>
        <Text style={t.barLbl}>{label}</Text>
        <Text style={t.barVal}>{pct ?? 0}%</Text>
      </View>
      <View style={t.barTrack}>
        <View style={[t.barFill, { width: `${Math.max(pct ?? 0, 2)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const t = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#09090B' },
  pad: { padding: 20, paddingBottom: 40 },

  section: {
    backgroundColor: '#111113',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1C1C22',
  },
  heading: { fontSize: 16, fontWeight: '700', color: '#FAFAFA', marginBottom: 4 },
  desc: { fontSize: 13, color: '#52525B', marginBottom: 16, lineHeight: 18 },

  lbl: { fontSize: 11, fontWeight: '600', color: '#52525B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 10, marginBottom: 4 },
  inp: {
    backgroundColor: '#09090B',
    borderWidth: 1, borderColor: '#27272A',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11,
    color: '#FAFAFA', fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6,
    backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A',
  },
  chipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTxt: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  chipTxtOn: { color: '#FAFAFA' },

  btn: { marginTop: 20, backgroundColor: '#7C3AED', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnTxt: { color: '#FAFAFA', fontSize: 14, fontWeight: '700' },
  btnSmall: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  btnSmallTxt: { color: '#A1A1AA', fontSize: 12, fontWeight: '600' },

  svgWrap: { alignItems: 'center', marginTop: 12, backgroundColor: '#09090B', borderRadius: 10, padding: 8 },

  table: { marginTop: 8 },
  tableHead: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1C1C22' },
  th: { fontSize: 10, fontWeight: '700', color: '#3F3F46', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1C1C22' },
  td: { fontSize: 13, fontWeight: '500', color: '#A1A1AA' },
  symbol: { fontSize: 16, color: '#7C3AED' },

  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLbl: { color: '#A1A1AA', fontSize: 13, fontWeight: '500' },
  barVal: { color: '#52525B', fontSize: 13, fontWeight: '600' },
  barTrack: { height: 6, backgroundColor: '#18181B', borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
});
