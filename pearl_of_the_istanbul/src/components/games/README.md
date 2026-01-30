# 🎮 games/ - Mini Oyun Bileşenleri

Bu dizin, uygulamadaki 13 mini oyunun React bileşenlerini içerir.

## ✨ Son Güncellemeler

### Erişilebilirlik İyileştirmeleri (v2.0)
- ✅ Tüm oyunlar lazy loading ile yükleniyor (performans)
- ✅ Tam klavye navigasyonu desteği
- ✅ ARIA etiketleri ve roller
- ✅ Ekran okuyucu duyuruları
- ✅ Yüksek kontrast modu desteği
- ✅ Azaltılmış hareket modu desteği

---

## 📂 Dizin Yapısı

```
games/
├── 📄 Games.css                 # Ortak oyun stilleri + erişilebilirlik
├── 📄 README.md                 # Bu dokümantasyon
├── 📄 RunnerGameAssets.md       # Runner oyunu varlık dokümantasyonu
│
├── 📄 MemoryGame.tsx            # Hafıza/Kart eşleştirme ♿
├── 📄 SnakeGame.tsx             # Klasik yılan ♿
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

♿ = Tam erişilebilirlik desteği
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

## 🔧 Yeni Oyun Ekleme Rehberi (Detaylı)

### Adım 1: Oyun Dosyası Oluştur

`games/` klasörüne `YeniOyun.tsx` dosyası oluştur:

```tsx
// YeniOyun.tsx - Tam erişilebilirlik desteği ile
import { useState, useCallback, useRef, useEffect, memo } from 'react';
import './Games.css';

interface YeniOyunProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onBack: () => void;
}

// 6 dil için çeviriler (ZORUNLU)
const translations = {
  tr: {
    title: 'Yeni Oyun',
    score: 'Skor',
    play: 'Oyna',
    restart: 'Yeniden Başla',
    gameOver: 'Oyun Bitti',
    back: 'Geri',
  },
  en: {
    title: 'New Game',
    score: 'Score',
    play: 'Play',
    restart: 'Restart',
    gameOver: 'Game Over',
    back: 'Back',
  },
  de: {
    title: 'Neues Spiel',
    score: 'Punktzahl',
    play: 'Spielen',
    restart: 'Neustart',
    gameOver: 'Spiel Vorbei',
    back: 'Zurück',
  },
  fr: {
    title: 'Nouveau Jeu',
    score: 'Score',
    play: 'Jouer',
    restart: 'Recommencer',
    gameOver: 'Jeu Terminé',
    back: 'Retour',
  },
  es: {
    title: 'Nuevo Juego',
    score: 'Puntuación',
    play: 'Jugar',
    restart: 'Reiniciar',
    gameOver: 'Fin del Juego',
    back: 'Volver',
  },
  it: {
    title: 'Nuovo Gioco',
    score: 'Punteggio',
    play: 'Gioca',
    restart: 'Riavvia',
    gameOver: 'Fine Partita',
    back: 'Indietro',
  }
};

const YeniOyun = ({ language, onBack }: YeniOyunProps) => {
  const t = translations[language];
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  
  // Ekran okuyucu duyuruları için ref
  const announcementRef = useRef<string>('');
  const [announcement, setAnnouncement] = useState('');
  
  // Klavye kontrolü
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          // Yukarı hareketi
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          // Aşağı hareketi
          e.preventDefault();
          break;
        // Diğer tuşlar...
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);
  
  // Ekran okuyucu duyurusu fonksiyonu
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);
  
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    announce(t.play);
  }, [t.play, announce]);
  
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);
  
  return (
    <div 
      className="game-container"
      role="application"
      aria-label={t.title}
    >
      {/* Ekran okuyucu duyuruları */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Geri butonu */}
      <button 
        onClick={onBack}
        className="game-btn"
        aria-label={t.back}
      >
        ← {t.back}
      </button>
      
      {/* Skor gösterimi */}
      <div className="game-score-board" aria-live="polite">
        <span>{t.score}: {score}</span>
      </div>
      
      {/* Oyun içeriği */}
      <div 
        className="game-area"
        role="grid"
        aria-label={t.title}
        tabIndex={0}
      >
        {/* Oyun grid'i veya canvas'ı buraya */}
      </div>
      
      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div 
          className="game-over-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="game-over-title"
        >
          <h2 id="game-over-title">{t.gameOver}</h2>
          <p>{t.score}: {score}</p>
          <button 
            onClick={restartGame}
            className="game-btn game-btn-primary"
            autoFocus
          >
            {t.restart}
          </button>
        </div>
      )}
    </div>
  );
};

// Performans optimizasyonu: memo ile gereksiz render'ları önle
export default memo(YeniOyun, (prevProps, nextProps) => {
  return prevProps.language === nextProps.language;
});
```

### Adım 2: MiniGames.tsx'e Lazy Import Ekle

`../MiniGames.tsx` dosyasını aç ve lazy import ekle:

```tsx
// Mevcut lazy import'ların yanına ekle
const YeniOyun = lazy(() => import('./games/YeniOyun'));
```

### Adım 3: Oyun Kartı Ekle

`MiniGames.tsx` içindeki `games` array'ine kart ekle:

```tsx
const games = [
  // ... mevcut oyunlar ...
  { 
    id: 'yenioyun', 
    icon: '🎮',  // Uygun bir emoji seç
    name: {
      tr: 'Yeni Oyun',
      en: 'New Game',
      de: 'Neues Spiel',
      fr: 'Nouveau Jeu',
      es: 'Nuevo Juego',
      it: 'Nuovo Gioco'
    }
  }
];
```

### Adım 4: Oyun Render Switch Case Ekle

`renderGame` fonksiyonundaki switch'e case ekle:

```tsx
case 'yenioyun':
  return <YeniOyun language={language} onBack={handleBackToList} />;
```

---

## ♿ Erişilebilirlik Gereksinimleri (WCAG 2.1 AA)

### Zorunlu ARIA Attributeleri

| Attribute | Kullanım |
|-----------|----------|
| `role="application"` | Ana oyun container'ı |
| `role="grid"` | Grid tabanlı oyunlar |
| `role="gridcell"` | Grid hücreleri |
| `role="button"` | Tıklanabilir elementler |
| `role="alertdialog"` | Game over/kazanma ekranları |
| `role="status"` | Dinamik güncellemeler |
| `aria-live="polite"` | Ekran okuyucu duyuruları |
| `aria-label` | Tüm interaktif elementler |
| `aria-pressed` | Toggle butonlar |

### Klavye Navigasyonu

Her oyun şu tuşları desteklemeli:

| Tuş | Aksiyon |
|-----|---------|
| Tab | Elementler arası gezinme |
| Enter/Space | Seçim/Aktivasyon |
| Arrow Keys | Yön kontrolü |
| Escape | Oyundan çıkış |
| P | Pause (varsa) |
| R | Restart |

### CSS Erişilebilirlik Sınıfları

```css
/* Games.css içinde mevcut */
.sr-only          /* Ekran okuyucu için gizli metin */
.game-focus-visible /* Klavye focus göstergesi */

/* Otomatik desteklenen medya sorguları */
@media (prefers-contrast: high) { ... }
@media (prefers-reduced-motion: reduce) { ... }
```

---

## 🎨 CSS Stil Rehberi

### Temel Sınıflar

```css
.game-container   /* Ana wrapper */
.game-score-board /* Skor paneli */
.game-controls    /* Kontrol butonları */
.game-btn         /* Standart buton */
.game-btn-primary /* Birincil buton */
.game-over-overlay /* Game over ekranı */
```

### Responsive Breakpoints

```css
/* Games.css içinde tanımlı */
/* Mobile: varsayılan */
/* Tablet: min-width: 768px */
/* Desktop: min-width: 1024px */
```

---

## 📱 Mobil Destek Kontrol Listesi

- [ ] Touch/swipe olayları eklendi
- [ ] Büyük dokunma alanları (min 44x44px)
- [ ] Landscape/portrait uyumu test edildi
- [ ] `touch-action: none` sayfa kaydırmayı engelliyor
- [ ] Mobil kontrol butonları eklendi (gerekirse)

---

## ✅ Yeni Oyun Kontrol Listesi

Yeni bir oyun eklerken tüm maddeleri kontrol et:

### Temel
- [ ] 6 dil için çeviriler eklendi
- [ ] `language` prop alınıyor
- [ ] `onBack` callback çalışıyor
- [ ] `memo()` ile sarıldı

### Erişilebilirlik
- [ ] Ana container'da `role="application"`
- [ ] Tüm butonlarda `aria-label`
- [ ] `aria-live` ile duyurular
- [ ] Klavye kontrolü çalışıyor
- [ ] Focus göstergesi görünür
- [ ] `sr-only` metinler eklendi

### Performans
- [ ] `lazy()` ile import edildi
- [ ] `useCallback` hook'ları kullanıldı
- [ ] Gereksiz re-render yok
- [ ] Animasyonlar optimize

### Test
- [ ] Tüm 6 dilde test edildi
- [ ] Klavye ile oynanabilir
- [ ] Ekran okuyucu test edildi
- [ ] Mobil test edildi

---

## 🔗 İlgili Dosyalar

- `../MiniGames.tsx` - Oyun seçim ekranı
- `../MiniGames.css` - Modal stilleri
- `./Games.css` - Oyun stilleri
- `../../i18n/` - Çeviri sistemi
