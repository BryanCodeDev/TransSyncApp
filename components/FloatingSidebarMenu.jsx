import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const FloatingSidebarMenu = ({
  onEmergencyPress,
  onToggleOnline,
  isOnline = false,
  onCenterLocation,
  assignedVehicle,
  currentRoute,
  animated
}) => {
  const menuItems = [
    {
      id: 'emergency',
      icon: 'alert-circle',
      label: 'Emergencia',
      color: COLORS.error[600],
      onPress: onEmergencyPress,
      priority: 'high'
    },
    {
      id: 'online-status',
      icon: isOnline ? 'radio-button-on' : 'radio-button-off',
      label: isOnline ? 'En línea' : 'Desconectado',
      color: isOnline ? COLORS.success[600] : COLORS.secondary[500],
      onPress: onToggleOnline,
      priority: 'medium'
    },
    {
      id: 'location',
      icon: 'navigate-circle',
      label: 'Mi ubicación',
      color: COLORS.primary[600],
      onPress: onCenterLocation,
      priority: 'low'
    }
  ];

  const MenuItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        item.priority === 'high' && styles.emergencyItem,
        !isOnline && item.id === 'emergency' && styles.disabledItem
      ]}
      onPress={item.onPress}
      activeOpacity={0.8}
      disabled={!isOnline && item.id === 'emergency'}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
        <Ionicons 
          name={item.icon} 
          size={item.priority === 'high' ? 26 : 22} 
          color={item.color} 
        />
      </View>
      <Text style={[
        styles.menuLabel,
        { color: item.color },
        item.priority === 'high' && styles.emergencyLabel
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [{ 
          translateX: animated.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0]
          })
        }],
        opacity: animated
      }
    ]}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name="information-circle" 
            size={16} 
            color={COLORS.primary[600]} 
          />
          <Text style={styles.statusTitle}>Estado</Text>
        </View>
        
        {/* Vehicle Info */}
        {assignedVehicle ? (
          <View style={styles.infoRow}>
            <Ionicons name="car" size={14} color={COLORS.secondary[600]} />
            <Text style={styles.infoText}>
              {assignedVehicle.plaVehiculo} - {assignedVehicle.marVehiculo}
            </Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={14} color={COLORS.secondary[400]} />
            <Text style={[styles.infoText, { color: COLORS.secondary[400] }]}>
              Sin vehículo asignado
            </Text>
          </View>
        )}

        {/* Route Info */}
        {currentRoute ? (
          <View style={styles.infoRow}>
            <Ionicons name="git-branch" size={14} color={COLORS.secondary[600]} />
            <Text style={styles.infoText} numberOfLines={2}>
              {currentRoute.nomRuta}
            </Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Ionicons name="git-branch-outline" size={14} color={COLORS.secondary[400]} />
            <Text style={[styles.infoText, { color: COLORS.secondary[400] }]}>
              Sin ruta asignada
            </Text>
          </View>
        )}

        {/* Connection Status */}
        <View style={[styles.connectionStatus, isOnline ? styles.onlineStatus : styles.offlineStatus]}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? COLORS.success[500] : COLORS.secondary[400] }]} />
          <Text style={[
            styles.connectionText, 
            { color: isOnline ? COLORS.success[700] : COLORS.secondary[600] }
          ]}>
            {isOnline ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </View>

      {/* Emergency Notice */}
      {!isOnline && (
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="warning" size={14} color={COLORS.warning[600]} />
            <Text style={styles.noticeText}>
              Conéctate para usar funciones de emergencia
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    right: SPACING.md,
    width: 200,
    zIndex: 1000,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
  },
  statusTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[700],
    marginLeft: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    paddingRight: SPACING.xs,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  onlineStatus: {
    backgroundColor: COLORS.success[50],
  },
  offlineStatus: {
    backgroundColor: COLORS.secondary[100],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  connectionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  emergencyItem: {
    backgroundColor: COLORS.error[50],
  },
  disabledItem: {
    opacity: 0.5,
    backgroundColor: COLORS.secondary[50],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  emergencyLabel: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  noticeCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning[500],
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.warning[700],
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 16,
  },
});

export default FloatingSidebarMenu;