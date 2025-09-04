// components/FloatingSidebarMenu.jsx - Sidebar flotante minimalista
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, ICONS } from '../utils/constants';

const FloatingSidebarMenu = ({ 
  onEmergencyPress,
  onToggleOnline,
  isOnline,
  onCenterLocation,
  assignedVehicle,
  currentRoute 
}) => {
  return (
    <View style={styles.container}>
      {/* Información compacta del conductor */}
      <View style={styles.infoSection}>
        <View style={[
          styles.onlineIndicator,
          { backgroundColor: isOnline ? COLORS.success[100] : COLORS.secondary[100] }
        ]}>
          <View style={[
            styles.onlineDot,
            { backgroundColor: isOnline ? COLORS.success[500] : COLORS.secondary[500] }
          ]} />
          <Text style={[
            styles.onlineText,
            { color: isOnline ? COLORS.success[700] : COLORS.secondary[700] }
          ]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {assignedVehicle && (
          <View style={styles.vehicleInfo}>
            <Ionicons name={ICONS.car} size={12} color={COLORS.primary[500]} />
            <Text style={styles.vehicleText}>
              {assignedVehicle.plaVehiculo}
            </Text>
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsSection}>
        {/* Centro en ubicación */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onCenterLocation}
        >
          <Ionicons 
            name={ICONS.navigation} 
            size={20} 
            color={COLORS.primary[600]} 
          />
        </TouchableOpacity>

        {/* Toggle estado online */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isOnline ? COLORS.success[50] : COLORS.secondary[50] }
          ]}
          onPress={onToggleOnline}
        >
          <Ionicons 
            name={isOnline ? ICONS.radioOn : ICONS.radioOff}
            size={20} 
            color={isOnline ? COLORS.success[600] : COLORS.secondary[600]} 
          />
        </TouchableOpacity>

        {/* Emergencia */}
        <TouchableOpacity
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={onEmergencyPress}
        >
          <Ionicons 
            name={ICONS.emergency} 
            size={20} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120, // Debajo del header
    left: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    minWidth: 160,
    ...SHADOWS.large,
  },
  infoSection: {
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  onlineText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  vehicleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionsSection: {
    gap: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary[50],
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  emergencyButton: {
    backgroundColor: COLORS.error[500],
  },
});

export default FloatingSidebarMenu;