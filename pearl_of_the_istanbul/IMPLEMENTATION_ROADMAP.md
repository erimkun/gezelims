# 🗺️ Adım Adım Uygulama Rehberi

**Proje:** Pearl of the Istanbul  
**Tarih:** 6 Kasım 2025  
**Süre:** ~6 ay (24 hafta)  
**Mevcut Skor:** 52/100  
**Hedef Skor:** 87/100

---

## 📋 İçindekiler

1. [Faz 1: Temel Altyapı (4 hafta)](#faz-1-temel-altyapı-4-hafta)
2. [Faz 2: SOLID ve Type Safety (6 hafta)](#faz-2-solid-ve-type-safety-6-hafta)
3. [Faz 3: Performance ve Caching (4 hafta)](#faz-3-performance-ve-caching-4-hafta)
4. [Faz 4: Security (3 hafta)](#faz-4-security-3-hafta)
5. [Faz 5: Accessibility (3 hafta)](#faz-5-accessibility-3-hafta)
6. [Faz 6: Test ve Deployment (4 hafta)](#faz-6-test-ve-deployment-4-hafta)

---

# BAŞLAMADAN ÖNCE

## ✅ Ön Hazırlık

```bash
# 1. Yedek alın
cd c:\Users\User\Desktop\vectormap\pearl_of_the_istanbul
git checkout -b refactor/architecture-improvements
git add .
git commit -m "chore: backup before major refactoring"

# 2. Dependency güncellemesi
npm install
npm audit fix

# 3. Yeni branch oluştur
git checkout -b feature/phase-1-infrastructure
```

---

# Faz 1: Temel Altyapı (4 hafta)

**Hedef:** Error handling, configuration management, utilities  
**Risk:** Düşük  
**Bağımlılık:** Yok

---

## Hafta 1: Error Handling Sistemi

### Gün 1-2: Error Boundary

**Görev 1.1:** Error Boundary component oluştur

```bash
# Yeni dosya oluştur
New-Item -Path "src\components\ErrorBoundary.tsx" -ItemType File
```

**Kopyala:** `docs/ERROR_HANDLING_FIX_GUIDE.md` → Section 1.1  
**Dosyaya yapıştır:** `src/components/ErrorBoundary.tsx`

**Görev 1.2:** App.tsx'e entegre et

```typescript
// src/App.tsx
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Mevcut kodunuz */}
    </ErrorBoundary>
  );
}
```

**Test:**
```bash
npm run dev
# Tarayıcıda konsola: throw new Error("Test error")
```

---

### Gün 3-4: Async Error Handling

**Görev 1.3:** Error utilities oluştur

```bash
New-Item -Path "src\utils\errorUtils.ts" -ItemType File
New-Item -Path "src\utils\fetchWrapper.ts" -ItemType File
```

**Kopyala:** `docs/ERROR_HANDLING_FIX_GUIDE.md` → Section 2  
**Dosyalara yapıştır**

**Görev 1.4:** Mevcut fetch çağrılarını güncelle

```typescript
// src/components/Map.tsx (ÖNCE)
const data = await fetch('/data/yemek.geojson').then(r => r.json());

// src/components/Map.tsx (SONRA)
import { fetchJSON } from '@/utils/fetchWrapper';
const data = await fetchJSON<GeoJSONData>('/data/yemek.geojson');
```

**Test:**
```bash
# Network tab'ı aç, offline yap
npm run dev
# Error handling çalışmalı
```

---

### Gün 5: Toast Notification

**Görev 1.5:** Toast sistemi kur

```bash
New-Item -Path "src\components\Toast" -ItemType Directory
New-Item -Path "src\components\Toast\ToastContext.tsx" -ItemType File
New-Item -Path "src\components\Toast\ToastContainer.tsx" -ItemType File
New-Item -Path "src\components\Toast\Toast.css" -ItemType File
```

**Kopyala:** `docs/ERROR_HANDLING_FIX_GUIDE.md` → Section 3.2

**Görev 1.6:** App.tsx'e Provider ekle

```typescript
import { ToastProvider } from './components/Toast/ToastContext';

<ToastProvider>
  <ErrorBoundary>
    {/* App content */}
  </ErrorBoundary>
</ToastProvider>
```

---

## Hafta 2: Configuration Management

### Gün 1-2: Centralized Config

**Görev 2.1:** Config dosyaları oluştur

```bash
New-Item -Path "src\config" -ItemType Directory
New-Item -Path "src\config\app.config.ts" -ItemType File
New-Item -Path "src\config\categories.config.ts" -ItemType File
New-Item -Path "src\config\map.config.ts" -ItemType File
```

**Kopyala:** `docs/DRY_VIOLATIONS_FIX_GUIDE.md` → Section 4

**Görev 2.2:** Magic numbers'ları değiştir

```typescript
// Map.tsx (ÖNCE)
if (distance < 0.02) { ... }
setTimeout(() => {}, 2000);

// Map.tsx (SONRA)
import { APP_CONFIG } from '@/config/app.config';
if (distance < APP_CONFIG.map.NEARBY_THRESHOLD_KM) { ... }
setTimeout(() => {}, APP_CONFIG.animation.MARKER_ANIMATION_DELAY_MS);
```

**Bulma komutu:**
```bash
# Magic numbers'ları bul
grep -r "0\.02\|2000\|50\|100" src/
```

---

### Gün 3-5: i18n System

**Görev 2.3:** i18n altyapısı kur

```bash
New-Item -Path "src\i18n" -ItemType Directory
New-Item -Path "src\i18n\I18nContext.tsx" -ItemType File
New-Item -Path "src\i18n\locales" -ItemType Directory
New-Item -Path "src\i18n\locales\tr.json" -ItemType File
New-Item -Path "src\i18n\locales\en.json" -ItemType File
```

**Kopyala:** `docs/DRY_VIOLATIONS_FIX_GUIDE.md` → Section 1

**Görev 2.4:** Translation objelerini taşı

```bash
# Sidebar.tsx'den translation nesnesini kopyala
# src/i18n/locales/tr.json içine yapıştır
```

**Görev 2.5:** useTranslation hook kullan

```typescript
// Sidebar.tsx (ÖNCE)
const translations = { tr: {...}, en: {...} };
<h2>{translations[language].title}</h2>

// Sidebar.tsx (SONRA)
import { useTranslation } from '@/i18n/I18nContext';
const { t } = useTranslation();
<h2>{t('sidebar.title')}</h2>
```

**Test:**
```bash
npm run dev
# Dil değiştir, tüm metinler güncellemeli
```

---

## Hafta 3: Shared Utilities

**Görev 3.1:** Utility dosyaları oluştur

```bash
New-Item -Path "src\utils\geoUtils.ts" -ItemType File
New-Item -Path "src\utils\formatUtils.ts" -ItemType File
New-Item -Path "src\utils\validationUtils.ts" -ItemType File
```

**Kopyala:** `docs/DRY_VIOLATIONS_FIX_GUIDE.md` → Section 2-3

**Görev 3.2:** Duplicate functions'ları taşı

```bash
# calculateDistance'ı bul
grep -r "calculateDistance" src/

# Tüm yerlerde şunu yap:
import { calculateDistance } from '@/utils/geoUtils';
```

**Liste:**
- ✅ `calculateDistance` → `geoUtils.ts`
- ✅ `formatDistance` → `formatUtils.ts`
- ✅ `formatDuration` → `formatUtils.ts`
- ✅ `isValidCoordinate` → `validationUtils.ts`

---

## Hafta 4: Type Definitions

**Görev 4.1:** Type dosyaları oluştur

```bash
New-Item -Path "src\types" -ItemType Directory
New-Item -Path "src\types\core.types.ts" -ItemType File
New-Item -Path "src\types\poi.types.ts" -ItemType File
New-Item -Path "src\types\map.types.ts" -ItemType File
New-Item -Path "src\types\api.types.ts" -ItemType File
```

**Kopyala:** `docs/TYPE_SAFETY_FIX_GUIDE.md` → Section 1

**Görev 4.2:** Branded types ekle

```typescript
// src/types/core.types.ts
export type UUID = string & { readonly brand: unique symbol };
export type Coordinate = [number, number] & { readonly brand: unique symbol };
export type Timestamp = number & { readonly brand: unique symbol };
```

**Test:**
```bash
npm run build
# Type errors varsa düzelt
```

---

## ✅ Faz 1 Kontrol Listesi

```bash
# Tüm testler geçmeli
npm run build
npm run dev

# Checklist:
□ ErrorBoundary çalışıyor
□ Toast notifications görünüyor
□ Config dosyaları merkezi
□ i18n sistemi çalışıyor
□ Magic numbers kalmadı
□ Duplicate functions kalmadı
□ Type definitions var

# Commit
git add .
git commit -m "feat: phase 1 - infrastructure improvements"
git push origin feature/phase-1-infrastructure
```

---

# Faz 2: SOLID ve Type Safety (6 hafta)

**Hedef:** Component separation, strict typing  
**Risk:** Orta  
**Bağımlılık:** Faz 1

```bash
git checkout -b feature/phase-2-solid-principles
```

---

## Hafta 5-6: Map.tsx Component Separation

### Gün 1-3: MapContainer

**Görev 5.1:** MapContainer oluştur

```bash
New-Item -Path "src\components\Map\MapContainer.tsx" -ItemType File
```

**Kopyala:** `docs/SOLID_PRINCIPLES_FIX_GUIDE.md` → Section 1.2

**Görev 5.2:** Map state'i taşı

```typescript
// MapContainer.tsx
export const MapContainer = () => {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Map initialization logic buraya
  
  return (
    <div ref={containerRef}>
      {isLoaded && (
        <>
          <POILayer map={mapRef.current!} />
          <NavigationLayer map={mapRef.current!} />
          <MapControls map={mapRef.current!} />
        </>
      )}
    </div>
  );
};
```

---

### Gün 4-6: POILayer Component

**Görev 5.3:** POILayer oluştur

```bash
New-Item -Path "src\components\Map\POILayer.tsx" -ItemType File
```

**Görev 5.4:** Marker logic'i taşı

```typescript
// Map.tsx'den bunu bul:
const loadPOIs = async () => { ... }
const createMarker = (poi) => { ... }

// POILayer.tsx'e taşı
```

**Test:**
```bash
npm run dev
# Marker'lar görünmeli
```

---

### Gün 7-10: Diğer Alt-Componentler

**Görev 5.5:** Componentleri oluştur

```bash
New-Item -Path "src\components\Map\NavigationLayer.tsx" -ItemType File
New-Item -Path "src\components\Map\MapControls.tsx" -ItemType File
New-Item -Path "src\components\Map\MapStyleSelector.tsx" -ItemType File
```

**Kopyala:** `docs/SOLID_PRINCIPLES_FIX_GUIDE.md` → Section 1.3-1.5

**Görev 5.6:** Map.tsx'i refactor et

```typescript
// Map.tsx (SONRA - Sadece orchestration)
import { MapContainer } from './Map/MapContainer';
import { Sidebar } from './Sidebar';

export const Map = () => {
  return (
    <>
      <MapContainer />
      <Sidebar />
    </>
  );
};
```

---

## Hafta 7-8: Dependency Injection

**Görev 6.1:** Routing Provider oluştur

```bash
New-Item -Path "src\services\routing\RoutingProvider.ts" -ItemType File
New-Item -Path "src\services\routing\OSRMProvider.ts" -ItemType File
```

**Kopyala:** `docs/SOLID_PRINCIPLES_FIX_GUIDE.md` → Section 3

**Görev 6.2:** routingService.ts'i güncelle

```typescript
// routingService.ts (ÖNCE)
const url = 'https://router.project-osrm.org/...';

// routingService.ts (SONRA)
import { routingProvider } from './routing/OSRMProvider';
const route = await routingProvider.getRoute(start, end);
```

---

## Hafta 9-10: Strict TypeScript

**Görev 7.1:** tsconfig.json sıkılaştır

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Görev 7.2:** Type errors'ları düzelt

```bash
npm run build
# Tüm type errors'ları tek tek düzelt
```

**Yaygın hatalar:**
```typescript
// ❌ HATA
const poi = pois.find(p => p.id === id);
poi.name // Error: possibly undefined

// ✅ ÇÖZÜM
const poi = pois.find(p => p.id === id);
if (!poi) throw new Error('POI not found');
poi.name // OK
```

---

## ✅ Faz 2 Kontrol Listesi

```bash
□ Map.tsx < 200 satır
□ 5+ alt-component var
□ Dependency Injection çalışıyor
□ Strict TypeScript aktif
□ Sıfır type error
□ Tüm any types kaldırıldı

git add .
git commit -m "refactor: phase 2 - SOLID principles and type safety"
git push origin feature/phase-2-solid-principles
```

---

# Faz 3: Performance ve Caching (4 hafta)

**Hedef:** Bundle size -38%, lazy loading  
**Risk:** Orta  
**Bağımlılık:** Faz 2

```bash
git checkout -b feature/phase-3-performance
```

---

## Hafta 11: Bundle Optimization

**Görev 8.1:** Unused dependencies kaldır

```bash
npm uninstall react-grab react-window
npm run build
# Bundle size kontrol et
```

**Görev 8.2:** Vite config optimize et

**Kopyala:** `docs/PERFORMANCE_OPTIMIZATION_FIX_GUIDE.md` → Section 1.2

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
```

---

## Hafta 12: Code Splitting

**Görev 9.1:** Lazy load components

```typescript
// App.tsx
import { lazy, Suspense } from 'react';

const Map = lazy(() => import('./components/Map'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const DirectionsModal = lazy(() => import('./components/DirectionsModal'));
```

**Görev 9.2:** Loading states ekle

```bash
New-Item -Path "src\components\LoadingSpinner.tsx" -ItemType File
```

---

## Hafta 13: Caching System

**Görev 10.1:** IndexedDB cache kur

```bash
npm install idb
New-Item -Path "src\services\cacheService.ts" -ItemType File
```

**Kopyala:** `docs/PERFORMANCE_OPTIMIZATION_FIX_GUIDE.md` → Section 3.1

**Görev 10.2:** GeoJSON'ları cache'le

```typescript
// POILayer.tsx
import { cacheService } from '@/services/cacheService';

const loadPOIs = async (category: string) => {
  const cached = await cacheService.getCachedGeoJSON(category);
  if (cached) return cached;
  
  const data = await fetchJSON(`/data/${category}.geojson`);
  await cacheService.setCachedGeoJSON(category, data);
  return data;
};
```

---

## Hafta 14: Render Optimization

**Görev 11.1:** useMemo/useCallback ekle

```bash
# Map.tsx, Sidebar.tsx, POIPopup.tsx içinde:
grep -r "const filtered = " src/
# Her yerde useMemo ekle
```

**Görev 11.2:** React.memo ekle

```typescript
// POICard.tsx
export const POICard = React.memo(({ poi }: Props) => {
  // ...
}, (prev, next) => prev.poi.id === next.poi.id);
```

**Görev 11.3:** Virtual scrolling (opsiyonel)

```bash
npm install @tanstack/react-virtual
```

**Kopyala:** `docs/PERFORMANCE_OPTIMIZATION_FIX_GUIDE.md` → Section 5.4

---

## ✅ Faz 3 Kontrol Listesi

```bash
# Bundle size kontrol
npm run build
# dist/assets/*.js dosya boyutları

□ Bundle < 320KB
□ Lazy loading çalışıyor
□ IndexedDB cache çalışıyor
□ useMemo/useCallback var
□ React.memo kullanılıyor

git add .
git commit -m "perf: phase 3 - performance optimizations"
```

---

# Faz 4: Security (3 hafta)

**Hedef:** XSS prevention, rate limiting  
**Risk:** Yüksek  
**Bağımlılık:** Faz 1-3

```bash
git checkout -b feature/phase-4-security
```

---

## Hafta 15: XSS Prevention

**Görev 12.1:** innerHTML kullanımlarını bul

```bash
grep -r "dangerouslySetInnerHTML\|innerHTML" src/
```

**Görev 12.2:** POIPopup.tsx güncelle

```typescript
// ÖNCE (XSS vulnerability!)
<div dangerouslySetInnerHTML={{ __html: poi.description }} />

// SONRA
<div>{poi.description}</div>
```

**Görev 12.3:** DOMPurify kur (eğer HTML gerekiyorsa)

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

---

## Hafta 16: Input Validation

**Görev 13.1:** Validation utilities

```bash
New-Item -Path "src\utils\urlUtils.ts" -ItemType File
New-Item -Path "src\utils\sanitizeUtils.ts" -ItemType File
```

**Kopyala:** `docs/SECURITY_FIXES_FIX_GUIDE.md` → Section 2

**Görev 13.2:** URL validation ekle

```typescript
// DirectionsModal.tsx
const openInGoogleMaps = (dest: Coordinate) => {
  if (!isValidCoordinate(dest[0], dest[1])) {
    throw new Error('Invalid coordinates');
  }
  // ...
};
```

---

## Hafta 17: Rate Limiting & CSP

**Görev 14.1:** Rate limiter kur

```bash
New-Item -Path "src\utils\rateLimiter.ts" -ItemType File
```

**Kopyala:** `docs/SECURITY_FIXES_FIX_GUIDE.md` → Section 3

**Görev 14.2:** OSRM API rate limit

```typescript
// routingService.ts
const rateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 });

export const getRoute = async (...) => {
  if (!await rateLimiter.checkLimit()) {
    throw new Error('Rate limit exceeded');
  }
  // ...
};
```

**Görev 14.3:** CSP header ekle

**Kopyala:** `docs/SECURITY_FIXES_FIX_GUIDE.md` → Section 4.1  
**Yapıştır:** `index.html` içine

---

## ✅ Faz 4 Kontrol Listesi

```bash
□ Sıfır dangerouslySetInnerHTML
□ Input validation çalışıyor
□ Rate limiting aktif
□ CSP headers var
□ URL whitelist çalışıyor

git add .
git commit -m "security: phase 4 - security hardening"
```

---

# Faz 5: Accessibility (3 hafta)

**Hedef:** WCAG 2.1 AA compliance  
**Risk:** Düşük  
**Bağımlılık:** Faz 2

```bash
git checkout -b feature/phase-5-accessibility
```

---

## Hafta 18: Semantic HTML & ARIA

**Görev 15.1:** Semantic elements

```typescript
// Sidebar.tsx (ÖNCE)
<div className="sidebar">

// Sidebar.tsx (SONRA)
<aside className="sidebar" aria-label="POI Kategorileri">
```

**Görev 15.2:** ARIA labels ekle

**Bulma komutu:**
```bash
# Tüm button/div onClick'leri bul
grep -r "<div.*onClick\|<button" src/
```

**Her birine:**
```typescript
<button 
  aria-label="Kategoriyi filtrele" 
  aria-pressed={isActive}
>
```

---

## Hafta 19: Keyboard Navigation

**Görev 16.1:** Focus trap hook

```bash
New-Item -Path "src\hooks\useFocusTrap.ts" -ItemType File
New-Item -Path "src\hooks\useArrowKeyNavigation.ts" -ItemType File
```

**Kopyala:** `docs/ACCESSIBILITY_FIX_GUIDE.md` → Section 3

**Görev 16.2:** Modal'a focus trap ekle

```typescript
// DirectionsModal.tsx
const modalRef = useRef<HTMLDivElement>(null);
useFocusTrap(modalRef, isOpen);
```

**Görev 16.3:** Skip to content link

```typescript
// App.tsx
<a href="#main-content" className="skip-link">
  Ana içeriğe atla
</a>
```

---

## Hafta 20: Screen Readers & Contrast

**Görev 17.1:** Live regions ekle

```typescript
// WalkingNavigation.tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {instruction}
</div>
```

**Görev 17.2:** Color contrast düzelt

```bash
# WebAIM Contrast Checker kullan
# https://webaim.org/resources/contrastchecker/
```

**Kopyala:** `docs/ACCESSIBILITY_FIX_GUIDE.md` → Section 6.1

**Görev 17.3:** Focus indicators

```css
/* index.css */
*:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

---

## ✅ Faz 5 Kontrol Listesi

```bash
# axe DevTools ile test et
# Lighthouse accessibility score > 90

□ Semantic HTML kullanılıyor
□ ARIA labels var
□ Keyboard navigation çalışıyor
□ Focus trap var
□ Skip link çalışıyor
□ Contrast ratios WCAG AA
□ Screen reader uyumlu

git add .
git commit -m "a11y: phase 5 - accessibility improvements"
```

---

# Faz 6: Test ve Deployment (4 hafta)

**Hedef:** Test coverage, CI/CD  
**Risk:** Düşük

```bash
git checkout -b feature/phase-6-testing
```

---

## Hafta 21-22: Unit Tests

**Görev 18.1:** Test setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Görev 18.2:** Test dosyaları oluştur

```bash
New-Item -Path "src\utils\__tests__\geoUtils.test.ts" -ItemType File
New-Item -Path "src\components\__tests__\Map.test.tsx" -ItemType File
```

**Örnek test:**
```typescript
// geoUtils.test.ts
import { calculateDistance } from '../geoUtils';

describe('calculateDistance', () => {
  it('calculates distance correctly', () => {
    const result = calculateDistance([29.0, 41.0], [29.1, 41.1]);
    expect(result).toBeCloseTo(15.7, 1);
  });
});
```

**Test coverage hedefi:** >70%

---

## Hafta 23: E2E Tests

**Görev 19.1:** Playwright kur

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Görev 19.2:** E2E test yaz

```bash
New-Item -Path "tests\e2e\map-navigation.spec.ts" -ItemType File
```

```typescript
// map-navigation.spec.ts
test('user can navigate to POI', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('[aria-label*="Kız Kulesi"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
```

---

## Hafta 24: CI/CD Pipeline

**Görev 20.1:** GitHub Actions workflow

```bash
New-Item -Path ".github\workflows\ci.yml" -ItemType File
```

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npx playwright test
```

**Görev 20.2:** Deployment

```bash
# Vercel/Netlify deploy
npm run build
# Deploy dist/ folder
```

---

## ✅ Final Kontrol Listesi

```bash
# Tüm testleri çalıştır
npm run test
npm run build
npx playwright test

# Metrics kontrol
□ Bundle size < 320KB ✅
□ Lighthouse score > 90 ✅
□ Test coverage > 70% ✅
□ Zero console errors ✅
□ Accessibility score > 90 ✅
□ Security score > 85 ✅

# Production deploy
git checkout main
git merge feature/phase-6-testing
git push origin main
```

---

# 📊 Son Metrikler

| Metrik | Önce | Sonra | İyileşme |
|--------|------|-------|----------|
| **Code Quality** | 52/100 | 87/100 | +67% |
| **Bundle Size** | 450KB | 280KB | -38% |
| **Load Time** | 3.2s | 1.8s | -44% |
| **Type Safety** | 5/10 | 9/10 | +80% |
| **Security** | 32/100 | 91/100 | +184% |
| **Accessibility** | 28/100 | 92/100 | +229% |

---

# 🎯 Her Hafta Sonunda

```bash
# 1. Code review yap
git diff main...feature/current-branch

# 2. Test et
npm run build && npm run dev

# 3. Commit yap
git add .
git commit -m "feat: week X completed"

# 4. Progress güncelle
# Bu dosyada ilgili hafta checkbox'ını işaretle
```

---

# 🆘 Sorun Yaşarsanız

## Build hatası alırsanız:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Type error alırsanız:
```bash
# tsconfig.json'da geçici olarak gevşet
"strict": false
# Sonra tek tek düzeltin
```

## Test fail olursa:
```bash
npm run test -- --reporter=verbose
# Hangi test fail olmuş göreceksiniz
```

---

# 📞 İletişim & Dokümantasyon

- **Ana Rapor:** `ARCHITECTURE_AND_CODE_QUALITY_REPORT.md`
- **Detaylı Rehberler:** `docs/` klasörü
- **Her faz için:** İlgili fix guide'a bakın

**Başarılar!** 🚀

---

**Oluşturulma Tarihi:** 6 Kasım 2025  
**Son Güncelleme:** 6 Kasım 2025  
**Versiyon:** 1.0.0
