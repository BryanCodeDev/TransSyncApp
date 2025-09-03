import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const EmergencyModal = ({ visible, onClose, onSubmit, currentLocation }) => {
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');

  const emergencyTypes = [
    { id: 'accidente', label: 'Accidente', iconName: 'car-outline' },
    { id: 'averia', label: 'Avería del vehículo', iconName: 'construct-outline' },
    { id: 'salud', label: 'Problema de salud', iconName: 'medical-outline' },
    { id: 'seguridad', label: 'Problema de seguridad', iconName: 'shield-outline' },
    { id: 'otro', label: 'Otro', iconName: 'help-circle-outline' },
  ];

  const handleSubmit = () => {
    if (!emergencyType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de emergencia');
      return;
    }

    const emergencyData = {
      tipo: emergencyType,
      descripcion: description,
      ubicacion: currentLocation ? {
        latitud: currentLocation.latitude,
        longitud: currentLocation.longitude
      } : null,
      fecha: new Date().toISOString()
    };

    onSubmit(emergencyData);
    setEmergencyType('');
    setDescription('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="alert-circle" size={24} color={COLORS.error[700]} />
              <Text style={styles.title}>Reportar Emergencia</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.secondary[600]} />
            </TouchableOpacity>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Tipo de emergencia *</Text>
            <View style={styles.typesContainer}>
              {emergencyTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    emergencyType === type.id && styles.selectedType
                  ]}
                  onPress={() => setEmergencyType(type.id)}
                >
                  <Ionicons 
                    name={type.iconName} 
                    size={20} 
                    color={emergencyType === type.id ? COLORS.error[700] : COLORS.secondary[600]} 
                  />
                  <Text style={[
                    styles.typeLabel,
                    emergencyType === type.id && styles.selectedTypeLabel
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Descripción</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe la emergencia en detalle..."
              placeholderTextColor={COLORS.secondary[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>
          
          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Ionicons name="alert-circle" size={16} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Reportar Emergencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
    backgroundColor: COLORS.error[50],
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.error[700],
    marginLeft: SPACING.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.sm,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '45%',
  },
  selectedType: {
    backgroundColor: COLORS.error[100],
    borderColor: COLORS.error[500],
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[700],
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  selectedTypeLabel: {
    color: COLORS.error[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.secondary[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    height: 100,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[900],
    backgroundColor: COLORS.secondary[50],
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.secondary[200],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[700],
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.error[600],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
});

export default EmergencyModal;