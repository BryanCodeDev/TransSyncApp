import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';

// Obtener prefijo de storage desde variables de entorno
const STORAGE_PREFIX = process.env.EXPO_PUBLIC_STORAGE_PREFIX || 'transsync_';
const DEBUG_MODE = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';

export const authService = {
  login: async (email, password) => {
    try {
      if (DEBUG_MODE) {
        console.log('🔑 Intentando login con:', email);
      }
      
      const response = await authAPI.login(email, password);
      
      // CORREGIDO: Tu backend retorna { success: true, token, user }
      if (response.data && response.data.success) {
        const { token, user } = response.data;
        
        // Guardar token y datos del usuario con prefijo
        await AsyncStorage.setItem(`${STORAGE_PREFIX}userToken`, token);
        await AsyncStorage.setItem(`${STORAGE_PREFIX}userData`, JSON.stringify(user));
        
        if (DEBUG_MODE) {
          console.log('✅ Login exitoso para:', user.name);
        }
        
        return { 
          success: true, 
          user: user,
          message: 'Inicio de sesión exitoso'
        };
      } else {
        return { 
          success: false, 
          message: response.data?.message || 'Error en la respuesta del servidor' 
        };
      }
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('❌ Error en login:', error);
      }
      
      // Manejar diferentes tipos de errores según tu backend
      if (error.status === 401) {
        return { 
          success: false, 
          message: 'Credenciales incorrectas. Verifica tu email y contraseña.' 
        };
      } else if (error.status === 403) {
        return { 
          success: false, 
          message: 'Tu cuenta está desactivada. Contacta al administrador.' 
        };
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return { 
          success: false, 
          message: 'Tiempo de conexión agotado. Verifica tu internet.' 
        };
      } else if (error.code === 'ENOTFOUND' || error.message?.includes('Network Error')) {
        return { 
          success: false, 
          message: 'No se puede conectar al servidor. Verifica tu internet y que el servidor esté funcionando.' 
        };
      } else {
        return { 
          success: false, 
          message: error.message || 'Error en el inicio de sesión. Intenta nuevamente.' 
        };
      }
    }
  },

  register: async (userData) => {
    try {
      if (DEBUG_MODE) {
        console.log('📝 Intentando registro para:', userData.email);
      }
      
      // CORREGIDO: Adaptar los datos al formato que espera tu backend
      const backendUserData = {
        email: userData.email,
        password: userData.password,
        // Tu backend espera estos campos para conductores si es necesario
        nomConductor: userData.nomConductor,
        apeConductor: userData.apeConductor,
        numDocConductor: userData.numDocConductor || userData.licencia,
        telConductor: userData.telConductor || userData.telefono,
        tipLicConductor: userData.tipLicConductor || 'C1',
        idEmpresa: userData.idEmpresa || 1
      };
      
      const response = await authAPI.register(backendUserData);
      
      if (DEBUG_MODE) {
        console.log('✅ Registro exitoso:', response.data);
      }
      
      return { 
        success: true, 
        data: response.data,
        message: response.data.message || 'Registro exitoso'
      };
    } catch (error) {
      if (DEBUG_MODE) {
        console.error('❌ Error en registro:', error);
      }
      
      // Manejar errores según tu backend
      if (error.status === 409) {
        return { 
          success: false, 
          message: 'Este correo electrónico ya está registrado. Intenta con otro email o inicia sesión.' 
        };
      } else if (error.status === 400) {
        return { 
          success: false, 
          message: error.message || 'Datos inválidos. Verifica la información ingresada.' 
        };
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return { 
          success: false, 
          message: 'Tiempo de conexión agotado. Verifica tu internet.' 
        };
      } else if (error.code === 'ENOTFOUND' || error.message?.includes('Network Error')) {
        return { 
          success: false, 
          message: 'No se puede conectar al servidor. Verifica tu internet.' 
        };
      } else {
        return { 
          success: false, 
          message: error.message || 'Error en el registro. Intenta nuevamente.' 
        };
      }
    }
  },

  logout: async () => {
    try {
      if (DEBUG_MODE) {
        console.log('🚪 Cerrando sesión...');
      }
      
      await AsyncStorage.multiRemove([
        `${STORAGE_PREFIX}userToken`, 
        `${STORAGE_PREFIX}userData`
      ]);
      
      if (DEBUG_MODE) {
        console.log('✅ Sesión cerrada exitosamente');
      }
      
      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      return { 
        success: false, 
        message: 'Error al cerrar sesión, pero los datos locales fueron limpiados' 
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem(`${STORAGE_PREFIX}userData`);
      if (userData) {
        const user = JSON.parse(userData);
        if (DEBUG_MODE) {
          console.log('👤 Usuario actual:', user.name);
        }
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(`${STORAGE_PREFIX}userToken`);
      const userData = await AsyncStorage.getItem(`${STORAGE_PREFIX}userData`);
      
      if (!token || !userData) {
        return false;
      }

      // NOTA: Tu backend no tiene endpoint /auth/verify-token
      // Por ahora solo verificamos que existan los datos locales
      // Si quieres verificar con el servidor, necesitarías crear ese endpoint
      return true;

      /* 
      // Si creas el endpoint en el backend, descomenta esto:
      try {
        const response = await authAPI.verifyToken();
        return response.data.success && response.data.valid;
      } catch (error) {
        // Si falla la verificación, limpiar datos locales
        await AsyncStorage.multiRemove([
          `${STORAGE_PREFIX}userToken`, 
          `${STORAGE_PREFIX}userData`
        ]);
        return false;
      }
      */
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(`${STORAGE_PREFIX}userToken`);
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  },

  // NOTA: Tu backend no tiene endpoint /auth/profile
  // Si quieres esta funcionalidad, necesitarías crear el endpoint
  refreshUserData: async () => {
    try {
      // Por ahora solo retornamos los datos almacenados localmente
      const userData = await AsyncStorage.getItem(`${STORAGE_PREFIX}userData`);
      return userData ? JSON.parse(userData) : null;
      
      /*
      // Si creas el endpoint en el backend, descomenta esto:
      const response = await authAPI.getProfile();
      if (response.data.success) {
        await AsyncStorage.setItem(`${STORAGE_PREFIX}userData`, JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
      */
    } catch (error) {
      console.error('❌ Error refrescando datos del usuario:', error);
      return null;
    }
  },

  // Función para recuperar contraseña - SÍ existe en tu backend
  forgotPassword: async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return { 
        success: true, 
        message: response.data.message || 'Correo de recuperación enviado'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Error enviando correo de recuperación'
      };
    }
  },

  // Función para resetear contraseña - SÍ existe en tu backend
  resetPassword: async (token, newPassword) => {
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      return {
        success: true,
        message: response.data.message || 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la contraseña'
      };
    }
  },

  // Limpiar todos los datos de autenticación
  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove([
        `${STORAGE_PREFIX}userToken`,
        `${STORAGE_PREFIX}userData`
      ]);
      return true;
    } catch (error) {
      console.error('❌ Error limpiando datos de autenticación:', error);
      return false;
    }
  },
};