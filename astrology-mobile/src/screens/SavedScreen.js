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
      { text: 'Sil', style: 'destructive', onPress: async () => {
        const next = [...profiles]; next.splice(idx, 1);
        setProfiles(next);
        await AsyncStorage.setItem('saved_charts', JSON.stringify(next));
      }},
    ]);
  };

  const clearAll = () => {
    Alert.alert('Tümünü Sil', 'Tüm kayıtlı profiller kalıcı olarak silinecek.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Tümünü Sil', style: 'destructive', onPress: async () => {
        await AsyncStorage.removeItem('saved_charts');
        setProfiles([]);
      }},
    ]);
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.pad}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#52525B" />}>

      {/* Header row */}
      <View style={s.topRow}>
        <View>
          <Text style={s.title}>Kayıtlı Profiller</Text>
          <Text style={s.subtitle}>{profiles.length} kayıt</Text>
        </View>
        {profiles.length > 0 && (
          <TouchableOpacity style={s.clearBtn} onPress={clearAll} activeOpacity={0.7}>
            <Text style={s.clearTxt}>Tümünü Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {profiles.length === 0 && (
        <View style={s.emptyCard}>
          <View style={s.emptyIcon}>
            <Text style={s.emptyIconTxt}>0</Text>
          </View>
          <Text style={s.emptyTitle}>Henüz kayıt yok</Text>
          <Text style={s.emptyDesc}>
            Natal veya AI Yorum sekmelerinden harita hesaplayıp
            kaydet butonuna basarak profil oluşturabilirsiniz.
          </Text>
        </View>
      )}

      {/* Profile list */}
      {profiles.map((p, i) => (
        <View key={i} style={s.card}>
          <View style={s.cardHead}>
            <View style={s.cardLeft}>
              <View style={s.avatar}>
                <Text style={s.avatarTxt}>{(p.name || 'D')[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={s.cardName}>{p.name || 'Danışan'}</Text>
                {p.savedAt && <Text style={s.savedAt}>{new Date(p.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>}
              </View>
            </View>
            <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={() => remove(i)}>
              <Text style={s.delTxt}>Sil</Text>
            </TouchableOpacity>
          </View>

          <View style={s.infoRow}>
            <InfoCell label="Doğum Tarihi" value={`${p.day || '?'}.${p.month || '?'}.${p.year || '?'}`} />
            <InfoCell label="Saat" value={`${p.hour || '0'}:${(p.minute || '0').toString().padStart(2, '0')}`} />
            <InfoCell label="Konum" value={p.city || '—'} />
          </View>
        </View>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function InfoCell({ label, value }) {
  return (
    <View style={s.infoCell}>
      <Text style={s.infoCellLbl}>{label}</Text>
      <Text style={s.infoCellVal}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#07070A' },
  pad: { paddingHorizontal: 16, paddingTop: 12 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#FAFAFA' },
  subtitle: { fontSize: 12, color: '#3F3F46', marginTop: 2 },
  clearBtn: { backgroundColor: '#111116', borderWidth: 1, borderColor: '#1E1E26', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 7 },
  clearTxt: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  emptyCard: {
    alignItems: 'center', paddingVertical: 50,
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  emptyIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#141419',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  emptyIconTxt: { fontSize: 18, fontWeight: '800', color: '#27272A' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#52525B', marginBottom: 6 },
  emptyDesc: { fontSize: 12, color: '#3F3F46', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },

  card: {
    backgroundColor: '#0E0E13', borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: '#FAFAFA', fontSize: 15, fontWeight: '800' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#FAFAFA' },
  savedAt: { fontSize: 10, color: '#3F3F46', marginTop: 1 },
  delTxt: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  infoRow: { flexDirection: 'row', gap: 10 },
  infoCell: {
    flex: 1, backgroundColor: '#111116', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#1A1A21',
  },
  infoCellLbl: { fontSize: 9, fontWeight: '600', color: '#3F3F46', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoCellVal: { fontSize: 13, fontWeight: '600', color: '#A1A1AA' },
});
