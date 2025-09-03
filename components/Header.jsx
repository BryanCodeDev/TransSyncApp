import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
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
  backgroundColor = COLORS.primary[600]
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        {/* Left Side */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBackPress}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ) : leftComponent ? (
            leftComponent
          ) : (
            <View style={styles.logoContainer}>
              <Ionicons name="bus" size={20} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Center */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {user && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {user.email || 'Conductor'}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightSection}>
          {rightComponent || (
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={onProfilePress}
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
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    elevation: 10,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;