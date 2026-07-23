import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import AIScreen from './src/screens/AIScreen';
import SavedScreen from './src/screens/SavedScreen';

const TABS = [
  { key: 'natal',    icon: '🌌', label: 'Natal' },
  { key: 'synastry', icon: '💞', label: 'Uyum' },
  { key: 'ai',       icon: '🤖', label: 'AI Yorum' },
  { key: 'saved',    icon: '💾', label: 'Kayıtlar' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('natal');

  const renderScreen = () => {
    switch (activeTab) {
      case 'natal':    return <NatalScreen />;
      case 'synastry': return <SynastryScreen />;
      case 'ai':       return <AIScreen />;
      case 'saved':    return <SavedScreen />;
      default:         return <NatalScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#05051A" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLogo}>✨ KERYKEION</Text>
          <Text style={styles.headerBadge}>AI ENGINE</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05051A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 2,
  },
  headerBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#05051A',
    backgroundColor: '#00DFD8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 1,
    overflow: 'hidden',
  },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0A0A24',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 6,
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: 'rgba(121, 40, 202, 0.15)',
  },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  tabLabelActive: { color: '#FFD700', fontWeight: '800' },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    marginTop: 3,
  },
});
