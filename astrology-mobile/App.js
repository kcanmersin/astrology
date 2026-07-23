import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import AIScreen from './src/screens/AIScreen';
import SavedScreen from './src/screens/SavedScreen';

const TABS = [
  { key: 'natal',    label: 'Natal',    sub: 'Doğum Haritası' },
  { key: 'synastry', label: 'Uyum',     sub: 'Synastry' },
  { key: 'ai',       label: 'AI Yorum', sub: 'LLM Analiz' },
  { key: 'saved',    label: 'Kayıtlar', sub: 'Profiller' },
];

function TabBar({ activeTab, setActiveTab }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.6}
          >
            <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            <Text style={[styles.tabSub, active && styles.tabSubActive]}>{tab.sub}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('natal');

  const screen = (() => {
    switch (activeTab) {
      case 'natal':    return <NatalScreen />;
      case 'synastry': return <SynastryScreen />;
      case 'ai':       return <AIScreen />;
      case 'saved':    return <SavedScreen />;
      default:         return <NatalScreen />;
    }
  })();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#07070A" />
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>KERYKEION</Text>
            <Text style={styles.brandSub}>Astrology Engine</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}><Text style={styles.badgeText}>Swiss Eph.</Text></View>
            <View style={[styles.badge, styles.badgeAccent]}><Text style={[styles.badgeText, styles.badgeAccentText]}>Groq AI</Text></View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>{screen}</View>

        {/* Tab Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07070A' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#141419',
  },
  brand: { fontSize: 17, fontWeight: '800', color: '#FAFAFA', letterSpacing: 2.5 },
  brandSub: { fontSize: 10, color: '#3F3F46', fontWeight: '500', letterSpacing: 1, marginTop: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, backgroundColor: '#141419' },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#52525B', letterSpacing: 0.3 },
  badgeAccent: { backgroundColor: '#7C3AED' },
  badgeAccentText: { color: '#F5F3FF' },

  content: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0C0C10',
    borderTopWidth: 1,
    borderTopColor: '#141419',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: '#141419' },
  tabIndicator: { width: 20, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 6 },
  tabIndicatorActive: { backgroundColor: '#7C3AED' },
  tabLabel: { fontSize: 13, fontWeight: '700', color: '#3F3F46' },
  tabLabelActive: { color: '#FAFAFA' },
  tabSub: { fontSize: 9, fontWeight: '500', color: '#27272A', marginTop: 2 },
  tabSubActive: { color: '#52525B' },
});
