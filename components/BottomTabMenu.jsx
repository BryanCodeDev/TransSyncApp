import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../utils/constants';

const BottomTabMenu = ({ 
  currentRoute, 
  onNavigate, 
  onEmergencyPress, 
  notificationCount = 0,
  isOnline = false 
}) => {
  const tabs = [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      iconOutline: 'home-outline'
    },
    {
      id: 'map',
      label: 'Mapa',
      icon: 'map',
      iconOutline: 'map-outline'
    },
    {
      id: 'emergency',
      label: 'Emergencia',
      icon: 'alert-circle',
      iconOutline: 'alert-circle-outline',
      isEmergency: true
    },
    {
      id: 'notifications',
      label: 'Alertas',
      icon: 'notifications',
      iconOutline: 'notifications-outline',
      badge: notificationCount
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'menu',
      iconOutline: 'menu-outline'
    }
  ];

  const handleTabPress = (tab) => {
    if (tab.isEmergency) {
      onEmergencyPress();
    } else {
      onNavigate(tab.id);
    }
  };

  const TabItem = ({ tab, isActive }) => (
    <TouchableOpacity
      style={[styles.tabItem, isActive && styles.activeTabItem]}
      onPress={() => handleTabPress(tab)}
      activeOpacity={0.7}
    >
      <View style={styles.tabIconContainer}>
        <Ionicons
          name={isActive ? tab.icon : tab.iconOutline}
          size={tab.isEmergency ? 28 : 24}
          color={
            tab.isEmergency 
              ? COLORS.error[500] 
              : isActive 
                ? COLORS.primary[600] 
                : COLORS.secondary[500]
          }
        />
        
        {/* Badge para notificaciones */}
        {tab.badge && tab.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}

        {/* Indicador de estado online para el botón de emergencia */}
        {tab.isEmergency && (
          <View style={[
            styles.onlineIndicator, 
            { backgroundColor: isOnline ? COLORS.success[500] : COLORS.secondary[400] }
          ]} />
        )}
      </View>
      
      <Text style={[
        styles.tabLabel,
        tab.isEmergency && styles.emergencyTabLabel,
        isActive && !tab.isEmergency && styles.activeTabLabel
      ]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={currentRoute === tab.id}
          />
        ))}
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Safe area for iOS
    ...SHADOWS.large,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  activeTabItem: {
    // Podrías agregar un background color aquí si quisieras
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activeTabLabel: {
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emergencyTabLabel: {
    color: COLORS.error[500],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 14,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

export default BottomTabMenu;