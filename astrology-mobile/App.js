import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import NatalScreen from './src/screens/NatalScreen';
import SynastryScreen from './src/screens/SynastryScreen';
import SavedScreen from './src/screens/SavedScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('natal');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070714" />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ KERYKEION ASTROLOGY</Text>
      </View>

      {/* Dynamic Screen Content */}
      <View style={styles.screenContainer}>
        {activeTab === 'natal' && <NatalScreen />}
        {activeTab === 'synastry' && <SynastryScreen />}
        {activeTab === 'saved' && <SavedScreen />}
      </View>

      {/* Mobile Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'natal' && styles.navItemActive]}
          onPress={() => setActiveTab('natal')}
        >
          <Text style={styles.navIcon}>🌌</Text>
          <Text style={[styles.navText, activeTab === 'natal' && styles.navTextActive]}>Natal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'synastry' && styles.navItemActive]}
          onPress={() => setActiveTab('synastry')}
        >
          <Text style={styles.navIcon}>💞</Text>
          <Text style={[styles.navText, activeTab === 'synastry' && styles.navTextActive]}>Synastry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'saved' && styles.navItemActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={styles.navIcon}>📁</Text>
          <Text style={[styles.navText, activeTab === 'saved' && styles.navTextActive]}>Kayıtlılar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070714'
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(18, 18, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1
  },
  screenContainer: {
    flex: 1
  },
  bottomNav: {
    flexDirection: 'row',
    height: 65,
    backgroundColor: 'rgba(18, 18, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#FF0080'
  },
  navIcon: {
    fontSize: 20
  },
  navText: {
    fontSize: 11,
    color: '#A0A5C0',
    fontWeight: '600',
    marginTop: 2
  },
  navTextActive: {
    color: '#FFF',
    fontWeight: '700'
  }
});
