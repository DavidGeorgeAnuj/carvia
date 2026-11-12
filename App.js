// CARVIA — Root App with Navigation

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import HomeScreen from './src/screens/HomeScreen';
import ParkingScreen from './src/screens/ParkingScreen';
import ParkingDetailScreen from './src/screens/ParkingDetailScreen';
import EVScreen from './src/screens/EVScreen';
import EVDetailScreen from './src/screens/EVDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CustomTabBar from './src/components/CustomTabBar';
import { colors } from './src/theme/colors';

// Keep the native splash on screen until the custom fonts are ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Customize NavContainer theme for dark backgrounds
const CarviaNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} />
      <Stack.Screen name="EVDetail" component={EVDetailScreen} />
    </Stack.Navigator>
  );
}

// Parking Stack
function ParkingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ParkingMain" component={ParkingScreen} />
      <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} />
    </Stack.Navigator>
  );
}

// EV Stack
function EVStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="EVMain" component={EVScreen} />
      <Stack.Screen name="EVDetail" component={EVDetailScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // The native splash screen stays visible until fonts resolve.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <NavigationContainer theme={CarviaNavTheme}>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="Parking" component={ParkingStack} />
          <Tab.Screen name="EV" component={EVStack} />
          <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
