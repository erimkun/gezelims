export const APP_CONFIG = {
  // Navigation settings
  navigation: {
    ARRIVAL_THRESHOLD_KM: 0.02, // 20 meters
    STEP_COMPLETE_THRESHOLD_KM: 0.02, // 20 meters
    AUTO_CLOSE_DELAY_MS: 2000, // 2 seconds
    LOCATION_UPDATE_INTERVAL_MS: 15000, // 15 seconds
    LOCATION_TIMEOUT_MS: 30000, // 30 seconds
    LOCATION_MAX_AGE_MS: 60000, // 1 minute
    ENABLE_HIGH_ACCURACY: true,
  },
  
  // Sidebar settings
  sidebar: {
    INITIAL_VISIBLE_COUNT: 50,
    LOAD_MORE_INCREMENT: 50,
    SCROLL_THRESHOLD_PX: 200,
    SEARCH_DEBOUNCE_MS: 300,
  },
  
  // Map settings
  map: {
    DEFAULT_CENTER: [29.015295995137393, 41.02678314419098] as const,
    DEFAULT_ZOOM: 12,
    NORMAL_ZOOM: 15,
    DETAIL_ZOOM: 17,
    NAVIGATION_ZOOM: 17,
    NAVIGATION_PITCH: 60,
    MAX_ZOOM: 22,
    MIN_ZOOM: 10,
    POI_LOAD_RADIUS_KM: 5,
    MAP_MOVE_THROTTLE_MS: 300,
    MARKER_Z_INDEX: 500, // Harita marker'ları (sidebar altında)
    POPUP_Z_INDEX: 2000, // POI popup'ları (sidebar üstünde)
    NAVIGATION_Z_INDEX: 3000, // Walking navigation (popup üstünde)
    POI_RELOAD_DISTANCE_KM: 0.5, // Harita bu kadar kaydırılınca yeni POI yükle (500 metre)
  },
  
  // Üsküdar bounds
  uskudar: {
    BOUNDS: {
      minLng: 28.95,
      maxLng: 29.10,
      minLat: 40.95,
      maxLat: 41.05,
    },
    CENTER: [29.015295995137393, 41.02678314419098] as const,
  },
  
  // UI settings
  ui: {
    HIGHLIGHT_DURATION_MS: 2000,
    TOAST_DURATION_MS: 3000,
    MODAL_ANIMATION_MS: 300,
    MOBILE_BREAKPOINT_PX: 768,
    SCROLL_INTO_VIEW_DELAY_MS: 100,
    MAP_FLY_TO_DURATION_MS: 2000,
    NAVIGATION_FLY_TO_DURATION_MS: 1500,
    RESET_CAMERA_DURATION_MS: 1000,
    POI_FLY_TO_DURATION_MS: 800,
  },
  
  // Cache settings
  cache: {
    POI_CACHE_SIZE: 1000,
    ROUTE_CACHE_SIZE: 50,
    CACHE_EXPIRY_MS: 3600000, // 1 hour
    GEOJSON_CACHE_DURATION_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Performance
  performance: {
    MAX_POI_MARKERS: 100,
    VIRTUAL_SCROLL_BUFFER: 10,
    IMAGE_LAZY_LOAD_THRESHOLD_PX: 300,
  },
} as const;

// Type-safe config access
export type AppConfig = typeof APP_CONFIG;
