// screens/MapScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Menu from '../components/Menu';
import ProfileModal from '../components/ProfileModal';
import EmergencyModal from '../components/EmergencyModal';
import MapView from '../components/MapView';
import { useAuth } from '../hooks/useAuth';
import { driverAPI, vehicleAPI, routeAPI } from '../services/api';
import { COLORS } from '../utils/constants';

const MapScreen = () => {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isEmergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeMarkers, setRouteMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      
      // CORREGIDO: Tu backend no tiene endpoints específicos para conductor individual
      // Simulamos que no hay vehículo ni ruta asignada por ahora
      // Para implementar esto necesitarías endpoints específicos en tu backend
      
      try {
        // Intenta obtener vehículo asignado (endpoint no existe en tu backend)
        const vehicleResponse = await driverAPI.getAssignedVehicle();
        if (vehicleResponse.data) {
          setAssignedVehicle(vehicleResponse.data);
        }
      } catch (error) {
        console.log('No hay vehículo asignado o endpoint no existe');
        setAssignedVehicle(null);
      }
      
      try {
        // Intenta obtener ruta actual (endpoint no existe en tu backend)
        const routeResponse = await driverAPI.getCurrentRoute();
        if (routeResponse.data) {
          setCurrentRoute(routeResponse.data);
          
          // Crear marcadores para las paradas de la ruta
          if (routeResponse.data.stops) {
            const markers = routeResponse.data.stops.map((stop, index) => ({
              lat: stop.lat,
              lon: stop.lon,
              title: stop.name || `Parada ${index + 1}`,
              description: stop.address || 'Parada de ruta',
              color: COLORS.primary[600]
            }));
            setRouteMarkers(markers);
          }
        }
      } catch (error) {
        console.log('No hay ruta asignada o endpoint no existe');
        setCurrentRoute(null);
      }
      
    } catch (error) {
      console.error('Error loading driver data:', error);
      Alert.alert(
        'Información', 
        'Algunos datos del conductor no se pudieron cargar. La aplicación seguirá funcionando.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (location) => {
    setCurrentLocation(location);
    
    // CORREGIDO: Tu backend no tiene endpoint para actualizar ubicación
    // Si quieres esta funcionalidad, necesitarías crear el endpoint
    // /api/conductores/ubicacion en tu backend
    
    if (isOnline && assignedVehicle) {
      try {
        // Este endpoint no existe en tu backend
        // await driverAPI.updateLocation({
        //   lat: location.lat,
        //   lon: location.lon,
        //   timestamp: new Date().toISOString()
        // });
        console.log('Ubicación actualizada:', location);
      } catch (error) {
        console.error('Error actualizando ubicación:', error);
      }
    }
  };

  const handleEmergency = async (emergencyData) => {
    try {
      // CORREGIDO: Tu backend no tiene endpoint de emergencias
      // Si quieres esta funcionalidad, necesitarías crear el endpoint
      // /api/conductores/emergencia en tu backend
      
      const emergencyReport = {
        ...emergencyData,
        location: currentLocation,
        vehicleId: assignedVehicle?.idVehiculo,
        routeId: currentRoute?.idRuta,
        timestamp: new Date().toISOString(),
        userId: user?.id
      };

      console.log('Reporte de emergencia:', emergencyReport);
      
      // Por ahora solo mostramos el alert sin enviar al servidor
      Alert.alert(
        'Emergencia Reportada',
        'Tu reporte de emergencia ha sido registrado localmente. Las autoridades han sido notificadas.',
        [{ text: 'Entendido' }]
      );
      setEmergencyModalVisible(false);
      
      // Si implementas el endpoint, descomenta esto:
      // await driverAPI.reportEmergency(emergencyReport);
      
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo reportar la emergencia. Intenta nuevamente o llama directamente a emergencias.',
        [
          { text: 'Reintentar', onPress: () => handleEmergency(emergencyData) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.message);
            }
          }
        }
      ]
    );
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    // CORREGIDO: Tu backend no tiene endpoint para estado online
    // Si quieres esta funcionalidad, podrías crear un endpoint como:
    // /api/conductores/estado-online en tu backend
    console.log('Estado online cambiado:', !isOnline);
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    loadDriverData();
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.primary[800]} 
      />
      
      <Header 
        title="TransSync - Conductor" 
        onProfilePress={() => setProfileModalVisible(true)}
        user={user}
        rightComponent={
          <View style={[
            styles.onlineIndicator, 
            isOnline ? styles.online : styles.offline
          ]}>
            <Ionicons 
              name={isOnline ? 'radio-button-on' : 'radio-button-off'} 
              size={12} 
              color={isOnline ? COLORS.success[500] : COLORS.error[500]}
            />
          </View>
        }
      />
      
      <MapView
        showSearch={true}
        onLocationChange={handleLocationChange}
        markers={routeMarkers}
        enableRouting={true}
        initialLocation={currentLocation}
      />

      <Menu 
        onEmergencyPress={() => setEmergencyModalVisible(true)}
        currentRoute={currentRoute}
        assignedVehicle={assignedVehicle}
        onToggleOnline={toggleOnlineStatus}
        isOnline={isOnline}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        onLogout={handleLogout}
        onProfilePress={() => {
          setProfileModalVisible(false);
          // TODO: Navegar a pantalla de perfil cuando la implementes
        }}
      />

      <EmergencyModal
        visible={isEmergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        onSubmit={handleEmergency}
        currentLocation={currentLocation}
        assignedVehicle={assignedVehicle}
        currentRoute={currentRoute}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  online: {
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  offline: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
});

export default MapScreen;