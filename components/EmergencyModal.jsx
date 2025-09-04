import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  StyleSheet, 
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const EmergencyModal = ({ visible, onClose, onSubmit, currentLocation }) => {
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const emergencyTypes = [
    { 
      id: 'accidente', 
      label: 'Accidente de Tráfico', 
      iconName: 'car-sport-outline',
      color: COLORS.error[600],
      description: 'Colisión o accidente vehicular'
    },
    { 
      id: 'averia', 
      label: 'Avería Mecánica', 
      iconName: 'construct-outline',
      color: COLORS.warning[600],
      description: 'Problema técnico del vehículo'
    },
    { 
      id: 'salud', 
      label: 'Emergencia Médica', 
      iconName: 'medical-outline',
      color: COLORS.error[700],
      description: 'Problema de salud urgente'
    },
    { 
      id: 'seguridad', 
      label: 'Seguridad Personal', 
      iconName: 'shield-outline',
      color: COLORS.error[800],
      description: 'Situación de riesgo o peligro'
    },
    { 
      id: 'incendio', 
      label: 'Incendio', 
      iconName: 'flame-outline',
      color: COLORS.error[700],
      description: 'Fuego o riesgo de incendio'
    },
    { 
      id: 'otro', 
      label: 'Otra Emergencia', 
      iconName: 'help-circle-outline',
      color: COLORS.secondary[600],
      description: 'Otra situación de emergencia'
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 7,
        })
      ]).start();

      // Pulse animation for emergency button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      slideAnim.setValue(height);
      scaleAnim.setValue(0);
      pulseAnim.stopAnimation();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      setEmergencyType('');
      setDescription('');
    });
  };

  const handleSubmit = async () => {
    if (!emergencyType) {
      Alert.alert('Campo Requerido', 'Por favor selecciona el tipo de emergencia');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Descripción Insuficiente', 'Por favor describe la emergencia con más detalle (mínimo 10 caracteres)');
      return;
    }

    setIsSubmitting(true);

    const emergencyData = {
      tipo: emergencyType,
      descripcion: description.trim(),
      ubicacion: currentLocation ? {
        latitud: currentLocation.latitude,
        longitud: currentLocation.longitude
      } : null,
      fecha: new Date().toISOString(),
      prioridad: emergencyType === 'salud' || emergencyType === 'incendio' ? 'ALTA' : 'MEDIA'
    };

    try {
      await onSubmit(emergencyData);
      handleClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la emergencia. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedType = () => {
    return emergencyTypes.find(type => type.id === emergencyType);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.alertIcon}>
                <Ionicons name="alert-circle" size={28} color={COLORS.error[600]} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Emergencia</Text>
                <Text style={styles.subtitle}>Reportar situación urgente</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.secondary[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Emergency Type Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list-outline" size={18} color={COLORS.error[600]} />
                <Text style={styles.sectionTitle}>Tipo de Emergencia</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>*</Text>
                </View>
              </View>
              
              <View style={styles.typesGrid}>
                {emergencyTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      emergencyType === type.id && styles.selectedTypeCard
                    ]}
                    onPress={() => setEmergencyType(type.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.typeIcon,
                      emergencyType === type.id && { backgroundColor: type.color }
                    ]}>
                      <Ionicons 
                        name={type.iconName} 
                        size={24} 
                        color={emergencyType === type.id ? COLORS.white : type.color} 
                      />
                    </View>
                    <Text style={[
                      styles.typeLabel,
                      emergencyType === type.id && styles.selectedTypeLabel
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={styles.typeDescription}>
                      {type.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {emergencyType && (
                <View style={styles.selectedTypeInfo}>
                  <View style={styles.selectedTypeIcon}>
                    <Ionicons 
                      name={getSelectedType()?.iconName} 
                      size={20} 
                      color={getSelectedType()?.color} 
                    />
                  </View>
                  <Text style={styles.selectedTypeText}>
                    Tipo seleccionado: {getSelectedType()?.label}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Description Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.error[600]} />
                <Text style={styles.sectionTitle}>Descripción Detallada</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>*</Text>
                </View>
              </View>
              
              <View style={[
                styles.textInputContainer,
                description.trim().length >= 10 && styles.validInput
              ]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Describe detalladamente qué está ocurriendo, ubicación específica, personas involucradas, etc. (mínimo 10 caracteres)"
                  placeholderTextColor={COLORS.secondary[400]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  numberOfLines={6}
                />
              </View>
              
              <View style={styles.inputFooter}>
                <Text style={[
                  styles.charCount,
                  description.length < 10 && styles.charCountWarning,
                  description.length >= 10 && styles.charCountValid
                ]}>
                  {description.length}/500 caracteres
                  {description.length < 10 && ` (mínimo 10)`}
                </Text>
                {description.length >= 10 && (
                  <View style={styles.validationCheck}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success[500]} />
                  </View>
                )}
              </View>
            </View>

            {/* Location Info */}
            {currentLocation && (
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary[600]} />
                  <Text style={styles.locationTitle}>Ubicación Actual</Text>
                  <View style={styles.locationStatus}>
                    <View style={styles.locationDot} />
                    <Text style={styles.locationStatusText}>GPS Activo</Text>
                  </View>
                </View>
                <Text style={styles.locationText}>
                  Lat: {currentLocation.latitude?.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  Lng: {currentLocation.longitude?.toFixed(6)}
                </Text>
              </View>
            )}

            {/* Warning Message */}
            <View style={styles.warningCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.warning[600]} />
              <Text style={styles.warningText}>
                Esta emergencia será enviada inmediatamente a los servicios de respuesta. 
                Asegúrate de que la información sea precisa y verídica.
              </Text>
            </View>
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Ionicons name="close-outline" size={18} color={COLORS.secondary[700]} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <Animated.View style={[styles.submitButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                  (!emergencyType || description.trim().length < 10) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || !emergencyType || description.trim().length < 10}
                activeOpacity={0.9}
              >
                {isSubmitting ? (
                  <View style={styles.loadingContent}>
                    <View style={styles.loadingSpinner} />
                    <Text style={styles.submitButtonText}>Enviando...</Text>
                  </View>
                ) : (
                  <View style={styles.submitContent}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.white} />
                    <Text style={styles.submitButtonText}>Enviar Emergencia</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl || 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.9,
    ...SHADOWS.large,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.error[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.medium,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.error[700],
    lineHeight: 24,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error[600],
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    maxHeight: height * 0.6,
  },
  section: {
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginLeft: SPACING.sm,
    flex: 1,
  },
  requiredBadge: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.error[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  requiredText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  typesGrid: {
    gap: SPACING.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.secondary[200],
    ...SHADOWS.small,
  },
  selectedTypeCard: {
    borderColor: COLORS.error[500],
    backgroundColor: COLORS.error[50],
    ...SHADOWS.medium,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.secondary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    flex: 1,
    lineHeight: 20,
  },
  selectedTypeLabel: {
    color: COLORS.error[700],
  },
  typeDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[600],
    marginTop: 2,
    flex: 1,
  },
  selectedTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success[500],
  },
  selectedTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  selectedTypeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.success[700],
  },
  textInputContainer: {
    borderWidth: 2,
    borderColor: COLORS.secondary[300],
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.secondary[50],
  },
  validInput: {
    borderColor: COLORS.success[400],
    backgroundColor: COLORS.success[50],
  },
  textInput: {
    padding: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[900],
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
  },
  charCountWarning: {
    color: COLORS.error[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  charCountValid: {
    color: COLORS.success[600],
  },
  validationCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationCard: {
    margin: SPACING.xl,
    marginTop: 0,
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[700],
    marginLeft: SPACING.sm,
    flex: 1,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success[500],
    marginRight: SPACING.xs,
  },
  locationStatusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  locationText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary[600],
    fontFamily: 'monospace',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.xl,
    marginTop: 0,
    borderWidth: 1,
    borderColor: COLORS.warning[200],
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.warning[700],
    marginLeft: SPACING.sm,
    lineHeight: 20,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: COLORS.secondary[50],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary[300],
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[700],
    marginLeft: SPACING.xs,
  },
  submitButtonContainer: {
    flex: 2,
  },
  submitButton: {
    backgroundColor: COLORS.error[600],
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    ...SHADOWS.large,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.secondary[400],
    ...SHADOWS.small,
  },
  loadingContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderTopColor: 'transparent',
    marginRight: SPACING.sm,
  },
  submitContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: SPACING.sm,
  },
});

export default EmergencyModal;