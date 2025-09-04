import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const ProfileModal = ({ 
  visible, 
  onClose, 
  user, 
  onLogout, 
  onProfilePress,
  onNotificationsPress,
  onSettingsPress,
  onHelpPress,
  onAboutPress 
}) => {
  
  const handleOptionPress = (callback) => {
    onClose(); // Cerrar el modal primero
    if (callback) {
      setTimeout(() => callback(), 100); // Pequeño delay para suavizar la transición
    }
  };

  const menuOptions = [
    {
      icon: 'person-outline',
      text: 'Mi Perfil',
      color: COLORS.primary[600],
      bgColor: COLORS.primary[100],
      onPress: () => handleOptionPress(onProfilePress),
    },
    {
      icon: 'notifications-outline',
      text: 'Notificaciones',
      color: COLORS.warning[600],
      bgColor: COLORS.warning[100],
      onPress: () => handleOptionPress(onNotificationsPress),
    },
    {
      icon: 'settings-outline',
      text: 'Configuración',
      color: COLORS.secondary[600],
      bgColor: COLORS.secondary[100],
      onPress: () => handleOptionPress(onSettingsPress),
    },
    {
      icon: 'help-circle-outline',
      text: 'Ayuda',
      color: COLORS.info[600],
      bgColor: COLORS.info[100],
      onPress: () => handleOptionPress(onHelpPress),
    },
    {
      icon: 'information-circle-outline',
      text: 'Acerca de',
      color: COLORS.success[600],
      bgColor: COLORS.success[100],
      onPress: () => handleOptionPress(onAboutPress),
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} // Evitar que se cierre al tocar el contenido
        >
          {/* Profile Header */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user?.fotoPerfil ? (
                <Image 
                  source={{ uri: user.fotoPerfil }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileInitial}>
                  <Ionicons name="person" size={32} color={COLORS.white} />
                </View>
              )}
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.nomConductor && user?.apeConductor 
                  ? `${user.nomConductor} ${user.apeConductor}` 
                  : user?.name || 'Usuario'
                }
              </Text>
              <Text style={styles.userEmail}>{user?.email || 'Sin email'}</Text>
              <Text style={styles.userRole}>Conductor</Text>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuSection}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.menuOption}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: option.bgColor }]}>
                  <Ionicons name={option.icon} size={20} color={option.color} />
                </View>
                <Text style={styles.menuText}>{option.text}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.secondary[400]} />
              </TouchableOpacity>
            ))}
            
            <View style={styles.divider} />
            
            {/* Logout Option */}
            <TouchableOpacity 
              style={[styles.menuOption, styles.logoutOption]}
              onPress={() => handleOptionPress(onLogout)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error[600]} />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Cerrar Sesión</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.error[400]} />
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>TransSync v1.0.0</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: 300,
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  profileSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
    backgroundColor: COLORS.primary[50],
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileInitial: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: 2,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  menuSection: {
    padding: SPACING.md,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 2,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  logoutIconContainer: {
    backgroundColor: COLORS.error[100],
  },
  menuText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[800],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  logoutText: {
    color: COLORS.error[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.secondary[200],
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  logoutOption: {
    marginTop: SPACING.xs,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[100],
  },
  versionText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default ProfileModal;