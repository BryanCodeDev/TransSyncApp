import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
          text: 'Verificando conexion...',
          color: COLORS.warning[600],
          icon: '🔄'
        };
      case 'connected':
        return {
          text: 'Servidor conectado',
          color: COLORS.success[600],
          icon: '✅'
        };
      case 'error':
        return {
          text: 'Error de conexion',
          color: COLORS.error[600],
          icon: '❌'
        };
      default:
        return {
          text: 'Estado desconocido',
          color: COLORS.secondary[600],
          icon: '❓'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={[styles.statusCard, { borderColor: statusInfo.color }]}>
        <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
        {lastCheck && (
          <Text style={styles.lastCheck}>
            Ultima verificacion: {lastCheck}
          </Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={checkConnection}
        >
          <Text style={styles.buttonText}>Verificar Conexion</Text>
        </TouchableOpacity>
        
        {serverInfo && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={showDetails}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Ver Detalles
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {connectionStatus === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Posibles soluciones:</Text>
          <Text style={styles.errorText}>
            • Verifica que el servidor backend este corriendo{'\n'}
            • Comprueba la URL en services/api.js{'\n'}
            • Para emulador Android usa: http://10.0.2.2:5000{'\n'}
            • Para dispositivo fisico usa tu IP local{'\n'}
            • Revisa la configuracion CORS del servidor
          </Text>
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
    fontSize: 32,
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
    alignItems: 'center',
    ...SHADOWS.small,
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
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.error[700],
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error[600],
    lineHeight: 16,
  },
});

export default ConnectionTest;