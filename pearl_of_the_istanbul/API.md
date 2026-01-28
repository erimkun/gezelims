# 📡 API Referansı

Bu doküman, Pearl of Istanbul uygulamasının kullandığı harici API'leri ve iç servisleri açıklar.

---

## 🌐 Harici API'ler

### 1. OSRM (Open Source Routing Machine)

**URL:** `https://router.project-osrm.org`

**Kullanım:** Yürüyüş rotası hesaplama

**Ücretsiz / API Key Gerektirmez**

#### Endpoint

```
GET /route/v1/foot/{start_lng},{start_lat};{end_lng},{end_lat}
    ?steps=true
    &geometries=geojson
    &overview=full
```

#### Örnek İstek

```typescript
const url = `https://router.project-osrm.org/route/v1/foot/29.015,41.026;29.025,41.030?steps=true&geometries=geojson&overview=full`;

const response = await fetch(url);
const data = await response.json();
```

#### Response

```json
{
  "code": "Ok",
  "routes": [{
    "geometry": {
      "type": "LineString",
      "coordinates": [[29.015, 41.026], [29.016, 41.027], ...]
    },
    "distance": 1234.5,    // metre
    "duration": 890.2,     // saniye
    "legs": [{
      "steps": [{
        "distance": 50.0,
        "duration": 35.0,
        "maneuver": {
          "type": "turn",
          "modifier": "left",
          "location": [29.015, 41.026]
        },
        "name": "Sokak Adı"
      }]
    }]
  }]
}
```

#### Rate Limits

- Saatlik limit: Belirtilmemiş (makul kullanım)
- Demo sunucusu, production için kendi sunucu önerilir

---

### 2. Carto Tile Server

**URL:** `https://basemaps.cartocdn.com`

**Kullanım:** Harita tile'ları

**Ücretsiz / API Key Gerektirmez**

#### Tile URL'leri

```typescript
// Voyager (Renkli)
https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png

// Dark (Koyu)
https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png
```

#### Parametreler

| Param | Açıklama |
|-------|----------|
| `{z}` | Zoom level (0-22) |
| `{x}` | Tile X koordinatı |
| `{y}` | Tile Y koordinatı |

---

### 3. OpenStreetMap Tiles

**URL:** `https://tile.openstreetmap.org`

**Kullanım:** Alternatif harita tile'ları

```
https://a.tile.openstreetmap.org/{z}/{x}/{y}.png
```

#### Attribution Zorunlu

```html
© OpenStreetMap contributors
```

---

### 4. Firebase Services

**Proje:** gezelim-b492b

#### Authentication (Google OAuth)

```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const result = await signInWithPopup(auth, googleProvider);
const user = result.user;
```

#### Firestore Database

**Collections:**

| Collection | Açıklama |
|------------|----------|
| `/routes` | Kullanıcı rotaları |
| `/routes/{id}/comments` | Rota yorumları |

**Route Document:**

```typescript
{
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  tags: string[];
  totalRating: number;
  votes: number;
  votedBy: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📂 İç Servisler

### authService

**Dosya:** `src/services/authService.ts`

```typescript
// Google ile giriş
signInWithGoogle(): Promise<User | null>

// Çıkış
signOut(): Promise<void>

// Auth state dinleyici
onAuthChange(callback: (user: User | null) => void): () => void

// Redirect sonucu kontrolü
checkRedirectResult(): Promise<User | null>

// Mevcut kullanıcı
getCurrentUser(): User | null
```

---

### routeService

**Dosya:** `src/services/routeService.ts`

```typescript
// CRUD
createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
updateRoute(routeId: string, data: Partial<Route>): Promise<void>
deleteRoute(routeId: string): Promise<void>
getRouteById(routeId: string): Promise<Route | null>

// Listeleme
getAllRoutes(): Promise<Route[]>
getPopularRoutes(limitCount?: number): Promise<Route[]>
getUserRoutes(userId: string): Promise<Route[]>

// Oylama
voteRoute(routeId: string, userId: string): Promise<void>
unvoteRoute(routeId: string, userId: string): Promise<void>

// Yorumlar
addComment(routeId: string, comment: Omit<RouteComment, 'id' | 'createdAt'>): Promise<string>
getComments(routeId: string): Promise<RouteComment[]>
deleteComment(routeId: string, commentId: string): Promise<void>
```

---

### routingService

**Dosya:** `src/services/routingService.ts`

```typescript
interface RouteData {
  distance: number;      // Toplam metre
  duration: number;      // Toplam saniye
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  steps: RouteStep[];
}

interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;   // Türkçe yön tarifi
  maneuver: {
    type: string;
    modifier?: string;
  };
  location: [number, number];
}

// Yürüyüş rotası al
getWalkingRoute(
  start: [number, number],  // [lng, lat]
  end: [number, number]     // [lng, lat]
): Promise<RouteData | null>
```

---

### cacheService

**Dosya:** `src/services/cacheService.ts`

```typescript
class CacheService {
  // GeoJSON cache
  getCachedGeoJSON(category: string): Promise<GeoJSONData | null>
  setCachedGeoJSON(category: string, data: GeoJSONData): Promise<void>
  
  // Cache temizleme
  clearCache(): Promise<void>
}

export const cacheService: CacheService;
```

**Cache Yapısı:**
- Storage: IndexedDB
- Süre: 7 gün
- Versiyon kontrolü ile invalidation

---

## 📊 GeoJSON Endpoints

**Base URL:** `/data/`

| Endpoint | Kategori |
|----------|----------|
| `/data/yemek.geojson` | Yeme-içme |
| `/data/doga.geojson` | Doğa |
| `/data/kultur-sanat.geojson` | Kültür-Sanat |
| `/data/eglence.geojson` | Eğlence |
| `/data/diger.geojson` | Diğer |

**Response Format:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [29.015, 41.026]
      },
      "properties": {
        "id": "poi-123",
        "name": "Mekan Adı",
        "category": "food",
        "subcategory": "Restoran",
        "address": "Adres",
        "rating": 4.5,
        "phone": "+90...",
        "website": "https://...",
        "images": ["url1", "url2"]
      }
    }
  ]
}
```

---

## 🔄 Event System

Uygulama içi custom event'ler:

### zoom-to-poi

POI'ye haritada zoom yapmak için:

```typescript
// Dispatch
window.dispatchEvent(new CustomEvent('zoom-to-poi', { 
  detail: poiObject 
}));

// Listen (Map.tsx'te)
window.addEventListener('zoom-to-poi', (e: CustomEvent) => {
  const poi = e.detail;
  map.flyTo({
    center: poi.coordinates,
    zoom: 17
  });
});
```

---

## 🔐 Güvenlik

### CORS

- GeoJSON dosyaları: Same-origin (public/)
- OSRM: CORS enabled
- Carto: CORS enabled
- Firebase: Firebase SDK handles

### Rate Limiting

| Servis | Limit |
|--------|-------|
| OSRM | Makul kullanım |
| Carto | Sınırsız (tile cache) |
| Firebase Auth | 100 istek/IP/saat |
| Firestore | Firebase plan limitleri |

---

## 📈 Monitoring

### Console Logs

```typescript
console.log('📍 Location:', ...);
console.log('🗺️ Map:', ...);
console.log('✅ Success:', ...);
console.error('❌ Error:', ...);
console.log('🔄 Update:', ...);
console.log('💾 Cache:', ...);
```

### Error Tracking (Önerilen)

```typescript
// Sentry veya benzeri entegrasyon
Sentry.captureException(error);
```
