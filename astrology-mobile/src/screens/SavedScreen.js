import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Alert, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavedScreen() {
  const [profiles, setProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem('saved_charts');
      setProfiles(raw ? JSON.parse(raw) : []);
    } catch { setProfiles([]); }
  };

  React.useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const remove = (idx) => {
    Alert.alert('Profili Sil', 'Bu kaydı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          const next = [...profiles]; next.splice(idx, 1);
          setProfiles(next);
          await AsyncStorage.setItem('saved_charts', JSON.stringify(next));
        },
      },
    ]);
  };

  const clearAll = () => {
    Alert.alert('Tümünü Sil', 'Tüm kayıtlı profiller kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Tümünü Sil', style: 'destructive',
        onPress: async () => { await AsyncStorage.removeItem('saved_charts'); setProfiles([]); },
      },
    ]);
  };

  return (
    <ScrollView style={t.bg} contentContainerStyle={t.pad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#71717A" />}>

      <View style={t.topRow}>
        <View>
          <Text style={t.pageTitle}>Kayıtlı Profiller</Text>
          <Text style={t.count}>{profiles.length} kayıt</Text>
        </View>
        {profiles.length > 0 && (
          <TouchableOpacity style={t.clearBtn} onPress={clearAll}>
            <Text style={t.clearTxt}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {profiles.length === 0 ? (
        <View style={t.empty}>
          <Text style={t.emptyTitle}>Henüz kayıt yok</Text>
          <Text style={t.emptyDesc}>
            Natal veya AI Yorum sekmelerinden harita hesaplayıp
            "Kaydet" butonuna basarak profil oluşturabilirsiniz.
          </Text>
        </View>
      ) : (
        profiles.map((p, i) => (
          <View key={i} style={t.card}>
            <View style={t.cardHead}>
              <Text style={t.cardName}>{p.name || 'Danışan'}</Text>
              <TouchableOpacity hitSlop={12} onPress={() => remove(i)}>
                <Text style={t.delTxt}>Sil</Text>
              </TouchableOpacity>
            </View>
            <View style={t.infoRow}>
              <InfoItem label="Tarih" value={`${p.day || '?'}.${p.month || '?'}.${p.year || '?'}`} />
              <InfoItem label="Saat" value={`${p.hour || '0'}:${(p.minute || '0').toString().padStart(2, '0')}`} />
              <InfoItem label="Konum" value={p.city || '—'} />
            </View>
            {p.savedAt && <Text style={t.savedAt}>{new Date(p.savedAt).toLocaleString('tr-TR')}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={t.info}>
      <Text style={t.infoLabel}>{label}</Text>
      <Text style={t.infoValue}>{value}</Text>
    </View>
  );
}

const t = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#09090B' },
  pad: { padding: 20, paddingBottom: 40 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#FAFAFA' },
  count: { fontSize: 12, color: '#52525B', marginTop: 2 },
  clearBtn: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  clearTxt: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#52525B', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#3F3F46', textAlign: 'center', lineHeight: 19, paddingHorizontal: 24 },

  card: {
    backgroundColor: '#111113', borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#1C1C22',
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#FAFAFA' },
  delTxt: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  infoRow: { flexDirection: 'row', gap: 12 },
  info: {},
  infoLabel: { fontSize: 10, fontWeight: '600', color: '#3F3F46', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#A1A1AA' },
  savedAt: { fontSize: 10, color: '#27272A', marginTop: 10 },
});
