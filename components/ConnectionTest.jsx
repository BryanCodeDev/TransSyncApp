import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testConnection } from '../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [serverInfo, setServerInfo] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const result = await testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        setServerInfo(result.data);
        setLastCheck(new Date().toLocaleTimeString());
      } else {
        setConnectionStatus('error');
        setServerInfo(result);
        setLastCheck(new Date().toLocaleTimeString());
      }
    } catch (error) {
      setConnectionStatus('error');
      setServerInfo({ error: error.message });
      setLastCheck(new Date().toLocaleTimeString());
    }
  };

  const showDetails = () => {
    if (serverInfo) {
      Alert.alert(
        'Detalles del Servidor',
        JSON.stringify(serverInfo, null, 2),
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'checking':
        return {
          text: 'Verificando conexión...',
          color: COLORS.warning[600],
          iconName: 'sync',
          iconColor: COLORS.warning[600]
        };
      case 'connected':
        return {
          text: 'Servidor conectado',
          color: COLORS.success[600],
          iconName: 'checkmark-circle',
          iconColor: COLORS.success[600]
        };
      case 'error':
        return {
          text: 'Error de conexión',
          color: COLORS.error[600],
          iconName: 'close-circle',
          iconColor: COLORS.error[600]
        };
      default:
        return {
          text: 'Estado desconocido',
          color: COLORS.secondary[600],
          iconName: 'help-circle',
          iconColor: COLORS.secondary[600]
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={[styles.statusCard, { borderColor: statusInfo.color }]}>
        <Ionicons 
          name={statusInfo.iconName} 
          size={32} 
          color={statusInfo.iconColor}
          style={styles.statusIcon}
        />
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
        {lastCheck && (
          <Text style={styles.lastCheck}>
            Última verificación: {lastCheck}
          </Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={checkConnection}
        >
          <Ionicons name="refresh" size={16} color={COLORS.white} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Verificar Conexión</Text>
        </TouchableOpacity>
        
        {serverInfo && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={showDetails}
          >
            <Ionicons name="information-circle" size={16} color={COLORS.secondary[700]} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Ver Detalles
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {connectionStatus === 'error' && (
        <View style={styles.errorContainer}>
          <View style={styles.errorHeader}>
            <Ionicons name="bulb" size={16} color={COLORS.error[700]} />
            <Text style={styles.errorTitle}>Posibles soluciones:</Text>
          </View>
          <View style={styles.errorList}>
            <View style={styles.errorItem}>
              <Ionicons name="ellipse" size={6} color={COLORS.error[600]} />
              <Text style={styles.errorText}>Verifica que el servidor backend esté corriendo</Text>
            </View>
            <View style={styles.errorItem}>
              <Ionicons name="ellipse" size={6} color={COLORS.error[600]} />
              <Text style={styles.errorText}>Comprueba la URL en services/api.js</Text>
            </View>
            <View style={styles.errorItem}>
              <Ionicons name="ellipse" size={6} color={COLORS.error[600]} />
              <Text style={styles.errorText}>Para emulador Android usa: http://10.0.2.2:5000</Text>
            </View>
            <View style={styles.errorItem}>
              <Ionicons name="ellipse" size={6} color={COLORS.error[600]} />
              <Text style={styles.errorText}>Para dispositivo físico usa tu IP local</Text>
            </View>
            <View style={styles.errorItem}>
              <Ionicons name="ellipse" size={6} color={COLORS.error[600]} />
              <Text style={styles.errorText}>Revisa la configuración CORS del servidor</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  statusIcon: {
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  lastCheck: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    textAlign: 'center',
  },
  buttonContainer: {
    gap: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary[100],
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  secondaryButtonText: {
    color: COLORS.secondary[700],
  },
  errorContainer: {
    backgroundColor: COLORS.error[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error[500],
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.error[700],
    marginLeft: SPACING.xs,
  },
  errorList: {
    gap: SPACING.xs,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error[600],
    lineHeight: 16,
    marginLeft: SPACING.xs,
    flex: 1,
  },
});

export default ConnectionTest;