import { Tabs } from "expo-router";
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrainProvider } from "@/context/BrainContext";
import { LLMProvider } from "@/context/LLMContext";
import { PinProvider } from "@/context/PinContext";
import { AIProviderProvider } from "@/context/AIProviderContext";
import { DevModeProvider } from "@/context/DevModeContext";
import JarvisSplash from "@/components/JarvisSplash";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";

import OnboardingScreen from "@/components/OnboardingScreen";

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
  const [showSplash, setShowSplash] = useState(true);
  const [splashChecked, setSplashLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function checkOnboarding() {
      const onboarded = await AsyncStorage.getItem('@jarvis_onboarded');
      if (onboarded !== 'true') {
        setNeedsOnboarding(true);
      }
    }
    checkOnboarding();
    setShowSplash(true);
    setSplashLoaded(true);
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
                        {needsOnboarding ? (
                          <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />
                        ) : (
                          <RootLayoutNav />
                        )}
                        <JarvisSplash onFinish={() => setShowSplash(false)} />
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
