import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const Menu = ({ onEmergencyPress, currentRoute, assignedVehicle }) => {
  const MenuIcon = ({ icon, label, onPress, type = 'default' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[
        styles.iconContainer,
        type === 'emergency' ? styles.emergencyIcon : styles.defaultIcon
      ]}>
        <Text style={[
          styles.iconText,
          type === 'emergency' ? styles.emergencyText : styles.defaultText
        ]}>
          {icon}
        </Text>
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
            <Text style={styles.infoValue}>
              {assignedVehicle 
                ? `${assignedVehicle.marVehiculo} ${assignedVehicle.modVehiculo} - ${assignedVehicle.plaVehiculo}` 
                : 'No asignado'
              }
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estado</Text>
            <View style={[
              styles.statusBadge,
              assignedVehicle?.estVehiculo?.toLowerCase() === 'activo' 
                ? styles.activeBadge 
                : styles.inactiveBadge
            ]}>
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
            <Text style={styles.infoLabel}>Ruta actual</Text>
            <Text style={styles.routeName}>{currentRoute.nomRuta}</Text>
            <Text style={styles.routeDirection}>
              {currentRoute.oriRuta} → {currentRoute.desRuta}
            </Text>
          </View>
        )}
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <MenuIcon 
          icon="🗺️" 
          label="Mapa" 
          onPress={() => {}} 
        />
        <MenuIcon 
          icon="🏠" 
          label="Inicio" 
          onPress={() => {}} 
        />
        <MenuIcon 
          icon="🚨" 
          label="Emergencia" 
          onPress={onEmergencyPress}
          type="emergency"
        />
        <MenuIcon 
          icon="⚙️" 
          label="Configuración" 
          onPress={() => {}} 
        />
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
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: COLORS.success[100],
  },
  inactiveBadge: {
    backgroundColor: COLORS.secondary[100],
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'capitalize',
  },
  activeText: {
    color: COLORS.success[700],
  },
  inactiveText: {
    color: COLORS.secondary[600],
  },
  routeInfo: {
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  routeName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary[800],
    marginBottom: 2,
  },
  routeDirection: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[600],
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
    ...SHADOWS.small,
  },
  defaultIcon: {
    backgroundColor: COLORS.primary[50],
  },
  emergencyIcon: {
    backgroundColor: COLORS.error[50],
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[700],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
});

export default Menu;