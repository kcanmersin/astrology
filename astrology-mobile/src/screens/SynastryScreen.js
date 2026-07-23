import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { fetchSynastryChart, fetchSynastrySVG } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

const { width: SW } = Dimensions.get('window');

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
    <ScrollView style={t.bg} contentContainerStyle={t.pad}>
      {/* Person A */}
      <View style={t.section}>
        <View style={t.personRow}>
          <View style={[t.dot, { backgroundColor: '#7C3AED' }]} />
          <Text style={t.heading}>Birinci Kişi</Text>
        </View>
        <TextInput style={t.inp} value={n1} onChangeText={setN1} placeholder="Ad" placeholderTextColor="#3F3F46" />
        <View style={t.row}>
          <F l="Yıl" v={y1} s={setY1} /> <F l="Ay" v={m1} s={setM1} /> <F l="Gün" v={d1} s={setD1} />
        </View>
        <View style={t.row}>
          <F l="Saat" v={h1} s={setH1} /> <F l="Dakika" v={mi1} s={setMi1} />
        </View>
      </View>

      {/* Person B */}
      <View style={t.section}>
        <View style={t.personRow}>
          <View style={[t.dot, { backgroundColor: '#EC4899' }]} />
          <Text style={t.heading}>İkinci Kişi</Text>
        </View>
        <TextInput style={t.inp} value={n2} onChangeText={setN2} placeholder="Ad" placeholderTextColor="#3F3F46" />
        <View style={t.row}>
          <F l="Yıl" v={y2} s={setY2} /> <F l="Ay" v={m2} s={setM2} /> <F l="Gün" v={d2} s={setD2} />
        </View>
        <View style={t.row}>
          <F l="Saat" v={h2} s={setH2} /> <F l="Dakika" v={mi2} s={setMi2} />
        </View>
      </View>

      <TouchableOpacity style={t.btn} onPress={calc} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={t.btnTxt}>Uyum Haritasını Hesapla</Text>}
      </TouchableOpacity>

      {/* Synastry Wheel */}
      {svgXml && (
        <View style={t.section}>
          <Text style={t.heading}>Synastry Çarkı</Text>
          <View style={t.svgWrap}>
            <SvgXml xml={svgXml} width={SW - 72} height={SW - 72} />
          </View>
        </View>
      )}

      {/* Aspects */}
      {aspects && (
        <View style={[t.section, { marginBottom: 32 }]}>
          <Text style={t.heading}>Açılar</Text>
          <Text style={t.meta}>{aspects.length} açı tespit edildi.</Text>
          {aspects.slice(0, 15).map((a, i) => (
            <View key={i} style={t.aspectRow}>
              <Text style={t.aspectPlanet}>{a.p1_name}</Text>
              <View style={t.aspectBadge}>
                <Text style={t.aspectType}>{a.aspect}</Text>
              </View>
              <Text style={t.aspectPlanet}>{a.p2_name}</Text>
              <Text style={t.aspectOrb}>{(a.orbit ?? 0).toFixed(1)}°</Text>
            </View>
          ))}
          {aspects.length > 15 && (
            <Text style={t.meta}>ve {aspects.length - 15} açı daha...</Text>
          )}
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

const t = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#09090B' },
  pad: { padding: 20, paddingBottom: 40 },

  section: {
    backgroundColor: '#111113', borderRadius: 12, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#1C1C22',
  },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  heading: { fontSize: 16, fontWeight: '700', color: '#FAFAFA' },
  meta: { fontSize: 12, color: '#52525B', marginTop: 4, marginBottom: 8 },

  lbl: { fontSize: 11, fontWeight: '600', color: '#52525B', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 10, marginBottom: 4 },
  inp: {
    backgroundColor: '#09090B', borderWidth: 1, borderColor: '#27272A',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, color: '#FAFAFA', fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 10 },

  btn: { backgroundColor: '#7C3AED', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  btnTxt: { color: '#FAFAFA', fontSize: 14, fontWeight: '700' },

  svgWrap: { alignItems: 'center', marginTop: 12, backgroundColor: '#09090B', borderRadius: 10, padding: 8 },

  aspectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1C1C22',
  },
  aspectPlanet: { flex: 1, fontSize: 13, fontWeight: '600', color: '#E4E4E7' },
  aspectBadge: { backgroundColor: '#18181B', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
  aspectType: { fontSize: 11, fontWeight: '700', color: '#A78BFA' },
  aspectOrb: { width: 40, textAlign: 'right', fontSize: 12, color: '#52525B' },
});
