import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Platform, 
  StatusBar,
  Animated 
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

// Components
import Header from '../components/Header';
import BottomTabMenu from '../components/BottomTabMenu';
import EmergencyModal from '../components/EmergencyModal';
import FloatingSidebarMenu from '../components/FloatingSidebarMenu';

// Utils and Hooks
import { useAuth } from '../hooks/useAuth';
import { COLORS, SPACING } from '../utils/constants';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  const mapRef = useRef(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  const sidebarAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisos requeridos',
            'La aplicación necesita permisos de ubicación para funcionar correctamente',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Configurar', 
                onPress: () => {
                  // Aquí podrías abrir la configuración del dispositivo
                }
              }
            ]
          );
          return;
        }

        setLocationPermission(true);
        
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        // Simular datos para desarrollo
        setAssignedVehicle({
          plaVehiculo: 'ABC-123',
          marVehiculo: 'Mercedes',
          modVehiculo: 'Sprinter',
          estVehiculo: 'activo',
          capVehiculo: 20
        });

        setCurrentRoute({
          nomRuta: 'Ruta Centro - Norte',
          oriRuta: 'Terminal Central',
          desRuta: 'Portal Norte'
        });

      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        Alert.alert(
          'Error de ubicación',
          'No se pudo obtener la ubicación actual. Verifica que el GPS esté activado.'
        );
      }
    })();
  }, []);

  const centerOnLocation = async () => {
    if (!locationPermission) return;

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setLocation(newLocation);
      
      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion(newLocation, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la ubicación');
    }
  };

  const handleToggleOnline = () => {
    if (!assignedVehicle) {
      Alert.alert(
        'Sin vehículo asignado',
        'Necesitas un vehículo asignado para conectarte',
        [{ text: 'Entendido' }]
      );
      return;
    }

    setIsOnline(!isOnline);
    Alert.alert(
      'Estado actualizado',
      `Ahora estás ${!isOnline ? 'en línea' : 'desconectado'}`,
      [{ text: 'OK' }]
    );
  };

  const handleEmergencyPress = () => {
    // Animate sidebar out
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setEmergencyModalVisible(true);
  };

  const handleEmergencySubmit = async (emergencyData) => {
    try {
      console.log('Emergency data:', emergencyData);
      Alert.alert(
        'Emergencia reportada',
        'Tu reporte de emergencia ha sido enviado exitosamente a los servicios de respuesta.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo enviar el reporte de emergencia. Intenta nuevamente.'
      );
    }
  };

  const handleEmergencyClose = () => {
    setEmergencyModalVisible(false);
    
    // Animate sidebar back in
    Animated.timing(sidebarAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigate = (screen) => {
    if (screen === 'home') {
      navigation.navigate('Home');
    } else if (screen === 'notifications') {
      navigation.navigate('Notifications');
    } else if (screen === 'settings') {
      navigation.navigate('Profile');
    } else if (screen === 'menu') {
      navigation.navigate('Menu');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[600]} />
      
      <Header
        title="Mapa en Tiempo Real"
        user={user}
        onProfilePress={() => navigation.navigate('Profile')}
        showNotifications={true}
        notificationCount={5}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <View style={styles.mapContainer}>
        {location && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={location}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={true}
            onMapReady={() => setMapReady(true)}
            mapType="standard"
            pitchEnabled={true}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {/* Marcador de ubicación actual */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Mi ubicación"
              description="Ubicación actual del conductor"
              pinColor={COLORS.primary[600]}
            />

            {/* Ejemplo de ruta simulada */}
            {currentRoute && (
              <Polyline
                coordinates={[
                  { latitude: location.latitude, longitude: location.longitude },
                  { latitude: location.latitude + 0.002, longitude: location.longitude + 0.002 },
                  { latitude: location.latitude + 0.004, longitude: location.longitude + 0.001 },
                ]}
                strokeColor={COLORS.primary[600]}
                strokeWidth={4}
                lineDashPattern={[5, 10]}
              />
            )}
          </MapView>
        )}

        {/* Floating Sidebar Menu */}
        <FloatingSidebarMenu
          onEmergencyPress={handleEmergencyPress}
          onToggleOnline={handleToggleOnline}
          isOnline={isOnline}
          onCenterLocation={centerOnLocation}
          assignedVehicle={assignedVehicle}
          currentRoute={currentRoute}
          animated={sidebarAnim}
        />
      </View>

      {/* Bottom Tab Navigation */}
      <BottomTabMenu
        currentRoute="map"
        onNavigate={handleNavigate}
        onEmergencyPress={handleEmergencyPress}
        notificationCount={5}
        isOnline={isOnline}
      />

      {/* Emergency Modal */}
      <EmergencyModal
        visible={emergencyModalVisible}
        onClose={handleEmergencyClose}
        onSubmit={handleEmergencySubmit}
        currentLocation={location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;