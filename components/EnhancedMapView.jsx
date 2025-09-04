// components/EnhancedMapView.jsx - Versión mejorada con OpenStreetMap
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { mapsAPI } from '../services/api';
import { COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const EnhancedMapView = ({ 
  initialLocation = null,
  onLocationChange = null,
  markers = [],
  routes = [],
  showUserLocation = true,
  showSearch = false,
  enableRouting = false,
  onMapPress = null,
  style = {},
  currentLocation = null,
  onPlaceSelect = null
}) => {
  // Estados
  const [currentUserLocation, setCurrentUserLocation] = useState(initialLocation);
  const [calculatedRoutes, setCalculatedRoutes] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [region, setRegion] = useState({
    latitude: currentLocation?.latitude || initialLocation?.latitude || 4.6097,
    longitude: currentLocation?.longitude || initialLocation?.longitude || -74.0817,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const mapRef = useRef(null);
  const locationWatchRef = useRef(null);

  // Configuración de OpenStreetMap
  const openStreetMapStyle = [
    {
      "featureType": "all",
      "stylers": [
        { "saturation": -100 },
        { "gamma": 0.5 }
      ]
    }
  ];

  // Efecto para solicitar permisos y obtener ubicación
  useEffect(() => {
    if (!initialLocation && !currentLocation) {
      requestLocationPermission();
    }
    
    return () => {
      if (locationWatchRef.current) {
        locationWatchRef.current.remove();
      }
    };
  }, []);

  // Efecto para actualizar región cuando cambie la ubicación
  useEffect(() => {
    if (currentLocation) {
      setCurrentUserLocation(currentLocation);
      setRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

  // Solicitar permisos de ubicación
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'La aplicación necesita acceso a la ubicación para funcionar correctamente.',
          [{ text: 'OK' }]
        );
        return;
      }

      getCurrentLocation();
      startLocationTracking();
    } catch (error) {
      console.error('Error solicitando permisos:', error);
    }
  };

  // Obtener ubicación actual
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 60000,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      setCurrentUserLocation(newLocation);
      
      if (onLocationChange) {
        onLocationChange(newLocation);
      }

      // Cargar lugares cercanos si está habilitado
      if (enableRouting) {
        loadNearbyPlaces(newLocation.latitude, newLocation.longitude);
      }

      // Centrar mapa en la nueva ubicación
      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert(
        'Error de ubicación',
        'No se pudo obtener la ubicación actual. Verifica que el GPS esté activado.',
        [{ text: 'OK' }]
      );
    }
  };

  // Seguimiento de ubicación en tiempo real
  const startLocationTracking = async () => {
    try {
      locationWatchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // 10 segundos
          distanceInterval: 10, // 10 metros
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            accuracy: location.coords.accuracy,
          };

          setCurrentUserLocation(newLocation);
          
          if (onLocationChange) {
            onLocationChange(newLocation);
          }
        }
      );
    } catch (error) {
      console.error('Error iniciando seguimiento:', error);
    }
  };

  // Cargar lugares cercanos usando OpenStreetMap
  const loadNearbyPlaces = async (lat, lon) => {
    if (isLoadingPlaces) return;

    setIsLoadingPlaces(true);
    try {
      const response = await mapsAPI.getPopularNearby(lat, lon);
      
      if (response.data.success) {
        const allPlaces = [];
        response.data.data.forEach(category => {
          category.places.forEach(place => {
            allPlaces.push({
              ...place,
              category: category.category,
              id: `nearby-${place.id}`,
            });
          });
        });
        setNearbyPlaces(allPlaces);
      }
    } catch (error) {
      console.error('Error cargando lugares cercanos:', error);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // Calcular ruta usando OpenStreetMap
  const calculateRoute = async (destination) => {
    if (!currentUserLocation || isLoadingRoute) return;

    setIsLoadingRoute(true);
    try {
      const response = await mapsAPI.calculateRoute(
        currentUserLocation.latitude,
        currentUserLocation.longitude,
        destination.latitude || destination.lat,
        destination.longitude || destination.lon,
        'driving-car'
      );

      if (response.data.success) {
        const routeData = response.data.data;
        
        // Convertir coordenadas de la geometría a formato react-native-maps
        const coordinates = routeData.geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        const newRoute = {
          id: `route-${Date.now()}`,
          coordinates,
          color: COLORS.primary[500],
          width: 4,
          distance: routeData.distance,
          duration: routeData.duration,
          instructions: routeData.instructions,
        };

        setCalculatedRoutes([newRoute]);

        // Ajustar vista del mapa para mostrar toda la ruta
        if (mapRef.current && coordinates.length > 0) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            },
            animated: true,
          });
        }

        return newRoute;
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      Alert.alert(
        'Error de ruta',
        'No se pudo calcular la ruta. Intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Manejar presión en el mapa
  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    
    if (onMapPress) {
      onMapPress(coordinate);
    }

    // Si está habilitado el routing, obtener información del lugar
    if (enableRouting) {
      try {
        const response = await mapsAPI.reverseGeocode(
          coordinate.latitude,
          coordinate.longitude
        );

        if (response.data.success) {
          const place = response.data.data;
          setSelectedPlace({
            ...place,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });

          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
        }
      } catch (error) {
        console.error('Error obteniendo información del lugar:', error);
      }
    }
  };

  // Manejar presión en marcador
  const handleMarkerPress = useCallback((marker) => {
    if (enableRouting && marker.latitude && marker.longitude) {
      Alert.alert(
        'Calcular Ruta',
        `¿Deseas calcular la ruta hasta ${marker.title || 'este lugar'}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Calcular', 
            onPress: () => calculateRoute(marker)
          }
        ]
      );
    }
  }, [enableRouting, calculateRoute]);

  // Centrar mapa en ubicación actual
  const centerOnCurrentLocation = useCallback(() => {
    if (currentUserLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentUserLocation.latitude,
        longitude: currentUserLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      getCurrentLocation();
    }
  }, [currentUserLocation]);

  // Limpiar rutas calculadas
  const clearRoutes = useCallback(() => {
    setCalculatedRoutes([]);
    setSelectedPlace(null);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        onPress={handleMapPress}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={setRegion}
      >
        {/* Marcadores personalizados */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || `marker-${index}`}
            coordinate={{
              latitude: marker.lat || marker.latitude,
              longitude: marker.lon || marker.longitude
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || COLORS.primary[600]}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}

        {/* Marcadores de lugares cercanos */}
        {nearbyPlaces.map((place, index) => (
          <Marker
            key={`nearby-${place.id || index}`}
            coordinate={{
              latitude: place.lat,
              longitude: place.lon
            }}
            title={place.name}
            description={`${place.category} - ${place.distance ? `${Math.round(place.distance)}m` : ''}`}
            pinColor={COLORS.secondary[500]}
            onPress={() => handleMarkerPress(place)}
          >
            <View style={styles.customMarker}>
              <Ionicons 
                name="location" 
                size={20} 
                color={COLORS.secondary[600]} 
              />
            </View>
          </Marker>
        ))}

        {/* Marcador de lugar seleccionado */}
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude
            }}
            title={selectedPlace.name}
            description="Lugar seleccionado"
            pinColor={COLORS.accent[500]}
          />
        )}

        {/* Rutas existentes */}
        {routes.map((route, index) => (
          <Polyline
            key={route.id || `route-${index}`}
            coordinates={route.coordinates}
            strokeColor={route.color || COLORS.primary[500]}
            strokeWidth={route.width || 3}
            lineDashPattern={route.dashed ? [5, 5] : undefined}
          />
        ))}

        {/* Rutas calculadas */}
        {calculatedRoutes.map((route, index) => (
          <Polyline
            key={route.id || `calc-route-${index}`}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={route.width}
          />
        ))}
      </MapView>

      {/* Controles flotantes */}
      <View style={styles.controls}>
        {/* Botón para centrar ubicación */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={centerOnCurrentLocation}
          disabled={!mapReady}
        >
          <Ionicons name="locate" size={24} color={COLORS.primary[600]} />
        </TouchableOpacity>

        {/* Botón para limpiar rutas */}
        {enableRouting && calculatedRoutes.length > 0 && (
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={clearRoutes}
          >
            <Ionicons name="close" size={24} color={COLORS.error[500]} />
          </TouchableOpacity>
        )}

        {/* Indicador de carga */}
        {(isLoadingRoute || isLoadingPlaces) && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={COLORS.primary[600]} />
            <Text style={styles.loadingText}>
              {isLoadingRoute ? 'Calculando ruta...' : 'Cargando lugares...'}
            </Text>
          </View>
        )}
      </View>

      {/* Información de ruta calculada */}
      {calculatedRoutes.length > 0 && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>
            Distancia: {Math.round(calculatedRoutes[0].distance / 1000 * 10) / 10} km
          </Text>
          <Text style={styles.routeText}>
            Tiempo: {Math.round(calculatedRoutes[0].duration / 60)} min
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 50,
    right: 15,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customMarker: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: COLORS.secondary[600],
  },
  loadingIndicator: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.secondary[600],
  },
  routeInfo: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary[700],
  },
});

export default EnhancedMapView;