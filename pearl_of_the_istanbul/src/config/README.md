# 📁 config/ - Uygulama Konfigürasyonları

Bu dizin, uygulamanın merkezi konfigürasyon dosyalarını içerir.

---

## 📂 Dizin Yapısı

```
config/
├── 📄 app.config.ts           # Uygulama genel ayarları
├── 📄 categories.config.ts    # Kategori tanımları
├── 📄 subcategories.config.ts # Alt kategori mapping
├── 📄 firebase.ts             # Firebase konfigürasyonu
└── 📄 env.ts                  # Environment değişkenleri
```

---

## 📄 Dosya Detayları

### `app.config.ts`
Uygulama genelinde kullanılan sabit değerler.

```typescript
export const APP_CONFIG = {
  // Navigation ayarları
  navigation: {
    ARRIVAL_THRESHOLD_KM: 0.02,    // 20m - hedefe varış eşiği
    STEP_COMPLETE_THRESHOLD_KM: 0.02,
    AUTO_CLOSE_DELAY_MS: 2000,
    LOCATION_UPDATE_INTERVAL_MS: 15000, // 15 saniye
    ENABLE_HIGH_ACCURACY: true,
  },
  
  // Sidebar ayarları
  sidebar: {
    INITIAL_VISIBLE_COUNT: 50,     // İlk yüklenen POI sayısı
    LOAD_MORE_INCREMENT: 50,
    SCROLL_THRESHOLD_PX: 200,
    SEARCH_DEBOUNCE_MS: 300,
  },
  
  // Harita ayarları
  map: {
    DEFAULT_CENTER: [29.015295995137393, 41.02678314419098], // Üsküdar
    DEFAULT_ZOOM: 12,
    DETAIL_ZOOM: 17,
    NAVIGATION_ZOOM: 17,
    NAVIGATION_PITCH: 60,          // 3D perspektif
    MAX_ZOOM: 22,
    MIN_ZOOM: 10,
    POI_RELOAD_DISTANCE_KM: 0.5,   // Yeni POI yükleme mesafesi
  },
  
  // Üsküdar sınırları
  uskudar: {
    BOUNDS: {
      minLng: 28.95, maxLng: 29.10,
      minLat: 40.95, maxLat: 41.05,
    },
    CENTER: [29.015295995137393, 41.02678314419098],
  },
  
  // UI ayarları
  ui: {
    HIGHLIGHT_DURATION_MS: 2000,
    TOAST_DURATION_MS: 3000,
    MOBILE_BREAKPOINT_PX: 768,
    MAP_FLY_TO_DURATION_MS: 2000,
  },
  
  // Cache ayarları
  cache: {
    POI_CACHE_SIZE: 1000,
    GEOJSON_CACHE_DURATION_MS: 7 * 24 * 60 * 60 * 1000, // 7 gün
  },
  
  // Performans
  performance: {
    MAX_POI_MARKERS: 100,
    VIRTUAL_SCROLL_BUFFER: 10,
  },
};
```

---

### `categories.config.ts`
POI kategorilerinin merkezi tanımları.

```typescript
export const CATEGORIES = {
  all: {
    key: 'all',
    icon: '🏠',
    color: '#6366F1',
    i18nKey: 'all',
  },
  food: {
    key: 'food',
    icon: '🍽️',
    color: '#EF4444',  // Kırmızı
    i18nKey: 'food',
  },
  nature: {
    key: 'nature',
    icon: '🌿',
    color: '#10B981',  // Yeşil
    i18nKey: 'nature',
  },
  culture: {
    key: 'culture',
    icon: '🎭',
    color: '#8B5CF6',  // Mor
    i18nKey: 'culture',
  },
  entertainment: {
    key: 'entertainment',
    icon: '🎉',
    color: '#F59E0B',  // Turuncu
    i18nKey: 'entertainment',
  },
  other: {
    key: 'other',
    icon: '📍',
    color: '#6B7280',  // Gri
    i18nKey: 'other',
  },
};

// Yardımcı fonksiyonlar
export const getCategoryColor = (key: string): string => { ... };
export const getCategoryIcon = (key: string): string => { ... };
export const getCategoryConfig = (key: string) => { ... };
export const getAllCategories = () => { ... };
export const isValidCategory = (key: string): boolean => { ... };
```

**Kullanım:**
```tsx
import { getCategoryColor, getCategoryIcon } from '../config/categories.config';

const color = getCategoryColor('food');  // '#EF4444'
const icon = getCategoryIcon('nature');  // '🌿'
```

---

### `subcategories.config.ts`
Alt kategorilerin kategori eşleştirmesi ve anahtar kelimeleri.

```typescript
// Kategori -> Alt kategoriler mapping
export const SUBCATEGORY_MAPPING = {
  all: [],
  entertainment: ['subTheater', 'subCinema', 'subShopping', 'subSpecialEnt'],
  culture: ['subMuseums', 'subCulturalCenters', 'subArtCenters', 'subCulturalTourism'],
  food: ['subCafes', 'subRestaurants', 'subBakery', 'subFastFood', 'subSpecialFood', 'subDrinks'],
  nature: ['subParks', 'subCoastal', 'subSports', 'subWalking', 'subNature'],
  other: ['subHealth', 'subEducation', 'subReligious', 'subTransport', 'subPublic', 'subAccommodation']
};

// Alt kategori anahtar kelimeleri (GeoJSON filtreleme için)
export const SUBCATEGORY_KEYWORDS = {
  subCafes: ['Kafe', 'Kahve', 'Çay Evi'],
  subRestaurants: ['Lokanta', 'Restoran', 'Kebap', 'Döner', 'Köfte', 'Balık'],
  subParks: ['Park', 'Yeşil Alan', 'Meydan'],
  subMuseums: ['Müze'],
  // ... diğer alt kategoriler
};
```

---

### `firebase.ts`
Firebase SDK konfigürasyonu ve servis export'ları.

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "gezelim-b492b.firebaseapp.com",
  projectId: "gezelim-b492b",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { analytics };
```

---

### `env.ts`
Environment değişkenleri (varsa).

```typescript
// Vite environment variables
export const ENV = {
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  // API keys (Vite prefix: VITE_)
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
};
```

---

## 🎯 Konfigürasyon Kullanım Örnekleri

### Harita Zoom Seviyesi
```tsx
import { APP_CONFIG } from '../config/app.config';

map.flyTo({
  center: poi.coordinates,
  zoom: APP_CONFIG.map.DETAIL_ZOOM,
  duration: APP_CONFIG.ui.MAP_FLY_TO_DURATION_MS
});
```

### Kategori Rengi
```tsx
import { getCategoryColor } from '../config/categories.config';

<div style={{ backgroundColor: getCategoryColor(poi.category) }}>
  {poi.name}
</div>
```

### Alt Kategori Filtreleme
```tsx
import { SUBCATEGORY_KEYWORDS } from '../config/subcategories.config';

const matchesSubcategory = (poi: POI, subcategory: string): boolean => {
  const keywords = SUBCATEGORY_KEYWORDS[subcategory] || [];
  return keywords.some(keyword => 
    poi.subcategory?.toLowerCase().includes(keyword.toLowerCase())
  );
};
```

---

## ✅ Best Practices

1. **Merkezi Yönetim**: Tüm sabitler bu dizinde toplanır
2. **Type Safety**: TypeScript ile tipleme
3. **as const**: Object'ler immutable
4. **Yardımcı Fonksiyonlar**: Doğrudan değer okumak yerine helper kullan
5. **Environment Separation**: Prod/Dev ayrımı
