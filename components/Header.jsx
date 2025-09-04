import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const Header = ({ 
  title = 'TransSync', 
  onProfilePress, 
  user, 
  rightComponent,
  leftComponent,
  showBackButton = false,
  onBackPress,
  backgroundColor = COLORS.primary[600],
  showNotifications = false,
  notificationCount = 0,
  onNotificationsPress
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBackButton ? (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={onBackPress}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
            ) : leftComponent ? (
              leftComponent
            ) : (
              <View style={styles.logoContainer}>
                <View style={styles.logoBackground}>
                  <Ionicons name="bus" size={24} color={COLORS.primary[600]} />
                </View>
              </View>
            )}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {user && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {user.name || user.email || 'Conductor'}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightComponent || (
              <View style={styles.rightActions}>
                {showNotifications && (
                  <TouchableOpacity 
                    style={styles.notificationButton}
                    onPress={onNotificationsPress}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                    {notificationCount > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.profileButton}
                  onPress={onProfilePress}
                  activeOpacity={0.9}
                >
                  {user?.fotoPerfil ? (
                    <Image 
                      source={{ uri: user.fotoPerfil }} 
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileIcon}>
                      <Ionicons name="person" size={20} color={COLORS.primary[600]} />
                    </View>
                  )}
                  <View style={styles.onlineIndicator} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    zIndex: 1000,
    elevation: 10,
  },
  container: {
    ...SHADOWS.large,
    shadowColor: COLORS.secondary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 64,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBackground: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  title: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.success[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

export default Header;