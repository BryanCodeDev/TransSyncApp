// utils/constants.js - VERSION ACTUALIZADA CON IONICONS
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

// Icons mapping - usando Ionicons de @expo/vector-icons
export const ICONS = {
  // Navigation
  back: 'arrow-back',
  close: 'close',
  menu: 'menu',
  home: 'home',
  
  // User/Profile
  user: 'person',
  users: 'people',
  profile: 'person-circle',
  avatar: 'person-outline',
  
  // Communication
  email: 'mail',
  emailOutline: 'mail-outline',
  phone: 'call',
  phoneOutline: 'call-outline',
  message: 'chatbubble',
  messageOutline: 'chatbubble-outline',
  
  // Security
  lock: 'lock-closed',
  lockOutline: 'lock-closed-outline',
  unlock: 'lock-open',
  unlockOutline: 'lock-open-outline',
  eye: 'eye',
  eyeOff: 'eye-off',
  shield: 'shield',
  shieldOutline: 'shield-outline',
  
  // Transportation
  bus: 'bus',
  busOutline: 'bus-outline',
  car: 'car',
  carOutline: 'car-outline',
  map: 'map',
  mapOutline: 'map-outline',
  mapPin: 'location',
  mapPinOutline: 'location-outline',
  navigation: 'navigate',
  navigationOutline: 'navigate-outline',
  route: 'git-branch',
  routeOutline: 'git-branch-outline',
  
  // Emergency
  alert: 'alert-circle',
  alertOutline: 'alert-circle-outline',
  alertTriangle: 'warning',
  alertTriangleOutline: 'warning-outline',
  emergency: 'medical',
  emergencyOutline: 'medical-outline',
  siren: 'volume-high',
  sirenOutline: 'volume-high-outline',
  
  // Actions
  edit: 'create',
  editOutline: 'create-outline',
  save: 'checkmark',
  saveOutline: 'checkmark-outline',
  cancel: 'close',
  cancelOutline: 'close-outline',
  delete: 'trash',
  deleteOutline: 'trash-outline',
  add: 'add',
  addOutline: 'add-outline',
  remove: 'remove',
  removeOutline: 'remove-outline',
  
  // Status
  online: 'wifi',
  offline: 'wifi-outline',
  success: 'checkmark-circle',
  successOutline: 'checkmark-circle-outline',
  error: 'close-circle',
  errorOutline: 'close-circle-outline',
  warning: 'warning',
  warningOutline: 'warning-outline',
  info: 'information-circle',
  infoOutline: 'information-circle-outline',
  
  // Settings
  settings: 'settings',
  settingsOutline: 'settings-outline',
  gear: 'cog',
  gearOutline: 'cog-outline',
  help: 'help-circle',
  helpOutline: 'help-circle-outline',
  logout: 'log-out',
  logoutOutline: 'log-out-outline',
  
  // Documents
  document: 'document-text',
  documentOutline: 'document-text-outline',
  license: 'card',
  licenseOutline: 'card-outline',
  
  // Stats
  stats: 'bar-chart',
  statsOutline: 'bar-chart-outline',
  star: 'star',
  starOutline: 'star-outline',
  
  // Medical
  medical: 'medical',
  medicalOutline: 'medical-outline',
  hospital: 'medical',
  hospitalOutline: 'medical-outline',
  
  // Business
  business: 'business',
  businessOutline: 'business-outline',
  
  // Time
  time: 'time',
  timeOutline: 'time-outline',
  calendar: 'calendar',
  calendarOutline: 'calendar-outline',
  
  // Search
  search: 'search',
  searchOutline: 'search-outline',
  
  // Radio buttons / checkboxes
  radioOn: 'radio-button-on',
  radioOff: 'radio-button-off',
  checkboxOn: 'checkbox',
  checkboxOff: 'square-outline',
  checkmark: 'checkmark',
  
  // Arrows
  arrowUp: 'arrow-up',
  arrowDown: 'arrow-down',
  arrowLeft: 'arrow-back',
  arrowRight: 'arrow-forward',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',
  chevronLeft: 'chevron-back',
  chevronRight: 'chevron-forward',
  
  // Loading
  refresh: 'refresh',
  refreshOutline: 'refresh-outline',
  sync: 'sync',
  syncOutline: 'sync-outline',
  
  // More
  more: 'ellipsis-horizontal',
  moreVertical: 'ellipsis-vertical',
  
  // Filter/Sort
  filter: 'filter',
  filterOutline: 'filter-outline',
  funnel: 'funnel',
  funnelOutline: 'funnel-outline',
};

// Función helper para obtener nombre de icono
export const getIconName = (iconKey, outlined = false) => {
  const baseIcon = ICONS[iconKey];
  if (!baseIcon) {
    console.warn(`Icon "${iconKey}" not found, using default`);
    return 'help-circle';
  }
  
  // Si se solicita outlined y existe la versión outline
  if (outlined) {
    const outlineKey = `${iconKey}Outline`;
    return ICONS[outlineKey] || baseIcon;
  }
  
  return baseIcon;
};