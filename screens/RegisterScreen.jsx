import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../utils/constants';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { register } = useAuth();
  const navigation = useNavigation();

  // Validation functions
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const validateField = (name, value) => {
    const validators = {
      email: (val) => !isEmailValid(val) ? "Ingrese un correo electrónico válido" : "",
      password: (val) => {
        if (val.length < 6) return "La contraseña debe tener al menos 6 caracteres";
        if (!/(?=.*[a-z])/.test(val)) return "Debe incluir al menos una minúscula";
        if (!/(?=.*[A-Z])/.test(val)) return "Debe incluir al menos una mayúscula";
        if (!/(?=.*\d)/.test(val)) return "Debe incluir al menos un número";
        return "";
      },
      confirmPassword: (val) => val !== formData.password ? "Las contraseñas no coinciden" : ""
    };
    return validators[name]?.(value) || "";
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { score: 0, label: "", color: "" };
    
    const checks = [
      password.length >= 8,
      /(?=.*[a-z])/.test(password),
      /(?=.*[A-Z])/.test(password),
      /(?=.*\d)/.test(password),
      /(?=.*[\W_])/.test(password)
    ];
    
    const score = checks.filter(Boolean).length;
    
    if (score < 3) return { score, label: "Débil", color: COLORS.error[500] };
    if (score < 5) return { score, label: "Media", color: COLORS.warning[500] };
    return { score, label: "Fuerte", color: COLORS.success[500] };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormTouched(true);
    
    const fieldError = validateField(field, value);
    setFormErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleRegister = async () => {
    setFormTouched(true);
    
    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });
    
    setFormErrors(errors);
    
    if (Object.keys(errors).some(key => errors[key])) {
      Alert.alert('Error de validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    
    const userData = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    };

    const result = await register(userData);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Registro Exitoso', 
        'Tu cuenta ha sido creada con éxito. Por favor verifica tu correo electrónico para completar el registro.',
        [{ 
          text: 'Entendido', 
          onPress: () => navigation.navigate('Login') 
        }]
      );
    } else {
      Alert.alert('Error de Registro', result.message);
    }
  };

  const passwordStrength = getPasswordStrength();

  const PasswordRequirement = ({ met, children }) => (
    <View style={[styles.requirementItem, met && styles.requirementMet]}>
      <Ionicons 
        name={met ? "checkmark-circle" : "ellipse-outline"} 
        size={16} 
        color={met ? COLORS.success[500] : COLORS.slate[400]} 
      />
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {children}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.blue[600]} />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Ionicons name="bus" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a TransSync</Text>
        </View>
        
        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-add-outline" size={20} color={COLORS.primary[700]} />
              <Text style={styles.sectionTitle}>Información de Cuenta</Text>
            </View>
            
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Correo electrónico <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputContainer,
                formTouched && formErrors.email && styles.inputError
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={COLORS.slate[400]} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={COLORS.slate[400]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                />
              </View>
              {formTouched && formErrors.email && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error[500]} />
                  <Text style={styles.errorText}>{formErrors.email}</Text>
                </View>
              )}
            </View>
            
            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Contraseña <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputContainer,
                formTouched && formErrors.password && styles.inputError
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={COLORS.slate[400]} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={COLORS.slate[400]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoComplete="off"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={COLORS.slate[500]} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Password strength indicator */}
              {formData.password && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Fortaleza:</Text>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill,
                        { 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }
                      ]}
                    />
                  </View>
                </View>
              )}
              
              {formTouched && formErrors.password && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error[500]} />
                  <Text style={styles.errorText}>{formErrors.password}</Text>
                </View>
              )}
            </View>
            
            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Confirmar contraseña <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputContainer,
                formTouched && formErrors.confirmPassword && styles.inputError
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={COLORS.slate[400]} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={COLORS.slate[400]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="off"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={COLORS.slate[500]} 
                  />
                </TouchableOpacity>
              </View>
              {formTouched && formErrors.confirmPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.error[500]} />
                  <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <View style={styles.requirementsHeader}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.secondary[600]} />
              <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
            </View>
            <View style={styles.requirementsGrid}>
              <PasswordRequirement met={formData.password.length >= 6}>
                Mínimo 6 caracteres
              </PasswordRequirement>
              <PasswordRequirement met={/(?=.*[a-z])/.test(formData.password)}>
                Una minúscula
              </PasswordRequirement>
              <PasswordRequirement met={/(?=.*[A-Z])/.test(formData.password)}>
                Una mayúscula
              </PasswordRequirement>
              <PasswordRequirement met={/(?=.*\d)/.test(formData.password)}>
                Un número
              </PasswordRequirement>
            </View>
          </View>

          {/* Information Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={COLORS.blue[600]} />
              <Text style={styles.infoTitle}>Proceso de registro</Text>
            </View>
            <View style={styles.processSteps}>
              {[
                'Se creará tu cuenta con estado PENDIENTE',
                'Recibirás un correo de verificación',
                'Un administrador revisará y activará tu cuenta'
              ].map((step, index) => (
                <View key={index} style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.loadingText}>Creando cuenta...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  backButtonText: {
    color: COLORS.blue[600],
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING.xs,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
    ...SHADOWS.large,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.slate[800],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.slate[600],
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blue[100],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.blue[700],
    marginLeft: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[700],
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate[50],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate[300],
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  inputError: {
    borderColor: COLORS.error[500],
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.slate[900],
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  errorText: {
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error[600],
  },
  strengthContainer: {
    marginTop: SPACING.sm,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  strengthLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.slate[600],
  },
  strengthText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  strengthBar: {
    height: 4,
    backgroundColor: COLORS.slate[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  requirementsContainer: {
    backgroundColor: COLORS.slate[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.slate[700],
    marginLeft: SPACING.xs,
  },
  requirementsGrid: {
    gap: SPACING.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  requirementMet: {
    // Additional styling for met requirements
  },
  requirementText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.slate[600],
  },
  requirementTextMet: {
    color: COLORS.success[600],
  },
  infoBox: {
    backgroundColor: COLORS.blue[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue[500],
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.blue[700],
    marginLeft: SPACING.xs,
  },
  processSteps: {
    gap: SPACING.sm,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.blue[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.blue[700],
    lineHeight: 20,
  },
  registerButton: {
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  disabledButton: {
    backgroundColor: COLORS.slate[400],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING.xs,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginRight: SPACING.xs,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate[200],
  },
  loginText: {
    color: COLORS.slate[600],
    fontSize: TYPOGRAPHY.sizes.sm,
    marginRight: SPACING.xs,
  },
  loginButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  loginButtonText: {
    color: COLORS.blue[600],
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default RegisterScreen;