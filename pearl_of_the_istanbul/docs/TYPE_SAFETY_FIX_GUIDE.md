# 🛡️ Type Safety İyileştirme Rehberi

**Proje:** Pearl of the Istanbul  
**Tarih:** 6 Kasım 2025  
**Kapsam:** TypeScript best practices ve strict typing

---

## 📋 İçindekiler

1. [Strict TypeScript Configuration](#1-strict-typescript-configuration)
2. [Type Definitions & Interfaces](#2-type-definitions--interfaces)
3. [Type Guards & Validation](#3-type-guards--validation)
4. [Generic Types & Utility Types](#4-generic-types--utility-types)
5. [Event System Type Safety](#5-event-system-type-safety)

---

## 1. Strict TypeScript Configuration

### ✅ tsconfig.json Optimization

**Dosya:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    
    /* Strict Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    /* Additional Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    
    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@config/*": ["src/config/*"]
    },
    
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

---

## 2. Type Definitions & Interfaces

### Core Types

**Dosya:** `src/types/core.types.ts`

```typescript
// Primitive branded types
export type UUID = string & { readonly brand: unique symbol };
export type Timestamp = number & { readonly brand: unique symbol };
export type Coordinate = readonly [longitude: number, latitude: number];

// Type creators
export const createUUID = (value: string): UUID => {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid UUID');
  }
  return value as UUID;
};

export const createTimestamp = (value: number = Date.now()): Timestamp => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Invalid timestamp');
  }
  return value as Timestamp;
};

export const createCoordinate = (lng: number, lat: number): Coordinate => {
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new Error(`Invalid coordinate: [${lng}, ${lat}]`);
  }
  return [lng, lat] as const;
};

// Utility types
export type NonEmptyArray<T> = [T, ...T[]];

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### POI Types (Strict)

**Dosya:** `src/types/poi.types.ts`

```typescript
import { Coordinate, UUID } from './core.types';

export const CATEGORY_KEYS = ['all', 'food', 'nature', 'culture', 'entertainment', 'other'] as const;
export type CategoryKey = typeof CATEGORY_KEYS[number];

export interface POI {
  readonly id: UUID;
  readonly name: string;
  readonly category: CategoryKey;
  readonly subcategory: string;
  readonly address: string;
  readonly description: string | null;
  readonly coordinates: Coordinate;
  readonly createdAt?: Timestamp;
  readonly updatedAt?: Timestamp;
}

export interface POIWithDistance extends POI {
  readonly distance: number; // kilometers
}

export interface POIFilter {
  readonly category?: CategoryKey;
  readonly subcategory?: string;
  readonly searchQuery?: string;
  readonly boundingBox?: BoundingBox;
}

export interface BoundingBox {
  readonly minLng: number;
  readonly maxLng: number;
  readonly minLat: number;
  readonly maxLat: number;
}

// Factory function
export const createPOI = (data: {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  address: string;
  description?: string;
  coordinates: [number, number];
}): POI => {
  if (!isCategoryKey(data.category)) {
    throw new Error(`Invalid category: ${data.category}`);
  }
  
  return {
    id: createUUID(data.id),
    name: data.name.trim(),
    category: data.category,
    subcategory: data.subcategory.trim(),
    address: data.address.trim(),
    description: data.description?.trim() || null,
    coordinates: createCoordinate(data.coordinates[0], data.coordinates[1]),
  };
};
```

---

## 3. Type Guards & Validation

### Type Guards

**Dosya:** `src/utils/typeGuards.ts`

```typescript
import { POI, CategoryKey, CATEGORY_KEYS } from '@/types/poi.types';
import { Coordinate } from '@/types/core.types';

// Category key guard
export const isCategoryKey = (value: unknown): value is CategoryKey => {
  return typeof value === 'string' && (CATEGORY_KEYS as readonly string[]).includes(value);
};

// Coordinate guard
export const isCoordinate = (value: unknown): value is Coordinate => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    value[0] >= -180 &&
    value[0] <= 180 &&
    value[1] >= -90 &&
    value[1] <= 90
  );
};

// POI guard
export const isPOI = (obj: unknown): obj is POI => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const poi = obj as Partial<POI>;
  
  return (
    typeof poi.id === 'string' &&
    typeof poi.name === 'string' &&
    typeof poi.category === 'string' &&
    isCategoryKey(poi.category) &&
    typeof poi.subcategory === 'string' &&
    typeof poi.address === 'string' &&
    (poi.description === null || typeof poi.description === 'string') &&
    isCoordinate(poi.coordinates)
  );
};

// Assert functions
export const assertIsPOI: (value: unknown) => asserts value is POI = (value) => {
  if (!isPOI(value)) {
    throw new TypeError('Value is not a valid POI');
  }
};

export const assertIsCoordinate: (value: unknown) => asserts value is Coordinate = (value) => {
  if (!isCoordinate(value)) {
    throw new TypeError(`Value is not a valid Coordinate: ${JSON.stringify(value)}`);
  }
};
```

### Runtime Validation

**Dosya:** `src/utils/validation.ts`

```typescript
import { z } from 'zod'; // npm install zod

// Zod schemas for runtime validation
export const CoordinateSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90)
]);

export const CategorySchema = z.enum(['all', 'food', 'nature', 'culture', 'entertainment', 'other']);

export const POISchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: CategorySchema,
  subcategory: z.string(),
  address: z.string().min(1),
  description: z.string().nullable(),
  coordinates: CoordinateSchema,
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export const POIArraySchema = z.array(POISchema);

// Validation functions
export const validatePOI = (data: unknown) => {
  return POISchema.safeParse(data);
};

export const validatePOIArray = (data: unknown) => {
  return POIArraySchema.safeParse(data);
};

// Type inference from schema
export type ValidatedPOI = z.infer<typeof POISchema>;
```

---

## 4. Generic Types & Utility Types

### API Response Types

**Dosya:** `src/types/api.types.ts`

```typescript
// Generic API response
export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  timestamp: number;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// Result type (Rust-like)
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Helper functions
export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Usage with type narrowing
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok === true;
};

export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return result.ok === false;
};
```

### Async State Type

**Dosya:** `src/types/async.types.ts`

```typescript
export type AsyncState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

// Type guards
export const isLoading = <T, E>(state: AsyncState<T, E>): state is { status: 'loading' } => {
  return state.status === 'loading';
};

export const isSuccess = <T, E>(state: AsyncState<T, E>): state is { status: 'success'; data: T } => {
  return state.status === 'success';
};

export const isError = <T, E>(state: AsyncState<T, E>): state is { status: 'error'; error: E } => {
  return state.status === 'error';
};

// Hook type
export interface UseAsyncReturn<T, E = Error> {
  state: AsyncState<T, E>;
  execute: () => Promise<void>;
  reset: () => void;
}
```

---

## 5. Event System Type Safety

### Type-safe Events

**Dosya:** `src/types/events.types.ts`

```typescript
import { POI } from './poi.types';
import { Coordinate } from './core.types';

// Event type definitions
export interface AppEventMap {
  'map:zoom-to-poi': POI;
  'map:center-changed': Coordinate;
  'map:poi-clicked': POI;
  'navigation:started': { destination: POI; userLocation: Coordinate };
  'navigation:ended': void;
  'sidebar:opened': void;
  'sidebar:closed': void;
}

export type AppEventType = keyof AppEventMap;

// Type-safe event dispatcher
export class TypedEventDispatcher {
  dispatch<K extends AppEventType>(
    type: K,
    detail: AppEventMap[K]
  ): void {
    window.dispatchEvent(
      new CustomEvent(type, { detail })
    );
  }
  
  addEventListener<K extends AppEventType>(
    type: K,
    listener: (event: CustomEvent<AppEventMap[K]>) => void
  ): void {
    window.addEventListener(type, listener as EventListener);
  }
  
  removeEventListener<K extends AppEventType>(
    type: K,
    listener: (event: CustomEvent<AppEventMap[K]>) => void
  ): void {
    window.removeEventListener(type, listener as EventListener);
  }
}

// Singleton instance
export const eventDispatcher = new TypedEventDispatcher();
```

### Type-safe Event Hook

**Dosya:** `src/hooks/useTypedEvent.ts`

```typescript
import { useEffect } from 'react';
import { AppEventType, AppEventMap, eventDispatcher } from '@/types/events.types';

export const useTypedEvent = <K extends AppEventType>(
  type: K,
  handler: (detail: AppEventMap[K]) => void,
  deps: React.DependencyList = []
): void => {
  useEffect(() => {
    const listener = (event: CustomEvent<AppEventMap[K]>) => {
      handler(event.detail);
    };
    
    eventDispatcher.addEventListener(type, listener);
    
    return () => {
      eventDispatcher.removeEventListener(type, listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
};

// Usage
const MyComponent = () => {
  useTypedEvent('map:poi-clicked', (poi) => {
    console.log(poi.name); // ✅ Type-safe: poi is POI
  });
  
  const handleClick = () => {
    eventDispatcher.dispatch('map:zoom-to-poi', somePOI); // ✅ Type-safe
  };
};
```

---

## 📊 Migration Checklist

- [ ] TypeScript strict mode aktif et
- [ ] Core types oluştur (UUID, Coordinate, Timestamp)
- [ ] POI types'ı branded types ile güçlendir
- [ ] Type guards ekle (isPOI, isCoordinate, etc.)
- [ ] Runtime validation (Zod) ekle
- [ ] Generic types kullan (Result, AsyncState)
- [ ] Event system type-safe yap
- [ ] Tüm `any` types kaldır
- [ ] Tüm implicit types explicit yap
- [ ] Return type annotations ekle

---

**Hazırlayan:** AI Code Analyzer  
**Tarih:** 6 Kasım 2025
