# 📱 Kerykeion React Native Expo Mobile App

Android Studio veya Xcode **kurmaya gerek kalmadan** doğrudan cep telefonunuzda (**Expo Go** uygulaması ile QR kod okutarak) canlı kullanabileceğiniz mobil uygulama.

---

## 🚀 Çalıştırma Adımları

### 1. Bağımlılıkları Yükleyin

```bash
cd d:\Code\kerykeion-astrology-api\astrology-mobile
npm install
```

### 2. Expo Sunucusunu Başlatın

```bash
npx expo start
```

### 3. Cep Telefonunda Canlı Kullanım (Expo Go)

1. Telefonunuza **Expo Go** (App Store / Google Play) uygulamasını indirin.
2. Terminal ekranında çıkan **QR Kodu** telefon kameranızla taptaze okutun.
3. Uygulama saniyeler içinde telefonunuzda canlı açılacaktır!

---

## 📱 Yerel Mobil APK Çıktısı (Bulut Üzerinden)

Android Studio kurmadan `.apk` çıktısı almak için:

```bash
npx eas-cli build -p android --profile preview
```
