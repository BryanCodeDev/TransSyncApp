// hooks/useMapServices.js - Hook personalizado para servicios de mapas
import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { mapsAPI } from '../services/api';

export const useMapServices = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  
  const cacheRef = useRef(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Función para obtener datos del cache
  const getFromCache = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Función para guardar en cache
  const saveToCache = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Buscar lugares
  const searchPlaces = useCallback(async (query, options = {}) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return { success: true, data: [] };
    }

    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      setSearchResults(cached.data || []);
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await mapsAPI.searchPlaces(query, {
        limit: options.limit || 5,
        countrycodes: options.countrycodes || 'co'
      });

      if (response.data.success) {
        const places = response.data.data.map(place => ({
          id: place.id,
          name: place.name,
          address: formatAddress(place.address),
          latitude: place.lat,
          longitude: place.lon,
          type: place.type,
          category: place.category
        }));

        setSearchResults(places);
        const result = { success: true, data: places };
        saveToCache(cacheKey, result);
        return result;
      } else {
        setSearchResults([]);
        return { success: false, data: [], error: 'No se encontraron resultados' };
      }
    } catch (error) {
      console.error('Error en búsqueda de lugares:', error);
      setError(error.message);
      setSearchResults([]);
      return { success: false, data: [], error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, saveToCache]);

  // Obtener lugares cercanos
  const getNearbyPlaces = useCallback(async (lat, lon, type = 'restaurant', radius = 1000) => {
    const cacheKey = `nearby_${lat}_${lon}_${type}_${radius}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      setNearbyPlaces(cached.data || []);
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await mapsAPI.findNearbyPlaces(lat, lon, type, radius);

      if (response.data.success) {
        const places = response.data.data.map(place => ({
          id: place.id,
          name: place.name,
          latitude: place.lat,
          longitude: place.lon,
          type: place.type,
          category: place.category,
          distance: place.distance,
          phone: place.phone,
          website: place.website,
          opening_hours: place.opening_hours
        }));

        setNearbyPlaces(places);
        const result = { success: true, data: places };
        saveToCache(cacheKey, result);
        return result;
      } else {
        setNearbyPlaces([]);
        return { success: false, data: [], error: 'No se encontraron lugares cercanos' };
      }
    } catch (error) {
      console.error('Error obteniendo lugares cercanos:', error);
      setError(error.message);
      setNearbyPlaces([]);
      
      // Manejar rate limiting
      if (error.status === 429) {
        Alert.alert(
          'Límite alcanzado',
          'Demasiadas solicitudes. Por favor espera unos momentos.',
          [{ text: 'OK' }]
        );
      }
      
      return { success: false, data: [], error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, saveToCache]);

  // Calcular ruta
  const calculateRoute = useCallback(async (start, end, profile = 'driving-car') => {
    const cacheKey = `route_${start.lat}_${start.lon}_${end.lat}_${end.lon}_${profile}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      setCalculatedRoute(cached.data);
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await mapsAPI.calculateRoute(
        start.lat || start.latitude,
        start.lon || start.longitude,
        end.lat || end.latitude,
        end.lon || end.longitude,
        profile
      );

      if (response.data.success) {
        const routeData = {
          ...response.data.data,
          id: `route_${Date.now()}`,
          coordinates: response.data.data.geometry.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
          }))
        };

        setCalculatedRoute(routeData);
        const result = { success: true, data: routeData };
        saveToCache(cacheKey, result);
        return result;
      } else {
        setCalculatedRoute(null);
        return { success: false, data: null, error: 'No se pudo calcular la ruta' };
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      setError(error.message);
      setCalculatedRoute(null);
      
      // Fallback con distancia estimada
      const distance = calculateHaversineDistance(
        start.lat || start.latitude,
        start.lon || start.longitude,
        end.lat || end.latitude,
        end.lon || end.longitude
      );

      const fallbackRoute = {
        id: `fallback_route_${Date.now()}`,
        distance: Math.round(distance),
        duration: Math.round(distance / 50 * 3.6), // Estimación: 50 km/h
        coordinates: [
          { latitude: start.lat || start.latitude, longitude: start.lon || start.longitude },
          { latitude: end.lat || end.latitude, longitude: end.lon || end.longitude }
        ],
        instructions: [{
          instruction: `Dirigirse hacia el destino (${Math.round(distance/1000)} km)`,
          distance: Math.round(distance),
          duration: Math.round(distance / 50 * 3.6)
        }],
        fallback: true
      };

      setCalculatedRoute(fallbackRoute);
      return { success: true, data: fallbackRoute, fallback: true };
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, saveToCache]);

  // Geocoding inverso
  const reverseGeocode = useCallback(async (lat, lon) => {
    const cacheKey = `reverse_${lat}_${lon}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await mapsAPI.reverseGeocode(lat, lon);

      if (response.data.success) {
        const place = {
          ...response.data.data,
          address: formatAddress(response.data.data.address)
        };

        const result = { success: true, data: place };
        saveToCache(cacheKey, result);
        return result;
      } else {
        return { success: false, data: null, error: 'No se encontró información del lugar' };
      }
    } catch (error) {
      console.error('Error en geocoding inverso:', error);
      setError(error.message);
      return { success: false, data: null, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, saveToCache]);

  // Obtener lugares populares cerca de una ubicación
  const getPopularPlaces = useCallback(async (lat, lon) => {
    const cacheKey = `popular_${lat}_${lon}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await mapsAPI.getPopularNearby(lat, lon);

      if (response.data.success) {
        const result = { success: true, data: response.data.data };
        saveToCache(cacheKey, result);
        return result;
      } else {
        return { success: false, data: [], error: 'No se encontraron lugares populares' };
      }
    } catch (error) {
      console.error('Error obteniendo lugares populares:', error);
      setError(error.message);
      return { success: false, data: [], error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, saveToCache]);

  // Limpiar datos
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setNearbyPlaces([]);
    setCalculatedRoute(null);
    setError(null);
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Funciones auxiliares
  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(`#${address.house_number}`);
    if (address.neighbourhood) parts.push(address.neighbourhood);
    if (address.city) parts.push(address.city);
    
    return parts.join(', ');
  };

  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return {
    // Estados
    isLoading,
    error,
    searchResults,
    nearbyPlaces,
    calculatedRoute,
    
    // Métodos
    searchPlaces,
    getNearbyPlaces,
    calculateRoute,
    reverseGeocode,
    getPopularPlaces,
    clearResults,
    clearCache,
    
    // Utilidades
    formatDistance,
    formatDuration,
    formatAddress
  };
};

export default useMapServices;