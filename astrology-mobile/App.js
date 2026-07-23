import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import AIScreen from './src/screens/AIScreen';
import SavedScreen from './src/screens/SavedScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('natal');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070714" />
      <View style={styles.container}>
        {/* Main Content Render */}
        <View style={styles.content}>
          {activeTab === 'natal' && <NatalScreen />}
          {activeTab === 'synastry' && <SynastryScreen />}
          {activeTab === 'ai' && <AIScreen />}
          {activeTab === 'saved' && <SavedScreen />}
        </View>

        {/* Bottom Tab Bar Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'natal' && styles.tabActive]}
            onPress={() => setActiveTab('natal')}
          >
            <Text style={styles.tabIcon}>🌌</Text>
            <Text style={[styles.tabLabel, activeTab === 'natal' && styles.tabLabelActive]}>Natal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'synastry' && styles.tabActive]}
            onPress={() => setActiveTab('synastry')}
          >
            <Text style={styles.tabIcon}>💞</Text>
            <Text style={[styles.tabLabel, activeTab === 'synastry' && styles.tabLabelActive]}>Synastry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'ai' && styles.tabActive]}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={styles.tabIcon}>🤖</Text>
            <Text style={[styles.tabLabel, activeTab === 'ai' && styles.tabLabelActive]}>AI Analiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={styles.tabIcon}>💾</Text>
            <Text style={[styles.tabLabel, activeTab === 'saved' && styles.tabLabelActive]}>Kayıtlılar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070714' },
  container: { flex: 1, backgroundColor: '#070714' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0D0D26',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12
  },
  tabActive: {
    backgroundColor: 'rgba(121, 40, 202, 0.2)'
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0A5C0'
  },
  tabLabelActive: {
    color: '#FFD700',
    fontWeight: '700'
  }
});
