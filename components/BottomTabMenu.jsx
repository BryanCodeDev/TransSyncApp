import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

const BottomTabMenu = ({ 
  currentRoute = 'home',
  onNavigate,
  onEmergencyPress,
  notificationCount = 0,
  isOnline = false
}) => {
  const [selectedTab, setSelectedTab] = useState(currentRoute);
  const animatedValues = useRef({
    home: new Animated.Value(currentRoute === 'home' ? 1 : 0),
    emergency: new Animated.Value(0),
    menu: new Animated.Value(0),
    notifications: new Animated.Value(0),
    map: new Animated.Value(0),
    settings: new Animated.Value(0)
  }).current;
  
  const emergencyPulseAnim = useRef(new Animated.Value(1)).current;

  const tabs = [
    {
      id: 'emergency',
      label: 'SOS',
      icon: 'alert-circle',
      activeIcon: 'alert-circle',
      color: COLORS.error[600],
      position: 'left',
      special: true,
      onPress: () => handleEmergencyPress()
    },
    {
      id: 'notifications',
      label: 'Alertas',
      icon: 'notifications-outline',
      activeIcon: 'notifications',
      color: COLORS.warning[600],
      badge: notificationCount,
      position: 'left',
      onPress: () => handleTabPress('notifications')
    },
    {
      id: 'menu',
      label: 'Menú',
      icon: 'apps-outline',
      activeIcon: 'apps',
      color: COLORS.primary[600],
      position: 'center',
      special: true,
      onPress: () => handleMenuPress()
    },
    {
      id: 'map',
      label: 'Mapa',
      icon: 'map-outline',
      activeIcon: 'map',
      color: COLORS.primary[600],
      position: 'right',
      onPress: () => handleTabPress('map')
    },
    {
      id: 'settings',
      label: 'Config',
      icon: 'settings-outline',
      activeIcon: 'settings',
      color: COLORS.secondary[600],
      position: 'right',
      onPress: () => handleTabPress('settings')
    }
  ];

  useEffect(() => {
    // Emergency button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(emergencyPulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(emergencyPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTabPress = (tabId) => {
    if (selectedTab === tabId) return;

    setSelectedTab(tabId);
    
    // Animate out current tab
    Animated.timing(animatedValues[selectedTab], {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animate in new tab
    Animated.timing(animatedValues[tabId], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (onNavigate) {
      onNavigate(tabId);
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate([10]);
    }
  };

  const handleEmergencyPress = () => {
    // Stronger haptic feedback for emergency
    if (Platform.OS === 'ios') {
      Vibration.vibrate([50, 50, 50]);
    }
    
    if (onEmergencyPress) {
      onEmergencyPress();
    }
  };

  const handleMenuPress = () => {
    handleTabPress('menu');
  };

  const TabButton = ({ tab, isActive }) => {
    const isEmergency = tab.id === 'emergency';
    const isCenter = tab.position === 'center';
    const animatedValue = animatedValues[tab.id];

    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          isCenter && styles.centerTab,
          isEmergency && styles.emergencyTab,
          isActive && styles.activeTab,
          isActive && isEmergency && styles.activeEmergencyTab
        ]}
        onPress={tab.onPress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.tabContent,
            isCenter && styles.centerTabContent,
            isEmergency && styles.emergencyContent,
            isEmergency && {
              transform: [{ scale: emergencyPulseAnim }]
            }
          ]}
        >
          {/* Background indicator for active tab */}
          {isActive && !isEmergency && (
            <Animated.View 
              style={[
                styles.activeIndicator,
                { 
                  opacity: animatedValue,
                  backgroundColor: tab.color + '15'
                }
              ]} 
            />
          )}

          <View style={styles.iconContainer}>
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={isCenter ? 28 : isEmergency ? 26 : 24}
              color={
                isEmergency 
                  ? COLORS.white
                  : isActive 
                    ? tab.color 
                    : COLORS.secondary[500]
              }
            />
            
            {/* Badge for notifications */}
            {tab.badge && tab.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Text>
              </View>
            )}

            {/* Online indicator for menu */}
            {tab.id === 'menu' && isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          
          <Animated.View style={{ opacity: isCenter ? 1 : animatedValue }}>
            <Text 
              style={[
                styles.tabLabel,
                isEmergency && styles.emergencyLabel,
                isActive && !isEmergency && { color: tab.color },
                isActive && !isEmergency && styles.activeLabel
              ]}
            >
              {tab.label}
            </Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const leftTabs = tabs.filter(tab => tab.position === 'left');
  const centerTab = tabs.find(tab => tab.position === 'center');
  const rightTabs = tabs.filter(tab => tab.position === 'right');

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        {/* Left tabs */}
        <View style={styles.sideSection}>
          {leftTabs.map((tab) => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              isActive={selectedTab === tab.id}
            />
          ))}
        </View>

        {/* Center tab (Menu) */}
        <View style={styles.centerSection}>
          <TabButton 
            tab={centerTab} 
            isActive={selectedTab === centerTab.id}
          />
        </View>

        {/* Right tabs */}
        <View style={styles.sideSection}>
          {rightTabs.map((tab) => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              isActive={selectedTab === tab.id}
            />
          ))}
        </View>
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
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
    paddingTop: SPACING.sm,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl || 24,
    ...SHADOWS.large,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 0.5,
    borderColor: COLORS.secondary[200],
    elevation: 10,
    shadowColor: COLORS.secondary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  sideSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  centerSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    minWidth: 60,
    minHeight: 64,
  },
  centerTab: {
    transform: [{ scale: 1.1 }],
    marginHorizontal: SPACING.sm,
  },
  emergencyTab: {
    backgroundColor: COLORS.error[600],
    borderRadius: BORDER_RADIUS.xl,
    minWidth: 65,
    ...SHADOWS.medium,
  },
  activeTab: {
    backgroundColor: COLORS.secondary[50],
  },
  activeEmergencyTab: {
    backgroundColor: COLORS.error[700],
    ...SHADOWS.large,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: SPACING.xs,
  },
  centerTabContent: {
    transform: [{ scale: 1.05 }],
  },
  emergencyContent: {
    paddingVertical: SPACING.xs,
  },
  activeIndicator: {
    position: 'absolute',
    top: -SPACING.xs,
    left: -SPACING.xs,
    right: -SPACING.xs,
    bottom: -SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    zIndex: -1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.full,
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
    textAlign: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  emergencyLabel: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  activeLabel: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default BottomTabMenu;