# 🏗️ Sistem Mimarisi

Bu doküman, Pearl of Istanbul projesinin teknik mimarisini ve tasarım kararlarını detaylı olarak açıklar.

---

## 📊 Genel Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React 19)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   App.tsx    │───▶│    Pages     │───▶│  Components  │                   │
│  │   (Router)   │    │  Map/Games   │    │   (UI/UX)    │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      STATE MANAGEMENT (Zustand)                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │   │
│  │  │  authStore  │  │ routeStore  │  │   i18n      │                   │   │
│  │  │  (User)     │  │ (Routes)    │  │ (Language)  │                   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        SERVICES LAYER                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │authService  │  │routeService │  │routingServ. │  │cacheService │  │   │
│  │  │(Firebase)   │  │(Firestore)  │  │(OSRM API)   │  │(IndexedDB)  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Firebase       │  │   OSRM Server    │  │   Carto Tiles    │          │
│  │  ┌────────────┐  │  │                  │  │                  │          │
│  │  │Auth (Google)│  │  │ Walking Routes  │  │   Map Tiles      │          │
│  │  │Firestore   │  │  │ Turn-by-turn    │  │   (CDN)          │          │
│  │  │Analytics   │  │  │ Navigation      │  │                  │          │
│  │  └────────────┘  │  │                  │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Veri Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

1. POI VERİ AKIŞI
   ┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
   │ GeoJSON │────▶│ CacheService│────▶│ Map.tsx     │────▶│ Markers │
   │ Files   │     │ (IndexedDB) │     │ (Transform) │     │ on Map  │
   └─────────┘     └─────────────┘     └─────────────┘     └─────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Sidebar.tsx │
                   │ (List View) │
                   └─────────────┘

2. AUTHENTICATION FLOW
   ┌──────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
   │ User     │────▶│ AuthService │────▶│ Firebase    │────▶│ authStore│
   │ Click    │     │ (Google)    │     │ Auth        │     │ (Zustand)│
   └──────────┘     └─────────────┘     └─────────────┘     └──────────┘

3. NAVIGATION FLOW
   ┌──────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
   │ POI      │────▶│RoutingServ. │────▶│ OSRM API    │────▶│ Walking  │
   │ Selected │     │ (Request)   │     │ (Response)  │     │ Nav UI   │
   └──────────┘     └─────────────┘     └─────────────┘     └──────────┘

4. ROUTE CREATION FLOW
   ┌──────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
   │ User     │────▶│ routeStore  │────▶│ RouteService│────▶│ Firestore│
   │ Creates  │     │ (State)     │     │ (CRUD)      │     │ Database │
   └──────────┘     └─────────────┘     └─────────────┘     └──────────┘
```

---

## 🧩 Bileşen Hiyerarşisi

```
App.tsx
├── ErrorBoundary
│   └── ToastProvider
│       ├── [Map Page]
│       │   ├── Map.tsx
│       │   │   ├── FlagIcon.tsx (Dil seçimi)
│       │   │   ├── POIPopup.tsx (POI detay modal)
│       │   │   └── WalkingNavigation.tsx (Navigasyon UI)
│       │   └── Sidebar.tsx
│       │       ├── Kategori filtreleri
│       │       ├── Alt kategori filtreleri
│       │       ├── Arama
│       │       └── POI kartları listesi
│       │
│       ├── [Mini Games Page]
│       │   └── MiniGames.tsx
│       │       ├── MemoryGame.tsx
│       │       ├── SnakeGame.tsx
│       │       ├── BalloonPopGame.tsx
│       │       ├── RunnerGame.tsx
│       │       ├── TilePuzzleGame.tsx
│       │       ├── ReactionGame.tsx
│       │       ├── WhackAMoleGame.tsx
│       │       ├── ColorMatchGame.tsx
│       │       ├── Game2048.tsx
│       │       ├── UskudarQuizGame.tsx
│       │       ├── TicTacToeGame.tsx
│       │       ├── MathRaceGame.tsx
│       │       └── TargetShootGame.tsx
│       │
│       └── [Routes Page]
│           └── RoutesPage.tsx
│               ├── RoutesSidebar.tsx
│               ├── RouteCreationPanel.tsx
│               ├── RoutePointPopup.tsx
│               ├── RouteComments.tsx
│               └── AuthButton.tsx
```

---

## 📦 State Management Yapısı

### Zustand Store Yapısı

```typescript
// Auth Store
authStore: {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  // Actions
  signIn(): Promise<void>;
  logout(): Promise<void>;
  initialize(): () => void;
}

// Route Store
routeStore: {
  // Rota oluşturma
  isCreatingRoute: boolean;
  selectedPoints: RoutePoint[];
  currentPOI: POI | null;
  routeTitle: string;
  routeDescription: string;
  selectedTags: string[];
  
  // Rotalar
  routes: Route[];
  popularRoutes: Route[];
  userRoutes: Route[];
  
  // Yorumlar
  comments: Record<string, RouteComment[]>;
  
  // Actions
  startCreatingRoute(): void;
  addPoint(poi: POI): void;
  saveRoute(userId, userName, userPhoto): Promise<string>;
  loadRoutes(): Promise<void>;
  voteForRoute(routeId, userId): Promise<void>;
  // ... diğer actions
}
```

---

## 🔌 Service Layer Detayları

### 1. AuthService
```typescript
// Google OAuth entegrasyonu
signInWithGoogle()    // Popup veya redirect
signOut()             // Oturum kapatma
onAuthChange()        // Auth state dinleyici
checkRedirectResult() // Redirect sonucu kontrolü
```

### 2. CacheService
```typescript
// IndexedDB tabanlı önbellekleme
getCachedGeoJSON(category)   // Cache'den veri al
setCachedGeoJSON(category)   // Cache'e veri yaz
clearCache()                  // Cache temizle
// 7 gün cache süresi
```

### 3. RoutingService
```typescript
// OSRM API entegrasyonu
getWalkingRoute(start, end)  // Yürüyüş rotası hesapla
formatInstruction(maneuver)   // Türkçe yön tarifi
// Gerçek zamanlı rota güncelleme
```

### 4. RouteService
```typescript
// Firestore CRUD operasyonları
createRoute(route)       // Yeni rota oluştur
updateRoute(id, data)    // Rota güncelle
deleteRoute(id)          // Rota sil
voteRoute(id, userId)    // Oy ver
addComment(routeId, ...)  // Yorum ekle
```

---

## 🎨 CSS Mimarisi

```
BEM Metodolojisi kullanılmaktadır:

.block {}
.block__element {}
.block--modifier {}

Örnek:
.sidebar {}
.sidebar__header {}
.sidebar__header--collapsed {}
.sidebar__category-list {}
.sidebar__poi-card {}
.sidebar__poi-card--selected {}
```

---

## 📊 Performans Optimizasyonları

| Teknik | Açıklama | Etki |
|--------|----------|------|
| **Lazy Loading** | Sayfa bileşenleri lazy load edilir | -40% initial bundle |
| **IndexedDB Cache** | GeoJSON verileri 7 gün önbellekte | -90% network requests |
| **Throttling** | Harita hareketleri 300ms throttle | CPU kullanımı azalır |
| **Virtual Scrolling** | POI listesi sanal scroll | DOM node azaltma |
| **Code Splitting** | Manuel chunk yapılandırması | Paralel yükleme |
| **Marker Clustering** | Uzaklaştırıldığında marker grupla | Performans artışı |

### Vite Build Optimizasyonu

```typescript
// vite.config.ts
rollupOptions: {
  output: {
    manualChunks: {
      'maplibre': ['maplibre-gl'],      // Harita kütüphanesi
      'vendor': ['react', 'react-dom'],  // React core
      'three': ['three', '@react-three/fiber'], // 3D kütüphaneleri
    }
  }
}
```

---

## 🌐 i18n (Internationalization) Yapısı

```typescript
// Desteklenen diller
type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

// Translation namespace'leri
type TranslationNamespace = 
  | 'common'      // Ortak metinler
  | 'map'         // Harita metinleri
  | 'sidebar'     // Kenar çubuğu
  | 'navigation'  // Navigasyon
  | 'games'       // Oyunlar
  | 'routes';     // Rotalar

// Kullanım
const { t } = useTranslation('sidebar', language);
<h1>{t('title')}</h1>
```

---

## 🔐 Güvenlik Mimarisi

### Firebase Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Routes collection
    match /routes/{routeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /routes/{routeId}/comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📱 Responsive Design Breakpoints

```css
/* Mobile First Approach */
/* Mobile: < 768px (default) */
/* Tablet: >= 768px */
/* Desktop: >= 1024px */
/* Large Desktop: >= 1440px */

@media (min-width: 769px) {
  /* Desktop styles */
  .sidebar {
    width: 400px;
    height: 100vh;
    position: fixed;
  }
}
```

---

## 🧪 Test Stratejisi (Önerilen)

```
┌─────────────────────────────────────────────────────────────────┐
│                        TEST PİRAMİDİ                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────┐                              │
│                    │   E2E Tests │ (Playwright/Cypress)         │
│                    │     5%      │                              │
│                    └─────────────┘                              │
│               ┌─────────────────────┐                           │
│               │  Integration Tests  │ (React Testing Library)   │
│               │        20%          │                           │
│               └─────────────────────┘                           │
│          ┌───────────────────────────────┐                      │
│          │        Unit Tests             │ (Vitest)             │
│          │           75%                 │                      │
│          └───────────────────────────────┘                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline (Önerilen)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
```

---

<div align="center">

**Bu doküman Pearl of Istanbul projesinin teknik mimarisini detaylı olarak açıklamaktadır.**

</div>
