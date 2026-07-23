import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { fetchSynastryChart, fetchSynastrySVG } from '../services/api';
import { cleanSvgForMobile } from '../utils/svgFix';

export default function SynastryScreen() {
  const [name1, setName1] = useState('Kişi A');
  const [year1, setYear1] = useState('1990');
  const [month1, setMonth1] = useState('1');
  const [day1, setDay1] = useState('15');

  const [name2, setName2] = useState('Kişi B');
  const [year2, setYear2] = useState('1992');
  const [month2, setMonth2] = useState('6');
  const [day2, setDay2] = useState('20');

  const [loading, setLoading] = useState(false);
  const [synData, setSynData] = useState(null);
  const [svgXml, setSvgXml] = useState(null);

  const handleCalculate = async () => {
    setLoading(true);
    setSynData(null);
    setSvgXml(null);

    const payload = {
      first_subject: {
        name: name1, year: parseInt(year1), month: parseInt(month1), day: parseInt(day1),
        hour: 12, minute: 0, city: 'Istanbul', lng: 28.9784, lat: 41.0082, tz_str: 'Europe/Istanbul'
      },
      second_subject: {
        name: name2, year: parseInt(year2), month: parseInt(month2), day: parseInt(day2),
        hour: 12, minute: 0, city: 'Ankara', lng: 32.8597, lat: 39.9334, tz_str: 'Europe/Istanbul'
      }
    };

    try {
      const [jsonRes, svgRes] = await Promise.all([
        fetchSynastryChart(payload),
        fetchSynastrySVG(payload)
      ]);
      setSynData(jsonRes.data);
      setSvgXml(cleanSvgForMobile(svgRes));
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>💞 Synastry (Uyum) Analizi</Text>
      <Text style={styles.subtitle}>İki Harita Arasındaki Açısal Etkileşimler</Text>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: '#00DFD8' }]}>1. Kişi Bilgileri</Text>
        <TextInput style={styles.input} value={name1} onChangeText={setName1} placeholder="Ad" placeholderTextColor="#A0A5C0" />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flex1]} value={year1} onChangeText={setYear1} placeholder="Yıl" keyboardType="numeric" />
          <TextInput style={[styles.input, styles.flex1]} value={month1} onChangeText={setMonth1} placeholder="Ay" keyboardType="numeric" />
          <TextInput style={[styles.input, styles.flex1]} value={day1} onChangeText={setDay1} placeholder="Gün" keyboardType="numeric" />
        </View>

        <Text style={[styles.cardTitle, { color: '#FF0080', marginTop: 16 }]}>2. Kişi Bilgileri</Text>
        <TextInput style={styles.input} value={name2} onChangeText={setName2} placeholder="Ad" placeholderTextColor="#A0A5C0" />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flex1]} value={year2} onChangeText={setYear2} placeholder="Yıl" keyboardType="numeric" />
          <TextInput style={[styles.input, styles.flex1]} value={month2} onChangeText={setMonth2} placeholder="Ay" keyboardType="numeric" />
          <TextInput style={[styles.input, styles.flex1]} value={day2} onChangeText={setDay2} placeholder="Gün" keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.btnPink} onPress={handleCalculate} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>💖 Uyum Haritasını Çiz</Text>}
        </TouchableOpacity>
      </View>

      {svgXml && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💞 Dual Wheel Görseli</Text>
          <View style={styles.svgWrapper}>
            <SvgXml xml={svgXml} width="100%" height={340} />
          </View>
        </View>
      )}

      {synData && synData.aspects && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Tespit Edilen Uyum Açısı Sayısı: {synData.aspects.length}</Text>
          <Text style={styles.textMuted}>İki harita arasındaki gezegen açıları ve uyum etkileşimleri başarıyla hesaplandı.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070714' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 12, color: '#FF0080', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: 'rgba(18, 18, 42, 0.85)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  input: { backgroundColor: 'rgba(7, 7, 20, 0.9)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 10, padding: 10, color: '#FFF', fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  btnPink: { backgroundColor: '#FF0080', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  textMuted: { color: '#A0A5C0', fontSize: 13 },
  svgWrapper: { alignItems: 'center', marginVertical: 8, backgroundColor: '#070714', borderRadius: 16, padding: 8 }
});
