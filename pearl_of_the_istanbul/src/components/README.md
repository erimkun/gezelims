# 📁 components/ - React Bileşenleri

Bu dizin, uygulamanın tüm React bileşenlerini içerir.

---

## 📂 Dizin Yapısı

```
components/
├── 📁 games/                    # Mini oyun bileşenleri
├── 📁 routes/                   # Rota sayfası bileşenleri
│
├── 📄 Map.tsx                   # Ana harita bileşeni (~1500 satır)
├── 📄 Sidebar.tsx               # Kenar çubuğu (~600 satır)
├── 📄 MiniGames.tsx             # Oyun seçim sayfası
│
├── 📄 POIPopup.tsx              # POI detay modal
├── 📄 POIPopup.css
│
├── 📄 WalkingNavigation.tsx     # Yürüyüş navigasyonu UI
├── 📄 WalkingNavigation.css
│
├── 📄 DirectionsModal.tsx       # Yön tarifi modal
├── 📄 DirectionsModal.css
│
├── 📄 ErrorBoundary.tsx         # Hata yakalama
├── 📄 ErrorBoundary.css
│
├── 📄 LoadingSpinner.tsx        # Yükleme animasyonu
├── 📄 LoadingSpinner.css
│
├── 📄 LoadingPopup.tsx          # Yükleme popup
├── 📄 LoadingPopup.css
│
├── 📄 Toast.tsx                 # Bildirim sistemi
├── 📄 Toast.css
│
├── 📄 EmptyState.tsx            # Boş durum gösterimi
├── 📄 EmptyState.css
│
├── 📄 FlagIcon.tsx              # Bayrak ikonları
└── 📄 GlobeIntro.tsx            # 3D globe intro animasyonu
```

---

## 🗺️ Ana Bileşenler

### `Map.tsx`
Ana harita bileşeni. Uygulamanın en büyük ve karmaşık bileşenidir.

**Özellikler:**
- MapLibre GL entegrasyonu
- POI marker yönetimi (1000+ marker)
- Kategori bazlı filtreleme
- Harita stili değiştirme (Voyager, Dark, OSM Bright)
- Dil seçici
- Kullanıcı konumu takibi
- Walking navigation rota çizimi
- Custom event handling (zoom-to-poi)

**Props:**
```typescript
interface MapProps {
  language: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
  onPOIClick?: (poi: POI) => void;
  selectedCategory: string;
  poiCache: Record<string, POI>;
  onPOIsLoad: (pois: POI[]) => void;
  sidebarPOIs?: POI[];
  onVisiblePOIsChange?: (pois: POI[]) => void;
  isWalkingMode: boolean;
  walkingDestination: POI | null;
  onNavigationStart: (poi: POI) => void;
  onNavigationEnd: () => void;
  onNavigateToMiniGames?: () => void;
  onNavigateToRoutes?: () => void;
}
```

---

### `Sidebar.tsx`
Kenar çubuğu bileşeni. POI listesi ve filtreleme UI'ı sağlar.

**Özellikler:**
- Kategori filtreleme (6 kategori)
- Alt kategori filtreleme (30+ alt kategori)
- Metin arama (debounced)
- Mesafeye göre sıralama
- Sanal scroll (performans)
- Mobil swipe gesture desteği
- POI kart listesi

**Props:**
```typescript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  language: LanguageKey;
  onPOIsChange?: (pois: POI[]) => void;
  onPOICardClick?: (poiId: string) => void;
  onCategoryChange?: (category: string) => void;
  poiListRef?: React.RefObject<HTMLDivElement>;
  selectedPOIId?: string | null;
  mapVisiblePOIs?: POI[];
  onNavigateToMiniGames?: () => void;
}
```

---

### `MiniGames.tsx`
Mini oyunlar ana sayfası. 13 oyunun kartlarını gösterir.

**Özellikler:**
- Grid layout ile oyun kartları
- Her kart için ikon, başlık, açıklama
- 6 dil desteği
- Seçilen oyunu tam ekran açma

---

## 🎯 POI Bileşenleri

### `POIPopup.tsx`
POI (Point of Interest) detay modalı.

**Gösterilen bilgiler:**
- İsim ve kategori
- Açıklama
- Adres
- Telefon
- Website linki
- Çalışma saatleri
- Kapalı günler
- Puan ve yorum sayısı
- Galeri (resimler)
- "Yol tarifi al" butonu

---

### `WalkingNavigation.tsx`
Yürüyüş navigasyonu kullanıcı arayüzü.

**Özellikler:**
- Kalan mesafe ve süre
- Mevcut adım gösterimi
- Sonraki adımlar listesi
- Progress bar
- Navigasyonu durdur butonu

---

## ⚠️ Hata ve Yükleme Bileşenleri

### `ErrorBoundary.tsx`
React Error Boundary pattern implementasyonu.

```tsx
<ErrorBoundary language={language}>
  <YourComponent />
</ErrorBoundary>
```

### `LoadingSpinner.tsx`
CSS animasyonlu yükleme göstergesi.

```tsx
<LoadingSpinner size="large" message="Harita yükleniyor..." />
```

### `Toast.tsx`
Bildirim sistemi (Context + Provider pattern).

```tsx
const { showToast } = useToast();
showToast('Başarılı!', 'success');
showToast('Hata oluştu', 'error');
```

---

## 🎮 games/ Alt Dizini

Mini oyunların bileşenleri. Her oyun bağımsız, self-contained bir modüldür.

| Oyun | Dosya | Açıklama |
|------|-------|----------|
| Hafıza | `MemoryGame.tsx` | Kart eşleştirme |
| Yılan | `SnakeGame.tsx` | Klasik yılan oyunu |
| Balon | `BalloonPopGame.tsx` | Balon patlatma |
| Koşucu | `RunnerGame.tsx` | Endless runner |
| Bulmaca | `TilePuzzleGame.tsx` | Karo bulmaca |
| Refleks | `ReactionGame.tsx` | Refleks testi |
| Köstebek | `WhackAMoleGame.tsx` | Köstebek vurma |
| Renk | `ColorMatchGame.tsx` | Renk eşleştirme |
| 2048 | `Game2048.tsx` | Sayı birleştirme |
| Quiz | `UskudarQuizGame.tsx` | Üsküdar bilgi yarışması |
| XOX | `TicTacToeGame.tsx` | Klasik XOX |
| Matematik | `MathRaceGame.tsx` | Hızlı matematik |
| Hedef | `TargetShootGame.tsx` | Hedef vurma |

---

## 📍 routes/ Alt Dizini

Gezi rotaları sayfasının bileşenleri.

| Dosya | Açıklama |
|-------|----------|
| `RoutesPage.tsx` | Ana rota sayfası (harita + sidebar) |
| `RoutesSidebar.tsx` | Rota listesi sidebar |
| `RouteCreationPanel.tsx` | Yeni rota oluşturma paneli |
| `RoutePointPopup.tsx` | Rota noktası popup |
| `RouteComments.tsx` | Rota yorumları |
| `AuthButton.tsx` | Google giriş butonu |
| `index.ts` | Barrel export |

---

## 🎨 CSS Yapısı

Her bileşen kendi CSS dosyasına sahiptir:
- `Component.tsx` ↔ `Component.css`
- BEM metodolojisi kullanılır
- CSS variables ile tema desteği
- Mobile-first responsive tasarım

---

## 📝 Best Practices

1. **Single Responsibility**: Her bileşen tek bir iş yapar
2. **Props Typing**: Tüm props TypeScript ile tiplenmiştir
3. **Memoization**: Pahalı hesaplamalar `useMemo`/`useCallback` ile optimize
4. **Lazy Loading**: Ağır bileşenler lazy load edilir
5. **Error Handling**: Error boundaries ile hata yönetimi
