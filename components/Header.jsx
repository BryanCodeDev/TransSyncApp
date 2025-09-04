import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../utils/constants';

const Header = ({ 
  title, 
  user, 
  onProfilePress, 
  showNotifications = false, 
  onNotificationsPress,
  showBack = false,
  onBackPress
}) => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Simular notificaciones - aquí puedes integrar con tu sistema real de notificaciones
    const simulateNotifications = () => {
      const mockNotifications = [
        {
          id: '1',
          tipo: 'emergencia',
          titulo: 'Emergencia reportada',
          mensaje: 'Se ha reportado una emergencia en tu ruta actual.',
          fecha: new Date(Date.now() - 30 * 60 * 1000),
          leida: false,
          prioridad: 'alta'
        },
        {
          id: '2',
          tipo: 'sistema',
          titulo: 'Mantenimiento programado',
          mensaje: 'Tu vehículo ABC-123 tiene mantenimiento programado.',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
          leida: false,
          prioridad: 'media'
        },
        {
          id: '3',
          tipo: 'ruta',
          titulo: 'Cambio de ruta',
          mensaje: 'Se ha actualizado tu ruta asignada.',
          fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
          leida: true,
          prioridad: 'media'
        }
      ];
      
      // Contar notificaciones no leídas
      const unreadCount = mockNotifications.filter(n => !n.leida).length;
      setNotificationCount(unreadCount);
    };

    simulateNotifications();

    // Opcional: actualizar periódicamente
    const interval = setInterval(simulateNotifications, 30000); // cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Función para manejar el press en notificaciones
  const handleNotificationsPress = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    }
    // Opcional: marcar como vistas al abrir
    // setNotificationCount(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[600]} />
      
      <View style={styles.header}>
        {/* Left Side - Back button or Logo */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoSection}>
              <Ionicons name="bus" size={28} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
          {user && (
            <Text style={styles.subtitle}>
              {user.nomConductor ? `${user.nomConductor} ${user.apeConductor}` : user.email}
            </Text>
          )}
        </View>

        {/* Right Side - Notifications and Profile */}
        <View style={styles.rightSection}>
          {showNotifications && (
            <TouchableOpacity 
              onPress={handleNotificationsPress} 
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <View>
                <Ionicons name="notifications" size={24} color={COLORS.white} />
                {notificationCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          
          {onProfilePress && (
            <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={20} color={COLORS.primary[600]} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary[600],
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  leftSection: {
    width: 50,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: SPACING.xs,
  },
  logoSection: {
    padding: SPACING.xs,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary[600],
  },
  badgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default Header;