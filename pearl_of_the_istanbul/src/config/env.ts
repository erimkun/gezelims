export const ENV = {
  // API URLs
  ROUTING_API_URL: import.meta.env.VITE_ROUTING_API_URL || 'https://router.project-osrm.org',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
  // Feature flags
  ENABLE_GOOGLE_MAPS: import.meta.env.VITE_ENABLE_GOOGLE_MAPS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: import.meta.env.DEV,
  
  // App metadata
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_NAME: 'Pearl of the Istanbul',
  
  // Build info
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
} as const;

// Validation
if (ENV.ENABLE_GOOGLE_MAPS && !ENV.GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps enabled but no API key provided');
}
