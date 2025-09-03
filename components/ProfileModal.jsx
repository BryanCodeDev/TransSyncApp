import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const ProfileModal = ({ visible, onClose, user, onLogout, onProfilePress }) => {
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
        <View style={styles.container}>
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
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuSection}>
            <TouchableOpacity 
              style={styles.menuOption}
              onPress={onProfilePress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary[600]} />
              </View>
              <Text style={styles.menuText}>Mi Perfil</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuOption}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings-outline" size={20} color={COLORS.secondary[600]} />
              </View>
              <Text style={styles.menuText}>Configuración</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuOption}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.secondary[600]} />
              </View>
              <Text style={styles.menuText}>Ayuda</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuOption}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary[600]} />
              </View>
              <Text style={styles.menuText}>Acerca de</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.secondary[400]} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={[styles.menuOption, styles.logoutOption]}
              onPress={onLogout}
            >
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.error[600]} />
              </View>
              <Text style={[styles.menuText, styles.logoutText]}>Cerrar Sesión</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.error[400]} />
            </TouchableOpacity>
          </View>
        </View>
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
    width: 280,
    minHeight: 200,
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
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
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
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.secondary[100],
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
  },
  logoutOption: {
    marginTop: SPACING.xs,
  },
});

export default ProfileModal;