import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, ICONS } from '../utils/constants';

const FloatingSidebarMenu = ({ 
  onEmergencyPress,
  onToggleOnline,
  isOnline,
  onCenterLocation,
  assignedVehicle,
  currentRoute,
  animated = new Animated.Value(1)
}) => {
  return (
    <Animated.View style={[styles.container, {
      opacity: animated,
      transform: [{ scale: animated }]
    }]}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: isOnline ? COLORS.success[500] : COLORS.secondary[400] }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isOnline ? COLORS.success[100] : COLORS.secondary[100] }
            ]} />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={[
              styles.statusText,
              { color: isOnline ? COLORS.success[700] : COLORS.secondary[700] }
            ]}>
              {isOnline ? 'En línea' : 'Desconectado'}
            </Text>
            <Text style={styles.statusSubtext}>
              {isOnline ? 'Disponible para viajes' : 'No disponible'}
            </Text>
          </View>
        </View>

        {assignedVehicle && (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleIcon}>
              <Ionicons name={ICONS.car} size={16} color={COLORS.primary[600]} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehiclePlate}>
                {assignedVehicle.plaVehiculo}
              </Text>
              <Text style={styles.vehicleModel}>
                {assignedVehicle.marVehiculo} {assignedVehicle.modVehiculo}
              </Text>
            </View>
            <View style={[
              styles.vehicleStatus,
              { backgroundColor: assignedVehicle.estVehiculo?.toLowerCase() === 'activo' 
                  ? COLORS.success[100] 
                  : COLORS.error[100] 
              }
            ]}>
              <Text style={[
                styles.vehicleStatusText,
                { color: assignedVehicle.estVehiculo?.toLowerCase() === 'activo' 
                    ? COLORS.success[700] 
                    : COLORS.error[700] 
                }
              ]}>
                {assignedVehicle.estVehiculo?.toLowerCase() === 'activo' ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        {/* Primary Actions */}
        <View style={styles.primaryActions}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.emergencyButton]}
            onPress={onEmergencyPress}
            activeOpacity={0.8}
          >
            <View style={styles.emergencyButtonContent}>
              <Ionicons 
                name={ICONS.emergency} 
                size={22} 
                color={COLORS.white} 
              />
              <Text style={styles.emergencyButtonText}>SOS</Text>
            </View>
            <View style={styles.emergencyPulse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              styles.toggleButton,
              { backgroundColor: isOnline ? COLORS.success[500] : COLORS.secondary[500] }
            ]}
            onPress={onToggleOnline}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isOnline ? ICONS.radioOn : ICONS.radioOff}
              size={22} 
              color={COLORS.white} 
            />
            <Text style={styles.toggleButtonText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onCenterLocation}
            activeOpacity={0.7}
          >
            <View style={styles.secondaryButtonIcon}>
              <Ionicons 
                name={ICONS.navigation} 
                size={18} 
                color={COLORS.primary[600]} 
              />
            </View>
            <Text style={styles.secondaryButtonText}>Ubicación</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Info */}
      {currentRoute && (
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Ionicons name="git-branch-outline" size={16} color={COLORS.primary[600]} />
            <Text style={styles.routeTitle}>Ruta Activa</Text>
          </View>
          <Text style={styles.routeName} numberOfLines={1}>
            {currentRoute.nomRuta}
          </Text>
          <View style={styles.routeDirection}>
            <Text style={styles.routeOrigin} numberOfLines={1}>
              {currentRoute.oriRuta}
            </Text>
            <Ionicons name="arrow-forward" size={12} color={COLORS.primary[500]} />
            <Text style={styles.routeDestination} numberOfLines={1}>
              {currentRoute.desRuta}
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
    top: 100,
    left: SPACING.md,
    width: 200,
    zIndex: 100,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.large,
    borderWidth: 0.5,
    borderColor: COLORS.secondary[200],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 16,
  },
  statusSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    lineHeight: 14,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  vehicleIcon: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[700],
    lineHeight: 16,
  },
  vehicleModel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary[600],
    lineHeight: 14,
  },
  vehicleStatus: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  vehicleStatusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionsSection: {
    marginBottom: SPACING.sm,
  },
  primaryActions: {
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  emergencyButton: {
    backgroundColor: COLORS.error[500],
  },
  emergencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    zIndex: 1,
  },
  emergencyButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emergencyPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.xl,
  },
  toggleButton: {
    gap: SPACING.xs,
  },
  toggleButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
  },
  secondaryButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  secondaryButtonText: {
    color: COLORS.primary[700],
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  routeTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary[700],
    marginLeft: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  routeDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  routeOrigin: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  routeDestination: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'right',
  },
});

export default FloatingSidebarMenu;