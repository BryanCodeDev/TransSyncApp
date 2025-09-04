// services/api.js - Actualizado con servicios de mapas
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar la URL base usando variables de entorno
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL 
  ? `${process.env.EXPO_PUBLIC_API_URL}/api` 
  : 'http://192.168.1.56:5000/api';
const REQUEST_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT) || 15000;
const DEBUG_MODE = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
const STORAGE_PREFIX = process.env.EXPO_PUBLIC_STORAGE_PREFIX || 'transsync_';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(`${STORAGE_PREFIX}userToken`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log para debugging solo si está habilitado
      if (DEBUG_MODE) {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        if (config.data) {
          console.log('📤 Request Data:', config.data);
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error en interceptor request:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    // Log para debugging solo si está habilitado
    if (DEBUG_MODE) {
      console.log(`✅ API Response: ${response.status}`, response.data);
    }
    return response;
  },
  async (error) => {
    if (DEBUG_MODE) {
      console.log('❌ API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expirado o inválido
      try {
        await AsyncStorage.multiRemove([
          `${STORAGE_PREFIX}userToken`, 
          `${STORAGE_PREFIX}userData`
        ]);
      } catch (storageError) {
        console.error('Error limpiando storage:', storageError);
      }
    }
    
    // Formatear error para mejor manejo
    const apiError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    };
    
    return Promise.reject(apiError);
  }
);

// APIs específicas existentes
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  verifyAccount: (token) => api.get(`/auth/verify?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  verifyToken: () => api.get('/auth/verify-token'),
  getProfile: () => api.get('/auth/profile'),
};

export const driverAPI = {
  getProfile: () => api.get('/conductores/perfil'),
  updateProfile: (data) => api.put('/conductores/perfil', data),
  getAssignedVehicle: () => api.get('/conductores/vehiculo-asignado'),
  getCurrentRoute: () => api.get('/conductores/ruta-actual'),
  startTrip: (tripId) => api.post(`/viajes/${tripId}/iniciar`),
  endTrip: (tripId, data) => api.post(`/viajes/${tripId}/finalizar`, data),
  reportEmergency: (data) => api.post('/conductores/emergencia', data),
  updateLocation: (locationData) => api.post('/conductores/ubicacion', locationData),
};

export const vehicleAPI = {
  getVehicleStatus: (vehicleId) => api.get(`/vehiculos/${vehicleId}/estado`),
  reportMaintenance: (data) => api.post('/vehiculos/reportar-mantenimiento', data),
};

export const routeAPI = {
  getRutasSelect: () => api.get('/rutas/utils/select'),
  getRutas: () => api.get('/rutas'),
  crearRuta: (data) => api.post('/rutas', data),
  actualizarRuta: (id, data) => api.put(`/rutas/${id}`, data),
  eliminarRuta: (id) => api.delete(`/rutas/${id}`),
};

// ========================================
// NUEVAS APIs DE MAPAS - OPENSTREETMAP
// ========================================

export const mapsAPI = {
  // 1. Buscar lugares
  searchPlaces: (query, options = {}) => {
    const { limit = 5, countrycodes = 'co' } = options;
    return api.get(`/map/search/${encodeURIComponent(query)}`, {
      params: { limit, countrycodes }
    });
  },

  // 2. Geocoding inverso - obtener dirección de coordenadas
  reverseGeocode: (lat, lon, zoom = 18) => {
    return api.get(`/map/reverse/${lat}/${lon}`, {
      params: { zoom }
    });
  },

  // 3. Buscar lugares cercanos
  findNearbyPlaces: (lat, lon, type, radius = 1000) => {
    return api.get(`/map/nearby/${lat}/${lon}/${type}`, {
      params: { radius }
    });
  },

  // 4. Calcular ruta entre dos puntos
  calculateRoute: (startLat, startLon, endLat, endLon, profile = 'driving-car') => {
    return api.get(`/map/route/${startLat}/${startLon}/${endLat}/${endLon}`, {
      params: { profile }
    });
  },

  // 5. Obtener detalles de un lugar específico
  getPlaceDetails: (placeId) => {
    return api.get(`/map/place/${placeId}`);
  },

  // 6. Obtener tipos de lugares disponibles
  getMapTypes: () => {
    return api.get('/map/types');
  },

  // 7. Health check del servicio de mapas
  getMapHealth: () => {
    return api.get('/map/health');
  },

  // MÉTODOS DE CONVENIENCIA PARA LA APP MÓVIL

  // Buscar direcciones con autocompletado
  searchAddresses: async (query, options = {}) => {
    if (!query || query.length < 3) {
      return { data: { success: true, data: [], count: 0 } };
    }
    return await mapsAPI.searchPlaces(query, options);
  },

  // Obtener lugares populares cerca de una ubicación
  getPopularNearby: async (lat, lon) => {
    const promises = [
      mapsAPI.findNearbyPlaces(lat, lon, 'restaurant', 2000),
      mapsAPI.findNearbyPlaces(lat, lon, 'bank', 1000),
      mapsAPI.findNearbyPlaces(lat, lon, 'hospital', 5000),
      mapsAPI.findNearbyPlaces(lat, lon, 'pharmacy', 1500),
      mapsAPI.findNearbyPlaces(lat, lon, 'bus_stop', 500)
    ];

    try {
      const results = await Promise.allSettled(promises);
      const categories = ['Restaurantes', 'Bancos', 'Hospitales', 'Farmacias', 'Paradas'];
      const places = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data?.success) {
          places.push({
            category: categories[index],
            places: result.value.data.data.slice(0, 3)
          });
        }
      });

      return { data: { success: true, data: places } };
    } catch (error) {
      return { data: { success: false, data: [], error: error.message } };
    }
  },

  // Calcular múltiples rutas (por si necesitas comparar opciones)
  calculateMultipleRoutes: async (start, end, profiles = ['driving-car', 'foot-walking']) => {
    const promises = profiles.map(profile => 
      mapsAPI.calculateRoute(start.lat, start.lon, end.lat, end.lon, profile)
    );

    try {
      const results = await Promise.allSettled(promises);
      const routes = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data?.success) {
          routes.push({
            profile: profiles[index],
            data: result.value.data.data
          });
        }
      });

      return { data: { success: true, data: routes } };
    } catch (error) {
      return { data: { success: false, data: [], error: error.message } };
    }
  }
};

// Función auxiliar para testear conectividad
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data 
    };
  }
};

// Función para testear servicios de mapas específicamente
export const testMapServices = async () => {
  try {
    const response = await mapsAPI.getMapHealth();
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data 
    };
  }
};

export default api;