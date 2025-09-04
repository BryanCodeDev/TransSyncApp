import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import BottomTabMenu from '../components/BottomTabMenu';
import EmergencyModal from '../components/EmergencyModal';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const MenuScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

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
  }, []);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      'Estado actualizado',
      `Ahora estás ${!isOnline ? 'en línea' : 'desconectado'}`,
      [{ text: 'OK' }]
    );
  };

  const handleEmergencyPress = () => {
    setEmergencyModalVisible(true);
  };

  const handleEmergencySubmit = async (emergencyData) => {
    console.log('Emergency data:', emergencyData);
    Alert.alert(
      'Emergencia reportada',
      'Tu reporte de emergencia ha sido enviado exitosamente',
      [{ text: 'OK' }]
    );
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen === 'settings' ? 'Profile' : screen === 'notifications' ? 'Notifications' : screen === 'map' ? 'Map' : 'Home');
  };

  const menuSections = [
    {
      title: 'Estado del Servicio',
      items: [
        {
          id: 'status',
          title: 'Estado de Conexión',
          subtitle: isOnline ? 'En línea - Disponible para viajes' : 'Desconectado - No disponible',
          icon: 'radio-button-on',
          color: isOnline ? COLORS.success[600] : COLORS.error[600],
          action: 'toggle',
          value: isOnline,
          onToggle: handleToggleOnline
        },
        {
          id: 'location',
          title: 'GPS y Ubicación',
          subtitle: 'Sistema de localización activo',
          icon: 'location',
          color: COLORS.primary[600],
          action: 'navigate',
          screen: 'Map'
        }
      ]
    },
    {
      title: 'Información del Vehículo',
      items: assignedVehicle ? [
        {
          id: 'vehicle',
          title: `Vehículo ${assignedVehicle.plaVehiculo}`,
          subtitle: `${assignedVehicle.marVehiculo} ${assignedVehicle.modVehiculo} - Cap: ${assignedVehicle.capVehiculo} pasajeros`,
          icon: 'car',
          color: COLORS.primary[600],
          badge: assignedVehicle.estVehiculo === 'activo' ? 'Activo' : 'Inactivo',
          badgeColor: assignedVehicle.estVehiculo === 'activo' ? COLORS.success[600] : COLORS.error[600]
        }
      ] : [
        {
          id: 'no-vehicle',
          title: 'Sin vehículo asignado',
          subtitle: 'Contacta con tu supervisor',
          icon: 'car-outline',
          color: COLORS.secondary[400]
        }
      ]
    },
    {
      title: 'Ruta Actual',
      items: currentRoute ? [
        {
          id: 'route',
          title: currentRoute.nomRuta,
          subtitle: `${currentRoute.oriRuta} → ${currentRoute.desRuta}`,
          icon: 'git-branch',
          color: COLORS.success[600]
        }
      ] : [
        {
          id: 'no-route',
          title: 'Sin ruta asignada',
          subtitle: 'Selecciona una ruta para comenzar',
          icon: 'git-branch-outline',
          color: COLORS.secondary[400]
        }
      ]
    },
    {
      title: 'Herramientas',
      items: [
        {
          id: 'statistics',
          title: 'Estadísticas',
          subtitle: 'Rendimiento y métricas',
          icon: 'bar-chart',
          color: COLORS.secondary[600],
          action: 'navigate'
        },
        {
          id: 'reports',
          title: 'Reportes',
          subtitle: 'Historial de viajes',
          icon: 'document-text',
          color: COLORS.secondary[600],
          action: 'navigate'
        },
        {
          id: 'maintenance',
          title: 'Mantenimiento',
          subtitle: 'Estado del vehículo',
          icon: 'construct',
          color: COLORS.warning[600],
          action: 'navigate'
        }
      ]
    },
    {
      title: 'Configuración',
      items: [
        {
          id: 'profile',
          title: 'Mi Perfil',
          subtitle: 'Información personal y configuración',
          icon: 'person',
          color: COLORS.primary[600],
          action: 'navigate',
          screen: 'Profile'
        },
        {
          id: 'notifications',
          title: 'Notificaciones',
          subtitle: 'Alertas y mensajes',
          icon: 'notifications',
          color: COLORS.warning[600],
          action: 'navigate',
          screen: 'Notifications',
          badge: '5'
        },
        {
          id: 'help',
          title: 'Ayuda y Soporte',
          subtitle: 'Centro de ayuda y contacto',
          icon: 'help-circle',
          color: COLORS.secondary[600],
          action: 'navigate'
        },
        {
          id: 'logout',
          title: 'Cerrar Sesión',
          subtitle: 'Salir de la aplicación',
          icon: 'log-out',
          color: COLORS.error[600],
          action: 'logout'
        }
      ]
    }
  ];

  const handleItemPress = (item) => {
    switch (item.action) {
      case 'toggle':
        if (item.onToggle) item.onToggle();
        break;
      case 'navigate':
        if (item.screen) {
          navigation.navigate(item.screen);
        }
        break;
      case 'logout':
        Alert.alert(
          'Cerrar Sesión',
          '¿Estás seguro de que quieres cerrar sesión?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Cerrar Sesión', 
              style: 'destructive',
              onPress: () => logout()
            }
          ]
        );
        break;
      default:
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
    }
  };

  const MenuItem = ({ item, isLast }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      
      <View style={styles.menuContent}>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
        
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: item.badgeColor || COLORS.primary[600] }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        
        {item.action === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: COLORS.secondary[300], true: `${item.color}30` }}
            thumbColor={item.value ? item.color : COLORS.secondary[500]}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.secondary[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Menú Principal"
        user={user}
        onProfilePress={() => navigation.navigate('Profile')}
        showNotifications={true}
        notificationCount={5}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {menuSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    isLast={itemIndex === section.items.length - 1}
                  />
                ))}
              </View>
            </View>
          ))}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>

      <BottomTabMenu
        currentRoute="menu"
        onNavigate={handleNavigate}
        onEmergencyPress={handleEmergencyPress}
        notificationCount={5}
        isOnline={isOnline}
      />

      <EmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        onSubmit={handleEmergencySubmit}
        currentLocation={currentLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for bottom tab menu
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[700],
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
  badge: {
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});

export default MenuScreen;