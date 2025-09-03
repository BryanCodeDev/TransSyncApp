import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { driverAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await driverAPI.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await driverAPI.updateProfile(formData);
      setProfile(formData);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const InfoField = ({ iconName, label, value, editable = false, field, keyboardType = 'default' }) => (
    <View style={styles.infoField}>
      <View style={styles.fieldHeader}>
        <Ionicons name={iconName} size={16} color={COLORS.secondary[600]} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          style={styles.fieldInput}
          value={formData[field] || ''}
          onChangeText={(value) => updateFormData(field, value)}
          keyboardType={keyboardType}
          placeholder={`Ingresa tu ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.secondary[400]}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {value || 'No especificado'}
        </Text>
      )}
    </View>
  );

  const StatusBadge = ({ status }) => {
    const isActive = status?.toLowerCase() === 'activo';
    return (
      <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
        <Ionicons 
          name={isActive ? 'checkmark-circle' : 'close-circle'} 
          size={16} 
          color={isActive ? COLORS.success[600] : COLORS.error[600]}
        />
        <Text style={[styles.statusText, isActive ? styles.activeText : styles.inactiveText]}>
          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Inactivo'}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary[600]} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.white} />
            </View>
            <StatusBadge status={profile?.estConductor} />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={styles.driverName}>
              {`${profile?.nomConductor || ''} ${profile?.apeConductor || ''}`.trim() || 'Conductor'}
            </Text>
            <Text style={styles.driverLicense}>
              Licencia: {profile?.numDocConductor || 'No especificada'}
            </Text>
            <Text style={styles.joinDate}>
              Miembro desde enero 2024
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary[700]} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>
          
          <InfoField
            iconName="person-outline"
            label="Nombre"
            value={profile?.nomConductor}
            editable
            field="nomConductor"
          />
          
          <InfoField
            iconName="person-outline"
            label="Apellido"
            value={profile?.apeConductor}
            editable
            field="apeConductor"
          />
          
          <InfoField
            iconName="call-outline"
            label="Teléfono"
            value={profile?.telConductor}
            editable
            field="telConductor"
            keyboardType="phone-pad"
          />
          
          <InfoField
            iconName="mail-outline"
            label="Email"
            value={user?.email}
            editable={false}
          />
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bus-outline" size={20} color={COLORS.primary[700]} />
            <Text style={styles.sectionTitle}>Información Profesional</Text>
          </View>
          
          <InfoField
            iconName="document-text-outline"
            label="Número de Licencia"
            value={profile?.numDocConductor}
            editable={false}
          />
          
          <InfoField
            iconName="car-outline"
            label="Tipo de Licencia"
            value={profile?.tipLicConductor}
            editable={false}
          />
          
          <InfoField
            iconName="business-outline"
            label="ID Empresa"
            value={profile?.idEmpresa?.toString()}
            editable={false}
          />
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={20} color={COLORS.primary[700]} />
            <Text style={styles.sectionTitle}>Estadísticas</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Viajes Hoy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Km Recorridos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setFormData(profile);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                    <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[600],
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  activeBadge: {
    backgroundColor: COLORS.success[100],
  },
  inactiveBadge: {
    backgroundColor: COLORS.error[100],
  },
  statusText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  activeText: {
    color: COLORS.success[700],
  },
  inactiveText: {
    color: COLORS.error[700],
  },
  headerInfo: {
    alignItems: 'center',
  },
  driverName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  driverLicense: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[600],
    marginBottom: SPACING.xs,
  },
  joinDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[500],
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[100],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[700],
    marginLeft: SPACING.sm,
  },
  infoField: {
    marginBottom: SPACING.lg,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[700],
    marginLeft: SPACING.sm,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[900],
    backgroundColor: COLORS.secondary[50],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: 28, // Icon width + margin
  },
  fieldInput: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[900],
    backgroundColor: COLORS.secondary[100],
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.secondary[300],
    marginLeft: 28, // Icon width + margin
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[600],
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.secondary[200],
  },
  actionSection: {
    marginTop: SPACING.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.secondary[200],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[700],
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  disabledButton: {
    backgroundColor: COLORS.secondary[400],
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginRight: SPACING.xs,
  },
  editButton: {
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen;