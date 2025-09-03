// utils/constants.js - VERSION CORREGIDA
// Paleta de colores basada en el Tailwind config
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Agregar fallback values
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  }
};

// Función helper para acceso seguro a colores
export const getColor = (colorPath, fallback = '#000000') => {
  try {
    const keys = colorPath.split('.');
    let result = COLORS;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return fallback;
      }
    }
    
    return result || fallback;
  } catch (error) {
    console.warn(`Color path "${colorPath}" not found, using fallback:`, fallback);
    return fallback;
  }
};

// Sombras con valores seguros
export const SHADOWS = {
  small: {
    shadowColor: getColor('secondary.900', '#0f172a'),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: getColor('secondary.900', '#0f172a'),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: getColor('secondary.900', '#0f172a'),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  }
};

// Espaciado
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Tipografía
export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

// Icons mapping - usando react-native-vector-icons
export const ICONS = {
  // Navigation
  back: 'arrow-left',
  close: 'x',
  menu: 'menu',
  
  // User/Profile
  user: 'user',
  users: 'users',
  profile: 'user-circle',
  
  // Communication
  email: 'mail',
  phone: 'phone',
  message: 'message-circle',
  
  // Security
  lock: 'lock',
  unlock: 'unlock',
  eye: 'eye',
  eyeOff: 'eye-off',
  shield: 'shield',
  
  // Transportation
  bus: 'truck', // Usamos truck que se parece más a un bus
  car: 'car',
  map: 'map',
  mapPin: 'map-pin',
  navigation: 'navigation',
  route: 'route',
  
  // Emergency
  alert: 'alert-triangle',
  alertCircle: 'alert-circle',
  emergency: 'alert-octagon',
  siren: 'volume-2',
  
  // Actions
  edit: 'edit-2',
  save: 'check',
  cancel: 'x',
  delete: 'trash-2',
  add: 'plus',
  remove: 'minus',
  
  // Status
  online: 'wifi',
  offline: 'wifi-off',
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info',
  
  // Settings
  settings: 'settings',
  gear: 'tool',
  help: 'help-circle',
  logout: 'log-out',
  
  // Documents
  document: 'file-text',
  license: 'credit-card',
  
  // Stats
  stats: 'bar-chart-2',
  star: 'star',
  
  // Home
  home: 'home',
  
  // Medical
  medical: 'heart',
  hospital: 'plus-square',
};