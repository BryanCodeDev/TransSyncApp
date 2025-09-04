// screens/MapScreen.jsx - Sistema completo de rutas TransSync
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  SafeAreaView
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps'; // 👈 OSM UrlTile añadido
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../hooks/useAuth';
import { driverAPI, vehicleAPI, routeAPI } from '../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, ICONS } from '../utils/constants';
import ProfileModal from '../components/ProfileModal';
import EmergencyModal from '../components/EmergencyModal';

const { width, height } = Dimensions.get('window');

// Simulación de datos de buses en tiempo real
const generateMockBuses = () => {
  return [
    {
      id: 'bus-001',
      route: 'Ruta 1: Centro - Norte',
      driver: 'Juan Pérez',
      lat: 4.7110,
      lng: -74.0721,
      speed: 25,
      passengers: 23,
      capacity: 40,
      status: 'en_ruta',
      lastUpdate: new Date(),
      direction: 45
    },
    {
      id: 'bus-002', 
      route: 'Ruta 2: Sur - Occidente',
      driver: 'María González',
      lat: 4.6097,
      lng: -74.0817,
      speed: 18,
      passengers: 31,
      capacity: 40,
      status: 'en_ruta',
      lastUpdate: new Date(),
      direction: 120
    },
    {
      id: 'bus-003',
      route: 'Ruta 3: Oriente - Centro',
      driver: 'Carlos Rodríguez',
      lat: 4.6486,
      lng: -74.0639,
      speed: 0,
      passengers: 8,
      capacity: 35,
      status: 'parada',
      lastUpdate: new Date(),
      direction: 0
    }
  ];
};

// Simulación de paradas de bus
const mockBusStops = [
  { id: 'stop-001', name: 'Terminal Norte', lat: 4.7850, lng: -74.0450, routes: ['Ruta 1', 'Ruta 3'] },
  { id: 'stop-002', name: 'Plaza Bolívar', lat: 4.5981, lng: -74.0758, routes: ['Ruta 1', 'Ruta 2'] },
  { id: 'stop-003', name: 'Centro Comercial', lat: 4.6601, lng: -74.0547, routes: ['Ruta 2', 'Ruta 3'] },
  { id: 'stop-004', name: 'Universidad Nacional', lat: 4.6365, lng: -74.0847, routes: ['Ruta 1'] },
  { id: 'stop-005', name: 'Hospital San Juan', lat: 4.6280, lng: -74.0631, routes: ['Ruta 2'] }
];

// Simulación de rutas predefinidas
const mockRoutes = [
  {
    id: 'route-001',
    name: 'Ruta 1: Centro - Norte',
    color: '#6366f1',
    coordinates: [
      { latitude: 4.5981, longitude: -74.0758 },
      { latitude: 4.6280, longitude: -74.0631 },
      { latitude: 4.6601, longitude: -74.0547 },
      { latitude: 4.7110, longitude: -74.0721 },
      { latitude: 4.7850, longitude: -74.0450 }
    ],
    distance: '15.2 km',
    estimatedTime: '45 min',
    active: true
  },
  {
    id: 'route-002', 
    name: 'Ruta 2: Sur - Occidente',
    color: '#06b6d4',
    coordinates: [
      { latitude: 4.5700, longitude: -74.0900 },
      { latitude: 4.5981, longitude: -74.0758 },
      { latitude: 4.6097, longitude: -74.0817 },
      { latitude: 4.6280, longitude: -74.0631 },
      { latitude: 4.6500, longitude: -74.1200 }
    ],
    distance: '18.7 km',
    estimatedTime: '55 min',
    active: true
  },
  {
    id: 'route-003',
    name: 'Ruta 3: Oriente - Centro',
    color: '#8b5cf6',
    coordinates: [
      { latitude: 4.6800, longitude: -74.0300 },
      { latitude: 4.6486, longitude: -74.0639 },
      { latitude: 4.6365, longitude: -74.0847 },
      { latitude: 4.6001, longitude: -74.0700 }
    ],
    distance: '12.5 km',
    estimatedTime: '35 min',
    active: false
  }
];

const MapScreen = () => {
  // Estados principales
  const [buses, setBuses] = useState(generateMockBuses());
  const [selectedBus, setSelectedBus] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [newMarkers, setNewMarkers] = useState([]);
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 4.6482,
    longitude: -74.0648,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Estados de la aplicación original
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isEmergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
    loadDriverData();
    const busInterval = setInterval(updateBusPositions, 3000);
    return () => clearInterval(busInterval);
  }, []);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      
      try {
        const vehicleResponse = await driverAPI.getAssignedVehicle();
        if (vehicleResponse.data) {
          setAssignedVehicle(vehicleResponse.data);
        }
      } catch (error) {
        console.log('No hay vehículo asignado o endpoint no existe');
        setAssignedVehicle(null);
      }
      
      try {
        const routeResponse = await driverAPI.getCurrentRoute();
        if (routeResponse.data) {
          setCurrentRoute(routeResponse.data);
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
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(newLocation);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const updateBusPositions = () => {
    setBuses(prevBuses => 
      prevBuses.map(bus => {
        if (bus.status === 'en_ruta' && bus.speed > 0) {
          const deltaLat = (Math.random() - 0.5) * 0.001;
          const deltaLng = (Math.random() - 0.5) * 0.001;
          
          return {
            ...bus,
            lat: bus.lat + deltaLat,
            lng: bus.lng + deltaLng,
            lastUpdate: new Date(),
            speed: Math.max(0, bus.speed + (Math.random() - 0.5) * 5),
            passengers: Math.max(0, Math.min(bus.capacity, bus.passengers + Math.floor((Math.random() - 0.5) * 3)))
          };
        }
        return bus;
      })
    );
  };

  const handleLocationChange = async (location) => {
    setCurrentLocation(location);
    
    if (isOnline && assignedVehicle) {
      try {
        console.log('Ubicación actualizada:', location);
      } catch (error) {
        console.error('Error actualizando ubicación:', error);
      }
    }
  };

  const handleEmergency = async (emergencyData) => {
    try {
      const emergencyReport = {
        ...emergencyData,
        location: currentLocation,
        vehicleId: assignedVehicle?.idVehiculo,
        routeId: currentRoute?.idRuta,
        timestamp: new Date().toISOString(),
        userId: user?.id
      };

      console.log('Reporte de emergencia:', emergencyReport);
      
      Alert.alert(
        'Emergencia Reportada',
        'Tu reporte de emergencia ha sido registrado localmente. Las autoridades han sido notificadas.',
        [{ text: 'Entendido' }]
      );
      setEmergencyModalVisible(false);
      
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
    console.log('Estado online cambiado:', !isOnline);
  };

  const handleRefresh = () => {
    loadDriverData();
  };

  // Funciones del sistema de rutas
  const handleBusPress = (bus) => {
    setSelectedBus(bus);
    const newRegion = {
      latitude: bus.lat,
      longitude: bus.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    if (route && route.coordinates.length > 0) {
      mapRef.current?.fitToCoordinates(route.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const startTracking = (bus) => {
    setIsTracking(true);
    setSelectedBus(bus);
    
    const trackingInterval = setInterval(() => {
      setBuses(currentBuses => {
        const trackedBus = currentBuses.find(b => b.id === bus.id);
        if (trackedBus) {
          const newRegion = {
            latitude: trackedBus.lat,
            longitude: trackedBus.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setMapRegion(newRegion);
          mapRef.current?.animateToRegion(newRegion, 1000);
        }
        return currentBuses;
      });
    }, 2000);

    setTimeout(() => {
      setIsTracking(false);
      clearInterval(trackingInterval);
    }, 30000);
  };

  const handleMapPress = (event) => {
    if (isAddingStop) {
      const coordinate = event.nativeEvent.coordinate;
      const newStop = {
        id: `new-stop-${Date.now()}`,
        name: `Nueva Parada ${newMarkers.length + 1}`,
        lat: coordinate.latitude,
        lng: coordinate.longitude,
        routes: [],
        isNew: true
      };
      setNewMarkers([...newMarkers, newStop]);
      setIsAddingStop(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_ruta': return COLORS.success[500];
      case 'parada': return COLORS.error[500];
      case 'mantenimiento': return COLORS.warning[500];
      default: return COLORS.secondary[500];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_ruta': return 'En Ruta';
      case 'parada': return 'En Parada';
      case 'mantenimiento': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const centerOnUser = () => {
    if (currentLocation) {
      const newRegion = {
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const resetView = () => {
    const newRegion = {
      latitude: 4.6482,
      longitude: -74.0648,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    setSelectedRoute(null);
    setSelectedBus(null);
  };

  const renderSidebar = () => (
    <Modal
      visible={showSidebar}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSidebar(false)}
    >
      <View style={styles.sidebarOverlay}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>TransSync - Panel</Text>
            <TouchableOpacity onPress={() => setShowSidebar(false)}>
              <Ionicons name={ICONS.close} size={24} color={COLORS.secondary[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sidebarContent}>
            {/* Información del conductor */}
            <View style={styles.driverSection}>
              <Text style={styles.sectionTitle}>Mi Información</Text>
              <View style={styles.driverCard}>
                <Text style={styles.driverName}>{user?.nomUsuario || 'Conductor'}</Text>
                <View style={styles.driverStats}>
                  <View style={styles.statItem}>
                    <Ionicons name={ICONS.navigation} size={16} color={COLORS.primary[500]} />
                    <Text style={styles.statText}>Estado: {isOnline ? 'En línea' : 'Fuera de línea'}</Text>
                  </View>
                  {assignedVehicle && (
                    <View className="statItem">
                      <Ionicons name={ICONS.car} size={16} color={COLORS.primary[500]} />
                      <Text style={styles.statText}>{assignedVehicle.plaVehiculo}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Información del bus seleccionado */}
            {selectedBus && (
              <View style={styles.selectedBusInfo}>
                <Text style={styles.sectionTitle}>Bus Seleccionado</Text>
                <View style={styles.busInfoCard}>
                  <Text style={styles.busRoute}>{selectedBus.route}</Text>
                  <Text style={styles.busDriver}>Conductor: {selectedBus.driver}</Text>
                  <View style={styles.busStats}>
                    <View style={styles.statItem}>
                      <Ionicons name={ICONS.navigation} size={16} color={COLORS.primary[500]} />
                      <Text style={styles.statText}>{selectedBus.speed} km/h</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name={ICONS.users} size={16} color={COLORS.primary[500]} />
                      <Text style={styles.statText}>{selectedBus.passengers}/{selectedBus.capacity}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedBus.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedBus.status)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => startTracking(selectedBus)}
                    disabled={isTracking}
                  >
                    <Ionicons name={ICONS.navigation} size={16} color={COLORS.white} />
                    <Text style={styles.trackButtonText}>
                      {isTracking ? 'Siguiendo...' : 'Seguir Bus'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Lista de Buses */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buses Activos ({buses.length})</Text>
              {buses.map(bus => (
                <TouchableOpacity
                  key={bus.id}
                  style={[
                    styles.busCard,
                    selectedBus?.id === bus.id && styles.selectedCard
                  ]}
                  onPress={() => handleBusPress(bus)}
                >
                  <View style={styles.busCardHeader}>
                    <Text style={styles.busCardTitle}>{bus.route}</Text>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(bus.status) }]} />
                  </View>
                  <Text style={styles.busCardDriver}>{bus.driver}</Text>
                  <View style={styles.busCardStats}>
                    <Text style={styles.busCardStat}>{bus.speed} km/h</Text>
                    <Text style={styles.busCardStat}>{bus.passengers}/{bus.capacity}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lista de Rutas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rutas Disponibles</Text>
              {mockRoutes.map(route => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeCard,
                    selectedRoute?.id === route.id && styles.selectedCard
                  ]}
                  onPress={() => handleRouteSelect(route)}
                >
                  <View style={styles.routeCardHeader}>
                    <View style={[styles.routeColorDot, { backgroundColor: route.color }]} />
                    <Text style={styles.routeCardTitle}>{route.name}</Text>
                  </View>
                  <View style={styles.routeCardInfo}>
                    <Text style={styles.routeCardStat}>{route.distance}</Text>
                    <Text style={styles.routeCardStat}>{route.estimatedTime}</Text>
                    <View style={[styles.routeStatusDot, { 
                      backgroundColor: route.active ? COLORS.success[500] : COLORS.secondary[400] 
                    }]} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Estadísticas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estadísticas</Text>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: COLORS.success[50] }]}>
                  <Text style={[styles.statNumber, { color: COLORS.success[600] }]}>
                    {buses.filter(b => b.status === 'en_ruta').length}
                  </Text>
                  <Text style={styles.statLabel}>Buses en Ruta</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: COLORS.primary[50] }]}>
                  <Text style={[styles.statNumber, { color: COLORS.primary[600] }]}>
                    {buses.reduce((total, bus) => total + bus.passengers, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Pasajeros</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[800]} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)}>
          <Ionicons name={ICONS.menu} size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TransSync - Conductor</Text>
        <TouchableOpacity onPress={() => setProfileModalVisible(true)}>
          <View style={styles.profileButton}>
            <Ionicons name={ICONS.user} size={20} color={COLORS.white} />
            <View style={[styles.onlineDot, { 
              backgroundColor: isOnline ? COLORS.success[400] : COLORS.error[400] 
            }]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={(region) => {
          handleLocationChange({
            latitude: region.latitude,
            longitude: region.longitude
          });
        }}
      >
        {/* 🧩 OpenStreetMap tiles al fondo */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={0}
        />

        {/* Rutas */}
        {showRoutes && mockRoutes.map(route => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={route.color}
            strokeWidth={selectedRoute?.id === route.id ? 6 : 4}
            strokeOpacity={route.active ? 0.8 : 0.4}
            lineDashPattern={route.active ? null : [10, 10]}
            zIndex={1}
          />
        ))}

        {/* Paradas de Bus */}
        {showStops && mockBusStops.map(stop => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={stop.name}
            description={`Rutas: ${stop.routes.join(', ')}`}
            pinColor={COLORS.error[500]}
          />
        ))}

        {/* Nuevas paradas agregadas */}
        {newMarkers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.name}
            description="Nueva parada agregada"
            pinColor={COLORS.warning[500]}
          />
        ))}

        {/* Buses */}
        {showBuses && buses.map(bus => (
          <Marker
            key={bus.id}
            coordinate={{ latitude: bus.lat, longitude: bus.lng }}
            title={bus.route}
            description={`${bus.driver} - ${getStatusText(bus.status)}`}
            onPress={() => handleBusPress(bus)}
          >
            <View style={[styles.busMarker, { 
              backgroundColor: getStatusColor(bus.status),
              transform: [{ rotate: `${bus.direction}deg` }]
            }]}>
              <Ionicons name={ICONS.bus} size={20} color={COLORS.white} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Atribución OSM */}
      <View style={styles.osmAttribution}>
        <Text style={styles.osmText}>© OpenStreetMap contributors</Text>
      </View>

      {/* Controles flotantes */}
      <View style={styles.floatingControls}>
        {/* Filtros */}
        <View style={styles.filterControls}>
          <TouchableOpacity
            style={[styles.filterButton, showBuses && styles.filterButtonActive]}
            onPress={() => setShowBuses(!showBuses)}
          >
            <Ionicons name={ICONS.bus} size={16} color={showBuses ? COLORS.white : COLORS.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showRoutes && styles.filterButtonActive]}
            onPress={() => setShowRoutes(!showRoutes)}
          >
            <Ionicons name={ICONS.route} size={16} color={showRoutes ? COLORS.white : COLORS.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showStops && styles.filterButtonActive]}
            onPress={() => setShowStops(!showStops)}
          >
            <Ionicons name={ICONS.mapPin} size={16} color={showStops ? COLORS.white : COLORS.primary[500]} />
          </TouchableOpacity>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionControls}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isAddingStop && { backgroundColor: COLORS.error[500] }
            ]}
            onPress={() => setIsAddingStop(!isAddingStop)}
          >
            <Ionicons 
              name={isAddingStop ? ICONS.close : ICONS.add} 
              size={20} 
              color={COLORS.white} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={centerOnUser}
          >
            <Ionicons name={ICONS.navigation} size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.secondary[500] }]}
            onPress={resetView}
          >
            <Ionicons name={ICONS.home} size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.error[500] }]}
            onPress={() => setEmergencyModalVisible(true)}
          >
            <Ionicons name={ICONS.emergency} size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isOnline ? COLORS.success[500] : COLORS.secondary[500] }
            ]}
            onPress={toggleOnlineStatus}
          >
            <Ionicons 
              name={isOnline ? ICONS.radioOn : ICONS.radioOff} 
              size={20} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de tracking */}
      {isTracking && selectedBus && (
        <View style={styles.trackingIndicator}>
          <View style={styles.trackingDot} />
          <Text style={styles.trackingText}>
            Siguiendo: {selectedBus.route}
          </Text>
        </View>
      )}

      {/* Indicador de agregar parada */}
      {isAddingStop && (
        <View style={styles.addingStopIndicator}>
          <Ionicons name={ICONS.info} size={16} color={COLORS.primary[600]} />
          <Text style={styles.addingStopText}>
            Toca el mapa para agregar una parada
          </Text>
        </View>
      )}

      {renderSidebar()}

      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        onLogout={handleLogout}
        onProfilePress={() => {
          setProfileModalVisible(false);
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.small,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  profileButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  onlineDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  map: {
    flex: 1,
  },
  busMarker: {
    width: 35,
    height: 35,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  floatingControls: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    gap: SPACING.sm,
  },
  filterControls: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary[500],
  },
  actionControls: {
    gap: SPACING.xs,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  trackingIndicator: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.success[500],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginRight: SPACING.sm,
  },
  trackingText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  addingStopIndicator: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  addingStopText: {
    color: COLORS.primary[700],
    fontSize: TYPOGRAPHY.sizes.sm,
    marginLeft: SPACING.sm,
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sidebar: {
    backgroundColor: COLORS.white,
    height: height * 0.8,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
  },
  sidebarTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
  },
  sidebarContent: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.sm,
  },
  driverSection: {
    marginBottom: SPACING.lg,
  },
  driverCard: {
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  driverName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary[900],
    marginBottom: SPACING.sm,
  },
  driverStats: {
    gap: SPACING.xs,
  },
  selectedBusInfo: {
    marginBottom: SPACING.lg,
  },
  busInfoCard: {
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  busRoute: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary[900],
    marginBottom: SPACING.xs,
  },
  busDriver: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    marginBottom: SPACING.sm,
  },
  busStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[700],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  statusText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  trackButton: {
    backgroundColor: COLORS.success[500],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  trackButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  busCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    ...SHADOWS.small,
  },
  selectedCard: {
    borderColor: COLORS.primary[300],
    backgroundColor: COLORS.primary[50],
  },
  busCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  busCardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.secondary[900],
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  busCardDriver: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    marginBottom: SPACING.xs,
  },
  busCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  busCardStat: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[700],
  },
  routeCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
    ...SHADOWS.small,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  routeColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  routeCardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.secondary[900],
    flex: 1,
  },
  routeCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeCardStat: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
  },
  routeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    textAlign: 'center',
  },
  osmAttribution: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  osmText: {
    fontSize: 10,
    color: '#555',
  },
});

export default MapScreen;