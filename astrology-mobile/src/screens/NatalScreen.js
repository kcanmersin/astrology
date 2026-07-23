import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNatalChart, fetchNatalSVG, fetchAIInterpretation } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', True_Node: '☊', Mean_Node: '☊'
};

const ZODIAC_SYMBOLS = {
  Ari: '♈ Koç', Tau: '♉ Boğa', Gem: '♊ İkizler', Can: '♋ Yengeç',
  Leo: '<ctrl42> Aslan', Vir: '♍ Başak', Lib: '♎ Terazi', Sco: '♏ Akrep',
  Sag: '♐ Yay', Cap: '♑ Oğlak', Aqu: '♒ Kova', Pis: '♓ Balık'
};

export default function NatalScreen() {
  const [name, setName] = useState('Ahmet Yılmaz');
  const [year, setYear] = useState('1995');
  const [month, setMonth] = useState('10');
  const [day, setDay] = useState('25');
  const [hour, setHour] = useState('14');
  const [minute, setMinute] = useState('30');
  const [lat, setLat] = useState('41.0082');
  const [lng, setLng] = useState('28.9784');
  const [tz, setTz] = useState('Europe/Istanbul');
  const [houseSys, setHouseSys] = useState('P');

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [svgXml, setSvgXml] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiModel, setAiModel] = useState(null);

  const handlePreset = (cName, cLat, cLng) => {
    setLat(cLat.toString());
    setLng(cLng.toString());
  };

  const getPayload = () => ({
    name,
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute),
    city: 'PresetCity',
    nation: 'TR',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    tz_str: tz,
    house_system: houseSys
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
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiReport(null);

    try {
      const payload = getPayload();
      const aiRes = await fetchAIInterpretation(payload);
      if (aiRes.status === 'success') {
        setAiReport(aiRes.ai_interpretation);
        setAiModel(aiRes.model_used);
        if (aiRes.chart_data && !chartData) {
          setChartData(aiRes.chart_data);
        }
      } else {
        Alert.alert('AI Hata', aiRes.detail || 'Analiz üretilemedi.');
      }
    } catch (err) {
      Alert.alert('AI Bağlantı Hatası', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name) return;
    try {
      const profile = { name, year, month, day, hour, minute, lat, lng, tz, houseSys };
      const existingStr = await AsyncStorage.getItem('saved_charts');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      existing.push(profile);
      await AsyncStorage.setItem('saved_charts', JSON.stringify(existing));
      Alert.alert('Başarılı', `${name} harita profili telefona kaydedildi!`);
    } catch (err) {
      Alert.alert('Hata', 'Profil kaydedilemedi.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🌌 Doğum Haritası (Natal)</Text>
      <Text style={styles.subtitle}>Canlı Render API (astrology-k5kd.onrender.com)</Text>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Kişi & Doğum Bilgileri</Text>
        
        <Text style={styles.label}>Ad / Etiket</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ad Soyad" placeholderTextColor="#A0A5C0" />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Yıl</Text>
            <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Ay</Text>
            <TextInput style={styles.input} value={month} onChangeText={setMonth} keyboardType="numeric" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Gün</Text>
            <TextInput style={styles.input} value={day} onChangeText={setDay} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Saat (0-23)</Text>
            <TextInput style={styles.input} value={hour} onChangeText={setHour} keyboardType="numeric" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Dakika</Text>
            <TextInput style={styles.input} value={minute} onChangeText={setMinute} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.label}>Şehir Presets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
          <TouchableOpacity style={styles.pill} onPress={() => handlePreset('Istanbul', 41.0082, 28.9784)}>
            <Text style={styles.pillText}>İstanbul</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill} onPress={() => handlePreset('Ankara', 39.9334, 32.8597)}>
            <Text style={styles.pillText}>Ankara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill} onPress={() => handlePreset('Izmir', 38.4237, 27.1428)}>
            <Text style={styles.pillText}>İzmir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pill} onPress={() => handlePreset('London', 51.5074, -0.1278)}>
            <Text style={styles.pillText}>London</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleCalculate} disabled={loading || aiLoading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>✨ Haritayı Çiz & Hesapla</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAi} onPress={handleGenerateAI} disabled={loading || aiLoading}>
          {aiLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>🤖 Groq AI ile Derin Analiz Yap</Text>}
        </TouchableOpacity>
      </View>

      {/* SVG Chart Wheel Display */}
      {svgXml && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🎨 Harita Çarkı</Text>
            <TouchableOpacity style={styles.btnSave} onPress={handleSaveProfile}>
              <Text style={styles.btnSaveText}>💾 Kaydet</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.svgWrapper}>
            <SvgXml xml={svgXml} width="100%" height={340} />
          </View>
        </View>
      )}

      {/* Groq AI Report Card */}
      {aiReport && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🤖 Groq AI Yorumu</Text>
            <Text style={styles.badgeText}>{aiModel}</Text>
          </View>
          <Text style={styles.aiReportText}>{aiReport}</Text>
        </View>
      )}

      {/* Planet Positions Cards */}
      {chartData && chartData.active_points && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🪐 Gezegen Konumları & Burçlar</Text>
          <View style={styles.planetGrid}>
            {chartData.active_points.map((p, idx) => {
              const symbol = PLANET_SYMBOLS[p.name] || '🪐';
              const signName = ZODIAC_SYMBOLS[p.sign] || p.sign;
              return (
                <View key={idx} style={styles.planetBadge}>
                  <Text style={styles.planetIcon}>{symbol}</Text>
                  <View>
                    <Text style={styles.planetName}>{p.name} {p.retrograde ? '℞' : ''}</Text>
                    <Text style={styles.planetSign}>{signName} {p.position ? `${p.position.toFixed(1)}°` : ''}</Text>
                    {p.house && <Text style={styles.planetHouse}>{p.house}. Ev</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070714' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 11, color: '#00DFD8', textAlign: 'center', marginBottom: 16 },
  card: {
    backgroundColor: 'rgba(18, 18, 42, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFD700', marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeText: { color: '#00DFD8', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(0,223,216,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  label: { fontSize: 11, fontWeight: '600', color: '#A0A5C0', textTransform: 'uppercase', marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(7, 7, 20, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 10,
    color: '#FFF',
    fontSize: 14
  },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  presetRow: { marginVertical: 8, flexDirection: 'row' },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6
  },
  pillText: { color: '#00DFD8', fontSize: 12, fontWeight: '600' },
  btnPrimary: {
    backgroundColor: '#7928CA',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16
  },
  btnAi: {
    backgroundColor: '#FF0080',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  btnSave: { backgroundColor: 'rgba(255, 215, 0, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  btnSaveText: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  svgWrapper: { alignItems: 'center', marginVertical: 8, backgroundColor: '#070714', borderRadius: 16, padding: 8 },
  planetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(7, 7, 20, 0.8)',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: '47%'
  },
  planetIcon: { fontSize: 20, color: '#FFD700' },
  planetName: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  planetSign: { color: '#00DFD8', fontSize: 11 },
  planetHouse: { color: '#A0A5C0', fontSize: 10 },
  aiReportText: { color: '#F0F4F8', fontSize: 13, lineHeight: 20, marginTop: 8 }
});
