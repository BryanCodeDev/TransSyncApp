import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Context / Hooks
import { AuthProvider } from './hooks/useAuth';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';

// Utils
import { COLORS } from './utils/constants';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary[600],
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {/* Pantalla de Login */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          {/* Registro */}
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />

          {/* Mapa principal (con Menu.jsx como dock) */}
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{
              headerShown: false,
              gestureEnabled: false, // evita retroceder con swipe
            }}
          />

          {/* Perfil */}
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerTitle: 'Mi Perfil',
              headerBackTitle: 'Mapa',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
