# 🏗️ SOLID Principles İhlalleri Çözüm Rehberi

**Proje:** Pearl of the Istanbul  
**Tarih:** 6 Kasım 2025  
**Kapsam:** SOLID principles ihlallerinin adım adım çözümü

---

## 📋 İçindekiler

1. [Single Responsibility Principle (SRP) Çözümü](#1-single-responsibility-principle-srp)
2. [Open/Closed Principle (OCP) Çözümü](#2-openclosed-principle-ocp)
3. [Liskov Substitution Principle (LSP) Çözümü](#3-liskov-substitution-principle-lsp)
4. [Interface Segregation Principle (ISP) Çözümü](#4-interface-segregation-principle-isp)
5. [Dependency Inversion Principle (DIP) Çözümü](#5-dependency-inversion-principle-dip)

---

## 1. Single Responsibility Principle (SRP)

### 🔴 Problem: Map.tsx - Multiple Responsibilities

**Mevcut Durum:**
- Map.tsx: 1200+ satır
- 10+ farklı sorumluluk bir arada

### ✅ Çözüm: Component Separation

#### Adım 1: Yeni Dosya Yapısı Oluştur

```
src/
  components/
    Map/
      index.tsx                 # Main container
      MapContainer.tsx          # Core map rendering
      MapControls.tsx           # Style & language controls
      POILayer.tsx              # POI markers management
      NavigationLayer.tsx       # Walking route rendering
      UserLocationMarker.tsx    # User location display
      hooks/
        useMapInitialization.ts # Map setup logic
        useMapEvents.ts         # Event handling
        usePOIMarkers.ts        # Marker management
      types/
        map.types.ts            # Map-related types
```

#### Adım 2: MapContainer Component

**Dosya:** `src/components/Map/MapContainer.tsx`

```typescript
import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapContainerProps {
  style: MapStyle;
  center: [number, number];
  zoom: number;
  onMapLoad?: (map: maplibregl.Map) => void;
  children?: React.ReactNode;
}

export const MapContainer = ({ 
  style, 
  center, 
  zoom, 
  onMapLoad,
  children 
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style.definition,
      center,
      zoom,
      maxZoom: 22,
      minZoom: 10,
    });

    map.current.on('load', () => {
      if (map.current && onMapLoad) {
        onMapLoad(map.current);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [style.definition, center, zoom, onMapLoad]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {children}
    </div>
  );
};
```

#### Adım 3: MapControls Component

**Dosya:** `src/components/Map/MapControls.tsx`

```typescript
import { useState } from 'react';
import { MapStyle, Language } from './types/map.types';
import FlagIcon from '../FlagIcon';

interface MapControlsProps {
  currentStyle: MapStyle;
  currentLanguage: Language;
  onStyleChange: (style: MapStyle) => void;
  onLanguageChange: (language: Language) => void;
}

export const MapControls = ({
  currentStyle,
  currentLanguage,
  onStyleChange,
  onLanguageChange,
}: MapControlsProps) => {
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  return (
    <div className="map-controls">
      {/* Language Picker */}
      <LanguagePicker
        current={currentLanguage}
        isOpen={showLanguagePicker}
        onToggle={() => setShowLanguagePicker(!showLanguagePicker)}
        onChange={onLanguageChange}
      />

      {/* Style Picker */}
      <StylePicker
        current={currentStyle}
        isOpen={showStylePicker}
        onToggle={() => setShowStylePicker(!showStylePicker)}
        onChange={onStyleChange}
      />
    </div>
  );
};

// Separate sub-components
const LanguagePicker = ({ /* ... */ }) => {
  // Language picker implementation
};

const StylePicker = ({ /* ... */ }) => {
  // Style picker implementation
};
```

#### Adım 4: POILayer Component

**Dosya:** `src/components/Map/POILayer.tsx`

```typescript
import { useEffect } from 'react';
import { usePOIMarkers } from './hooks/usePOIMarkers';
import { POI } from '@/types/poi.types';

interface POILayerProps {
  map: maplibregl.Map | null;
  pois: POI[];
  selectedPOI?: string | null;
  onPOIClick: (poi: POI) => void;
  isWalkingMode?: boolean;
  walkingDestination?: POI | null;
}

export const POILayer = ({
  map,
  pois,
  selectedPOI,
  onPOIClick,
  isWalkingMode,
  walkingDestination,
}: POILayerProps) => {
  const { addMarkers, removeMarkers, highlightMarker } = usePOIMarkers(map);

  useEffect(() => {
    if (!map || !pois.length) return;

    // Filter POIs based on walking mode
    const visiblePOIs = isWalkingMode && walkingDestination
      ? pois.filter(poi => poi.id === walkingDestination.id)
      : pois;

    addMarkers(visiblePOIs, onPOIClick);

    return () => removeMarkers();
  }, [map, pois, isWalkingMode, walkingDestination, addMarkers, removeMarkers, onPOIClick]);

  useEffect(() => {
    if (selectedPOI) {
      highlightMarker(selectedPOI);
    }
  }, [selectedPOI, highlightMarker]);

  return null; // This is a logic component
};
```

#### Adım 5: NavigationLayer Component

**Dosya:** `src/components/Map/NavigationLayer.tsx`

```typescript
import { useEffect } from 'react';
import { useRouteDrawing } from './hooks/useRouteDrawing';
import { RouteGeometry, RouteStep } from '@/types/navigation.types';

interface NavigationLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  routeGeometry?: RouteGeometry;
  userLocation?: [number, number];
  steps?: RouteStep[];
  categoryColor: string;
}

export const NavigationLayer = ({
  map,
  isActive,
  routeGeometry,
  userLocation,
  steps,
  categoryColor,
}: NavigationLayerProps) => {
  const { drawRoute, clearRoute, updateUserLocation } = useRouteDrawing(map, categoryColor);

  useEffect(() => {
    if (!map || !isActive) {
      clearRoute();
      return;
    }

    if (routeGeometry && userLocation && steps) {
      drawRoute(routeGeometry, userLocation, steps);
    }

    return () => clearRoute();
  }, [map, isActive, routeGeometry, userLocation, steps, drawRoute, clearRoute]);

  useEffect(() => {
    if (isActive && userLocation) {
      updateUserLocation(userLocation);
    }
  }, [isActive, userLocation, updateUserLocation]);

  return null; // Logic component
};
```

#### Adım 6: Main Map Component (Orchestrator)

**Dosya:** `src/components/Map/index.tsx`

```typescript
import { useState, useCallback } from 'react';
import { MapContainer } from './MapContainer';
import { MapControls } from './MapControls';
import { POILayer } from './POILayer';
import { NavigationLayer } from './NavigationLayer';
import { useMapInitialization } from './hooks/useMapInitialization';
import { MapProps } from './types/map.types';

export const Map = ({
  language,
  onLanguageChange,
  selectedCategory,
  sidebarPOIs,
  isWalkingMode,
  walkingDestination,
  onNavigationStart,
  onNavigationEnd,
}: MapProps) => {
  const [currentStyle, setCurrentStyle] = useState('voyager');
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);

  const { map, isLoaded } = useMapInitialization({
    style: currentStyle,
    onLoad: (mapInstance) => {
      // Map initialization logic
    },
  });

  const handlePOIClick = useCallback((poi: POI) => {
    setSelectedPOI(poi.id);
    // Handle POI click logic
  }, []);

  return (
    <MapContainer
      style={MAP_STYLES[currentStyle]}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      onMapLoad={setMap}
    >
      {/* Controls */}
      <MapControls
        currentStyle={currentStyle}
        currentLanguage={language}
        onStyleChange={setCurrentStyle}
        onLanguageChange={onLanguageChange}
      />

      {/* POI Layer */}
      {isLoaded && (
        <POILayer
          map={map}
          pois={sidebarPOIs || []}
          selectedPOI={selectedPOI}
          onPOIClick={handlePOIClick}
          isWalkingMode={isWalkingMode}
          walkingDestination={walkingDestination}
        />
      )}

      {/* Navigation Layer */}
      {isLoaded && (
        <NavigationLayer
          map={map}
          isActive={isWalkingMode}
          routeGeometry={routeGeometry}
          userLocation={userLocation}
          steps={routeSteps}
          categoryColor={categoryColor}
        />
      )}
    </MapContainer>
  );
};
```

#### Adım 7: Custom Hooks

**Dosya:** `src/components/Map/hooks/usePOIMarkers.ts`

```typescript
import { useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { POI } from '@/types/poi.types';
import { createMarkerElement } from '@/utils/markerUtils';

export const usePOIMarkers = (map: maplibregl.Map | null) => {
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const addMarkers = useCallback(
    (pois: POI[], onPOIClick: (poi: POI) => void) => {
      if (!map) return;

      // Remove existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();

      // Add new markers
      pois.forEach(poi => {
        const element = createMarkerElement(poi);
        
        element.addEventListener('click', () => onPOIClick(poi));

        const marker = new maplibregl.Marker({ element, anchor: 'bottom' })
          .setLngLat(poi.coordinates)
          .addTo(map);

        markersRef.current.set(poi.id, marker);
      });
    },
    [map]
  );

  const removeMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();
  }, []);

  const highlightMarker = useCallback((poiId: string) => {
    const marker = markersRef.current.get(poiId);
    if (marker) {
      const element = marker.getElement();
      element.classList.add('marker-highlighted');
      
      setTimeout(() => {
        element.classList.remove('marker-highlighted');
      }, 2000);
    }
  }, []);

  return { addMarkers, removeMarkers, highlightMarker };
};
```

---

## 2. Open/Closed Principle (OCP)

### 🔴 Problem: Hard-coded Category System

**Mevcut Durum:**
- 100+ satırlık hard-coded icon mapping
- Switch-case blokları
- Yeni kategori eklemek için kod değişikliği gerekli

### ✅ Çözüm: Plugin-based Category Registry

#### Adım 1: Category Configuration System

**Dosya:** `src/config/categories/types.ts`

```typescript
export interface CategoryConfig {
  key: string;
  icon: string;
  color: string;
  keywords: string[];
  subcategories: SubcategoryConfig[];
}

export interface SubcategoryConfig {
  key: string;
  icon: string;
  keywords: string[];
}

export interface CategoryMatcher {
  matches(subcategory: string): boolean;
}
```

#### Adım 2: Category Registry

**Dosya:** `src/config/categories/registry.ts`

```typescript
import { CategoryConfig, CategoryMatcher } from './types';

class CategoryRegistry {
  private categories = new Map<string, CategoryConfig>();
  private matchers = new Map<string, CategoryMatcher>();

  register(config: CategoryConfig, matcher?: CategoryMatcher): void {
    this.categories.set(config.key, config);
    
    if (matcher) {
      this.matchers.set(config.key, matcher);
    } else {
      // Default keyword matcher
      this.matchers.set(config.key, new KeywordMatcher(config.keywords));
    }
  }

  getCategory(key: string): CategoryConfig | undefined {
    return this.categories.get(key);
  }

  getAllCategories(): CategoryConfig[] {
    return Array.from(this.categories.values());
  }

  findSubcategoryIcon(category: string, subcategory: string): string {
    const config = this.categories.get(category);
    if (!config) return '📍';

    // Find matching subcategory
    for (const subcat of config.subcategories) {
      if (this.matchesKeywords(subcategory, subcat.keywords)) {
        return subcat.icon;
      }
    }

    return config.icon; // Fallback to category icon
  }

  private matchesKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }
}

// Singleton instance
export const categoryRegistry = new CategoryRegistry();

// Keyword matcher implementation
class KeywordMatcher implements CategoryMatcher {
  constructor(private keywords: string[]) {}

  matches(subcategory: string): boolean {
    const lower = subcategory.toLowerCase();
    return this.keywords.some(keyword => 
      lower.includes(keyword.toLowerCase())
    );
  }
}
```

#### Adım 3: Category Definitions

**Dosya:** `src/config/categories/definitions/food.category.ts`

```typescript
import { CategoryConfig } from '../types';

export const foodCategory: CategoryConfig = {
  key: 'food',
  icon: '🍽️',
  color: '#EF4444',
  keywords: ['yemek', 'food', 'restaurant'],
  subcategories: [
    {
      key: 'cafe',
      icon: '☕',
      keywords: ['kafe', 'cafe', 'kahve', 'coffee'],
    },
    {
      key: 'restaurant',
      icon: '🍽️',
      keywords: ['restoran', 'restaurant', 'lokanta'],
    },
    {
      key: 'bakery',
      icon: '🥖',
      keywords: ['fırın', 'pastane', 'bakery', 'tatlı'],
    },
    {
      key: 'fastfood',
      icon: '🍔',
      keywords: ['fast food', 'hamburger', 'burger', 'döner'],
    },
  ],
};
```

**Dosya:** `src/config/categories/definitions/nature.category.ts`

```typescript
export const natureCategory: CategoryConfig = {
  key: 'nature',
  icon: '🌳',
  color: '#10B981',
  keywords: ['doğa', 'nature', 'park'],
  subcategories: [
    {
      key: 'park',
      icon: '🌳',
      keywords: ['park', 'bahçe', 'garden', 'yeşil alan'],
    },
    {
      key: 'coastal',
      icon: '🏖️',
      keywords: ['sahil', 'beach', 'plaj', 'boğaz'],
    },
    {
      key: 'sports',
      icon: '⚽',
      keywords: ['spor', 'sports', 'fitness', 'gym'],
    },
  ],
};
```

#### Adım 4: Registry Setup

**Dosya:** `src/config/categories/index.ts`

```typescript
import { categoryRegistry } from './registry';
import { foodCategory } from './definitions/food.category';
import { natureCategory } from './definitions/nature.category';
import { cultureCategory } from './definitions/culture.category';
import { entertainmentCategory } from './definitions/entertainment.category';
import { otherCategory } from './definitions/other.category';

// Register all categories
export function setupCategories(): void {
  categoryRegistry.register(foodCategory);
  categoryRegistry.register(natureCategory);
  categoryRegistry.register(cultureCategory);
  categoryRegistry.register(entertainmentCategory);
  categoryRegistry.register(otherCategory);
}

// Export for use
export { categoryRegistry };
export * from './types';
```

#### Adım 5: Usage in Components

**Dosya:** `src/components/Map/utils/iconUtils.ts`

```typescript
import { categoryRegistry } from '@/config/categories';

export const getIconForPOI = (category: string, subcategory: string): string => {
  return categoryRegistry.findSubcategoryIcon(category, subcategory);
};

export const getCategoryColor = (category: string): string => {
  const config = categoryRegistry.getCategory(category);
  return config?.color || '#6B7280';
};
```

#### Adım 6: Yeni Kategori Ekleme (Kod değişikliği YOK!)

**Dosya:** `src/config/categories/definitions/shopping.category.ts`

```typescript
// Yeni kategori - mevcut kodu değiştirmeden ekleniyor!
export const shoppingCategory: CategoryConfig = {
  key: 'shopping',
  icon: '🛍️',
  color: '#FF6B9D',
  keywords: ['alışveriş', 'shopping', 'market'],
  subcategories: [
    {
      key: 'mall',
      icon: '🏬',
      keywords: ['avm', 'mall', 'alışveriş merkezi'],
    },
    {
      key: 'market',
      icon: '🛒',
      keywords: ['market', 'süpermarket', 'supermarket'],
    },
  ],
};

// Register
categoryRegistry.register(shoppingCategory);
```

---

## 3. Liskov Substitution Principle (LSP)

### 🔴 Problem: POI Interface Duplication

**Mevcut Durum:**
- Her dosyada farklı POI tanımı
- Type substitution güvenli değil

### ✅ Çözüm: Shared Type System

#### Adım 1: Core Types

**Dosya:** `src/types/core.types.ts`

```typescript
// Core types - tüm projede kullanılacak
export type Coordinate = [longitude: number, latitude: number];

export type UUID = string;

export type Timestamp = number;
```

#### Adım 2: POI Types

**Dosya:** `src/types/poi.types.ts`

```typescript
import { Coordinate, UUID } from './core.types';
import { CategoryKey } from '@/config/categories';

export interface POI {
  id: UUID;
  name: string;
  category: CategoryKey;
  subcategory: string;
  address: string;
  description?: string;
  coordinates: Coordinate;
}

export interface POIWithDistance extends POI {
  distance: number; // in kilometers
}

export interface POIFilter {
  category?: CategoryKey;
  subcategory?: string;
  searchQuery?: string;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

// Type guards
export const isPOI = (obj: unknown): obj is POI => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'category' in obj &&
    'coordinates' in obj &&
    Array.isArray((obj as POI).coordinates) &&
    (obj as POI).coordinates.length === 2
  );
};
```

#### Adım 3: Navigation Types

**Dosya:** `src/types/navigation.types.ts`

```typescript
import { Coordinate } from './core.types';

export interface RouteGeometry {
  type: 'LineString';
  coordinates: Coordinate[];
}

export interface RouteManeuver {
  type: 'turn' | 'arrive' | 'depart' | 'continue';
  modifier?: 'left' | 'right' | 'slight left' | 'slight right' | 'sharp left' | 'sharp right';
  location: Coordinate;
}

export interface RouteStep {
  distance: number; // meters
  duration: number; // seconds
  instruction: string;
  maneuver: RouteManeuver;
  location: Coordinate;
}

export interface RouteData {
  distance: number; // total meters
  duration: number; // total seconds
  geometry: RouteGeometry;
  steps: RouteStep[];
}
```

#### Adım 4: Component Props

**Dosya:** `src/types/component.types.ts`

```typescript
import { POI } from './poi.types';
import { LanguageKey } from '@/config/languages';

// Base props that extend from POI
export interface POIComponentProps {
  poi: POI;
  language: LanguageKey;
}

export interface POIListProps extends POIComponentProps {
  pois: POI[];
  onPOIClick?: (poi: POI) => void;
}

// Liskov Substitution: Derived types can be used anywhere base type is expected
export interface InteractivePOIProps extends POIComponentProps {
  onClick?: () => void;
  onNavigate?: () => void;
}
```

#### Adım 5: Usage Example

```typescript
// ✅ Type-safe substitution
const renderPOI = (poi: POI) => {
  console.log(poi.name);
};

const poiWithDistance: POIWithDistance = {
  id: '123',
  name: 'Test',
  category: 'food',
  subcategory: 'restaurant',
  address: 'Address',
  coordinates: [29.0, 41.0],
  distance: 1.5,
};

// ✅ LSP: POIWithDistance can be used as POI
renderPOI(poiWithDistance); // Works!

// ✅ Type guard
if (isPOI(unknownData)) {
  renderPOI(unknownData); // Type-safe
}
```

---

## 4. Interface Segregation Principle (ISP)

### 🔴 Problem: Fat MapProps Interface

**Mevcut Durum:**
- 13 props
- Farklı concerns bir arada

### ✅ Çözüm: Interface Segregation + Context

#### Adım 1: Segregated Interfaces

**Dosya:** `src/types/map-props.types.ts`

```typescript
import { POI } from './poi.types';
import { CategoryKey } from '@/config/categories';
import { LanguageKey } from '@/config/languages';

// Language concern
export interface MapLanguageProps {
  language: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
}

// POI concern
export interface MapPOIProps {
  selectedCategory: CategoryKey;
  visiblePOIs: POI[];
  onPOIClick?: (poi: POI) => void;
  onPOILoad?: (pois: POI[]) => void;
}

// Navigation concern
export interface MapNavigationProps {
  isNavigating: boolean;
  destination: POI | null;
  onNavigationStart: (poi: POI) => void;
  onNavigationEnd: () => void;
}

// Style concern
export interface MapStyleProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

// Composite (if needed)
export interface MapProps 
  extends MapLanguageProps, 
          MapPOIProps, 
          MapNavigationProps, 
          MapStyleProps {}
```

#### Adım 2: Context Pattern (Better Solution)

**Dosya:** `src/contexts/MapContext.tsx`

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { POI } from '@/types/poi.types';
import { CategoryKey } from '@/config/categories';

interface MapContextValue {
  // POI state
  visiblePOIs: POI[];
  selectedCategory: CategoryKey;
  setVisiblePOIs: (pois: POI[]) => void;
  setSelectedCategory: (category: CategoryKey) => void;
  
  // Map state
  map: maplibregl.Map | null;
  setMap: (map: maplibregl.Map) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [visiblePOIs, setVisiblePOIs] = useState<POI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  return (
    <MapContext.Provider
      value={{
        visiblePOIs,
        selectedCategory,
        setVisiblePOIs,
        setSelectedCategory,
        map,
        setMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within MapProvider');
  }
  return context;
};
```

**Dosya:** `src/contexts/NavigationContext.tsx`

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { POI } from '@/types/poi.types';

interface NavigationContextValue {
  isNavigating: boolean;
  destination: POI | null;
  startNavigation: (poi: POI) => void;
  endNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState<POI | null>(null);

  const startNavigation = (poi: POI) => {
    setIsNavigating(true);
    setDestination(poi);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setDestination(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        isNavigating,
        destination,
        startNavigation,
        endNavigation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
```

#### Adım 3: Clean Component Usage

```typescript
// Map component - SADECE ihtiyacı olan context'i kullanır
export const MapContainer = () => {
  const { map, setMap } = useMapContext();
  // Only map-related logic
};

export const POILayer = () => {
  const { visiblePOIs, selectedCategory } = useMapContext();
  const { onPOIClick } = usePOIActions();
  // Only POI-related logic
};

export const NavigationLayer = () => {
  const { isNavigating, destination } = useNavigation();
  // Only navigation-related logic
};
```

---

## 5. Dependency Inversion Principle (DIP)

### 🔴 Problem: Direct API Dependencies

**Mevcut Durum:**
- OSRM'e hard-coded bağımlılık
- Test edilemez
- Provider değiştiremezsin

### ✅ Çözüm: Abstraction Layer

#### Adım 1: Routing Provider Interface

**Dosya:** `src/services/routing/types.ts`

```typescript
import { Coordinate } from '@/types/core.types';
import { RouteData } from '@/types/navigation.types';

export interface RouteOptions {
  mode?: 'walking' | 'driving' | 'cycling';
  alternatives?: boolean;
  steps?: boolean;
}

export interface RoutingProvider {
  getName(): string;
  getRoute(
    start: Coordinate,
    end: Coordinate,
    options?: RouteOptions
  ): Promise<RouteData | null>;
}
```

#### Adım 2: OSRM Implementation

**Dosya:** `src/services/routing/providers/OSRMProvider.ts`

```typescript
import { RoutingProvider, RouteOptions } from '../types';
import { Coordinate } from '@/types/core.types';
import { RouteData } from '@/types/navigation.types';

export class OSRMProvider implements RoutingProvider {
  private baseURL: string;

  constructor(baseURL: string = 'https://router.project-osrm.org') {
    this.baseURL = baseURL;
  }

  getName(): string {
    return 'OSRM';
  }

  async getRoute(
    start: Coordinate,
    end: Coordinate,
    options: RouteOptions = {}
  ): Promise<RouteData | null> {
    try {
      const mode = options.mode || 'walking';
      const url = this.buildURL(start, end, mode, options);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        return null;
      }
      
      return this.parseOSRMResponse(data.routes[0]);
    } catch (error) {
      console.error('OSRM routing error:', error);
      return null;
    }
  }

  private buildURL(
    start: Coordinate,
    end: Coordinate,
    mode: string,
    options: RouteOptions
  ): string {
    const profile = mode === 'driving' ? 'car' : 'foot';
    const baseUrl = `${this.baseURL}/route/v1/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}`;
    
    const params = new URLSearchParams({
      steps: String(options.steps !== false),
      geometries: 'geojson',
      overview: 'full',
    });
    
    if (options.alternatives) {
      params.set('alternatives', 'true');
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  private parseOSRMResponse(route: any): RouteData {
    // OSRM response parsing logic
    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps: route.legs[0].steps.map((step: any) => ({
        distance: step.distance,
        duration: step.duration,
        instruction: this.formatInstruction(step),
        maneuver: step.maneuver,
        location: step.maneuver.location,
      })),
    };
  }

  private formatInstruction(step: any): string {
    // Instruction formatting logic
    return step.name || 'Continue';
  }
}
```

#### Adım 3: Google Maps Implementation

**Dosya:** `src/services/routing/providers/GoogleMapsProvider.ts`

```typescript
import { RoutingProvider, RouteOptions } from '../types';
import { Coordinate } from '@/types/core.types';
import { RouteData } from '@/types/navigation.types';

export class GoogleMapsProvider implements RoutingProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return 'Google Maps';
  }

  async getRoute(
    start: Coordinate,
    end: Coordinate,
    options: RouteOptions = {}
  ): Promise<RouteData | null> {
    try {
      const url = this.buildURL(start, end, options);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.routes.length) {
        return null;
      }
      
      return this.parseGoogleResponse(data.routes[0]);
    } catch (error) {
      console.error('Google Maps routing error:', error);
      return null;
    }
  }

  private buildURL(start: Coordinate, end: Coordinate, options: RouteOptions): string {
    const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    
    const params = new URLSearchParams({
      origin: `${start[1]},${start[0]}`,
      destination: `${end[1]},${end[0]}`,
      mode: options.mode || 'walking',
      key: this.apiKey,
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  private parseGoogleResponse(route: any): RouteData {
    // Google Maps response parsing
    return {
      distance: route.legs[0].distance.value,
      duration: route.legs[0].duration.value,
      geometry: this.decodePolyline(route.overview_polyline.points),
      steps: route.legs[0].steps.map((step: any) => ({
        distance: step.distance.value,
        duration: step.duration.value,
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        maneuver: {
          type: step.maneuver || 'continue',
          location: [step.start_location.lng, step.start_location.lat],
        },
        location: [step.start_location.lng, step.start_location.lat],
      })),
    };
  }

  private decodePolyline(encoded: string): any {
    // Polyline decoding logic
    // ...
  }
}
```

#### Adım 4: Routing Service (Dependency Injection)

**Dosya:** `src/services/routing/RoutingService.ts`

```typescript
import { RoutingProvider, RouteOptions } from './types';
import { Coordinate } from '@/types/core.types';
import { RouteData } from '@/types/navigation.types';

export class RoutingService {
  private provider: RoutingProvider;

  constructor(provider: RoutingProvider) {
    this.provider = provider;
  }

  // Dependency Injection: Provider değiştirilebilir
  setProvider(provider: RoutingProvider): void {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.getName();
  }

  async getWalkingRoute(
    start: Coordinate,
    end: Coordinate
  ): Promise<RouteData | null> {
    return this.provider.getRoute(start, end, { mode: 'walking', steps: true });
  }

  async getDrivingRoute(
    start: Coordinate,
    end: Coordinate
  ): Promise<RouteData | null> {
    return this.provider.getRoute(start, end, { mode: 'driving', steps: true });
  }
}
```

#### Adım 5: Factory Pattern

**Dosya:** `src/services/routing/factory.ts`

```typescript
import { RoutingService } from './RoutingService';
import { OSRMProvider } from './providers/OSRMProvider';
import { GoogleMapsProvider } from './providers/GoogleMapsProvider';
import { ENV } from '@/config/env';

export type RoutingProviderType = 'osrm' | 'google';

export class RoutingServiceFactory {
  static create(type: RoutingProviderType = 'osrm'): RoutingService {
    switch (type) {
      case 'osrm':
        return new RoutingService(new OSRMProvider());
      
      case 'google':
        if (!ENV.GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key not configured');
        }
        return new RoutingService(new GoogleMapsProvider(ENV.GOOGLE_MAPS_API_KEY));
      
      default:
        throw new Error(`Unknown routing provider: ${type}`);
    }
  }
}
```

#### Adım 6: Usage

```typescript
// App initialization
const routingService = RoutingServiceFactory.create('osrm');

// Component usage
const { routingService } = useRouting(); // from context

const route = await routingService.getWalkingRoute(start, end);

// ✅ Easy to test
class MockRoutingProvider implements RoutingProvider {
  async getRoute() {
    return mockRouteData;
  }
}

const testService = new RoutingService(new MockRoutingProvider());

// ✅ Easy to switch
routingService.setProvider(new GoogleMapsProvider(apiKey));
```

---

## 📊 Sonuç

### Migration Checklist

- [ ] **SRP**: Map.tsx'i 5+ component'e böl
- [ ] **OCP**: Category registry sistemi kur
- [ ] **LSP**: Shared type system oluştur
- [ ] **ISP**: Context pattern ile prop drilling kaldır
- [ ] **DIP**: Routing provider abstraction ekle

### Beklenen İyileştirmeler

| Metrik | Önce | Sonra |
|--------|------|-------|
| Map.tsx satır sayısı | 1200+ | 200 |
| Component sayısı | 7 | 15+ |
| Props per component | 13 | 3-5 |
| Code duplication | Yüksek | Düşük |
| Testability | Zor | Kolay |
| Extensibility | Zor | Kolay |

---

**Hazırlayan:** AI Code Analyzer  
**Tarih:** 6 Kasım 2025
