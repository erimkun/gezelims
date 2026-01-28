# 🎮 games/ - Mini Oyun Bileşenleri

Bu dizin, uygulamadaki 13 mini oyunun React bileşenlerini içerir.

---

## 📂 Dizin Yapısı

```
games/
├── 📄 Games.css                 # Ortak oyun stilleri
├── 📄 RunnerGameAssets.md       # Runner oyunu varlık dokümantasyonu
│
├── 📄 MemoryGame.tsx            # Hafıza/Kart eşleştirme
├── 📄 SnakeGame.tsx             # Klasik yılan
├── 📄 BalloonPopGame.tsx        # Balon patlatma
├── 📄 RunnerGame.tsx            # Sonsuz koşu
├── 📄 TilePuzzleGame.tsx        # Karo bulmaca
├── 📄 ReactionGame.tsx          # Refleks testi
├── 📄 WhackAMoleGame.tsx        # Köstebek vurma
├── 📄 ColorMatchGame.tsx        # Renk eşleştirme
├── 📄 Game2048.tsx              # 2048 sayı oyunu
├── 📄 UskudarQuizGame.tsx       # Üsküdar bilgi yarışması
├── 📄 TicTacToeGame.tsx         # XOX oyunu
├── 📄 MathRaceGame.tsx          # Matematik yarışı
└── 📄 TargetShootGame.tsx       # Hedef vurma
```

---

## 🎯 Oyun Listesi

### 1. 🃏 MemoryGame.tsx - Hafıza Oyunu
**Mekanik:** Kartları çevir, eşlerini bul

**Özellikler:**
- 4x4 kart grid
- Flip animasyonu
- Skor ve hamle sayacı
- 6 dil desteği

---

### 2. 🐍 SnakeGame.tsx - Mini Yılan
**Mekanik:** Klasik yılan oyunu, yem ye ve büyü

**Özellikler:**
- Klavye kontrolü (WASD / Ok tuşları)
- Mobil swipe desteği
- Skor sistemi
- Game over ekranı

---

### 3. 🎈 BalloonPopGame.tsx - Balon Patlatma
**Mekanik:** Ekranda beliren balonları tıkla

**Özellikler:**
- Farklı renkli balonlar
- Zaman sınırı
- Bonus balonlar
- Combo sistemi

---

### 4. 🏃 RunnerGame.tsx - Sonsuz Koşu
**Mekanik:** Engelleri aş, altınları topla

**Özellikler:**
- Canvas tabanlı rendering
- Engel tipleri
- Zıplama mekaniği
- Yüksek skor takibi

---

### 5. 🧩 TilePuzzleGame.tsx - Karo Bulmaca
**Mekanik:** Karoları kaydır, resmi tamamla

**Özellikler:**
- 3x3 veya 4x4 grid seçeneği
- Hamle sayacı
- Çözüm ipucu
- Kazanma animasyonu

---

### 6. ⚡ ReactionGame.tsx - Refleks Testi
**Mekanik:** Yeşil rengi gör, en hızlı tıkla

**Özellikler:**
- Milisaniye hassasiyetinde ölçüm
- Ortalama hesaplama
- Erken tıklama cezası
- En iyi skor takibi

---

### 7. 🔨 WhackAMoleGame.tsx - Köstebek Vur
**Mekanik:** Çıkan köstebekleri vur, bombalara dikkat

**Özellikler:**
- Rastgele köstebek çıkışı
- Bomba mekanizması (-puan)
- Hız artışı
- Zaman sınırı

---

### 8. 🎨 ColorMatchGame.tsx - Renk Eşleştir
**Mekanik:** Renk ismi ile gerçek rengi eşleştir (Stroop effect)

**Özellikler:**
- Yanıltıcı renkler
- Hız bazlı puanlama
- Zorluk artışı
- Combo bonus

---

### 9. 🔢 Game2048.tsx - 2048
**Mekanik:** Aynı sayıları birleştir, 2048'e ulaş

**Özellikler:**
- Swipe/Klavye kontrol
- Skor takibi
- En yüksek tile takibi
- Geri al özelliği

---

### 10. 🏛️ UskudarQuizGame.tsx - Üsküdar Quiz
**Mekanik:** Üsküdar hakkında bilgi yarışması

**Özellikler:**
- Çoktan seçmeli sorular
- Üsküdar tarihi/coğrafyası
- Puan sistemi
- Doğru/yanlış animasyonları

---

### 11. ⭕ TicTacToeGame.tsx - XOX
**Mekanik:** Klasik XOX oyunu

**Özellikler:**
- 2 oyunculu mod
- AI rakip (minimax algoritması)
- Kazanma çizgisi animasyonu
- Berabere kontrolü

---

### 12. ➕ MathRaceGame.tsx - Matematik Yarışı
**Mekanik:** Hızlı matematik soruları çöz

**Özellikler:**
- +, -, ×, ÷ işlemleri
- Süre bazlı puanlama
- Zorluk seviyeleri
- Streak bonus

---

### 13. 🎯 TargetShootGame.tsx - Hedef Vur
**Mekanik:** Hareket eden hedefleri vur

**Özellikler:**
- Farklı boyut hedefler
- Hız değişimi
- Combo sistemi
- Zaman sınırı

---

## 🎨 Ortak Tasarım Özellikleri

### UI Elementleri
```tsx
// Her oyunda standart butonlar
<button className="game-back-btn">Geri</button>
<button className="game-restart-btn">Yeniden Başla</button>

// Skor gösterimi
<div className="game-score">Skor: {score}</div>

// Game over ekranı
<div className="game-over">
  <h2>Oyun Bitti!</h2>
  <p>Skor: {finalScore}</p>
</div>
```

### Dil Desteği Pattern
```tsx
const translations = {
  tr: { title: 'Oyun Adı', play: 'Oyna', ... },
  en: { title: 'Game Name', play: 'Play', ... },
  de: { ... },
  fr: { ... },
  es: { ... },
  it: { ... }
};

const t = translations[language];
```

---

## 📱 Responsive Tasarım

Tüm oyunlar mobil uyumludur:
- Touch/swipe desteği
- Esnek boyutlandırma
- Büyük dokunma alanları
- Landscape/portrait uyumu

---

## 🔧 Yeni Oyun Ekleme Rehberi

1. `games/` klasörüne `YeniOyun.tsx` oluştur
2. 6 dil için `translations` objesi ekle
3. `language` prop'u al
4. `onBack` callback'i implement et
5. `MiniGames.tsx`'e import ve kart ekle

```tsx
// YeniOyun.tsx template
interface YeniOyunProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onBack: () => void;
}

const translations = {
  tr: { title: 'Yeni Oyun', ... },
  en: { title: 'New Game', ... },
  // ... diğer diller
};

const YeniOyun = ({ language, onBack }: YeniOyunProps) => {
  const t = translations[language];
  
  return (
    <div className="game-container">
      <button onClick={onBack}>← Geri</button>
      <h1>{t.title}</h1>
      {/* Oyun içeriği */}
    </div>
  );
};

export default YeniOyun;
```
