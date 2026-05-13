import { Tabs } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, Dimensions, PanResponder, Animated, FlatList,
  Switch, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
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
import ThinkingIndicator from "@/components/ThinkingIndicator";
import ChatBubble from "@/components/ChatBubble";
import SurveyBubble from "@/components/SurveyBubble";
import QuickActions from "@/components/QuickActions";
import MemoryModal from "@/components/MemoryModal";
import MemoryManager from "@/components/MemoryManager";
import FileUploadModal from "@/components/FileUploadModal";
import PinScreen from "@/components/PinScreen";
import ModelSetupScreen from "@/components/ModelSetupScreen";
import FloatingBubble from "@/components/FloatingBubble";
import AIProviderModal from "@/components/AIProviderModal";
import KnowledgeScreen from "@/components/KnowledgeScreen";
import CodeSandboxScreen from "@/components/CodeSandboxScreen";

import { Message, BrainState, processMessage, processDocument,
  createInitialBrainState, archiveCurrentSession,
} from '@/engine/brain';
import { createMindState } from '@/engine/mind';
import { createSelfKnowledge, type CorrectionRecord } from '@/engine/learning';
import { createEntityTracker } from '@/engine/entities';
import { createInferenceEngine, extractRulesFromFact, addFact } from '@/engine/inference';
import { createTemporalMemory } from '@/engine/temporal';
import { createConstitutionState } from '@/engine/constitution';
import { searchOnline, isOnlineIntent, searchOnlineSynthesized, extractTopSentences, smartWebSearch, extractSearchQuery } from '@/engine/webSearch';
import { detectQuestionType, synthesizeWebResponse, detectTopicCategory } from '@/engine/responseGenerator';
import { buildRichSystemPrompt, type JarvisContext, type ConversationTurn } from '@/engine/aiProviders';
import { semanticSimilarity } from '@/engine/semantic';
import { loadDynamicConceptsFromDB } from '@/engine/knowledge';
import type { EntityType } from '@/engine/entities';
import {
  getDB,
  autoPruneKnowledge,
  insertKnowledgeEntry,
  queryKnowledgeForAnswer,
  upsertEntity,
  loadAllEntities,
  saveBrainStateFull,
  loadBrainStateFull,
  saveMessagesFull,
  loadMessagesFull,
  markMigrationDone,
  isMigrationDone,
  type EntityData,
} from '@/engine/database';
import {
  detectDevIntent, generateDevExplanation, generateFromTemplate,
  buildAICodePrompt, formatCodeResponse, extractCodeSnippet,
} from '@/engine/codeGenerator';
import {
  loadMemory, saveMemory, addMemoryEntry, getRelevantMemories, formatMemoriesForPrompt, type MemoryStore, type MemoryCategory,
} from '@/engine/memory';
import { initMemoryFolder, writeMemoryEntry, searchMemory as searchMemoryFolder, migrateFromAsyncStorage as migrateMemoryFolder, getMemoryStats, listAllMemories, deleteMemoryByKeyword, clearAllMemory, saveConversation } from '@/engine/memoryFolder';
import { requestFolderAccess, getExternalFolders, scanAllFolders } from '@/engine/externalFolders';
import { autoDetectFacts, normalizeInput, detectIntentWithConfidence, loadLearnedPatterns, saveLearnedPatterns, extractPatternsFromState, type LearnedPatterns, isResponseVague } from '@/engine/brain';
import { useDevMode } from '@/context/DevModeContext';

import { type Project, getAllProjects, setActiveProject } from '@/engine/projectMemory';
import { usePin } from '@/context/PinContext';
import { useAIProvider, providerIcon, providerLabel } from '@/context/AIProviderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        if (lastSplash === today) {
          setShowSplash(false);
        } else {
          setShowSplash(true);
          await AsyncStorage.setItem('@jarvis_last_splash', today);
        }
      } catch (e) {
        console.error("Error checking splash screen status:", e);
        setShowSplash(false); // Default to not showing splash on error
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
