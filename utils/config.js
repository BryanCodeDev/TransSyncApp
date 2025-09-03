// utils/config.js
// Configuración centralizada de la aplicación

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000',
    timeout: parseInt(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT) || 15000,
    retryAttempts: parseInt(process.env.EXPO_PUBLIC_RETRY_ATTEMPTS) || 3,
  },

  // App Configuration
  app: {
    name: process.env.EXPO_PUBLIC_APP_NAME || 'TransSync',
    version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    platform: process.env.EXPO_PUBLIC_PLATFORM || 'mobile',
    defaultCountry: process.env.EXPO_PUBLIC_DEFAULT_COUNTRY || 'co',
  },

  // Development Configuration
  development: {
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Storage Configuration
  storage: {
    prefix: process.env.EXPO_PUBLIC_STORAGE_PREFIX || 'transsync_',
    keys: {
      userToken: 'userToken',
      userData: 'userData',
      appSettings: 'appSettings',
      lastLocation: 'lastLocation',
    }
  },

  // Geolocation Configuration
  geolocation: {
    timeout: parseInt(process.env.EXPO_PUBLIC_GEOLOCATION_TIMEOUT) || 15000,
    highAccuracy: process.env.EXPO_PUBLIC_GEOLOCATION_HIGH_ACCURACY === 'true',
    distanceFilter: parseInt(process.env.EXPO_PUBLIC_GEOLOCATION_DISTANCE_FILTER) || 50,
    timeInterval: parseInt(process.env.EXPO_PUBLIC_GEOLOCATION_TIME_INTERVAL) || 10000,
  },

  // External Services
  externalServices: {
    googleMaps: process.env.EXPO_PUBLIC_GOOGLE_MAPS_URL || 'https://www.google.com/maps',
    openStreetMap: process.env.EXPO_PUBLIC_OSM_URL || 'https://www.openstreetmap.org',
  },

  // Notifications (for future use)
  notifications: {
    enabled: process.env.EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true',
  },
};

// Helper function to get storage key with prefix
export const getStorageKey = (key) => {
  return `${config.storage.prefix}${key}`;
};

// Helper function to check if we're in development
export const isDevelopment = () => {
  return config.development.nodeEnv === 'development';
};

// Helper function to log in development mode only
export const devLog = (message, data = null) => {
  if (config.development.debugMode && isDevelopment()) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

export default config;