---
applyTo: '**/*.{ts,tsx,js,jsx}'
description: 'Otomatik kod standartları ve best practices kuralları'
---

# 🤖 AI Coding Assistant - Otomatik Uygulama Kuralları

Bu dosya, tüm kod değişikliklerinde otomatik olarak uygulanmalıdır.

---

## 📋 ZORUNLU KURALLAR

### 1. SOLID Principles

**Her kod değişikliğinde:**

#### Single Responsibility Principle (SRP)
```typescript
// ❌ YAPMAYIN
const UserDashboard = () => {
  // API çağrısı
  // State management
  // Rendering
  // Analytics
  // Form validation
}

// ✅ YAPIN
const UserDashboard = () => {
  const { data } = useUserData();  // API logic ayrı hook
  const { track } = useAnalytics(); // Analytics ayrı hook
  return <DashboardView data={data} onTrack={track} />;
}
```

**Kural:** Bir component/function sadece TEK bir sorumluluğa sahip olmalı.

---

#### Open/Closed Principle (OCP)
```typescript
// ❌ YAPMAYIN - Her yeni kategori için kod değişikliği
function getCategoryColor(category: string) {
  if (category === 'food') return 'red';
  if (category === 'culture') return 'blue';
  // Yeni kategori = kod değişikliği gerekir
}

// ✅ YAPIN - Config-driven, kod değişikliği yok
const CATEGORY_CONFIG = {
  food: { color: 'red', icon: '🍔' },
  culture: { color: 'blue', icon: '🎭' },
  // Yeni kategori = sadece config'e ekle
} as const;

function getCategoryColor(category: string) {
  return CATEGORY_CONFIG[category]?.color ?? 'gray';
}
```

**Kural:** Yeni özellik eklemek için mevcut kodu değiştirme, genişlet.

---

#### Dependency Inversion Principle (DIP)
```typescript
// ❌ YAPMAYIN - Concrete implementation'a bağımlı
class MapComponent {
  private osrmService = new OSRMService(); // Tight coupling!
  
  async getRoute() {
    return this.osrmService.fetchRoute();
  }
}

// ✅ YAPIN - Interface'e bağımlı
interface RoutingProvider {
  getRoute(start: Coordinate, end: Coordinate): Promise<Route>;
}

class MapComponent {
  constructor(private routingProvider: RoutingProvider) {}
  
  async getRoute() {
    return this.routingProvider.getRoute(start, end);
  }
}

// Implementation ayrı
class OSRMProvider implements RoutingProvider { ... }
class GoogleMapsProvider implements RoutingProvider { ... }
```

**Kural:** High-level modules, low-level details'e bağımlı olmamalı.

---

### 2. DRY (Don't Repeat Yourself)

**ASLA kod tekrarı yapmayın:**

```typescript
// ❌ YAPMAYIN
// File 1:
const translations = { tr: { title: 'Başlık' }, en: { title: 'Title' } };

// File 2:
const translations = { tr: { title: 'Başlık' }, en: { title: 'Title' } };

// File 3:
const translations = { tr: { title: 'Başlık' }, en: { title: 'Title' } };

// ✅ YAPIN
// src/i18n/locales/tr.json
{ "title": "Başlık" }

// Her dosyada:
import { useTranslation } from '@/i18n';
const { t } = useTranslation();
<h1>{t('title')}</h1>
```

**Tespit:**
- Aynı function 2+ yerde varsa → utility'ye taşı
- Aynı constant 2+ yerde varsa → config'e taşı
- Aynı translation 2+ yerde varsa → i18n'e taşı

---

### 3. Type Safety

**Her değişken/function tip belirtilmeli:**

```typescript
// ❌ YAPMAYIN
const calculateDistance = (a, b) => { ... }  // No types!
let result;  // Type: any
const data = await fetch(url).then(r => r.json());  // any

// ✅ YAPIN
const calculateDistance = (a: Coordinate, b: Coordinate): number => { ... }
let result: number | undefined;
const data = await fetch(url).then(r => r.json() as POIData);

// Branded types kullan
type UUID = string & { readonly __brand: 'UUID' };
type Coordinate = [number, number] & { readonly __brand: 'Coordinate' };
```

**tsconfig.json zorunlu ayarlar:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### 4. Error Handling

**Her async operation try-catch içinde:**

```typescript
// ❌ YAPMAYIN
const loadData = async () => {
  const data = await fetch('/api/data');  // Unhandled rejection!
  setData(data);
}

// ✅ YAPIN
const loadData = async () => {
  try {
    const data = await fetchJSON<POIData>('/api/data');
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    showToast({
      type: 'error',
      title: 'Veri Yüklenemedi',
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
    });
  }
}
```

**Promise.all kullanımı:**
```typescript
// ❌ YAPMAYIN
const [a, b, c] = await Promise.all([...]);  // Tek hata tümünü kırar

// ✅ YAPIN
const results = await Promise.allSettled([...]);
results.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.error(`Task ${index} failed:`, result.reason);
  }
});
```

---

### 5. Security

**Güvenlik kontrolleri:**

#### XSS Prevention
```typescript
// ❌ YAPMAYIN - XSS VULNERABILITY!
<div dangerouslySetInnerHTML={{ __html: userInput }} />
element.innerHTML = userInput;

// ✅ YAPIN
<div>{userInput}</div>  // React auto-escapes

// Eğer HTML gerekiyorsa:
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

#### Input Validation
```typescript
// ❌ YAPMAYIN
const openURL = (url: string) => {
  window.open(url);  // Open redirect vulnerability!
}

// ✅ YAPIN
const ALLOWED_DOMAINS = ['google.com', 'openstreetmap.org'];

const openURL = (url: string) => {
  try {
    const parsed = new URL(url);
    const isAllowed = ALLOWED_DOMAINS.some(d => 
      parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
    );
    
    if (!isAllowed) {
      throw new Error('Domain not allowed');
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Invalid URL:', error);
  }
}
```

#### Rate Limiting
```typescript
// Her API call için rate limiter kullan
const rateLimiter = new RateLimiter({ 
  maxRequests: 10, 
  windowMs: 60000 
});

const apiCall = async () => {
  if (!await rateLimiter.checkLimit()) {
    throw new Error('Rate limit exceeded');
  }
  return fetch(...);
}
```

---

### 6. Performance

**Her yeni component/function için:**

#### useMemo for Calculations
```typescript
// ❌ YAPMAYIN
const Sidebar = ({ pois, filters }) => {
  const filtered = pois.filter(poi => filters.includes(poi.category));
  // Her render'da yeniden hesaplanır!
}

// ✅ YAPIN
const Sidebar = ({ pois, filters }) => {
  const filtered = useMemo(() => 
    pois.filter(poi => filters.includes(poi.category)),
    [pois, filters]
  );
}
```

#### useCallback for Functions
```typescript
// ❌ YAPMAYIN
const Component = () => {
  const handleClick = (id: string) => { ... };
  // Her render'da yeni function!
  return <Child onClick={handleClick} />;
}

// ✅ YAPIN
const Component = () => {
  const handleClick = useCallback((id: string) => { ... }, []);
  return <Child onClick={handleClick} />;
}
```

#### Lazy Loading
```typescript
// ❌ YAPMAYIN
import DirectionsModal from './DirectionsModal';  // Always in bundle

// ✅ YAPIN
const DirectionsModal = lazy(() => import('./DirectionsModal'));

// Usage:
<Suspense fallback={<LoadingSpinner />}>
  <DirectionsModal />
</Suspense>
```

---

### 7. Accessibility

**Her UI component için:**

```typescript
// ❌ YAPMAYIN
<div onClick={handleClick}>Click me</div>
<img src="icon.png" />
<div className="modal">

// ✅ YAPIN
<button onClick={handleClick} aria-label="Kategoriyi filtrele">
  Click me
</button>

<img src="icon.png" alt="Kategori ikonu" />

<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
```

**Keyboard navigation:**
```typescript
// Her interactive element tabIndex ve keyboard handler'a sahip olmalı
<div
  tabIndex={0}
  role="button"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
```

---

### 8. Code Organization

**Dosya yapısı:**

```
src/
├── components/          # UI Components
│   ├── Map/
│   │   ├── MapContainer.tsx      # Ana container
│   │   ├── POILayer.tsx          # POI logic
│   │   ├── NavigationLayer.tsx   # Navigation logic
│   │   └── MapControls.tsx       # Controls
│   └── Sidebar/
├── hooks/              # Custom hooks
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── services/           # API services
│   ├── cacheService.ts
│   └── routingService.ts
├── utils/              # Pure functions
│   ├── geoUtils.ts
│   ├── formatUtils.ts
│   └── validationUtils.ts
├── types/              # Type definitions
│   ├── core.types.ts
│   └── poi.types.ts
├── config/             # Configuration
│   ├── app.config.ts
│   └── categories.config.ts
└── i18n/               # Internationalization
    └── locales/
```

**Naming conventions:**
```typescript
// Components: PascalCase
const UserDashboard = () => {}

// Functions: camelCase
const calculateDistance = () => {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Types/Interfaces: PascalCase
interface UserData {}
type UserID = string;

// Files: kebab-case
// user-dashboard.tsx
// calculate-distance.ts
```

---

### 9. Magic Numbers

**ASLA hard-coded değer kullanmayın:**

```typescript
// ❌ YAPMAYIN
if (distance < 0.02) { ... }
setTimeout(() => {}, 2000);
const items = data.slice(0, 50);

// ✅ YAPIN
// src/config/app.config.ts
export const APP_CONFIG = {
  map: {
    NEARBY_THRESHOLD_KM: 0.02,
    MAX_ZOOM_LEVEL: 18,
  },
  animation: {
    MARKER_ANIMATION_DELAY_MS: 2000,
  },
  pagination: {
    ITEMS_PER_PAGE: 50,
  },
} as const;

// Usage:
if (distance < APP_CONFIG.map.NEARBY_THRESHOLD_KM) { ... }
setTimeout(() => {}, APP_CONFIG.animation.MARKER_ANIMATION_DELAY_MS);
const items = data.slice(0, APP_CONFIG.pagination.ITEMS_PER_PAGE);
```

---

### 10. Testing

**Her yeni function için test yazın:**

```typescript
// src/utils/geoUtils.ts
export const calculateDistance = (a: Coordinate, b: Coordinate): number => {
  // implementation
}

// src/utils/__tests__/geoUtils.test.ts
import { calculateDistance } from '../geoUtils';

describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    const result = calculateDistance([29.0, 41.0], [29.1, 41.1]);
    expect(result).toBeCloseTo(15.7, 1);
  });
  
  it('should return 0 for same coordinates', () => {
    const result = calculateDistance([29.0, 41.0], [29.0, 41.0]);
    expect(result).toBe(0);
  });
  
  it('should handle negative coordinates', () => {
    const result = calculateDistance([-10, -20], [-11, -21]);
    expect(result).toBeGreaterThan(0);
  });
});
```

---

## 🚨 CODE REVIEW CHECKLIST

**Her commit öncesi kontrol edin:**

```bash
# 1. Type safety
npm run build
# Sıfır type error olmalı

# 2. Linting
npm run lint
# Sıfır lint error olmalı

# 3. Tests
npm run test
# Tüm testler geçmeli

# 4. Bundle size
npm run build
# dist/ klasörü kontrol et, 350KB altında olmalı

# 5. Security scan
npm audit
# Sıfır high/critical vulnerability
```

---

## 📝 COMMIT MESSAGE FORMAT

```bash
# Format:
<type>(<scope>): <subject>

# Types:
feat:     # Yeni özellik
fix:      # Bug fix
refactor: # Kod iyileştirme (davranış değişikliği yok)
perf:     # Performance iyileştirme
style:    # Formatting (kod davranışı değişmez)
test:     # Test ekleme/değiştirme
docs:     # Dokümantasyon
chore:    # Build, dependencies, etc.

# Examples:
feat(map): add POI clustering for better performance
fix(sidebar): prevent crash on empty category filter
refactor(utils): extract duplicate distance calculation
perf(map): add useMemo to marker filtering
security(api): add rate limiting to OSRM calls
a11y(sidebar): add ARIA labels to category filters
```

---

## 🎯 YENİ COMPONENT OLUŞTURURKEN

**Template:**

```typescript
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from '@/i18n';
import type { PropsType } from './ComponentName.types';
import styles from './ComponentName.module.css';

/**
 * Component açıklaması
 * 
 * @example
 * <ComponentName prop1="value" prop2={123} />
 */
export const ComponentName = memo<PropsType>(({ 
  prop1, 
  prop2,
  onEvent,
}) => {
  const { t } = useTranslation();

  // Memoized values
  const computedValue = useMemo(() => {
    return heavyCalculation(prop1);
  }, [prop1]);

  // Callbacks
  const handleClick = useCallback(() => {
    onEvent?.(computedValue);
  }, [computedValue, onEvent]);

  return (
    <div className={styles.container}>
      <h2>{t('componentName.title')}</h2>
      <button 
        onClick={handleClick}
        aria-label={t('componentName.button.label')}
      >
        {t('componentName.button.text')}
      </button>
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

**Type dosyası:**

```typescript
// ComponentName.types.ts
export interface PropsType {
  prop1: string;
  prop2: number;
  onEvent?: (value: number) => void;
}
```

---

## 🔄 REFACTORING ÖNCELIKLERI

**Bir dosya şu durumdaysa hemen refactor edin:**

1. ❌ 300+ satır → Component'lere böl
2. ❌ 5+ state variable → Custom hook oluştur
3. ❌ 3+ useEffect → Mantıksal gruplara ayır
4. ❌ Duplicate code → Utility'ye taşı
5. ❌ Hard-coded strings → i18n'e taşı
6. ❌ Magic numbers → Config'e taşı
7. ❌ any type → Proper type ekle
8. ❌ Try-catch yok → Error handling ekle

---

## 🎨 CSS BEST PRACTICES

**Global styles yerine CSS Modules kullanın:**

- ❌ Global: `.button { color: red; }`
- ✅ Module: `ComponentName.module.css` içinde `.button { color: var(--primary-color); }`

**CSS Variables için:**
- Primary color: `--primary-color`
- Text color: `--text-color`
- Spacing: `--spacing-sm`, `--spacing-md`, `--spacing-lg`

**Responsive design:** Media queries kullanın (`max-width: 768px`)
**Dark mode:** `prefers-color-scheme: dark` media query

---

## ⚡ PERFORMANS HEDEFLERİ

**Her değişiklik sonrası kontrol:**

- Bundle size: < 350KB (gzipped < 120KB)
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 90

---

## 🔒 GÜVENLİK CHECKLİSTİ

**Her PR öncesi:**

- [ ] Sıfır `dangerouslySetInnerHTML` kullanımı
- [ ] Tüm user input sanitize edilmiş
- [ ] API rate limiting var
- [ ] URL whitelist kontrolü var
- [ ] Coordinate validation var
- [ ] CSP headers eklenmiş
- [ ] `npm audit` temiz
- [ ] Sensitive data localStorage'da yok

---

## ♿ ACCESSIBILITY CHECKLİSTİ

**Her UI component için:**

- [ ] Semantic HTML kullanılmış (button, nav, aside, etc.)
- [ ] ARIA labels eklenmiş
- [ ] Keyboard navigation çalışıyor (Tab, Enter, Escape)
- [ ] Focus indicators görünür
- [ ] Color contrast WCAG AA (4.5:1)
- [ ] Screen reader uyumlu
- [ ] Skip to content link var
- [ ] Live regions (aria-live) var

---

## 📦 YENİ DEPENDENCY EKLERKENː

**Önce sor:**

1. Gerçekten gerekli mi? (Bundle size +KB)
2. Alternatif native solution var mı?
3. Tree-shaking destekliyor mu?
4. Son 6 ayda update var mı?
5. Security issues var mı? (`npm audit`)
6. TypeScript support var mı?

**Eklerken:**

```bash
# Bundle size etki analizi
npm install <package>
npm run build
# dist/ klasörü boyutunu kontrol et
```

---

## 🌍 ÇOKLU DİL DESTEĞİ

**Her yeni metin için:**

```typescript
// ❌ YAPMAYIN
<h1>Kategoriler</h1>
<button>Ara</button>

// ✅ YAPIN
const { t } = useTranslation();
<h1>{t('sidebar.categories')}</h1>
<button>{t('common.search')}</button>
```

**Translation dosyası güncelle:**

```json
// src/i18n/locales/tr.json
{
  "sidebar": {
    "categories": "Kategoriler"
  },
  "common": {
    "search": "Ara"
  }
}

// src/i18n/locales/en.json
{
  "sidebar": {
    "categories": "Categories"
  },
  "common": {
    "search": "Search"
  }
}
```

**6 dil için tekrarla:** tr, en, de, fr, es, it

---

## 🔍 DEBUG TİPLERİ

```typescript
// Development mode logging
if (import.meta.env.DEV) {
  console.log('[DEBUG]', data);
}

// Production error tracking
if (import.meta.env.PROD) {
  errorReporter.log(error, context);
}

// Performance marking
if (import.meta.env.DEV) {
  performance.mark('operation-start');
  // ... operation
  performance.mark('operation-end');
  performance.measure('operation', 'operation-start', 'operation-end');
}
```

---

## 📊 METRIK TAKIP

**Her sprint sonunda:**

```bash
# Code quality
npm run lint
npm run test -- --coverage

# Bundle analysis
npm run build -- --report

# Performance
lighthouse http://localhost:5173 --view

# Accessibility
axe http://localhost:5173
```

**Hedef metrikler:**
- Test coverage: > 70%
- Type coverage: 100%
- Lint errors: 0
- Bundle size: < 350KB
- Lighthouse: > 90/100

---

## 🚀 DEPLOYMENT ÖNCESİ

**Final checklist:**

```bash
# 1. Build test
npm run build
npm run preview

# 2. Type check
npm run type-check

# 3. Tests
npm run test

# 4. E2E tests
npm run test:e2e

# 5. Security scan
npm audit

# 6. Bundle size check
ls -lh dist/assets/*.js

# 7. Lighthouse test
lighthouse http://localhost:4173 --view

# Hepsi ✅ ise deploy!
```

---

## ⚙️ OTOMATIK UYGULAMA

**Bu kurallar her zaman:**

1. ✅ **Component yazarken:** SOLID, Type Safety, A11y
2. ✅ **API call yaparken:** Error handling, Rate limiting
3. ✅ **State kullanırken:** useMemo, useCallback
4. ✅ **User input alırken:** Validation, Sanitization
5. ✅ **Text eklerken:** i18n sistemi
6. ✅ **Hard-coded değer görünce:** Config'e taşı
7. ✅ **Duplicate kod görünce:** DRY uygula
8. ✅ **300+ satır component görünce:** Böl

---

**Son Güncelleme:** 6 Kasım 2025  
**Versiyon:** 1.0.0  
**Durum:** Aktif
