# 📋 Proje Dosya Yapısı

Bu doküman, Pearl of Istanbul projesinin tüm dosya yapısını ve her dosyanın amacını detaylı olarak açıklar.

---

## 🌳 Tam Dosya Ağacı

```
pearl_of_the_istanbul/
│
├── 📄 index.html                          # HTML entry point
├── 📄 package.json                        # NPM bağımlılıkları ve scripts
├── 📄 tsconfig.json                       # TypeScript root config
├── 📄 tsconfig.app.json                   # App TypeScript config
├── 📄 tsconfig.node.json                  # Node (Vite) TypeScript config
├── 📄 vite.config.ts                      # Vite build config
├── 📄 eslint.config.js                    # ESLint kuralları
├── 📄 firestore.rules                     # Firebase security rules
│
├── 📄 README.md                           # Proje ana dokümantasyonu
├── 📄 ARCHITECTURE.md                     # Sistem mimarisi
├── 📄 CONTRIBUTING.md                     # Geliştirici rehberi
├── 📄 API.md                              # API referansı
├── 📄 FILE_STRUCTURE.md                   # Bu dosya
│
├── 📁 docs/                               # Ek dokümantasyon
│   ├── 📄 ACCESSIBILITY_FIX_GUIDE.md
│   ├── 📄 DRY_VIOLATIONS_FIX_GUIDE.md
│   ├── 📄 ERROR_HANDLING_FIX_GUIDE.md
│   ├── 📄 PERFORMANCE_OPTIMIZATION_FIX_GUIDE.md
│   ├── 📄 SECURITY_FIXES_FIX_GUIDE.md
│   ├── 📄 SOLID_PRINCIPLES_FIX_GUIDE.md
│   └── 📄 TYPE_SAFETY_FIX_GUIDE.md
│
├── 📁 public/                             # Statik dosyalar (build'e kopyalanır)
│   └── 📁 data/                           # GeoJSON POI verileri
│       ├── 📄 README.md                   # Veri dokümantasyonu
│       ├── 📄 yemek.geojson              # Yeme-içme mekanları
│       ├── 📄 doga.geojson               # Doğa ve parklar
│       ├── 📄 kultur-sanat.geojson       # Kültür-sanat mekanları
│       ├── 📄 eglence.geojson            # Eğlence mekanları
│       └── 📄 diger.geojson              # Diğer kategoriler
│
└── 📁 src/                                # Kaynak kodlar
    │
    ├── 📄 README.md                       # Src dizin dokümantasyonu
    ├── 📄 main.tsx                        # React entry point
    ├── 📄 App.tsx                         # Ana uygulama bileşeni
    ├── 📄 App.css                         # Global stiller
    ├── 📄 index.css                       # Root stiller
    ├── 📄 vite-env.d.ts                   # Vite type declarations
    │
    ├── 📁 assets/                         # Statik kaynaklar (resim, font)
    │   └── (boş)
    │
    ├── 📁 components/                     # React bileşenleri
    │   ├── 📄 README.md                   # Bileşen dokümantasyonu
    │   │
    │   ├── 📄 Map.tsx                     # Ana harita bileşeni (1500+ satır)
    │   ├── 📄 Sidebar.tsx                 # Kenar çubuğu (600+ satır)
    │   ├── 📄 Sidebar.css
    │   ├── 📄 MiniGames.tsx               # Mini oyunlar ana sayfası
    │   ├── 📄 MiniGames.css
    │   │
    │   ├── 📄 POIPopup.tsx                # POI detay modal
    │   ├── 📄 POIPopup.css
    │   ├── 📄 WalkingNavigation.tsx       # Yürüyüş navigasyonu UI
    │   ├── 📄 WalkingNavigation.css
    │   ├── 📄 DirectionsModal.tsx         # Yön tarifi modal
    │   ├── 📄 DirectionsModal.css
    │   │
    │   ├── 📄 ErrorBoundary.tsx           # Hata yakalama
    │   ├── 📄 ErrorBoundary.css
    │   ├── 📄 LoadingSpinner.tsx          # Yükleme animasyonu
    │   ├── 📄 LoadingSpinner.css
    │   ├── 📄 LoadingPopup.tsx            # Yükleme popup
    │   ├── 📄 LoadingPopup.css
    │   ├── 📄 Toast.tsx                   # Bildirim sistemi
    │   ├── 📄 Toast.css
    │   ├── 📄 EmptyState.tsx              # Boş durum gösterimi
    │   ├── 📄 EmptyState.css
    │   │
    │   ├── 📄 FlagIcon.tsx                # Bayrak ikonları
    │   ├── 📄 GlobeIntro.tsx              # 3D globe intro
    │   │
    │   ├── 📁 games/                      # Mini oyun bileşenleri
    │   │   ├── 📄 README.md               # Oyun dokümantasyonu
    │   │   ├── 📄 Games.css               # Ortak oyun stilleri
    │   │   ├── 📄 RunnerGameAssets.md     # Runner varlık dokümanı
    │   │   │
    │   │   ├── 📄 MemoryGame.tsx          # Hafıza oyunu
    │   │   ├── 📄 SnakeGame.tsx           # Yılan oyunu
    │   │   ├── 📄 BalloonPopGame.tsx      # Balon patlatma
    │   │   ├── 📄 RunnerGame.tsx          # Endless runner
    │   │   ├── 📄 TilePuzzleGame.tsx      # Karo bulmaca
    │   │   ├── 📄 ReactionGame.tsx        # Refleks testi
    │   │   ├── 📄 WhackAMoleGame.tsx      # Köstebek vurma
    │   │   ├── 📄 ColorMatchGame.tsx      # Renk eşleştirme
    │   │   ├── 📄 Game2048.tsx            # 2048 oyunu
    │   │   ├── 📄 UskudarQuizGame.tsx     # Üsküdar quiz
    │   │   ├── 📄 TicTacToeGame.tsx       # XOX oyunu
    │   │   ├── 📄 MathRaceGame.tsx        # Matematik yarışı
    │   │   └── 📄 TargetShootGame.tsx     # Hedef vurma
    │   │
    │   └── 📁 routes/                     # Rota sayfası bileşenleri
    │       ├── 📄 README.md               # Rota dokümantasyonu
    │       ├── 📄 index.ts                # Barrel export
    │       │
    │       ├── 📄 RoutesPage.tsx          # Ana rota sayfası
    │       ├── 📄 RoutesPage.css
    │       ├── 📄 RoutesSidebar.tsx       # Rota listesi sidebar
    │       ├── 📄 RoutesSidebar.css
    │       ├── 📄 RouteCreationPanel.tsx  # Yeni rota oluşturma
    │       ├── 📄 RouteCreationPanel.css
    │       ├── 📄 RoutePointPopup.tsx     # Rota noktası popup
    │       ├── 📄 RoutePointPopup.css
    │       ├── 📄 RouteComments.tsx       # Yorum sistemi
    │       ├── 📄 RouteComments.css
    │       ├── 📄 AuthButton.tsx          # Google giriş butonu
    │       └── 📄 AuthButton.css
    │
    ├── 📁 config/                         # Konfigürasyon dosyaları
    │   ├── 📄 README.md                   # Config dokümantasyonu
    │   ├── 📄 app.config.ts               # Uygulama genel ayarları
    │   ├── 📄 categories.config.ts        # Kategori tanımları
    │   ├── 📄 subcategories.config.ts     # Alt kategori mapping
    │   ├── 📄 firebase.ts                 # Firebase konfigürasyonu
    │   └── 📄 env.ts                      # Environment değişkenleri
    │
    ├── 📁 hooks/                          # Custom React hooks
    │   ├── 📄 README.md                   # Hook dokümantasyonu
    │   ├── 📄 useClickOutside.ts          # Dış tıklama algılama
    │   ├── 📄 useDebounce.ts              # Debounce değer
    │   ├── 📄 useFocusTrap.ts             # Modal focus trap
    │   ├── 📄 useKeyPress.ts              # Klavye tuşu dinleme
    │   ├── 📄 useLocalStorage.ts          # localStorage wrapper
    │   └── 📄 useWalkingNavigation.ts     # Yürüyüş navigasyonu
    │
    ├── 📁 i18n/                           # Çoklu dil desteği
    │   ├── 📄 README.md                   # i18n dokümantasyonu
    │   ├── 📄 index.ts                    # Barrel export
    │   ├── 📄 types.ts                    # Tip tanımları
    │   ├── 📄 translations.ts             # Çeviri verileri
    │   ├── 📄 context.ts                  # Context tanımı
    │   ├── 📄 I18nContext.tsx             # Provider bileşeni
    │   ├── 📄 useI18n.ts                  # i18n hook
    │   └── 📄 useTranslation.ts           # Translation hook
    │
    ├── 📁 services/                       # API servisleri
    │   ├── 📄 README.md                   # Servis dokümantasyonu
    │   ├── 📄 authService.ts              # Firebase Auth işlemleri
    │   ├── 📄 cacheService.ts             # IndexedDB önbellekleme
    │   ├── 📄 routeService.ts             # Firestore CRUD
    │   └── 📄 routingService.ts           # OSRM navigasyon API
    │
    ├── 📁 store/                          # Zustand state yönetimi
    │   ├── 📄 README.md                   # Store dokümantasyonu
    │   ├── 📄 index.ts                    # Barrel export
    │   ├── 📄 authStore.ts                # Authentication state
    │   └── 📄 routeStore.ts               # Routes state
    │
    ├── 📁 types/                          # TypeScript tip tanımları
    │   ├── 📄 README.md                   # Tip dokümantasyonu
    │   └── 📄 index.ts                    # Tüm tipler
    │
    ├── 📁 utils/                          # Yardımcı fonksiyonlar
    │   ├── 📄 README.md                   # Utils dokümantasyonu
    │   ├── 📄 coordinateTransform.ts      # Koordinat dönüşümleri
    │   ├── 📄 domUtils.ts                 # DOM manipülasyonu
    │   ├── 📄 formatUtils.ts              # Formatlama fonksiyonları
    │   ├── 📄 geoUtils.ts                 # Coğrafi hesaplamalar
    │   └── 📄 performanceUtils.ts         # Performans optimizasyonu
    │
    └── 📁 data/                           # Yerel veri dosyaları
        └── 📄 uskudar.geojson             # Üsküdar sınır verisi
```

---

## 📊 Dosya İstatistikleri

| Kategori | Dosya Sayısı | Tahmini Satır |
|----------|--------------|---------------|
| Components | ~35 | ~6000 |
| Games | 14 | ~3000 |
| Routes | 12 | ~2500 |
| Config | 5 | ~400 |
| Services | 4 | ~800 |
| Store | 3 | ~600 |
| Hooks | 6 | ~400 |
| i18n | 7 | ~800 |
| Utils | 5 | ~400 |
| Types | 1 | ~250 |
| **Toplam** | **~90** | **~15000** |

---

## 🔗 Dosya İlişkileri

```
main.tsx
    └── App.tsx
        ├── ErrorBoundary.tsx
        ├── Toast.tsx (Context)
        ├── Map.tsx
        │   ├── FlagIcon.tsx
        │   ├── POIPopup.tsx
        │   └── WalkingNavigation.tsx
        ├── Sidebar.tsx
        │   └── EmptyState.tsx
        ├── MiniGames.tsx
        │   └── [13 oyun bileşeni]
        └── RoutesPage.tsx
            ├── RoutesSidebar.tsx
            ├── RouteCreationPanel.tsx
            ├── RoutePointPopup.tsx
            ├── RouteComments.tsx
            └── AuthButton.tsx

Store'lar:
authStore.ts ← authService.ts ← firebase.ts
routeStore.ts ← routeService.ts ← firebase.ts

Servisler:
cacheService.ts → IndexedDB (browser)
routingService.ts → OSRM API (external)
```

---

## 📝 Dosya Adlandırma Kuralları

| Tip | Format | Örnek |
|-----|--------|-------|
| Component | PascalCase.tsx | `Map.tsx`, `POIPopup.tsx` |
| Style | PascalCase.css | `Map.css`, `POIPopup.css` |
| Hook | useCamelCase.ts | `useDebounce.ts` |
| Service | camelCase.ts | `authService.ts` |
| Store | camelCaseStore.ts | `authStore.ts` |
| Config | camelCase.config.ts | `app.config.ts` |
| Utils | camelCase.ts | `geoUtils.ts` |
| Types | index.ts | `types/index.ts` |
| Docs | SCREAMING_SNAKE.md | `README.md`, `ARCHITECTURE.md` |
