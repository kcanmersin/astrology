import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Animated
} from 'react-native';
import { fetchAIInterpretation } from '../services/api';

const CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara',   lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir',    lat: 38.4237, lng: 27.1428 },
  { name: 'Selanik',  lat: 40.6401, lng: 22.9444 },
];

const MODELS = ['Llama 3.3 70B', 'DeepSeek-R1', 'Mixtral 8×7B', 'Llama 3.1 8B'];

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
  const scrollRef = useRef(null);

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
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
      } else { Alert.alert('Hata', res.detail || 'Analiz oluşturulamadı.'); }
    } catch (e) { Alert.alert('Bağlantı Hatası', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>AI Astroloji Yorumu</Text>
        <Text style={s.heroDesc}>
          Doğum haritanız Groq LLM altyapısıyla analiz edilir.
          Rate-limit aşıldığında otomatik olarak sonraki modele geçilir.
        </Text>
        <View style={s.modelList}>
          {MODELS.map((m, i) => (
            <View key={m} style={s.modelItem}>
              <View style={[s.modelDot, i === 0 && s.modelDotActive]} />
              <Text style={[s.modelName, i === 0 && s.modelNameActive]}>{m}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Form */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Doğum Bilgileri</Text>

        <Text style={s.lbl}>Ad Soyad</Text>
        <TextInput style={s.inp} value={name} onChangeText={setName}
          placeholder="İsteğe bağlı" placeholderTextColor="#3F3F46" />

        <View style={s.fieldGrid}>
          <View style={s.fieldHalf}>
            <Text style={s.lbl}>Tarih</Text>
            <View style={s.dateRow}>
              <TextInput style={[s.inp, s.dateInp]} value={day} onChangeText={setDay} keyboardType="numeric" placeholder="GG" placeholderTextColor="#3F3F46" />
              <Text style={s.sep}>/</Text>
              <TextInput style={[s.inp, s.dateInp]} value={month} onChangeText={setMonth} keyboardType="numeric" placeholder="AA" placeholderTextColor="#3F3F46" />
              <Text style={s.sep}>/</Text>
              <TextInput style={[s.inp, { flex: 1.4 }]} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="YYYY" placeholderTextColor="#3F3F46" />
            </View>
          </View>
          <View style={s.fieldHalf}>
            <Text style={s.lbl}>Saat</Text>
            <View style={s.dateRow}>
              <TextInput style={[s.inp, s.dateInp]} value={hour} onChangeText={setHour} keyboardType="numeric" placeholder="SS" placeholderTextColor="#3F3F46" />
              <Text style={s.sep}>:</Text>
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

        <TouchableOpacity style={s.btn} onPress={generate} disabled={loading} activeOpacity={0.8}>
          {loading
            ? <View style={s.loadRow}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={[s.btnTxt, { marginLeft: 10 }]}>Analiz ediliyor...</Text>
              </View>
            : <Text style={s.btnTxt}>Yorum Oluştur</Text>}
        </TouchableOpacity>
      </View>

      {/* Report */}
      {report && (
        <View style={s.card}>
          <View style={s.reportHead}>
            <Text style={s.cardTitle}>AI Yorumu</Text>
            {model && (
              <View style={s.modelBadge}>
                <Text style={s.modelBadgeTxt}>{model}</Text>
              </View>
            )}
          </View>
          <View style={s.divider} />

          {report.split('\n\n').map((para, i) => {
            const trimmed = para.trim();
            if (!trimmed) return null;
            // Bold section headers (lines starting with ** or ##)
            if (trimmed.startsWith('**') || trimmed.startsWith('##')) {
              const clean = trimmed.replace(/[*#]/g, '').trim();
              return <Text key={i} style={s.reportSection}>{clean}</Text>;
            }
            return <Text key={i} style={s.reportPara}>{trimmed}</Text>;
          })}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#07070A' },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  hero: { marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#FAFAFA', marginBottom: 6 },
  heroDesc: { fontSize: 12, color: '#52525B', lineHeight: 18, marginBottom: 14 },
  modelList: { gap: 6 },
  modelItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#27272A' },
  modelDotActive: { backgroundColor: '#22C55E' },
  modelName: { fontSize: 12, color: '#3F3F46', fontWeight: '600' },
  modelNameActive: { color: '#71717A' },

  card: {
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAFA', marginBottom: 8 },

  lbl: { fontSize: 11, fontWeight: '600', color: '#52525B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 14 },
  inp: {
    backgroundColor: '#07070A', borderWidth: 1, borderColor: '#1E1E26',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12,
    color: '#FAFAFA', fontSize: 15, fontWeight: '500',
  },

  fieldGrid: { flexDirection: 'row', gap: 14 },
  fieldHalf: { flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateInp: { flex: 1, textAlign: 'center', paddingHorizontal: 4 },
  sep: { fontSize: 16, color: '#27272A', fontWeight: '600' },

  chipScroll: { marginTop: 4, marginBottom: 4 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#111116', borderWidth: 1, borderColor: '#1E1E26', marginRight: 8,
  },
  chipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTxt: { color: '#52525B', fontSize: 13, fontWeight: '600' },
  chipTxtOn: { color: '#FAFAFA' },

  btn: { marginTop: 18, backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  btnTxt: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },
  loadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },

  reportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modelBadge: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  modelBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#7C3AED' },
  divider: { height: 1, backgroundColor: '#1A1A21', marginVertical: 14 },
  reportSection: { fontSize: 15, fontWeight: '700', color: '#D4D4D8', marginTop: 16, marginBottom: 6 },
  reportPara: { fontSize: 14, color: '#A1A1AA', lineHeight: 23, marginBottom: 10 },
});
