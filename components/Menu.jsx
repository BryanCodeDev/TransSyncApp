import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const Menu = ({ onEmergencyPress, currentRoute, assignedVehicle, onToggleOnline, isOnline, onRefresh, loading }) => {
  const MenuIcon = ({ iconName, label, onPress, type = 'default' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[
        styles.iconContainer,
        type === 'emergency' ? styles.emergencyIcon : styles.defaultIcon
      ]}>
        <Ionicons 
          name={iconName} 
          size={24} 
          color={type === 'emergency' ? COLORS.error[600] : COLORS.primary[600]} 
        />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Vehicle and Route Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehículo asignado</Text>
            <View style={styles.vehicleInfo}>
              <Ionicons name="bus-outline" size={16} color={COLORS.secondary[600]} />
              <Text style={styles.infoValue}>
                {assignedVehicle 
                  ? `${assignedVehicle.marVehiculo} ${assignedVehicle.modVehiculo} - ${assignedVehicle.plaVehiculo}` 
                  : 'No asignado'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estado</Text>
            <View style={[
              styles.statusBadge,
              assignedVehicle?.estVehiculo?.toLowerCase() === 'activo' 
                ? styles.activeBadge 
                : styles.inactiveBadge
            ]}>
              <Ionicons 
                name={assignedVehicle?.estVehiculo?.toLowerCase() === 'activo' ? 'checkmark-circle' : 'close-circle'} 
                size={12} 
                color={assignedVehicle?.estVehiculo?.toLowerCase() === 'activo' ? COLORS.success[700] : COLORS.error[700]} 
              />
              <Text style={[
                styles.statusText,
                assignedVehicle?.estVehiculo?.toLowerCase() === 'activo' 
                  ? styles.activeText 
                  : styles.inactiveText
              ]}>
                {assignedVehicle?.estVehiculo?.toLowerCase() || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
        
        {currentRoute && (
          <View style={styles.routeInfo}>
            <View style={styles.routeHeader}>
              <Ionicons name="git-branch-outline" size={16} color={COLORS.primary[600]} />
              <Text style={styles.infoLabel}>Ruta actual</Text>
            </View>
            <Text style={styles.routeName}>{currentRoute.nomRuta}</Text>
            <View style={styles.routeDirection}>
              <Text style={styles.routeText}>{currentRoute.oriRuta}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary[600]} />
              <Text style={styles.routeText}>{currentRoute.desRuta}</Text>
            </View>
          </View>
        )}
        
        {/* Online Status Toggle */}
        <TouchableOpacity 
          style={[styles.onlineToggle, isOnline ? styles.onlineActive : styles.onlineInactive]}
          onPress={onToggleOnline}
        >
          <Ionicons 
            name={isOnline ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color={isOnline ? COLORS.success[600] : COLORS.error[600]} 
          />
          <Text style={[
            styles.onlineText, 
            { color: isOnline ? COLORS.success[700] : COLORS.error[700] }
          ]}>
            {isOnline ? 'En línea' : 'Fuera de línea'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <MenuIcon 
          iconName="map-outline" 
          label="Mapa" 
          onPress={() => {}} 
        />
        <MenuIcon 
          iconName="home-outline" 
          label="Inicio" 
          onPress={() => {}} 
        />
        <MenuIcon 
          iconName="alert-circle" 
          label="Emergencia" 
          onPress={onEmergencyPress}
          type="emergency"
        />
        <TouchableOpacity style={styles.menuItem} onPress={onRefresh} disabled={loading}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={loading ? "sync" : "refresh-outline"} 
              size={24} 
              color={COLORS.primary[600]} 
            />
          </View>
          <Text style={styles.menuLabel}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
    ...SHADOWS.large,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoItem: {
    flex: 1,
    marginRight: SPACING.md,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    marginBottom: 2,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginLeft: SPACING.xs,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: COLORS.success[100],
  },
  inactiveBadge: {
    backgroundColor: COLORS.error[100],
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'capitalize',
    marginLeft: SPACING.xs,
  },
  activeText: {
    color: COLORS.success[700],
  },
  inactiveText: {
    color: COLORS.error[700],
  },
  routeInfo: {
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
    marginBottom: SPACING.sm,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  routeName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary[800],
    marginBottom: 2,
  },
  routeDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  routeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[600],
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  onlineActive: {
    backgroundColor: COLORS.success[100],
  },
  onlineInactive: {
    backgroundColor: COLORS.error[100],
  },
  onlineText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING.xs,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.primary[50],
    ...SHADOWS.small,
  },
  emergencyIcon: {
    backgroundColor: COLORS.error[50],
  },
  defaultIcon: {
    backgroundColor: COLORS.primary[50],
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[700],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
});

export default Menu;