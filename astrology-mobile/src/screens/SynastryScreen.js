import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { fetchSynastryChart, fetchSynastrySVG } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

const { width: SW } = Dimensions.get('window');

const ASPECT_COLORS = {
  conjunction: '#22C55E', opposition: '#EF4444', trine: '#60A5FA',
  square: '#F97316', sextile: '#A78BFA', default: '#52525B',
};

export default function SynastryScreen() {
  const [n1, setN1] = useState(''); const [y1, setY1] = useState('1990');
  const [m1, setM1] = useState('3'); const [d1, setD1] = useState('15');
  const [h1, setH1] = useState('14'); const [mi1, setMi1] = useState('30');

  const [n2, setN2] = useState(''); const [y2, setY2] = useState('1993');
  const [m2, setM2] = useState('8'); const [d2, setD2] = useState('22');
  const [h2, setH2] = useState('9'); const [mi2, setMi2] = useState('15');

  const [loading, setLoading] = useState(false);
  const [aspects, setAspects] = useState(null);
  const [svgXml, setSvgXml] = useState(null);

  const calc = async () => {
    setLoading(true); setAspects(null); setSvgXml(null);
    const payload = {
      first_subject: { name: n1 || 'Kişi A', year: +y1, month: +m1, day: +d1, hour: +h1, minute: +mi1, city: 'Istanbul', lng: 28.9784, lat: 41.0082, tz_str: 'Europe/Istanbul' },
      second_subject: { name: n2 || 'Kişi B', year: +y2, month: +m2, day: +d2, hour: +h2, minute: +mi2, city: 'Ankara', lng: 32.8597, lat: 39.9334, tz_str: 'Europe/Istanbul' },
    };
    try {
      const [json, svg] = await Promise.all([fetchSynastryChart(payload), fetchSynastrySVG(payload)]);
      setAspects(json.data?.aspects);
      setSvgXml(cleanSvgForMobile(svg));
    } catch (e) { Alert.alert('Hata', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>

      {/* Intro */}
      <View style={s.intro}>
        <Text style={s.introTitle}>Synastry Analizi</Text>
        <Text style={s.introDesc}>İki kişinin haritalarını karşılaştırarak ilişki uyumunu analiz edin.</Text>
      </View>

      {/* Two-person side by side */}
      <View style={s.personGrid}>
        <PersonCard color="#7C3AED" label="Birinci Kişi"
          n={n1} sN={setN1} y={y1} sY={setY1} m={m1} sM={setM1} d={d1} sD={setD1} h={h1} sH={setH1} mi={mi1} sMi={setMi1} />
        <PersonCard color="#EC4899" label="İkinci Kişi"
          n={n2} sN={setN2} y={y2} sY={setY2} m={m2} sM={setM2} d={d2} sD={setD2} h={h2} sH={setH2} mi={mi2} sMi={setMi2} />
      </View>

      <TouchableOpacity style={s.btn} onPress={calc} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.btnTxt}>Uyum Haritasını Hesapla</Text>}
      </TouchableOpacity>

      {/* SVG */}
      {svgXml && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Synastry Çarkı</Text>
          <View style={s.svgWrap}>
            <SvgXml xml={svgXml} width={SW - 64} height={SW - 64} />
          </View>
        </View>
      )}

      {/* Aspects table */}
      {aspects && aspects.length > 0 && (
        <View style={s.card}>
          <View style={s.cardTopRow}>
            <Text style={s.cardTitle}>Açılar</Text>
            <View style={s.countBadge}><Text style={s.countTxt}>{aspects.length}</Text></View>
          </View>
          {aspects.slice(0, 20).map((a, i) => {
            const col = ASPECT_COLORS[a.aspect?.toLowerCase()] || ASPECT_COLORS.default;
            return (
              <View key={i} style={s.aspectRow}>
                <Text style={s.aspectP}>{a.p1_name}</Text>
                <View style={[s.aspectBadge, { borderColor: col }]}>
                  <View style={[s.aspectDot, { backgroundColor: col }]} />
                  <Text style={[s.aspectType, { color: col }]}>{a.aspect}</Text>
                </View>
                <Text style={[s.aspectP, { textAlign: 'right' }]}>{a.p2_name}</Text>
                <Text style={s.aspectOrb}>{(a.orbit ?? 0).toFixed(1)}°</Text>
              </View>
            );
          })}
          {aspects.length > 20 && <Text style={s.moreTxt}>+{aspects.length - 20} daha</Text>}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function PersonCard({ color, label, n, sN, y, sY, m, sM, d, sD, h, sH, mi, sMi }) {
  return (
    <View style={s.pCard}>
      <View style={[s.pBar, { backgroundColor: color }]} />
      <Text style={s.pLabel}>{label}</Text>
      <TextInput style={s.pInp} value={n} onChangeText={sN} placeholder="Ad" placeholderTextColor="#3F3F46" />
      <View style={s.pRow}>
        <TextInput style={[s.pInp, s.pSmall]} value={d} onChangeText={sD} keyboardType="numeric" placeholder="G" placeholderTextColor="#3F3F46" />
        <TextInput style={[s.pInp, s.pSmall]} value={m} onChangeText={sM} keyboardType="numeric" placeholder="A" placeholderTextColor="#3F3F46" />
        <TextInput style={[s.pInp, s.pSmall]} value={y} onChangeText={sY} keyboardType="numeric" placeholder="Y" placeholderTextColor="#3F3F46" />
      </View>
      <View style={s.pRow}>
        <TextInput style={[s.pInp, s.pSmall]} value={h} onChangeText={sH} keyboardType="numeric" placeholder="S" placeholderTextColor="#3F3F46" />
        <TextInput style={[s.pInp, s.pSmall]} value={mi} onChangeText={sMi} keyboardType="numeric" placeholder="D" placeholderTextColor="#3F3F46" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#07070A' },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  intro: { marginBottom: 14 },
  introTitle: { fontSize: 20, fontWeight: '800', color: '#FAFAFA', marginBottom: 4 },
  introDesc: { fontSize: 12, color: '#52525B', lineHeight: 17 },

  personGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pCard: {
    flex: 1, backgroundColor: '#0E0E13', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  pBar: { height: 3, borderRadius: 2, marginBottom: 10, width: 24 },
  pLabel: { fontSize: 11, fontWeight: '700', color: '#52525B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  pInp: {
    backgroundColor: '#07070A', borderWidth: 1, borderColor: '#1E1E26',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 9,
    color: '#FAFAFA', fontSize: 13, marginBottom: 5,
  },
  pSmall: { flex: 1, textAlign: 'center', paddingHorizontal: 2 },
  pRow: { flexDirection: 'row', gap: 4 },

  btn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  btnTxt: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },

  card: {
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAFA', marginBottom: 8 },
  svgWrap: { alignItems: 'center', backgroundColor: '#07070A', borderRadius: 10, padding: 8 },

  countBadge: { backgroundColor: '#7C3AED', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countTxt: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  aspectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#141419',
  },
  aspectP: { flex: 1, fontSize: 12, fontWeight: '600', color: '#D4D4D8' },
  aspectBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  aspectDot: { width: 5, height: 5, borderRadius: 3 },
  aspectType: { fontSize: 10, fontWeight: '700' },
  aspectOrb: { width: 36, textAlign: 'right', fontSize: 11, color: '#3F3F46', fontWeight: '600' },
  moreTxt: { fontSize: 11, color: '#3F3F46', textAlign: 'center', marginTop: 8 },
});
