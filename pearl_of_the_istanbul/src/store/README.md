# 📁 store/ - Zustand State Yönetimi

Bu dizin, **Zustand** ile global state yönetimini içerir.

---

## 📂 Dizin Yapısı

```
store/
├── 📄 index.ts          # Barrel export
├── 📄 authStore.ts      # Authentication state
└── 📄 routeStore.ts     # Routes state
```

---

## 🤔 Neden Zustand?

| Özellik | Redux | Context API | Zustand |
|---------|-------|-------------|---------|
| Boilerplate | Çok | Az | Minimal |
| Bundle Size | ~12KB | 0KB | ~2KB |
| DevTools | ✅ | ❌ | ✅ |
| Persist | Plugin | Manuel | Middleware |
| Learning Curve | Yüksek | Düşük | Düşük |

Zustand'ın avantajları:
- Minimal API, öğrenmesi kolay
- Küçük bundle size
- TypeScript friendly
- Redux DevTools desteği
- Persist middleware built-in

---

## 🔐 authStore.ts
Kullanıcı oturum yönetimi.

### State Yapısı

```typescript
interface AuthState {
  user: User | null;           // Firebase User objesi
  isLoading: boolean;          // Login/logout işlemi sürüyor
  error: string | null;        // Hata mesajı
  isInitialized: boolean;      // İlk auth check tamamlandı

  // Actions
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void; // Returns unsubscribe
}
```

### Kullanım

```tsx
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { user, isLoading, signIn, logout } = useAuthStore();

  if (isLoading) return <LoadingSpinner />;

  return user ? (
    <div>
      <img src={user.photoURL} alt={user.displayName} />
      <span>{user.displayName}</span>
      <button onClick={logout}>Çıkış</button>
    </div>
  ) : (
    <button onClick={signIn}>Google ile Giriş</button>
  );
}
```

### Persistence

```typescript
persist(
  (set) => ({ ... }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      // Sadece temel bilgileri persist et
      user: state.user ? {
        uid: state.user.uid,
        displayName: state.user.displayName,
        email: state.user.email,
        photoURL: state.user.photoURL
      } : null
    })
  }
)
```

---

## 📍 routeStore.ts
Gezi rotaları state yönetimi.

### State Yapısı

```typescript
interface RouteState {
  // Rota oluşturma modu
  isCreatingRoute: boolean;
  selectedPoints: RoutePoint[];
  currentPOI: POI | null;
  routeTitle: string;
  routeDescription: string;
  selectedTags: string[];
  
  // Anonim işlem için
  guestId: string;

  // Rotalar listesi
  routes: Route[];
  popularRoutes: Route[];
  userRoutes: Route[];
  isLoadingRoutes: boolean;

  // Yorumlar
  comments: Record<string, RouteComment[]>;
  isLoadingComments: boolean;
  
  // === ACTIONS ===
  
  // Rota oluşturma
  startCreatingRoute: () => void;
  cancelCreatingRoute: () => void;
  addPoint: (poi: POI) => void;
  removePoint: (poiId: string) => void;
  updatePointRating: (poiId: string, rating: number) => void;
  updatePointComment: (poiId: string, comment: string) => void;
  updatePointPhoto: (poiId: string, photo: string | undefined) => void;
  reorderPoints: (fromIndex: number, toIndex: number) => void;
  setCurrentPOI: (poi: POI | null) => void;
  setRouteTitle: (title: string) => void;
  setRouteDescription: (description: string) => void;
  toggleTag: (tag: string) => void;
  
  // Rota kaydetme/yükleme
  saveRoute: (userId, userName, userPhoto?) => Promise<string>;
  loadRoutes: () => Promise<void>;
  loadPopularRoutes: () => Promise<void>;
  loadUserRoutes: (userId: string) => Promise<void>;
  
  // Oylama
  voteForRoute: (routeId: string, userId: string) => Promise<void>;
  unvoteRoute: (routeId: string, userId: string) => Promise<void>;
  
  // Silme
  userDeleteRoute: (routeId: string) => Promise<void>;

  // Yorumlar
  loadComments: (routeId: string) => Promise<void>;
  addRouteComment: (...) => Promise<void>;
  userDeleteComment: (routeId, commentId) => Promise<void>;
}
```

### Rota Etiketleri

```typescript
export const ROUTE_TAGS = [
  { key: 'romantic', label: 'Romantik', emoji: '💕' },
  { key: 'historical', label: 'Tarihi', emoji: '🏛️' },
  { key: 'food', label: 'Lezzet Turu', emoji: '🍽️' },
  { key: 'nature', label: 'Doğa', emoji: '🌳' },
  { key: 'art', label: 'Sanat', emoji: '🎨' },
  { key: 'adventure', label: 'Macera', emoji: '🎒' },
  { key: 'family', label: 'Aile', emoji: '👨‍👩‍👧‍👦' },
  { key: 'night', label: 'Gece Turu', emoji: '🌙' }
];
```

### Kullanım

```tsx
import { useRouteStore, ROUTE_TAGS } from '../store/routeStore';

function RouteCreation() {
  const {
    isCreatingRoute,
    selectedPoints,
    routeTitle,
    selectedTags,
    startCreatingRoute,
    addPoint,
    setRouteTitle,
    toggleTag,
    saveRoute
  } = useRouteStore();

  const handleSave = async () => {
    const routeId = await saveRoute(userId, userName, userPhoto);
    console.log('Rota kaydedildi:', routeId);
  };

  return (
    <div>
      <input 
        value={routeTitle}
        onChange={(e) => setRouteTitle(e.target.value)}
        placeholder="Rota başlığı"
      />
      
      <div className="tags">
        {ROUTE_TAGS.map(tag => (
          <button
            key={tag.key}
            onClick={() => toggleTag(tag.key)}
            className={selectedTags.includes(tag.key) ? 'selected' : ''}
          >
            {tag.emoji} {tag.label}
          </button>
        ))}
      </div>
      
      <div className="points">
        {selectedPoints.map((point, i) => (
          <div key={point.poiId}>
            {i + 1}. {point.poiName}
          </div>
        ))}
      </div>
      
      <button onClick={handleSave}>Kaydet</button>
    </div>
  );
}
```

---

## 📄 index.ts
Barrel export dosyası.

```typescript
export { useAuthStore } from './authStore';
export { useRouteStore, ROUTE_TAGS } from './routeStore';
```

### Import Kolaylığı

```tsx
// Tek import ile tüm store'lara erişim
import { useAuthStore, useRouteStore, ROUTE_TAGS } from '../store';
```

---

## 🔄 State Flow Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                      Component                               │
│   const { user, signIn } = useAuthStore();                  │
│   const { routes, loadRoutes } = useRouteStore();           │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │    authStore     │  │   routeStore     │
         │                  │  │                  │
         │  user: User      │  │  routes: Route[] │
         │  isLoading: bool │  │  selectedPoints  │
         │                  │  │  comments        │
         │  signIn()        │  │                  │
         │  logout()        │  │  saveRoute()     │
         │  initialize()    │  │  loadRoutes()    │
         └──────────────────┘  └──────────────────┘
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │   authService    │  │  routeService    │
         │   (Firebase)     │  │  (Firestore)     │
         └──────────────────┘  └──────────────────┘
                    │                   │
                    ▼                   ▼
         ┌────────────────────────────────────────┐
         │              Firebase Cloud            │
         └────────────────────────────────────────┘
```

---

## 🧪 Store Testing (Önerilen)

```typescript
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Store'u sıfırla
    useAuthStore.setState({ user: null, isLoading: false });
  });

  it('should set user on signIn', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.signIn();
    });
    
    expect(result.current.user).not.toBeNull();
  });
});
```

---

## ✅ Best Practices

1. **Selector Kullanımı**: Gereksiz re-render'ı önle
   ```tsx
   // ❌ Tüm state'i çeker
   const store = useAuthStore();
   
   // ✅ Sadece gereken parçaları çeker
   const user = useAuthStore((state) => state.user);
   ```

2. **Shallow Equality**: Object selector'larında shallow kullan
   ```tsx
   import { shallow } from 'zustand/shallow';
   
   const { user, isLoading } = useAuthStore(
     (state) => ({ user: state.user, isLoading: state.isLoading }),
     shallow
   );
   ```

3. **Immer Middleware**: Nested state güncellemeleri için
   ```tsx
   import { immer } from 'zustand/middleware/immer';
   ```
