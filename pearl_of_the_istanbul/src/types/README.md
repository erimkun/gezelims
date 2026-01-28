# 📁 types/ - TypeScript Tip Tanımları

Bu dizin, uygulama genelinde kullanılan merkezi TypeScript tip tanımlarını içerir.

---

## 📂 Dizin Yapısı

```
types/
└── 📄 index.ts    # Tüm tip tanımları
```

---

## 📄 index.ts
Merkezi tip tanımları dosyası.

### Dil Tipleri

```typescript
// Desteklenen dil kodları
export type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

// Dil seçeneği objesi
export interface LanguageOption {
  code: LanguageKey;
  name: string;      // "Türkçe", "English"
  flag: string;      // "TR", "US" (bayrak kodu)
}

// Desteklenen diller listesi
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'it', name: 'Italiano', flag: 'IT' },
];
```

---

### POI (Point of Interest) Tipleri

```typescript
// Temel POI tipi
export interface POI {
  id: string;
  name: string;
  category: string;           // 'food', 'nature', 'culture', etc.
  subcategory: string;
  address: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  rating?: number;            // 1-5
  reviews_count?: number;
  images?: string[];          // Resim URL'leri
  phone?: string;
  website?: string;
  workday_timing?: string;    // "09:00-18:00"
  closed_on?: string[];       // ["Pazar", "Pazartesi"]
}

// Mesafe bilgisi eklenmiş POI
export interface POIWithDistance extends POI {
  distance: number; // Kilometre cinsinden
}
```

---

### Harita Tipleri

```typescript
// Harita sınırları (bounding box)
export interface MapBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

// Harita merkezi
export interface MapCenter {
  lng: number;
  lat: number;
}

// Harita stili anahtarı
export type MapStyleKey = 'voyager' | 'dark' | 'osmBright';

// Harita stili konfigürasyonu
export interface MapStyle {
  name: string;
  tiles: string[];
  attribution: string;
}
```

---

### Navigasyon Tipleri

```typescript
// Rota adımı
export interface RouteStep {
  location: [number, number];
  instruction: string;     // "Sola dön", "Düz devam et"
  distance: number;        // Metre
  duration: number;        // Saniye
  maneuver: {
    type: string;          // "turn", "arrive", "depart"
    modifier?: string;     // "left", "right", "straight"
  };
}

// Hesaplanmış rota
export interface Route {
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  distance: number;        // Toplam metre
  duration: number;        // Toplam saniye
  steps: RouteStep[];
}

// Navigasyon durumu
export interface NavigationState {
  isActive: boolean;
  currentStep: RouteStep | null;
  currentStepIndex: number;
  remainingDistance: number;
  remainingDuration: number;
  progress: number;        // 0-100
}
```

---

### Kullanıcı Rotası Tipleri

```typescript
// Rota noktası
export interface RoutePoint {
  poiId: string;
  poiName: string;
  poiImage?: string;
  commentPhoto?: string;   // Kullanıcının eklediği fotoğraf
  coordinates: [number, number];
  rating: number;          // 1-5 mutluluk skoru
  comment: string;
  order: number;
}

// Kullanıcı rotası
export interface UserRoute {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  tags: RouteTag[];
  totalRating: number;
  votes: number;
  votedBy: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Rota etiketi
export type RouteTag = 
  | 'romantic'     // 💕
  | 'historical'   // 🏛️
  | 'food'         // 🍽️
  | 'nature'       // 🌳
  | 'art'          // 🎨
  | 'adventure'    // 🎒
  | 'family'       // 👨‍👩‍👧‍👦
  | 'night';       // 🌙
```

---

### API Response Tipleri

```typescript
// GeoJSON Feature
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id?: string;
    name?: string;
    Name?: string;
    category?: string;
    subcategory?: string;
    address?: string;
    Address?: string;
    [key: string]: unknown;
  };
}

// GeoJSON FeatureCollection
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// OSRM Rota Response
export interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      type: string;
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
    legs: Array<{
      steps: Array<{
        distance: number;
        duration: number;
        maneuver: {
          type: string;
          modifier?: string;
          location: [number, number];
        };
        name?: string;
      }>;
    }>;
  }>;
}
```

---

### Utility Tipleri

```typescript
// Nullable wrapper
export type Nullable<T> = T | null;

// Optional keys
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Deep partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract array item type
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
```

---

## 🔧 Kullanım

```tsx
import { 
  POI, 
  POIWithDistance, 
  LanguageKey, 
  RouteStep,
  SUPPORTED_LANGUAGES 
} from '../types';

// Fonksiyon parametresi olarak
const formatPOI = (poi: POI): string => {
  return `${poi.name} - ${poi.address}`;
};

// State tipi olarak
const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

// Array tipi olarak
const [routes, setRoutes] = useState<RouteStep[]>([]);

// Props tipi olarak
interface ComponentProps {
  language: LanguageKey;
  pois: POIWithDistance[];
}
```

---

## ✅ Best Practices

1. **Merkezi Tanım**: Tüm tipler `types/index.ts`'te
2. **Export**: Named export kullan
3. **Interface vs Type**: 
   - Object shapes → `interface`
   - Union/Intersection → `type`
4. **Optional Properties**: `?` ile işaretle
5. **Readonly**: Değişmemesi gereken alanlar için
6. **Generics**: Yeniden kullanılabilir tipler için
7. **JSDoc**: Karmaşık tipler için açıklama ekle
