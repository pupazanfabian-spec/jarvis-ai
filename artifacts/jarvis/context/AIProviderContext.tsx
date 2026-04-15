
// Jarvis — Context AI Provider
// Gestionează setările Gemini / ChatGPT stocate local pe telefon

import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { Feather } from '@expo/vector-icons';
import {
  AIProvider, AIProviderSettings,
  callActiveProvider,
  loadProviderSettings, saveProviderSettings,
  testGeminiKeyDetailed, testOpenAIKeyDetailed,
  isSecureStoreFallbackActive,
  JARVIS_SYSTEM_PROMPT,
  type ConversationTurn,
} from '@/engine/aiProviders';

export type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface AIProviderContextType {
  settings: AIProviderSettings;
  isReady: boolean;
  isTesting: boolean;
  testError: string;
  secureStoreFallback: boolean;

  setActiveProvider: (provider: AIProvider) => Promise<void>;
  saveGeminiKey: (key: string) => Promise<void>;
  saveOpenAIKey: (key: string) => Promise<void>;
  testKey: (provider: 'gemini' | 'openai', key: string) => Promise<boolean>;
  generate: (prompt: string, system?: string, history?: ConversationTurn[]) => Promise<{ text: string; provider: AIProvider } | null>;
  clearError: () => void;
}

const AIProviderContext = createContext<AIProviderContextType | null>(null);

export function AIProviderProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AIProviderSettings>({
    activeProvider: 'none',
    geminiKey: '',
    openaiKey: '',
  });
  const [isReady, setIsReady] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadProviderSettings().then(s => {
      setSettings(s);
      setIsReady(true);
    }).catch(() => setIsReady(true));
  }, []);

  const settingsRef = useRef<AIProviderSettings>(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const persist = useCallback(async (updater: (prev: AIProviderSettings) => AIProviderSettings) => {
    // Compute next from the latest snapshot — no stale closure, no race
    const next = updater(settingsRef.current);
    settingsRef.current = next;
    setSettings(next);
    await saveProviderSettings(next).catch(() => {});
  }, []);

  const setActiveProvider = useCallback(async (provider: AIProvider) => {
    await persist(prev => ({ ...prev, activeProvider: provider }));
  }, [persist]);

  const saveGeminiKey = useCallback(async (key: string) => {
    await persist(prev => ({ ...prev, geminiKey: key.trim() }));
  }, [persist]);

  const saveOpenAIKey = useCallback(async (key: string) => {
    await persist(prev => ({ ...prev, openaiKey: key.trim() }));
  }, [persist]);

  const testKey = useCallback(async (provider: 'gemini' | 'openai', key: string): Promise<boolean> => {
    setIsTesting(true);
    setTestError('');
    try {
      const { ok, error } = provider === 'gemini'
        ? await testGeminiKeyDetailed(key.trim())
        : await testOpenAIKeyDetailed(key.trim());
      if (!ok) setTestError(error || 'Cheia nu este validă sau nu există conexiune la internet.');
      return ok;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestError(`Eroare la testare: ${msg.slice(0, 100)}`);
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  const generate = useCallback(async (
    prompt: string,
    system?: string,
    history?: ConversationTurn[],
  ): Promise<{ text: string; provider: AIProvider } | null> => {
    if (settings.activeProvider === 'none') return null;
    return callActiveProvider(prompt, settings, system ?? JARVIS_SYSTEM_PROMPT, history);
  }, [settings]);

  const clearError = useCallback(() => setTestError(''), []);

  // Check SecureStore fallback status after settings load
  const secureStoreFallback = isReady ? isSecureStoreFallbackActive() : false;

  return (
    <AIProviderContext.Provider value={{
      settings, isReady, isTesting, testError, secureStoreFallback,
      setActiveProvider, saveGeminiKey, saveOpenAIKey, testKey, generate, clearError,
    }}>
      {children}
    </AIProviderContext.Provider>
  );
}

export function useAIProvider() {
  const ctx = useContext(AIProviderContext);
  if (!ctx) throw new Error('useAIProvider must be used within AIProviderProvider');
  return ctx;
}

// Helper: icon și label pentru provider
export function providerLabel(provider: AIProvider): string {
  if (provider === 'gemini') return 'Gemini 1.5 Flash';
  if (provider === 'openai') return 'ChatGPT (GPT-4.1 mini)';
  return 'Fără AI cloud';
}

export function providerIcon(provider: AIProvider): FeatherIconName {
  if (provider === 'gemini') return 'zap';
  if (provider === 'openai') return 'message-circle';
  return 'cpu';
}
