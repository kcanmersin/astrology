import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import AIScreen from './src/screens/AIScreen';
import SavedScreen from './src/screens/SavedScreen';

const TABS = [
  { key: 'natal',    label: 'Natal' },
  { key: 'synastry', label: 'Uyum' },
  { key: 'ai',       label: 'AI Yorum' },
  { key: 'saved',    label: 'Kayıtlar' },
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
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      <SafeAreaView style={styles.root} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>KERYKEION</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Swiss Ephemeris</Text>
            </View>
            <View style={[styles.tag, styles.tagAccent]}>
              <Text style={[styles.tagText, styles.tagAccentText]}>AI</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>{renderScreen()}</View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#09090B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C22',
  },
  brand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FAFAFA',
    letterSpacing: 3,
  },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#1C1C22',
  },
  tagText: { fontSize: 9, fontWeight: '700', color: '#71717A', letterSpacing: 0.5 },
  tagAccent: { backgroundColor: '#7C3AED' },
  tagAccentText: { color: '#FAFAFA' },

  content: { flex: 1 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#09090B',
    borderTopWidth: 1,
    borderTopColor: '#1C1C22',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#18181B',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525B',
  },
  tabTextActive: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
});
