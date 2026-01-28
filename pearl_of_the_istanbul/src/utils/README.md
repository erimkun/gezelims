# 📁 utils/ - Yardımcı Fonksiyonlar

Bu dizin, uygulamada sıkça kullanılan utility fonksiyonlarını içerir.

---

## 📂 Dizin Yapısı

```
utils/
├── 📄 coordinateTransform.ts  # Koordinat dönüşümleri
├── 📄 domUtils.ts             # DOM manipülasyonu
├── 📄 formatUtils.ts          # Formatlama fonksiyonları
├── 📄 geoUtils.ts             # Coğrafi hesaplamalar
└── 📄 performanceUtils.ts     # Performans optimizasyonu
```

---

## 📄 geoUtils.ts
Coğrafi hesaplamalar için fonksiyonlar.

### Fonksiyonlar

```typescript
type Coordinate = [number, number]; // [lng, lat]

/**
 * İki koordinat arası mesafe (Haversine formülü)
 * @returns Kilometre cinsinden mesafe
 */
export const calculateDistance = (
  coord1: Coordinate,
  coord2: Coordinate
): number

/**
 * Mesafeyi okunabilir formata çevir
 * @example formatDistance(0.5) → "500m"
 * @example formatDistance(2.5) → "2.5km"
 */
export const formatDistance = (kilometers: number): string

/**
 * Koordinat geçerli mi kontrol et
 */
export const isValidCoordinate = (coord: Coordinate): boolean

/**
 * Nokta bounding box içinde mi?
 */
export const isPointInBounds = (
  point: Coordinate,
  bbox: { minLng, maxLng, minLat, maxLat }
): boolean

/**
 * Koordinat dizisinin merkez noktası
 */
export const getCenterPoint = (coordinates: Coordinate[]): Coordinate
```

### Kullanım
```tsx
import { calculateDistance, formatDistance, isPointInBounds } from '../utils/geoUtils';

// Mesafe hesapla
const distance = calculateDistance(
  [29.015, 41.026],  // Başlangıç
  [29.025, 41.030]   // Hedef
);
console.log(`${formatDistance(distance)}`); // "1.2km"

// Bölge kontrolü
const isInUskudar = isPointInBounds(
  [29.015, 41.026],
  { minLng: 28.95, maxLng: 29.10, minLat: 40.95, maxLat: 41.05 }
);
```

---

## 📄 performanceUtils.ts
Performans optimizasyonu için fonksiyonlar.

### Fonksiyonlar

```typescript
/**
 * Debounce - Son çağrıdan sonra bekler
 * Use case: Arama kutusu, window resize
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void

/**
 * Throttle - Belirli aralıkta en fazla bir kez çağır
 * Use case: Scroll, mouse move, map move
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void

/**
 * Performance Tracker - Execution time ölçümü
 */
export class PerformanceTracker {
  static mark(name: string): void
  static measure(name: string, startMark: string, endMark: string): number
  static log(name: string, duration: number): void
}
```

### Kullanım
```tsx
import { debounce, throttle, PerformanceTracker } from '../utils/performanceUtils';

// Debounce - Arama kutusu
const handleSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />

// Throttle - Harita hareketi
const handleMapMove = throttle((center: [number, number]) => {
  loadPOIsInViewport(center);
}, 500);

map.on('move', () => handleMapMove(map.getCenter()));

// Performance ölçümü
PerformanceTracker.mark('poi-load-start');
await loadPOIs();
PerformanceTracker.mark('poi-load-end');
const duration = PerformanceTracker.measure('poi-load', 'poi-load-start', 'poi-load-end');
console.log(`POI load took ${duration}ms`);
```

---

## 📄 coordinateTransform.ts
GeoJSON koordinat dönüşümleri (proj4 kullanarak).

### Fonksiyonlar

```typescript
/**
 * GeoJSON'u WGS84 koordinat sistemine dönüştür
 * EPSG:32635 (UTM Zone 35N) → EPSG:4326 (WGS84)
 */
export const transformGeoJSON = (geojson: GeoJSON): GeoJSON

/**
 * Tek koordinatı dönüştür
 */
export const transformCoordinate = (
  coord: [number, number],
  fromProj: string,
  toProj: string
): [number, number]
```

### Kullanım
```tsx
import { transformGeoJSON } from '../utils/coordinateTransform';

// Farklı projeksiyon sistemindeki GeoJSON'u dönüştür
const utmGeoJSON = await fetch('/data/uskudar.geojson').then(r => r.json());
const wgs84GeoJSON = transformGeoJSON(utmGeoJSON);

// Artık MapLibre'da kullanılabilir
map.addSource('uskudar', {
  type: 'geojson',
  data: wgs84GeoJSON
});
```

---

## 📄 formatUtils.ts
Veri formatlama fonksiyonları.

### Fonksiyonlar

```typescript
/**
 * Süreyi okunabilir formata çevir
 * @example formatDuration(3661) → "1 sa 1 dk"
 */
export const formatDuration = (seconds: number): string

/**
 * Rating yıldızlarını göster
 * @example formatRating(4.5) → "⭐⭐⭐⭐⭐" (4.5/5)
 */
export const formatRating = (rating: number): string

/**
 * Telefon numarasını formatla
 * @example formatPhone("5321234567") → "+90 532 123 45 67"
 */
export const formatPhone = (phone: string): string

/**
 * Tarihi formatla
 * @example formatDate(timestamp) → "28 Ocak 2026"
 */
export const formatDate = (date: Date | Timestamp, locale?: string): string

/**
 * Büyük sayıları kısalt
 * @example formatNumber(1500000) → "1.5M"
 */
export const formatNumber = (num: number): string
```

### Kullanım
```tsx
import { formatDuration, formatRating, formatPhone } from '../utils/formatUtils';

// POI kartında gösterim
<div className="poi-card">
  <span>{formatRating(poi.rating)}</span>
  <span>{formatDuration(route.duration)}</span>
  <a href={`tel:${poi.phone}`}>{formatPhone(poi.phone)}</a>
</div>
```

---

## 📄 domUtils.ts
DOM manipülasyonu yardımcıları.

### Fonksiyonlar

```typescript
/**
 * Element görünür mü kontrol et
 */
export const isElementVisible = (element: HTMLElement): boolean

/**
 * Smooth scroll to element
 */
export const scrollToElement = (
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void

/**
 * Clipboard'a kopyala
 */
export const copyToClipboard = async (text: string): Promise<boolean>

/**
 * Fullscreen toggle
 */
export const toggleFullscreen = (element: HTMLElement): Promise<void>

/**
 * CSS class toggle with timeout
 */
export const flashClass = (
  element: HTMLElement,
  className: string,
  duration: number
): void
```

### Kullanım
```tsx
import { scrollToElement, copyToClipboard, flashClass } from '../utils/domUtils';

// POI kartına scroll
const poiCard = document.getElementById(`poi-card-${poi.id}`);
if (poiCard) {
  scrollToElement(poiCard, { behavior: 'smooth', block: 'center' });
  flashClass(poiCard, 'highlighted', 2000);
}

// Adres kopyala
const handleCopyAddress = async () => {
  const success = await copyToClipboard(poi.address);
  if (success) {
    showToast('Adres kopyalandı!', 'success');
  }
};
```

---

## 🏗️ Utility Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Components                              │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                       Utilities                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│ │  geoUtils    │ │ formatUtils  │ │ performanceUtils     │ │
│ │              │ │              │ │                      │ │
│ │ calculateDist│ │ formatDurat. │ │ debounce / throttle  │ │
│ │ isPointIn... │ │ formatRating │ │ PerformanceTracker   │ │
│ └──────────────┘ └──────────────┘ └──────────────────────┘ │
│ ┌──────────────┐ ┌──────────────┐                          │
│ │ coordTrans.  │ │  domUtils    │                          │
│ │              │ │              │                          │
│ │ transformGeo │ │ scrollTo...  │                          │
│ │ transformCrd │ │ copyToClip.. │                          │
│ └──────────────┘ └──────────────┘                          │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Best Practices

1. **Pure Functions**: Side effect içermez
2. **Type Safety**: Tam TypeScript desteği
3. **Single Responsibility**: Her fonksiyon tek iş yapar
4. **Testable**: Kolayca unit test yazılabilir
5. **Reusable**: Uygulama genelinde kullanılabilir
6. **Documented**: JSDoc ile dokümante

### JSDoc Örneği
```typescript
/**
 * İki koordinat arasındaki mesafeyi Haversine formülü ile hesaplar.
 * 
 * @param coord1 - Başlangıç koordinatı [lng, lat]
 * @param coord2 - Bitiş koordinatı [lng, lat]
 * @returns Kilometre cinsinden mesafe
 * 
 * @example
 * ```ts
 * const distance = calculateDistance([29.015, 41.026], [29.025, 41.030]);
 * console.log(distance); // 1.234
 * ```
 */
export const calculateDistance = (
  coord1: Coordinate,
  coord2: Coordinate
): number => {
  // implementation
};
```
