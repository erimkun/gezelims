# 📁 services/ - API Servisleri

Bu dizin, harici API'ler ve veritabanı işlemleri için servis katmanını içerir.

---

## 📂 Dizin Yapısı

```
services/
├── 📄 authService.ts      # Firebase Authentication işlemleri
├── 📄 cacheService.ts     # IndexedDB önbellekleme
├── 📄 routeService.ts     # Firestore CRUD (rotalar)
└── 📄 routingService.ts   # OSRM navigasyon API
```

---

## 🔐 authService.ts
**Firebase Authentication** işlemlerini yönetir.

### Fonksiyonlar

```typescript
// Google ile giriş (popup veya redirect)
export const signInWithGoogle = async (): Promise<User | null>

// Redirect sonucunu kontrol et
export const checkRedirectResult = async (): Promise<User | null>

// Çıkış yap
export const signOut = async (): Promise<void>

// Auth state dinleyici
export const onAuthChange = (callback: (user: User | null) => void) => unsubscribe

// Mevcut kullanıcıyı al
export const getCurrentUser = (): User | null
```

### Kullanım
```tsx
import { signInWithGoogle, signOut, onAuthChange } from '../services/authService';

// Giriş
await signInWithGoogle();

// Çıkış
await signOut();

// Dinleyici
const unsubscribe = onAuthChange((user) => {
  if (user) {
    console.log('Logged in:', user.displayName);
  } else {
    console.log('Logged out');
  }
});
```

### Popup vs Redirect Stratejisi
```
1. Önce popup dene
2. Popup engellenirse → redirect'e fallback
3. Sayfa yenilenince → checkRedirectResult() çağır
```

---

## 💾 cacheService.ts
**IndexedDB** tabanlı önbellekleme servisi.

### Özellikler
- GeoJSON verileri 7 gün cache'lenir
- Versiyon kontrolü ile eski cache invalidate
- Offline-first yaklaşım

### Fonksiyonlar

```typescript
class CacheService {
  // Cache'den veri al
  async getCachedGeoJSON(category: string): Promise<GeoJSONData | null>
  
  // Cache'e veri yaz
  async setCachedGeoJSON(category: string, data: GeoJSONData): Promise<void>
  
  // Cache temizle
  async clearCache(): Promise<void>
}

export const cacheService = new CacheService();
```

### Kullanım
```tsx
import { cacheService } from '../services/cacheService';

// Cache kontrolü
const cached = await cacheService.getCachedGeoJSON('yemek');

if (cached) {
  // Cache'den kullan
  return cached;
} else {
  // API'den çek ve cache'le
  const data = await fetch('/data/yemek.geojson').then(r => r.json());
  await cacheService.setCachedGeoJSON('yemek', data);
  return data;
}
```

### IndexedDB Şeması
```typescript
interface CacheDB {
  'geojson': {
    key: string;          // Kategori adı
    value: {
      category: string;
      data: GeoJSONData;
      timestamp: number;  // Cache zamanı
      version: number;    // Şema versiyonu
    };
  };
}
```

---

## 📍 routingService.ts
**OSRM (Open Source Routing Machine)** API entegrasyonu.

### Özellikler
- Ücretsiz, API key gerektirmez
- Yürüyüş modu (foot profile)
- Adım adım yön tarifi
- GeoJSON geometri

### Fonksiyonlar

```typescript
interface RouteData {
  distance: number;        // Toplam metre
  duration: number;        // Toplam saniye
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  steps: RouteStep[];
}

interface RouteStep {
  distance: number;        // Metre
  duration: number;        // Saniye
  instruction: string;     // "Sola dön", "Sağa dön"
  maneuver: {
    type: string;
    modifier?: string;
  };
  location: [number, number];
}

// Ana fonksiyon
export const getWalkingRoute = async (
  start: [number, number],  // [lon, lat]
  end: [number, number]
): Promise<RouteData | null>
```

### Kullanım
```tsx
import { getWalkingRoute } from '../services/routingService';

const route = await getWalkingRoute(
  [29.015, 41.026],  // Başlangıç
  [29.025, 41.030]   // Hedef
);

if (route) {
  console.log(`${route.distance}m, ${route.duration}s`);
  route.steps.forEach(step => {
    console.log(step.instruction);
  });
}
```

### Türkçe Yön Tarifleri
```typescript
// OSRM maneuver → Türkçe
'turn left' → 'Sola dön'
'turn right' → 'Sağa dön'
'slight left' → 'Hafif sola kıvrıl'
'straight' → 'Düz devam et'
'arrive' → 'Hedefe vardınız!'
```

---

## 🗄️ routeService.ts
**Firestore** CRUD işlemleri (gezi rotaları).

### Veri Modeli

```typescript
interface Route {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  tags: string[];           // ['romantic', 'historical', ...]
  totalRating: number;      // Ortalama mutluluk skoru
  votes: number;            // Toplam oy
  votedBy: string[];        // Oy veren kullanıcı ID'leri
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface RoutePoint {
  poiId: string;
  poiName: string;
  poiImage?: string;
  commentPhoto?: string;
  coordinates: [number, number];
  rating: number;           // 1-5
  comment: string;
  order: number;
}

interface RouteComment {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt?: Timestamp;
}
```

### Fonksiyonlar

```typescript
// CRUD
export const createRoute = async (route): Promise<string>
export const updateRoute = async (routeId, data): Promise<void>
export const deleteRoute = async (routeId): Promise<void>

// Listeleme
export const getAllRoutes = async (): Promise<Route[]>
export const getPopularRoutes = async (limitCount?): Promise<Route[]>
export const getUserRoutes = async (userId): Promise<Route[]>
export const getRouteById = async (routeId): Promise<Route | null>

// Oylama
export const voteRoute = async (routeId, userId): Promise<void>
export const unvoteRoute = async (routeId, userId): Promise<void>

// Yorumlar
export const addComment = async (routeId, comment): Promise<string>
export const getComments = async (routeId): Promise<RouteComment[]>
export const deleteComment = async (routeId, commentId): Promise<void>
```

### Kullanım
```tsx
import { 
  createRoute, 
  getAllRoutes, 
  voteRoute 
} from '../services/routeService';

// Rota oluştur
const routeId = await createRoute({
  userId: 'user123',
  userName: 'Ahmet',
  title: 'Tarihi Üsküdar Turu',
  points: [...],
  tags: ['historical', 'culture']
});

// Rotaları listele
const routes = await getAllRoutes();

// Oy ver
await voteRoute('route123', 'user456');
```

---

## 🏗️ Servis Katmanı Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                          │
│         (Map.tsx, Sidebar.tsx, RoutesPage.tsx)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Store Layer (Zustand)                   │
│              (authStore, routeStore)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │authService  │ │routeService │ │ routingService      │    │
│  │             │ │             │ │ cacheService        │    │
│  └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Firebase   │ │    OSRM     │ │  IndexedDB  │            │
│  │  (Cloud)    │ │   (API)     │ │  (Local)    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Best Practices

1. **Separation of Concerns**: Her servis tek bir sorumluluğa sahip
2. **Error Handling**: Try-catch ile hata yönetimi
3. **Logging**: Console log ile debug kolaylığı
4. **Type Safety**: Tam TypeScript desteği
5. **Singleton Pattern**: cacheService instance olarak export
