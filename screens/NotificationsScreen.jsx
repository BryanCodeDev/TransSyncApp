import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Simular notificaciones
    setNotifications([
      {
        id: '1',
        tipo: 'emergencia',
        titulo: 'Emergencia reportada',
        mensaje: 'Se ha reportado una emergencia en tu ruta actual. Mantente alerta y sigue los protocolos de seguridad.',
        fecha: new Date(Date.now() - 30 * 60 * 1000),
        leida: false,
        prioridad: 'alta'
      },
      {
        id: '2',
        tipo: 'sistema',
        titulo: 'Mantenimiento programado',
        mensaje: 'Tu vehículo ABC-123 tiene mantenimiento programado para mañana a las 8:00 AM en el taller central.',
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
        leida: false,
        prioridad: 'media'
      },
      {
        id: '3',
        tipo: 'ruta',
        titulo: 'Cambio de ruta',
        mensaje: 'Se ha actualizado tu ruta asignada. Ahora estás asignado a la Ruta Centro - Norte.',
        fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
        leida: true,
        prioridad: 'media'
      },
      {
        id: '4',
        tipo: 'informacion',
        titulo: 'Nueva actualización disponible',
        mensaje: 'La aplicación TransSync se ha actualizado con nuevas funciones de seguridad y rendimiento.',
        fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
        leida: true,
        prioridad: 'baja'
      },
      {
        id: '5',
        tipo: 'emergencia',
        titulo: 'Alerta de tráfico',
        mensaje: 'Congestión vehicular reportada en la Avenida Principal. Se recomienda usar rutas alternas.',
        fecha: new Date(Date.now() - 48 * 60 * 60 * 1000),
        leida: true,
        prioridad: 'alta'
      }
    ]);
  }, []);

  const getNotificationIcon = (tipo) => {
    const icons = {
      emergencia: 'alert-circle',
      sistema: 'settings',
      ruta: 'git-branch',
      informacion: 'information-circle',
      default: 'notifications'
    };
    return icons[tipo] || icons.default;
  };

  const getNotificationColor = (tipo, prioridad) => {
    if (prioridad === 'alta') return COLORS.error[600];
    
    const colors = {
      emergencia: COLORS.error[600],
      sistema: COLORS.warning[600],
      ruta: COLORS.primary[600],
      informacion: COLORS.success[600],
      default: COLORS.secondary[600]
    };
    return colors[tipo] || colors.default;
  };

  const formatDate = (fecha) => {
    const now = new Date();
    const diff = now - fecha;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;
    return fecha.toLocaleDateString();
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(notif => notif.id !== id));
          }
        }
      ]
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, leida: true }))
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Eliminar todas',
      '¿Estás seguro de que quieres eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todas',
          style: 'destructive',
          onPress: () => setNotifications([])
        }
      ]
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.leida;
    if (filter === 'high') return notif.prioridad === 'alta';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.leida).length;

  const NotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.leida && styles.unreadItem]}
      onPress={() => !item.leida && markAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.notificationIcon,
          { backgroundColor: `${getNotificationColor(item.tipo, item.prioridad)}15` }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.tipo)}
            size={24}
            color={getNotificationColor(item.tipo, item.prioridad)}
          />
        </View>

        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              !item.leida && styles.unreadTitle
            ]}>
              {item.titulo}
            </Text>
            {item.prioridad === 'alta' && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>ALTA</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.mensaje}
          </Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationDate}>
              {formatDate(item.fecha)}
            </Text>
            {!item.leida && <View style={styles.unreadDot} />}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close" size={20} color={COLORS.secondary[400]} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ id, label, active }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.activeFilterButton]}
      onPress={() => setFilter(id)}
    >
      <Text style={[
        styles.filterButtonText,
        active && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </Text>
        </View>
        
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons 
                name="checkmark-done" 
                size={20} 
                color={unreadCount > 0 ? COLORS.primary[600] : COLORS.secondary[400]} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={clearAll}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error[600]} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <FilterButton id="all" label="Todas" active={filter === 'all'} />
        <FilterButton 
          id="unread" 
          label={`Sin leer (${unreadCount})`} 
          active={filter === 'unread'} 
        />
        <FilterButton id="high" label="Alta prioridad" active={filter === 'high'} />
      </View>

      {/* Lista de notificaciones */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={COLORS.secondary[300]} />
          <Text style={styles.emptyStateTitle}>
            {filter === 'all' ? 'No hay notificaciones' : 
             filter === 'unread' ? 'No hay notificaciones sin leer' : 
             'No hay notificaciones de alta prioridad'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {filter === 'all' 
              ? 'Te notificaremos cuando recibas mensajes importantes'
              : 'Todas las notificaciones han sido leídas'
            }
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.secondary[700],
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[600],
    ...SHADOWS.medium,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.secondary[800],
    flex: 1,
  },
  unreadTitle: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
  },
  priorityBadge: {
    backgroundColor: COLORS.error[500],
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[600],
  },
  deleteButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[700],
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[500],
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;