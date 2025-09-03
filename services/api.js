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

// APIs específicas
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

export const mapsAPI = {
  getRoute: (origin, destination) => api.get('/maps/ruta', {
    params: { 
      origin: `${origin.lat},${origin.lng}`, 
      destination: `${destination.lat},${destination.lng}` 
    }
  }),
  searchLocation: (query) => api.get('/maps/buscar', { params: { q: query } }),
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

export default api;