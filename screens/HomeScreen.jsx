import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, ICONS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const estadisticas = [
    { valor: "2,500+", texto: "Rutas activas", icono: "bus", color: COLORS.primary[600] },
    { valor: "92%", texto: "Puntualidad", icono: "time", color: COLORS.success[600] },
    { valor: "5.2M", texto: "Pasajeros mensuales", icono: "people", color: COLORS.secondary[600] },
    { valor: "98%", texto: "Satisfacción", icono: "star", color: COLORS.warning[600] }
  ];

  const accesosRapidos = [
    {
      id: 'mapa',
      titulo: 'Mapa en Vivo',
      descripcion: 'Visualiza rutas y vehículos',
      icono: 'map',
      color: COLORS.primary[600],
      gradient: [COLORS.primary[500], COLORS.primary[700]],
      onPress: () => navigation.navigate('Map')
    },
    {
      id: 'emergencia',
      titulo: 'Emergencias',
      descripcion: 'Reportar situaciones urgentes',
      icono: 'alert-circle',
      color: COLORS.error[600],
      gradient: [COLORS.error[500], COLORS.error[700]],
      onPress: () => handleEmergencyPress()
    },
    {
      id: 'notificaciones',
      titulo: 'Notificaciones',
      descripcion: 'Mensajes y alertas',
      icono: 'notifications',
      color: COLORS.warning[600],
      gradient: [COLORS.warning[500], COLORS.warning[700]],
      onPress: () => handleNotificationsPress()
    },
    {
      id: 'configuracion',
      titulo: 'Configuración',
      descripcion: 'Ajustes y preferencias',
      icono: 'settings',
      color: COLORS.secondary[600],
      gradient: [COLORS.secondary[500], COLORS.secondary[700]],
      onPress: () => navigation.navigate('Profile')
    }
  ];

  const caracteristicas = [
    {
      icono: 'bus',
      titulo: 'Gestión de flota',
      descripcion: 'Monitoreo de vehículos en tiempo real con análisis predictivo avanzado',
      beneficios: ['GPS en tiempo real', 'Mantenimiento predictivo', 'Optimización de rutas']
    },
    {
      icono: 'time',
      titulo: 'Programación inteligente',
      descripcion: 'Algoritmos de IA que optimizan horarios basados en patrones de demanda',
      beneficios: ['IA predictiva', 'Optimización automática', 'Reducción de esperas']
    },
    {
      icono: 'shield',
      titulo: 'Seguridad avanzada',
      descripcion: 'Protocolos de seguridad empresarial con monitoreo 24/7',
      beneficios: ['Monitoreo 24/7', 'Alertas automáticas', 'Protección de datos']
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-rotate statistics
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % estadisticas.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergencias',
      'Esta función permite reportar situaciones urgentes',
      [{ text: 'Entendido' }]
    );
  };

  const handleNotificationsPress = () => {
    Alert.alert(
      'Notificaciones',
      'Aquí se mostrarán todas las alertas y mensajes importantes',
      [{ text: 'Entendido' }]
    );
  };

  const StatCard = ({ stat, isActive }) => (
    <Animated.View style={[
      styles.statCard,
      {
        opacity: isActive ? 1 : 0.7,
        transform: [{ scale: isActive ? 1 : 0.95 }]
      }
    ]}>
      <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
        <Ionicons name={stat.icono} size={24} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.valor}</Text>
      <Text style={styles.statLabel}>{stat.texto}</Text>
    </Animated.View>
  );

  const QuickAccessCard = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.quickAccessCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
      key={item.id}
    >
      <TouchableOpacity
        style={styles.quickAccessContent}
        onPress={item.onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.quickAccessIcon, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icono} size={28} color={item.color} />
        </View>
        <View style={styles.quickAccessText}>
          <Text style={styles.quickAccessTitle}>{item.titulo}</Text>
          <Text style={styles.quickAccessDescription}>{item.descripcion}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.secondary[400]} />
      </TouchableOpacity>
    </Animated.View>
  );

  const FeatureCard = ({ feature, index }) => (
    <View style={[styles.featureCard, { marginLeft: index > 0 ? SPACING.lg : 0 }]}>
      <View style={[styles.featureIcon, { backgroundColor: COLORS.primary[50] }]}>
        <Ionicons name={feature.icono} size={32} color={COLORS.primary[600]} />
      </View>
      <Text style={styles.featureTitle}>{feature.titulo}</Text>
      <Text style={styles.featureDescription}>{feature.descripcion}</Text>
      <View style={styles.featureBenefits}>
        {feature.beneficios.map((beneficio, idx) => (
          <View key={idx} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success[500]} />
            <Text style={styles.benefitText}>{beneficio}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary[600]} />
      
      <Header
        title="TransSync"
        user={user}
        onProfilePress={() => navigation.navigate('Profile')}
        showNotifications={true}
        notificationCount={5}
        onNotificationsPress={handleNotificationsPress}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              Bienvenido, {user?.nombre || user?.email || 'Conductor'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              Gestiona tu operación de transporte de manera inteligente
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.9}
            >
              <Ionicons name="map" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Ir al Mapa</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas en Tiempo Real</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
            pagingEnabled
          >
            {estadisticas.map((stat, index) => (
              <StatCard 
                key={index} 
                stat={stat} 
                isActive={index === currentStatIndex}
              />
            ))}
          </ScrollView>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.quickAccessGrid}>
            {accesosRapidos.map((item, index) => (
              <QuickAccessCard key={item.id} item={item} index={index} />
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Características Destacadas</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresContainer}
          >
            {caracteristicas.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaIcon}>
              <Ionicons name="trending-up" size={32} color={COLORS.primary[600]} />
            </View>
            <Text style={styles.ctaTitle}>
              Optimiza tu operación hoy
            </Text>
            <Text style={styles.ctaDescription}>
              Únete a más de 50 ciudades que ya transformaron su transporte público
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Comenzar</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
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
  heroSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  welcomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.large,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  welcomeSubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    width: width * 0.4,
    ...SHADOWS.medium,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    textAlign: 'center',
  },
  quickAccessSection: {
    marginBottom: SPACING.xl,
  },
  quickAccessGrid: {
    paddingHorizontal: SPACING.lg,
  },
  quickAccessCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  quickAccessText: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  quickAccessDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
  featuresSection: {
    marginBottom: SPACING.xl,
  },
  featuresContainer: {
    paddingHorizontal: SPACING.lg,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    width: width * 0.8,
    ...SHADOWS.large,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.sm,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[600],
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  featureBenefits: {
    gap: SPACING.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[700],
    flex: 1,
  },
  ctaSection: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  ctaCard: {
    backgroundColor: COLORS.primary[50],
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  ctaTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[700],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ctaDescription: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.primary[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    backgroundColor: COLORS.primary[600],
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});

export default HomeScreen;