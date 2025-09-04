import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, BORDER_RADIUS, getColor } from '../utils/constants';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  
  const { login } = useAuth();
  const navigation = useNavigation();

  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    setFormTouched(true);
    
    if (!isEmailValid(email)) {
      Alert.alert('Error', 'Por favor ingrese un correo electrónico válido');
      return;
    }

    if (!isPasswordValid(password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      // Navegación corregida: ir a Home en lugar de Map
      navigation.replace('Home');
    } else {
      Alert.alert('Error', result.message);
    }
  };

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
          <View style={styles.logoContainer}>
            <Ionicons name="bus" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.appTitle}>TransSync</Text>
          <Text style={styles.appSubtitle}>Conductor</Text>
          <Text style={styles.welcomeText}>Bienvenido de vuelta</Text>
        </View>
        
        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
            <View style={[
              styles.inputContainer,
              formTouched && !isEmailValid(email) && email && styles.inputError
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={COLORS.secondary?.[500] || '#64748B'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={getColor('secondary.400', '#94a3b8')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {formTouched && !isEmailValid(email) && email && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={getColor('error.500', '#ef4444')} />
                <Text style={styles.errorText}>Por favor ingrese un correo válido</Text>
              </View>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={[
              styles.inputContainer,
              formTouched && !isPasswordValid(password) && password && styles.inputError
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={COLORS.secondary?.[500] || '#64748B'} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Tu contraseña"
                placeholderTextColor={getColor('secondary.400', '#94a3b8')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.secondary?.[500] || '#64748B'} 
                />
              </TouchableOpacity>
            </View>
            {formTouched && !isPasswordValid(password) && password && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={getColor('error.500', '#ef4444')} />
                <Text style={styles.errorText}>La contraseña debe tener al menos 6 caracteres</Text>
              </View>
            )}
          </View>

          {/* Remember Me */}
          <View style={styles.rememberContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxSelected
              ]}>
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.rememberText}>Recordarme</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => {/* Navigate to forgot password */}}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Register Section */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING?.xl || 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING?.xxxl || 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: getColor('primary.600', '#2563eb'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING?.lg || 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: TYPOGRAPHY?.sizes?.xxxl || 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: SPACING?.xs || 4,
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY?.sizes?.lg || 18,
    color: getColor('primary.600', '#2563eb'),
    fontWeight: '600',
    marginBottom: SPACING?.md || 12,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY?.sizes?.base || 16,
    color: '#64748B',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS?.xl || 16,
    padding: SPACING?.xl || 24,
    marginBottom: SPACING?.xl || 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: SPACING?.lg || 20,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY?.sizes?.sm || 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: SPACING?.xs || 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS?.lg || 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: SPACING?.md || 16,
    minHeight: 56,
  },
  inputError: {
    borderColor: getColor('error.500', '#ef4444'),
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: SPACING?.sm || 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: SPACING?.md || 16,
    fontSize: TYPOGRAPHY?.sizes?.base || 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: SPACING?.xs || 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING?.xs || 4,
  },
  errorText: {
    marginLeft: SPACING?.xs || 4,
    fontSize: TYPOGRAPHY?.sizes?.sm || 14,
    color: getColor('error.600', '#dc2626'),
  },
  rememberContainer: {
    marginBottom: SPACING?.lg || 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: SPACING?.sm || 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: getColor('primary.600', '#2563eb'),
    borderColor: getColor('primary.600', '#2563eb'),
  },
  rememberText: {
    fontSize: TYPOGRAPHY?.sizes?.sm || 14,
    color: '#374151',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: getColor('primary.600', '#2563eb'),
    borderRadius: BORDER_RADIUS?.lg || 12,
    paddingVertical: SPACING?.lg || 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING?.md || 16,
    shadowColor: getColor('primary.600', '#2563eb'),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY?.sizes?.lg || 18,
    fontWeight: 'bold',
    marginRight: SPACING?.sm || 8,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: SPACING?.sm || 12,
  },
  forgotPasswordText: {
    color: getColor('primary.600', '#2563eb'),
    fontSize: TYPOGRAPHY?.sizes?.sm || 14,
    fontWeight: '500',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS?.lg || 12,
    padding: SPACING?.lg || 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerText: {
    color: '#64748B',
    fontSize: TYPOGRAPHY?.sizes?.sm || 14,
    marginRight: SPACING?.xs || 4,
  },
  registerButton: {
    paddingVertical: SPACING?.xs || 4,
    paddingHorizontal: SPACING?.sm || 8,
  },
  registerButtonText: {
    color: getColor('primary.600', '#2563eb'),
    fontSize: TYPOGRAPHY?.sizes?.sm || 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;