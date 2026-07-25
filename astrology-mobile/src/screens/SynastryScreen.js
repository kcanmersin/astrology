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
  square: '#F97316', sextile: '#A78BFA', default: '#A1A1AA',
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
  const [score, setScore] = useState(null);

  const calc = async () => {
    setLoading(true); setAspects(null); setSvgXml(null); setScore(null);
    const payload = {
      first_subject: { name: n1 || 'Kişi A', year: +y1, month: +m1, day: +d1, hour: +h1, minute: +mi1, city: 'Istanbul', lng: 28.9784, lat: 41.0082, tz_str: 'Europe/Istanbul' },
      second_subject: { name: n2 || 'Kişi B', year: +y2, month: +m2, day: +d2, hour: +h2, minute: +mi2, city: 'Ankara', lng: 32.8597, lat: 39.9334, tz_str: 'Europe/Istanbul' },
    };
    try {
      const [json, svg] = await Promise.all([fetchSynastryChart(payload), fetchSynastrySVG(payload)]);
      const list = json.data?.aspects || [];
      setAspects(list);
      setSvgXml(cleanSvgForMobile(svg));

      // Calculate harmony score based on aspect counts
      const harmon = list.filter(a => ['trine', 'sextile', 'conjunction'].includes(a.aspect?.toLowerCase())).length;
      const total = Math.max(list.length, 1);
      const computedScore = Math.min(Math.round((harmon / total) * 100) + 35, 98);
      setScore(computedScore);
    } catch (e) { Alert.alert('Hata', e.message); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>

      {/* Intro Banner */}
      <View style={s.intro}>
        <Text style={s.introTitle}>Kozmik Uyum & Synastry</Text>
        <Text style={s.introDesc}>İki kişinin haritalarını karşılaştırarak ilişki uyumunu ve kozmik bağını analiz edin.</Text>
      </View>

      {/* Two Person Cards Side by Side */}
      <View style={s.personGrid}>
        <PersonCard color="#7C3AED" label="Birinci Kişi"
          n={n1} sN={setN1} y={y1} sY={setY1} m={m1} sM={setM1} d={d1} sD={setD1} h={h1} sH={setH1} mi={mi1} sMi={setMi1} />
        <PersonCard color="#EC4899" label="İkinci Kişi"
          n={n2} sN={setN2} y={y2} sY={setY2} m={m2} sM={setM2} d={d2} sD={setD2} h={h2} sH={setH2} mi={mi2} sMi={setMi2} />
      </View>

      <TouchableOpacity style={s.btn} onPress={calc} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.btnTxt}>💞 Uyum Analizini Başlat</Text>}
      </TouchableOpacity>

      {/* Score Gauge Card */}
      {score !== null && (
        <View style={s.scoreCard}>
          <View style={s.scoreCircle}>
            <Text style={s.scoreNum}>{score}</Text>
            <Text style={s.scoreLabel}>PUAN</Text>
          </View>
          <Text style={s.scoreTitle}>
            {score > 75 ? 'Kozmik Uyum Yüksek ✨' : score > 50 ? 'Dengeli & Gelişime Açık İlişki 💫' : 'Zorlayıcı Açı Yoğunluğu ⚡'}
          </Text>
          <Text style={s.scoreSub}>
            Ruhsal ve zihinsel düzeyde haritalar arasında {aspects?.length || 0} aktif açı hesaplandı.
          </Text>
        </View>
      )}

      {/* SVG Chart Wheel */}
      {svgXml && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Synastry Uyum Çarkı</Text>
          <View style={s.svgWrap}>
            <SvgXml xml={svgXml} width={SW - 64} height={SW - 64} />
          </View>
        </View>
      )}

      {/* Aspects Table */}
      {aspects && aspects.length > 0 && (
        <View style={s.card}>
          <View style={s.cardTopRow}>
            <Text style={s.cardTitle}>Hesaplanan Açılar</Text>
            <View style={s.countBadge}><Text style={s.countTxt}>{aspects.length} Açı</Text></View>
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
          {aspects.length > 20 && <Text style={s.moreTxt}>+{aspects.length - 20} açı daha...</Text>}
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
      <TextInput style={s.pInp} value={n} onChangeText={sN} placeholder="Ad" placeholderTextColor="#52525B" />
      <View style={s.pRow}>
        <TextInput style={[s.pInp, s.pSmall]} value={d} onChangeText={sD} keyboardType="numeric" placeholder="G" placeholderTextColor="#52525B" />
        <TextInput style={[s.pInp, s.pSmall]} value={m} onChangeText={sM} keyboardType="numeric" placeholder="A" placeholderTextColor="#52525B" />
        <TextInput style={[s.pInp, s.pSmall]} value={y} onChangeText={sY} keyboardType="numeric" placeholder="Y" placeholderTextColor="#52525B" />
      </View>
      <View style={s.pRow}>
        <TextInput style={[s.pInp, s.pSmall]} value={h} onChangeText={sH} keyboardType="numeric" placeholder="S" placeholderTextColor="#52525B" />
        <TextInput style={[s.pInp, s.pSmall]} value={mi} onChangeText={sMi} keyboardType="numeric" placeholder="D" placeholderTextColor="#52525B" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#070714' },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  intro: { marginBottom: 14, alignItems: 'center' },
  introTitle: { fontSize: 20, fontWeight: '800', color: '#FAFAFA', letterSpacing: 0.5 },
  introDesc: { fontSize: 11, color: '#A1A1AA', marginTop: 3, textAlign: 'center' },

  personGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pCard: {
    flex: 1, backgroundColor: '#0E0E1F', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  pBar: { height: 3, borderRadius: 2, marginBottom: 10, width: 24 },
  pLabel: { fontSize: 11, fontWeight: '700', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  pInp: {
    backgroundColor: '#070714', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 9,
    color: '#FAFAFA', fontSize: 13, marginBottom: 5,
  },
  pSmall: { flex: 1, textAlign: 'center', paddingHorizontal: 2 },
  pRow: { flexDirection: 'row', gap: 4 },

  btn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
  btnTxt: { color: '#FAFAFA', fontSize: 15, fontWeight: '800' },

  scoreCard: {
    backgroundColor: '#0E0E1F', borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 14,
  },
  scoreCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 3, borderColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  scoreNum: { fontSize: 32, fontWeight: '900', color: '#FAFAFA' },
  scoreLabel: { fontSize: 9, fontWeight: '800', color: '#FFE16D', letterSpacing: 1 },
  scoreTitle: { fontSize: 16, fontWeight: '800', color: '#FAFAFA', marginBottom: 4 },
  scoreSub: { fontSize: 12, color: '#A1A1AA', textAlign: 'center' },

  card: {
    backgroundColor: '#0E0E1F', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FAFAFA' },
  svgWrap: { alignItems: 'center', backgroundColor: '#070714', borderRadius: 10, padding: 8 },

  countBadge: { backgroundColor: '#7C3AED', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countTxt: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  aspectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  aspectP: { flex: 1, fontSize: 12, fontWeight: '600', color: '#D4D4D8' },
  aspectBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  aspectDot: { width: 5, height: 5, borderRadius: 3 },
  aspectType: { fontSize: 10, fontWeight: '700' },
  aspectOrb: { width: 36, textAlign: 'right', fontSize: 11, color: '#71717A', fontWeight: '600' },
  moreTxt: { fontSize: 11, color: '#52525B', textAlign: 'center', marginTop: 8 },
});
