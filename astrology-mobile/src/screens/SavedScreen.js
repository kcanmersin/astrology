import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavedScreen() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const dataStr = await AsyncStorage.getItem('saved_charts');
      if (dataStr) {
        setProfiles(JSON.parse(dataStr));
      }
    } catch (err) {
      console.log('Error loading saved profiles:', err);
    }
  };

  const handleClear = async () => {
    await AsyncStorage.removeItem('saved_charts');
    setProfiles([]);
    Alert.alert('Silindi', 'Tüm kaydedilen haritalar silindi.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📁 Kaydedilen Profiller</Text>
      <Text style={styles.subtitle}>Telefonda Saklanan Doğum Haritaları</Text>

      {profiles.length > 0 ? (
        <View>
          {profiles.map((p, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardTitle}>👤 {p.name}</Text>
              <Text style={styles.textDetails}>Tarih: {p.day}/{p.month}/{p.year} {p.hour}:{p.minute}</Text>
              <Text style={styles.textDetails}>Konum: Enlem {p.lat}, Boylam {p.lng}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.btnClear} onPress={handleClear}>
            <Text style={styles.btnClearText}>🗑️ Kayıtları Temizle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>Henüz kaydedilmiş harita bulunmuyor.</Text>
          <Text style={styles.emptySubtext}>Natal ekranından hesaplama yaptıktan sonra "Kaydet" butonuna basarak kaydedebilirsiniz.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070714' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 12, color: '#00DFD8', textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: 'rgba(18, 18, 42, 0.75)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFD700', marginBottom: 4 },
  textDetails: { color: '#A0A5C0', fontSize: 13 },
  emptyCard: { backgroundColor: 'rgba(18, 18, 42, 0.5)', borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  emptySubtext: { color: '#A0A5C0', fontSize: 12, textAlign: 'center', marginTop: 4 },
  btnClear: { backgroundColor: 'rgba(255, 0, 128, 0.2)', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnClearText: { color: '#FF0080', fontWeight: '700' }
});
