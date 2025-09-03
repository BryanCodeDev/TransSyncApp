// components/EnhancedMapView.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import mapService from '../services/mapService';
// Comentado temporalmente hasta que se cree el componente
// import PlaceSearchComponent from './PlaceSearchComponent';

const { width, height } = Dimensions.get('window');

const EnhancedMapView = ({ 
  initialLocation = null,
  showSearch = true,
  onLocationChange = null,
  routePoints = [],
  markers = [],
  enableRouting = false
}) => {
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [route, setRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation && onLocationChange) {
      onLocationChange(currentLocation);
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'La aplicación necesita acceso a la ubicación para funcionar correctamente.',
          [
            { text: 'Configurar', onPress: () => Location.requestForegroundPermissionsAsync() },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      setUserLocation(newLocation);
      
      if (!currentLocation) {
        setCurrentLocation(newLocation);
      }

      // Centrar el mapa en la ubicación actual
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  const handlePlaceSelected = async (place) => {
    setSelectedPlace(place);
    setShowSearchModal(false);

    // Animar hacia el lugar seleccionado
    if (mapRef.current && place.lat && place.lon) {
      mapRef.current.animateToRegion({
        latitude: place.lat,
        longitude: place.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }

    // Calcular ruta si está habilitado y tenemos ubicación actual
    if (enableRouting && userLocation) {
      await calculateRoute(userLocation, place);
    }
  };

  const calculateRoute = async (origin, destination) => {
    if (!origin || !destination) return;

    setIsLoadingRoute(true);
    try {
      const response = await mapService.calculateRoute(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon
      );

      if (response.success && response.data) {
        setRoute({
          coordinates: response.data.geometry.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
          })),
          distance: response.data.distance,
          duration: response.data.duration,
          instructions: response.data.instructions
        });
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      Alert.alert('Error', 'No se pudo calcular la ruta');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const loadNearbyPlaces = async () => {
    if (!currentLocation) return;

    try {
      setShowNearbyPlaces(true);
      const response = await mapService.findNearbyPlaces(
        currentLocation.lat,
        currentLocation.lon,
        'restaurant',
        2000
      );

      if (response.success) {
        setNearbyPlaces(response.data);
      }
    } catch (error) {
      console.error('Error cargando lugares cercanos:', error);
      Alert.alert('Error', 'No se pudieron cargar los lugares cercanos');
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setSelectedPlace(null);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  // Función simple de búsqueda temporal hasta que se implemente PlaceSearchComponent
  const openSimpleSearch = () => {
    Alert.alert(
      'Búsqueda de lugares',
      'La función de búsqueda avanzada estará disponible pronto',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 4.6097,
          longitude: currentLocation?.longitude || -74.0817,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => setSelectedPlace(null)}
      >
        {/* Marcador de lugar seleccionado */}
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.lat,
              longitude: selectedPlace.lon
            }}
            title={selectedPlace.name}
            description={selectedPlace.address ? 
              `${selectedPlace.address.road || ''} ${selectedPlace.address.city || ''}`.trim() 
              : 'Ubicación seleccionada'
            }
            pinColor={COLORS.primary[600]}
          />
        )}

        {/* Marcadores adicionales */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.lat,
              longitude: marker.lon
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || COLORS.secondary[600]}
          />
        ))}

        {/* Marcadores de lugares cercanos */}
        {showNearbyPlaces && nearbyPlaces.map((place, index) => (
          <Marker
            key={`nearby-${index}`}
            coordinate={{
              latitude: place.lat,
              longitude: place.lon
            }}
            title={place.name}
            description={place.type}
          >
            <View style={styles.nearbyMarker}>
              <Text style={styles.nearbyMarkerText}>🍽️</Text>
            </View>
          </Marker>
        ))}

        {/* Ruta calculada */}
        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={COLORS.primary[500]}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Botones de control */}
      <View style={styles.controls}>
        {showSearch && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={openSimpleSearch}
          >
            <Text style={styles.searchButtonText}>🔍 Buscar lugar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUser}
        >
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={loadNearbyPlaces}
        >
          <Text style={styles.controlButtonText}>🍽️</Text>
        </TouchableOpacity>

        {route && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: COLORS.error[500] }]}
            onPress={clearRoute}
          >
            <Text style={styles.controlButtonText}>✖️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Información de ruta */}
      {route && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeInfoTitle}>Ruta calculada</Text>
          <Text style={styles.routeInfoText}>
            Distancia: {mapService.formatDistance(route.distance)}
          </Text>
          {route.duration && (
            <Text style={styles.routeInfoText}>
              Tiempo estimado: {mapService.formatDuration(route.duration)}
            </Text>
          )}
        </View>
      )}

      {/* Indicador de carga de ruta */}
      {isLoadingRoute && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Calculando ruta...</Text>
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
    bottom: SPACING.xl,
    right: SPACING.md,
    gap: SPACING.sm,
  },
  searchButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  controlButton: {
    backgroundColor: COLORS.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  controlButtonText: {
    fontSize: 20,
  },
  nearbyMarker: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  nearbyMarkerText: {
    fontSize: 16,
  },
  routeInfo: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  routeInfoTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  routeInfoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[700],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    marginTop: SPACING.md,
  },
});

export default EnhancedMapView;