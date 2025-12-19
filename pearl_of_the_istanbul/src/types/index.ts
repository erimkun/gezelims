/**
 * Shared Types for Pearl of Istanbul
 * Merkezi tip tanımlamaları
 */

// ============================================
// Language Types
// ============================================

export type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

export interface LanguageOption {
  code: LanguageKey;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'it', name: 'Italiano', flag: 'IT' },
];

// ============================================
// POI (Point of Interest) Types
// ============================================

export interface POI {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  address: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  rating?: number;
  reviews_count?: number;
  images?: string[];
  phone?: string;
  website?: string;
  workday_timing?: string;
  closed_on?: string[];
}

export interface POIWithDistance extends POI {
  distance: number; // in kilometers
}

// ============================================
// Map Types
// ============================================

export interface MapBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface MapCenter {
  lng: number;
  lat: number;
}

export type MapStyleKey = 'voyager' | 'dark' | 'osmBright';

export interface MapStyle {
  name: string;
  tiles: string[];
  attribution: string;
}

// ============================================
// Navigation Types
// ============================================

export interface RouteStep {
  location: [number, number];
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
  };
}

export interface Route {
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
}

export type TravelMode = 'walking' | 'driving' | 'transit';

// ============================================
// Category Types
// ============================================

export type CategoryKey = 'all' | 'yemek' | 'doga' | 'kultur-sanat' | 'eglence' | 'diger';

export interface Category {
  key: CategoryKey;
  icon: string;
  color: string;
  translations: Record<LanguageKey, string>;
}

// ============================================
// UI State Types
// ============================================

export type PageType = 'map' | 'mini-games';

export interface AppState {
  language: LanguageKey;
  currentPage: PageType;
  isSidebarOpen: boolean;
  selectedCategory: CategoryKey;
  selectedPOIId: string | null;
  isWalkingMode: boolean;
  walkingDestination: POI | null;
}

// ============================================
// Component Props Types
// ============================================

export interface WithLanguage {
  language: LanguageKey;
}

export interface WithOnClose {
  onClose: () => void;
}

// ============================================
// GeoJSON Types
// ============================================

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    address: string;
    description?: string;
    rating?: number;
    reviews_count?: number;
    images?: string[];
    phone?: string;
    website?: string;
    workday_timing?: string;
    closed_on?: string[];
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

export interface CacheConfig {
  maxAge: number; // milliseconds
  maxSize: number; // number of entries
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Event Types
// ============================================

export interface ZoomToPOIEvent extends CustomEvent {
  detail: POI;
}

export interface MapMoveEvent extends CustomEvent {
  detail: {
    center: MapCenter;
    zoom: number;
    bounds: MapBounds;
  };
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<ApiResponse<T>>;
