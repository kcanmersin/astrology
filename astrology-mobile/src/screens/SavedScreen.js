import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, Alert, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function SavedScreen() {
  const [profiles, setProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfiles = async () => {
    try {
      const raw = await AsyncStorage.getItem('saved_charts');
      setProfiles(raw ? JSON.parse(raw) : []);
    } catch { setProfiles([]); }
  };

  // Load on mount + whenever tab is focused (works without react-navigation too)
  React.useEffect(() => { loadProfiles(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  };

  const handleDelete = (idx) => {
    Alert.alert('Sil', 'Bu profili silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          const updated = [...profiles];
          updated.splice(idx, 1);
          setProfiles(updated);
          await AsyncStorage.setItem('saved_charts', JSON.stringify(updated));
        }
      }
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Tümünü Sil', 'Kayıtlı tüm profiller silinecek.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Hepsini Sil', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('saved_charts');
          setProfiles([]);
        }
      }
    ]);
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}>

      <View style={s.headerRow}>
        <Text style={s.pageTitle}>💾 Kayıtlı Profiller</Text>
        {profiles.length > 0 && (
          <TouchableOpacity style={s.clearBtn} onPress={handleClearAll}>
            <Text style={s.clearBtnText}>🗑 Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {profiles.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📂</Text>
          <Text style={s.emptyTitle}>Henüz kayıtlı profil yok</Text>
          <Text style={s.emptySub}>Natal veya AI sekmelerinden harita hesaplayıp "💾 Kaydet" butonuna basarak profil oluşturabilirsiniz.</Text>
        </View>
      ) : (
        profiles.map((p, idx) => (
          <View key={idx} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardName}>{p.name || 'Danışan'}</Text>
              <TouchableOpacity onPress={() => handleDelete(idx)}>
                <Text style={s.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={s.infoRow}>
              <InfoPill icon="📅" text={`${p.day || '?'}/${p.month || '?'}/${p.year || '?'}`} />
              <InfoPill icon="⏰" text={`${p.hour || '0'}:${(p.minute || '0').toString().padStart(2, '0')}`} />
              <InfoPill icon="📍" text={p.city || '—'} />
            </View>
            {p.savedAt && <Text style={s.savedAt}>Kayıt: {new Date(p.savedAt).toLocaleString('tr-TR')}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function InfoPill({ icon, text }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillIcon}>{icon}</Text>
      <Text style={s.pillText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#05051A' },
  content: { padding: 14, paddingBottom: 32 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#FFD700', letterSpacing: 0.3 },
  clearBtn: { backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  clearBtnText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#94A3B8', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, paddingHorizontal: 32 },

  card: {
    backgroundColor: 'rgba(14,14,38,0.92)',
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '800', color: '#F1F5F9' },
  deleteIcon: { color: '#EF4444', fontSize: 16, fontWeight: '800', paddingHorizontal: 6 },

  infoRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  pillIcon: { fontSize: 12 },
  pillText: { color: '#CBD5E1', fontSize: 12, fontWeight: '600' },
  savedAt: { color: '#475569', fontSize: 10, marginTop: 8 },
});
