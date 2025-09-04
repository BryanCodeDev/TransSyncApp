import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// Context / Hooks
import { AuthProvider } from './hooks/useAuth';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import MenuScreen from './screens/MenuScreen';

// Utils
import { COLORS } from './utils/constants';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.primary[600],
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: COLORS.white,
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitleAlign: 'center',
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar 
          style="light" 
          backgroundColor={COLORS.primary[600]}
          translucent={Platform.OS === 'android'}
        />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={screenOptions}
        >
          {/* Authentication Screens */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ 
              headerShown: false,
              animationTypeForReplace: 'push'
            }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ 
              headerShown: false,
              presentation: 'modal'
            }}
          />

          {/* Main App Screens */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="Menu"
            component={MenuScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerTitle: 'Notificaciones',
              headerBackTitle: 'Atrás',
              presentation: 'modal'
            }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerTitle: 'Configuración',
              headerBackTitle: 'Atrás',
              presentation: 'card'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}