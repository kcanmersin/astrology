import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { fetchAIInterpretation } from '../services/api';

const CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara',   lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir',    lat: 38.4237, lng: 27.1428 },
  { name: 'Selanik',  lat: 40.6401, lng: 22.9444 },
];

export default function AIScreen() {
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
  const [report, setReport] = useState(null);
  const [model, setModel] = useState(null);

  const generate = async () => {
    setLoading(true); setReport(null); setModel(null);
    try {
      const res = await fetchAIInterpretation({
        name: name || 'Danışan', year: +year, month: +month, day: +day,
        hour: +hour, minute: +minute, city, nation: 'TR',
        lat: parseFloat(lat), lng: parseFloat(lng),
        tz_str: 'Europe/Istanbul', house_system: 'P',
      });
      if (res.status === 'success') {
        setReport(res.ai_interpretation);
        setModel(res.model_used);
      } else { Alert.alert('AI Hata', res.detail || 'Analiz oluşturulamadı.'); }
    } catch (e) { Alert.alert('Bağlantı Hatası', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={t.bg} contentContainerStyle={t.pad}>
      {/* Hero */}
      <View style={t.hero}>
        <Text style={t.heroTitle}>AI Astroloji Yorumu</Text>
        <Text style={t.heroDesc}>
          Groq LLM altyapısıyla doğum haritanızın derinlemesine
          analizi. Otomatik model fallback ile kesintisiz servis.
        </Text>
        <View style={t.modelRow}>
          <ModelTag name="Llama 3.3 70B" />
          <ModelTag name="DeepSeek-R1" />
          <ModelTag name="Mixtral 8x7B" />
        </View>
      </View>

      {/* Form */}
      <View style={t.section}>
        <Text style={t.heading}>Doğum Bilgileri</Text>

        <Text style={t.lbl}>Ad Soyad</Text>
        <TextInput style={t.inp} value={name} onChangeText={setName}
          placeholder="İsteğe bağlı" placeholderTextColor="#3F3F46" />

        <View style={t.row}>
          <F l="Yıl" v={year} s={setYear} />
          <F l="Ay" v={month} s={setMonth} />
          <F l="Gün" v={day} s={setDay} />
        </View>
        <View style={t.row}>
          <F l="Saat" v={hour} s={setHour} />
          <F l="Dakika" v={minute} s={setMinute} />
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

        <TouchableOpacity style={t.btn} onPress={generate} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <View style={t.loadRow}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={[t.btnTxt, { marginLeft: 8 }]}>Analiz ediliyor...</Text>
              </View>
            : <Text style={t.btnTxt}>Yorum Oluştur</Text>}
        </TouchableOpacity>
      </View>

      {/* Report */}
      {report && (
        <View style={[t.section, { marginBottom: 32 }]}>
          <View style={t.reportHead}>
            <Text style={t.heading}>AI Yorumu</Text>
            {model && (
              <View style={t.badge}>
                <Text style={t.badgeTxt}>{model}</Text>
              </View>
            )}
          </View>
          <View style={t.divider} />
          <Text style={t.reportBody}>{report}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function F({ l, v, s }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={t.lbl}>{l}</Text>
      <TextInput style={t.inp} value={v} onChangeText={s} keyboardType="numeric" />
    </View>
  );
}

function ModelTag({ name }) {
  return (
    <View style={t.mTag}>
      <Text style={t.mTagTxt}>{name}</Text>
    </View>
  );
}

const t = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#09090B' },
  pad: { padding: 20, paddingBottom: 40 },

  hero: { marginBottom: 12, paddingVertical: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FAFAFA', marginBottom: 6 },
  heroDesc: { fontSize: 13, color: '#52525B', lineHeight: 19, marginBottom: 12 },
  modelRow: { flexDirection: 'row', gap: 6 },
  mTag: { backgroundColor: '#18181B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#27272A' },
  mTagTxt: { fontSize: 10, fontWeight: '600', color: '#71717A' },

  section: {
    backgroundColor: '#111113', borderRadius: 12, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#1C1C22',
  },
  heading: { fontSize: 16, fontWeight: '700', color: '#FAFAFA', marginBottom: 4 },

  lbl: { fontSize: 11, fontWeight: '600', color: '#52525B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 10, marginBottom: 4 },
  inp: {
    backgroundColor: '#09090B', borderWidth: 1, borderColor: '#27272A',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, color: '#FAFAFA', fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 10 },
  loadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' },
  chipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTxt: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  chipTxtOn: { color: '#FAFAFA' },

  btn: { marginTop: 20, backgroundColor: '#7C3AED', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  btnTxt: { color: '#FAFAFA', fontSize: 14, fontWeight: '700' },

  reportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: '#18181B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#27272A' },
  badgeTxt: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  divider: { height: 1, backgroundColor: '#1C1C22', marginVertical: 14 },
  reportBody: { fontSize: 14, color: '#D4D4D8', lineHeight: 24 },
});
