import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { fetchSynastryChart, fetchSynastrySVG } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

const { width: SCREEN_W } = Dimensions.get('window');

export default function SynastryScreen() {
  const [n1, setN1] = useState('Kişi A');
  const [y1, setY1] = useState('1990'); const [m1, setM1] = useState('3'); const [d1, setD1] = useState('15');
  const [h1, setH1] = useState('14');   const [mi1, setMi1] = useState('30');

  const [n2, setN2] = useState('Kişi B');
  const [y2, setY2] = useState('1993'); const [m2, setM2] = useState('8'); const [d2, setD2] = useState('22');
  const [h2, setH2] = useState('9');    const [mi2, setMi2] = useState('15');

  const [loading, setLoading] = useState(false);
  const [synData, setSynData] = useState(null);
  const [svgXml, setSvgXml] = useState(null);

  const handleCalc = async () => {
    setLoading(true); setSynData(null); setSvgXml(null);
    const payload = {
      first_subject: { name: n1, year: +y1, month: +m1, day: +d1, hour: +h1, minute: +mi1, city: 'Istanbul', lng: 28.9784, lat: 41.0082, tz_str: 'Europe/Istanbul' },
      second_subject: { name: n2, year: +y2, month: +m2, day: +d2, hour: +h2, minute: +mi2, city: 'Ankara', lng: 32.8597, lat: 39.9334, tz_str: 'Europe/Istanbul' },
    };
    try {
      const [json, svg] = await Promise.all([fetchSynastryChart(payload), fetchSynastrySVG(payload)]);
      setSynData(json.data);
      setSvgXml(cleanSvgForMobile(svg));
    } catch (e) { Alert.alert('Hata', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      {/* Person 1 */}
      <View style={s.card}>
        <View style={s.personHeader}>
          <View style={[s.dot, { backgroundColor: '#00DFD8' }]} />
          <Text style={[s.sectionTitle, { color: '#00DFD8' }]}>1. Kişi</Text>
        </View>
        <TextInput style={s.input} value={n1} onChangeText={setN1} placeholder="Ad" placeholderTextColor="#475569" />
        <View style={s.row}>
          <F label="Yıl" v={y1} set={setY1} />
          <F label="Ay"  v={m1} set={setM1} />
          <F label="Gün" v={d1} set={setD1} />
        </View>
        <View style={s.row}>
          <F label="Saat" v={h1} set={setH1} />
          <F label="Dk"   v={mi1} set={setMi1} />
        </View>
      </View>

      {/* Person 2 */}
      <View style={s.card}>
        <View style={s.personHeader}>
          <View style={[s.dot, { backgroundColor: '#FF0080' }]} />
          <Text style={[s.sectionTitle, { color: '#FF0080' }]}>2. Kişi</Text>
        </View>
        <TextInput style={s.input} value={n2} onChangeText={setN2} placeholder="Ad" placeholderTextColor="#475569" />
        <View style={s.row}>
          <F label="Yıl" v={y2} set={setY2} />
          <F label="Ay"  v={m2} set={setM2} />
          <F label="Gün" v={d2} set={setD2} />
        </View>
        <View style={s.row}>
          <F label="Saat" v={h2} set={setH2} />
          <F label="Dk"   v={mi2} set={setMi2} />
        </View>
      </View>

      <TouchableOpacity style={s.btn} onPress={handleCalc} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>💞  Uyum Haritasını Çiz</Text>}
      </TouchableOpacity>

      {svgXml && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>💞 Synastry Çarkı</Text>
          <View style={s.svgBox}>
            <SvgXml xml={svgXml} width={SCREEN_W - 64} height={SCREEN_W - 64} />
          </View>
        </View>
      )}

      {synData?.aspects && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>📐 Açı Sayısı: {synData.aspects.length}</Text>
          <Text style={s.muted}>İki harita arasındaki tüm açılar başarıyla hesaplandı ve veritabanına kaydedildi.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function F({ label, v, set }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} value={v} onChangeText={set} keyboardType="numeric" />
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#05051A' },
  content: { padding: 14, paddingBottom: 32 },
  card: {
    backgroundColor: 'rgba(14,14,38,0.92)',
    borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  personHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#FFD700', letterSpacing: 0.3 },
  label: { fontSize: 10, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6, marginBottom: 3 },
  input: {
    backgroundColor: '#0F0F2E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#F1F5F9', fontSize: 14, marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: '#FF0080', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 14 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  svgBox: { alignItems: 'center', marginTop: 8, backgroundColor: '#05051A', borderRadius: 14, padding: 6 },
  muted: { color: '#94A3B8', fontSize: 13, lineHeight: 19 },
});
