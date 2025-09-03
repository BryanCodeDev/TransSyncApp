// services/mapService.js
import { mapsAPI } from './api';

class MapService {
  constructor() {
    this.cache = new Map(); // Cache simple para respuestas
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Cache helper
  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 1. Buscar lugares - CORREGIDO para tu backend
  async searchPlaces(query, options = {}) {
    if (!query || query.length < 2) {
      return { success: true, data: [], count: 0 };
    }

    const { limit = 5, countrycodes = 'co' } = options;
    const cacheKey = this.getCacheKey('search', { query, limit, countrycodes });
    
    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Tu backend espera: /api/map/search/:query
      const params = { limit: limit.toString(), countrycodes };
      const response = await mapsAPI.searchPlaces(query, params);
      
      const result = response.data;
      
      // Guardar en cache
      this.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error buscando lugares:', error);
      return { 
        success: false, 
        data: [], 
        count: 0, 
        error: error.message 
      };
    }
  }

  // 2. Geocoding inverso - CORREGIDO para tu backend
  async reverseGeocode(lat, lon, zoom = 18) {
    if (!this.isValidCoordinate(lat, lon)) {
      throw new Error('Coordenadas inválidas');
    }

    const cacheKey = this.getCacheKey('reverse', { lat, lon, zoom });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Tu backend: /api/map/reverse/:lat/:lon
      const response = await mapsAPI.reverseGeocode(lat, lon, zoom);
      const result = response.data;
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error en geocoding inverso:', error);
      return { 
        success: false, 
        data: null, 
        error: error.message 
      };
    }
  }

  // 3. Buscar lugares cercanos - CORREGIDO para tu backend
  async findNearbyPlaces(lat, lon, type, radius = 1000) {
    if (!this.isValidCoordinate(lat, lon)) {
      throw new Error('Coordenadas inválidas');
    }

    const cacheKey = this.getCacheKey('nearby', { lat, lon, type, radius });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Tu backend: /api/map/nearby/:lat/:lon/:type
      const response = await mapsAPI.findNearbyPlaces(lat, lon, type, radius);
      const result = response.data;
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error buscando lugares cercanos:', error);
      
      // Manejo especial para rate limit (error 429)
      if (error.status === 429) {
        return {
          success: false,
          data: [],
          error: 'Demasiadas solicitudes. Intenta en unos momentos.',
          rateLimited: true
        };
      }
      
      return { 
        success: false, 
        data: [], 
        error: error.message 
      };
    }
  }

  // 4. Calcular ruta - CORREGIDO para tu backend
  async calculateRoute(startLat, startLon, endLat, endLon, profile = 'driving-car') {
    if (!this.isValidCoordinate(startLat, startLon) || 
        !this.isValidCoordinate(endLat, endLon)) {
      throw new Error('Coordenadas inválidas');
    }

    const cacheKey = this.getCacheKey('route', { 
      startLat, startLon, endLat, endLon, profile 
    });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Tu backend: /api/map/route/:startLat/:startLon/:endLat/:endLon
      const response = await mapsAPI.calculateRoute(startLat, startLon, endLat, endLon, profile);
      const result = response.data;
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error calculando ruta:', error);
      // Fallback: calcular distancia simple
      const distance = this.calculateDistance(startLat, startLon, endLat, endLon);
      return {
        success: true,
        data: {
          distance: distance,
          duration: Math.round(distance / 50 * 3.6), // Estimación
          geometry: {
            coordinates: [[startLon, startLat], [endLon, endLat]]
          },
          instructions: [{
            instruction: 'Dirigirse al destino',
            distance: distance
          }],
          fallback: true,
          error: error.message
        }
      };
    }
  }

  // 5. Obtener información detallada de un lugar - CORREGIDO para tu backend
  async getPlaceDetails(placeId) {
    const cacheKey = this.getCacheKey('details', { placeId });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Tu backend: /api/map/place/:placeId
      const response = await mapsAPI.getPlaceDetails(placeId);
      const result = response.data;
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo detalles:', error);
      return { 
        success: false, 
        data: null, 
        error: error.message 
      };
    }
  }

  // 6. Obtener tipos de lugares disponibles - NUEVO endpoint de tu backend
  async getAvailableTypes() {
    try {
      const response = await mapsAPI.getMapTypes();
      return response.data;
    } catch (error) {
      console.error('Error obteniendo tipos:', error);
      // Fallback con tipos básicos
      return {
        success: true,
        data: {
          amenities: ['restaurant', 'bank', 'hospital', 'school', 'pharmacy', 'fuel'],
          shops: ['supermarket'],
          transport: ['bus_stop'],
          profiles: ['driving-car', 'foot-walking']
        }
      };
    }
  }

  // 7. Verificar salud del servicio de mapas - NUEVO endpoint de tu backend
  async checkMapHealth() {
    try {
      const response = await mapsAPI.getMapHealth();
      return response.data;
    } catch (error) {
      console.error('Error verificando salud de mapas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 8. Métodos de utilidad
  
  // Convertir distancia a formato legible
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  // Convertir duración a formato legible
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Calcular distancia entre dos puntos (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distancia en km
    
    return distance * 1000; // Convertir a metros
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Validar coordenadas
  isValidCoordinate(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  // Obtener ubicación actual del usuario
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Error desconocido';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permiso de ubicación denegado';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              message = 'Tiempo de espera agotado';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }

  // Buscar direcciones con autocompletado
  async searchAddresses(query, options = {}) {
    if (query.length < 3) {
      return { success: true, data: [], count: 0 };
    }

    return await this.searchPlaces(query, {
      limit: options.limit || 5,
      countrycodes: options.countrycodes || 'co'
    });
  }

  // Obtener sugerencias de lugares populares
  async getPopularPlaces(lat, lon) {
    const promises = [
      this.findNearbyPlaces(lat, lon, 'restaurant', 2000),
      this.findNearbyPlaces(lat, lon, 'bank', 1000),
      this.findNearbyPlaces(lat, lon, 'hospital', 5000),
      this.findNearbyPlaces(lat, lon, 'school', 2000),
      this.findNearbyPlaces(lat, lon, 'pharmacy', 1500)
    ];

    try {
      const results = await Promise.allSettled(promises);
      const places = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const category = ['Restaurantes', 'Bancos', 'Hospitales', 'Escuelas', 'Farmacias'][index];
          places.push({
            category,
            places: result.value.data.slice(0, 3) // Solo los primeros 3
          });
        }
      });

      return { success: true, data: places };
    } catch (error) {
      console.error('Error obteniendo lugares populares:', error);
      return { success: false, data: [] };
    }
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }

  // Obtener estadísticas de cache
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout
    };
  }
}

// Crear instancia singleton
const mapService = new MapService();

export default mapService;