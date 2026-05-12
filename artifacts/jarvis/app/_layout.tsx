
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrainProvider } from "@/context/BrainContext";
import { LLMProvider } from "@/context/LLMContext";
import { PinProvider } from "@/context/PinContext";
import { AIProviderProvider } from "@/context/AIProviderContext";
import { DevModeProvider } from "@/context/DevModeContext";
import JarvisSplash from "@/components/JarvisSplash";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashChecked, setSplashLoaded] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function checkSplash() {
      try {
        const today = new Date().toDateString();
        const lastSplash = await AsyncStorage.getItem('@jarvis_last_splash');
        if (lastSplash !== today) {
          setShowSplash(true);
          await AsyncStorage.setItem('@jarvis_last_splash', today);
        }
      } catch (e) {
        // Fallback
      } finally {
        setSplashLoaded(true);
      }
    }
    checkSplash();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && splashChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, splashChecked]);

  if ((!fontsLoaded && !fontError) || !splashChecked) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <LLMProvider>
                <AIProviderProvider>
                  <DevModeProvider>
                    <PinProvider>
                      <BrainProvider>
                        <RootLayoutNav />
                        {showSplash && (
                          <JarvisSplash onFinish={() => setShowSplash(false)} />
                        )}
                      </BrainProvider>
                    </PinProvider>
                  </DevModeProvider>
                </AIProviderProvider>
              </LLMProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
