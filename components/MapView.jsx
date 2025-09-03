// components/MapView.jsx - Componente básico de mapa
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../utils/constants';

const BasicMapView = ({ 
  initialLocation = null,
  onLocationChange = null,
  markers = [],
  routes = [],
  showUserLocation = true,
  onMapPress = null,
  style = {}
}) => {
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    }
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
          'La aplicación necesita acceso a la ubicación.',
          [{ text: 'OK' }]
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

      setCurrentLocation(newLocation);

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

  const handleMapPress = (event) => {
    if (onMapPress) {
      const coordinate = event.nativeEvent.coordinate;
      onMapPress({
        lat: coordinate.latitude,
        lon: coordinate.longitude,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 4.6097, // Bogotá por defecto
          longitude: currentLocation?.longitude || -74.0817,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={showUserLocation}
        followsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={handleMapPress}
      >
        {/* Marcadores */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            coordinate={{
              latitude: marker.lat || marker.latitude,
              longitude: marker.lon || marker.longitude
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || COLORS.primary[600]}
          />
        ))}

        {/* Rutas */}
        {routes.map((route, index) => (
          <Polyline
            key={route.id || index}
            coordinates={route.coordinates}
            strokeColor={route.color || COLORS.primary[500]}
            strokeWidth={route.width || 3}
            lineDashPattern={route.dashed ? [5, 5] : undefined}
          />
        ))}
      </MapView>
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
});

export default MapView;