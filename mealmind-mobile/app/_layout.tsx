import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from '../src/context/AppContext';
import { COLORS } from '../src/constants';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="privacy-consent" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="medical-disclaimer" />
            <Stack.Screen name="generating-plan" />
            <Stack.Screen name="plan-reveal" />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen 
              name="recipe-preview" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }} 
            />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
