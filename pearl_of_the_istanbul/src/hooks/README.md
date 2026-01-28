# 📁 hooks/ - Custom React Hooks

Bu dizin, yeniden kullanılabilir React hook'larını içerir.

---

## 📂 Dizin Yapısı

```
hooks/
├── 📄 useClickOutside.ts      # Dış tıklama algılama
├── 📄 useDebounce.ts          # Debounce değer
├── 📄 useFocusTrap.ts         # Modal focus trap
├── 📄 useKeyPress.ts          # Klavye tuşu dinleme
├── 📄 useLocalStorage.ts      # localStorage wrapper
└── 📄 useWalkingNavigation.ts # Yürüyüş navigasyonu
```

---

## 📄 Hook Detayları

### `useClickOutside.ts`
Bir elementin dışına tıklandığında callback çağırır.

```typescript
function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: () => void
): void
```

**Kullanım:**
```tsx
const menuRef = useRef<HTMLDivElement>(null);
const [isOpen, setIsOpen] = useState(false);

useClickOutside(menuRef, () => {
  if (isOpen) setIsOpen(false);
});

return (
  <div ref={menuRef}>
    {isOpen && <Menu />}
  </div>
);
```

**Use Cases:**
- Dropdown menü kapatma
- Modal dışı tıklama
- Popup kapatma

---

### `useDebounce.ts`
Değer değişikliklerini geciktirir (debounce).

```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Kullanım:**
```tsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  // API çağrısı sadece kullanıcı 300ms yazmayı bırakınca yapılır
  searchAPI(debouncedSearch);
}, [debouncedSearch]);
```

**Use Cases:**
- Arama kutusu
- Form auto-save
- API rate limiting

---

### `useFocusTrap.ts`
Modal/dialog içinde focus'u hapsetir (accessibility).

```typescript
function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
): void
```

**Kullanım:**
```tsx
const modalRef = useRef<HTMLDivElement>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

useFocusTrap(modalRef, isModalOpen);

return (
  <dialog ref={modalRef} open={isModalOpen}>
    <button>First focusable</button>
    <input type="text" />
    <button onClick={() => setIsModalOpen(false)}>Close</button>
  </dialog>
);
```

**Davranış:**
- Tab tuşu modal içinde döner
- Shift+Tab geriye gider
- Modal dışındaki elementlere focus geçmez

---

### `useKeyPress.ts`
Belirli klavye tuşuna basıldığında callback çağırır.

```typescript
function useKeyPress(
  targetKey: string,
  callback: () => void,
  options?: { 
    preventDefault?: boolean;
    stopPropagation?: boolean;
  }
): void
```

**Kullanım:**
```tsx
// Escape tuşu ile modal kapat
useKeyPress('Escape', () => {
  setIsModalOpen(false);
});

// Ctrl+S ile kaydet
useKeyPress('s', () => {
  if (event.ctrlKey) {
    saveDocument();
  }
}, { preventDefault: true });
```

**Use Cases:**
- Modal Escape ile kapatma
- Keyboard shortcuts
- Oyun kontrolleri

---

### `useLocalStorage.ts`
localStorage ile senkronize state.

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void]
```

**Kullanım:**
```tsx
const [theme, setTheme] = useLocalStorage('theme', 'light');
const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);

// Değer değişince otomatik localStorage'a yazılır
setTheme('dark');

// Sayfa yenilendiğinde değer korunur
console.log(theme); // 'dark'
```

**Özellikler:**
- JSON serialization otomatik
- SSR safe (window check)
- Type-safe generic API

---

### `useWalkingNavigation.ts`
Yürüyüş navigasyonu için kapsamlı hook.

```typescript
interface NavigationState {
  isNavigating: boolean;
  route: RouteData | null;
  currentStep: RouteStep | null;
  currentStepIndex: number;
  progress: number;          // 0-100
  distanceToNextStep: number;
  userLocation: [number, number] | null;
}

function useWalkingNavigation(
  destination: [number, number]
): {
  state: NavigationState;
  startNavigation: () => Promise<void>;
  stopNavigation: () => void;
}
```

**Kullanım:**
```tsx
const { state, startNavigation, stopNavigation } = useWalkingNavigation([29.025, 41.030]);

useEffect(() => {
  if (state.isNavigating) {
    console.log('Current step:', state.currentStep?.instruction);
    console.log('Progress:', state.progress, '%');
  }
}, [state]);

return (
  <div>
    {state.isNavigating ? (
      <>
        <p>{state.currentStep?.instruction}</p>
        <p>Kalan: {state.distanceToNextStep}m</p>
        <progress value={state.progress} max="100" />
        <button onClick={stopNavigation}>Durdur</button>
      </>
    ) : (
      <button onClick={startNavigation}>Navigasyonu Başlat</button>
    )}
  </div>
);
```

**Özellikler:**
- OSRM API entegrasyonu
- Gerçek zamanlı konum takibi
- Adım tamamlama algılama
- Hedefe varış kontrolü
- Progress hesaplama

---

## 🧪 Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  jest.useFakeTimers();

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Henüz değişmedi

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated'); // Şimdi değişti
  });
});
```

---

## 📝 Custom Hook Yazma Rehberi

### Temel Kurallar
1. `use` prefix'i ile başla
2. Diğer hook'ları kullanabilir
3. Değer veya tuple döndür
4. Side effect'ler için cleanup yap

### Template

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseMyHookOptions {
  option1?: boolean;
  option2?: number;
}

interface UseMyHookReturn {
  value: string;
  setValue: (v: string) => void;
  reset: () => void;
}

export function useMyHook(
  initialValue: string,
  options: UseMyHookOptions = {}
): UseMyHookReturn {
  const { option1 = true, option2 = 100 } = options;
  
  const [value, setValue] = useState(initialValue);
  
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  // Side effect
  useEffect(() => {
    // Setup
    const handler = () => { ... };
    window.addEventListener('event', handler);
    
    // Cleanup
    return () => {
      window.removeEventListener('event', handler);
    };
  }, [option1, option2]);
  
  return { value, setValue, reset };
}
```

---

## ✅ Best Practices

1. **Single Responsibility**: Her hook tek bir iş yapmalı
2. **Generic Types**: Mümkünse generic kullan
3. **Cleanup**: useEffect'te cleanup unutma
4. **Memoization**: useCallback/useMemo kullan
5. **Dependencies**: Dependency array'e dikkat et
