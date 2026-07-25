import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Dimensions
} from 'react-native';

const { width: SW } = Dimensions.get('window');

export default function WelcomeScreen({ onStart, onLoginSuccess }) {
  const [mode, setMode] = useState('welcome'); // 'welcome' | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta adresinizi giriniz.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Giriş Başarılı ✨', `Hoş geldiniz, ${email}`);
      onLoginSuccess ? onLoginSuccess(email) : onStart();
    }, 1000);
  };

  if (mode === 'login' || mode === 'register') {
    return (
      <ScrollView style={s.scroll} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
        <View style={s.authCard}>
          <TouchableOpacity style={s.backBtn} onPress={() => setMode('welcome')}>
            <Text style={s.backBtnTxt}>← Geri Dön</Text>
          </TouchableOpacity>

          <Text style={s.authTitle}>
            {mode === 'login' ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
          </Text>
          <Text style={s.authSub}>
            {mode === 'login' ? 'Yıldızların altındaki yerinize geri dönün.' : 'Kozmik haritanızı keşfetmek için üye olun.'}
          </Text>

          {mode === 'register' && (
            <View style={s.group}>
              <Text style={s.label}>TAM İSİM</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Ad Soyad"
                placeholderTextColor="#52525B"
              />
            </View>
          )}

          <View style={s.group}>
            <Text style={s.label}>E-POSTA ADRESİ</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="kozmos@luminaastra.com"
              placeholderTextColor="#52525B"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.group}>
            <Text style={s.label}>ŞİFRE</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#52525B"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleAuth} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={s.submitBtnTxt}>
                {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerTxt}>VEYA</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social Auth Buttons */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn} onPress={() => onStart()}>
              <Text style={s.socialBtnTxt}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn} onPress={() => onStart()}>
              <Text style={s.socialBtnTxt}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.switchModeBtn}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={s.switchModeTxt}>
              {mode === 'login' ? 'Hesabınız yok mu? Kayıt Olun' : 'Zaten hesabınız var mı? Giriş Yapın'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.padWelcome} showsVerticalScrollIndicator={false}>
      {/* Hero Icon */}
      <View style={s.heroOrb}>
        <Text style={s.heroOrbSymbol}>✨</Text>
      </View>

      <Text style={s.welcomeTitle}>Kozmos Sizi Bekliyor</Text>
      <Text style={s.welcomeSub}>
        Kadim astroloji bilgeliği ile modern AI biliminin kesiştiği noktada kendi yıldız haritanızı keşfedin.
      </Text>

      {/* Primary CTA Buttons */}
      <TouchableOpacity style={s.startBtn} onPress={onStart} activeOpacity={0.8}>
        <Text style={s.startBtnTxt}>Kozmik Yolculuğunuza Başlayın  →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.loginBtn} onPress={() => setMode('login')} activeOpacity={0.7}>
        <Text style={s.loginBtnTxt}>
          Zaten bir hesabınız var mı? <Text style={s.loginBtnHighlight}>Giriş Yapın</Text>
        </Text>
      </TouchableOpacity>

      {/* Bento Feature Teasers */}
      <View style={s.bentoGrid}>
        <View style={s.bentoCard}>
          <Text style={s.bentoIcon}>📊</Text>
          <Text style={s.bentoTag}>ANALİZ</Text>
          <Text style={s.bentoDesc}>Detaylı natal harita ve Swiss Ephemeris dereceleri.</Text>
        </View>
        <View style={s.bentoCard}>
          <Text style={s.bentoIcon}>🤖</Text>
          <Text style={s.bentoTag}>GROQ AI</Text>
          <Text style={s.bentoDesc}>Llama 3.3 70B modeli ile anında astroloji yorumu.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#070714' },
  padWelcome: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40, alignItems: 'center' },
  pad: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  heroOrb: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1.5, borderColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  heroOrbSymbol: { fontSize: 36 },

  welcomeTitle: { fontSize: 28, fontWeight: '800', color: '#FAFAFA', textAlign: 'center', marginBottom: 10, letterSpacing: 0.5 },
  welcomeSub: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 10 },

  startBtn: {
    width: '100%', backgroundColor: '#7C3AED', borderRadius: 14,
    paddingVertical: 18, alignItems: 'center', marginBottom: 12,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  startBtnTxt: { color: '#FAFAFA', fontSize: 16, fontWeight: '800' },

  loginBtn: { paddingVertical: 10, marginBottom: 30 },
  loginBtnTxt: { color: '#A1A1AA', fontSize: 13 },
  loginBtnHighlight: { color: '#FFE16D', fontWeight: '700' },

  bentoGrid: { flexDirection: 'row', gap: 12, width: '100%' },
  bentoCard: {
    flex: 1, backgroundColor: '#0E0E1F', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  bentoIcon: { fontSize: 24, marginBottom: 8 },
  bentoTag: { fontSize: 10, fontWeight: '800', color: '#7C3AED', letterSpacing: 1, marginBottom: 4 },
  bentoDesc: { fontSize: 12, color: '#A1A1AA', lineHeight: 17 },

  /* Auth Card */
  authCard: {
    backgroundColor: '#0E0E1F', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { marginBottom: 16 },
  backBtnTxt: { color: '#7C3AED', fontSize: 13, fontWeight: '600' },
  authTitle: { fontSize: 22, fontWeight: '800', color: '#FAFAFA', marginBottom: 4 },
  authSub: { fontSize: 12, color: '#A1A1AA', marginBottom: 20 },

  group: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '700', color: '#A1A1AA', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: '#070714', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: '#FAFAFA', fontSize: 14,
  },

  submitBtn: {
    backgroundColor: '#7C3AED', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 10,
  },
  submitBtnTxt: { color: '#FAFAFA', fontSize: 15, fontWeight: '800' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerTxt: { color: '#52525B', fontSize: 10, fontWeight: '700', paddingHorizontal: 12 },

  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  socialBtn: {
    flex: 1, backgroundColor: '#14142B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  socialBtnTxt: { color: '#FAFAFA', fontSize: 13, fontWeight: '600' },

  switchModeBtn: { alignItems: 'center', paddingTop: 8 },
  switchModeTxt: { color: '#FFE16D', fontSize: 12, fontWeight: '600' },
});
