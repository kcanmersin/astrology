import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WelcomeScreen from './src/screens/WelcomeScreen';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import AIScreen from './src/screens/AIScreen';
import SavedScreen from './src/screens/SavedScreen';

const TABS = [
  { key: 'natal',    label: 'Natal',    sub: 'Doğum Haritası' },
  { key: 'synastry', label: 'Uyum',     sub: 'Synastry' },
  { key: 'ai',       label: 'AI Yorum', sub: 'Groq LLM' },
  { key: 'saved',    label: 'Arşiv',    sub: 'Profiller' },
  { key: 'welcome',  label: 'Profil',   sub: 'Giriş / Hoşgeldin' },
];

function TabBar({ activeTab, setActiveTab }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
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
  const [activeTab, setActiveTab] = useState('welcome');
  const [userEmail, setUserEmail] = useState(null);

  const handleStart = () => {
    setActiveTab('natal');
  };

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setActiveTab('natal');
  };

  const screen = (() => {
    switch (activeTab) {
      case 'welcome':  return <WelcomeScreen onStart={handleStart} onLoginSuccess={handleLoginSuccess} />;
      case 'natal':    return <NatalScreen />;
      case 'synastry': return <SynastryScreen />;
      case 'ai':       return <AIScreen />;
      case 'saved':    return <SavedScreen />;
      default:         return <NatalScreen />;
    }
  })();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#070714" />
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>LUMINA ASTRA</Text>
            <Text style={styles.brandSub}>
              {userEmail ? `👤 ${userEmail}` : 'Kozmik Astroloji Engine'}
            </Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}><Text style={styles.badgeText}>Swiss Eph.</Text></View>
            <View style={[styles.badge, styles.badgeAccent]}><Text style={[styles.badgeText, styles.badgeAccentText]}>Groq AI</Text></View>
          </View>
        </View>

        {/* Main View */}
        <View style={styles.content}>{screen}</View>

        {/* Navigation Bar */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070714' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(7,7,20,0.95)',
  },
  brand: { fontSize: 17, fontWeight: '800', color: '#FAFAFA', letterSpacing: 2.5 },
  brandSub: { fontSize: 10, color: '#A1A1AA', fontWeight: '500', letterSpacing: 1, marginTop: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, backgroundColor: '#14142B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#A1A1AA', letterSpacing: 0.3 },
  badgeAccent: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  badgeAccentText: { color: '#F5F3FF', fontWeight: '800' },

  content: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E0E1F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: 'rgba(124, 58, 237, 0.15)' },
  tabIndicator: { width: 18, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 5 },
  tabIndicatorActive: { backgroundColor: '#7C3AED' },
  tabLabel: { fontSize: 12, fontWeight: '700', color: '#52525B' },
  tabLabelActive: { color: '#FAFAFA' },
  tabSub: { fontSize: 8, fontWeight: '500', color: '#3F3F46', marginTop: 2 },
  tabSubActive: { color: '#A1A1AA' },
});
