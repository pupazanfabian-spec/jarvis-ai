
// Jarvis — Context AI Provider
// Gestionează setările Gemini / ChatGPT / Groq / OpenRouter stocate local pe telefon

import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { Feather } from '@expo/vector-icons';
import {
  AIProvider, AIProviderSettings,
  callActiveProvider,
  loadProviderSettings, saveProviderSettings,
  testGeminiKeyDetailed, testOpenAIKeyDetailed,
  testGroqKeyDetailed, testOpenRouterKeyDetailed,
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
  saveGroqKey: (key: string) => Promise<void>;
  saveOpenRouterKey: (key: string) => Promise<void>;
  testKey: (provider: 'gemini' | 'openai' | 'groq' | 'openrouter', key: string) => Promise<boolean>;
  generate: (prompt: string, system?: string, history?: ConversationTurn[], intent?: string) => Promise<{ text: string; provider: AIProvider } | null>;
  generateStream: (prompt: string, onChunk: (chunk: string) => void, system?: string, history?: ConversationTurn[], intent?: string) => Promise<{ text: string; provider: AIProvider } | null>;
  clearError: () => void;
}

const AIProviderContext = createContext<AIProviderContextType | null>(null);

export function AIProviderProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AIProviderSettings>({
    activeProvider: 'none',
    geminiKey: '',
    openaiKey: '',
    groqKey: '',
    openrouterKey: '',
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

  const saveGroqKey = useCallback(async (key: string) => {
    await persist(prev => ({ ...prev, groqKey: key.trim() }));
  }, [persist]);

  const saveOpenRouterKey = useCallback(async (key: string) => {
    await persist(prev => ({ ...prev, openrouterKey: key.trim() }));
  }, [persist]);

  const testKey = useCallback(async (provider: 'gemini' | 'openai' | 'groq' | 'openrouter', key: string): Promise<boolean> => {
    setIsTesting(true);
    setTestError('');
    try {
      let result: { ok: boolean; error: string };
      switch (provider) {
        case 'gemini': result = await testGeminiKeyDetailed(key.trim()); break;
        case 'openai': result = await testOpenAIKeyDetailed(key.trim()); break;
        case 'groq': result = await testGroqKeyDetailed(key.trim()); break;
        case 'openrouter': result = await testOpenRouterKeyDetailed(key.trim()); break;
      }
      if (!result.ok) setTestError(result.error || 'Cheia nu este validă sau nu există conexiune la internet.');
      return result.ok;
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
    intent?: string,
  ): Promise<{ text: string; provider: AIProvider } | null> => {
    if (settings.activeProvider === 'none') return null;
    return callActiveProvider(prompt, settings, system ?? JARVIS_SYSTEM_PROMPT, history, intent);
  }, [settings]);

  const generateStream = useCallback(async (
    prompt: string,
    onChunk: (chunk: string) => void,
    system?: string,
    history?: ConversationTurn[],
    intent?: string,
  ): Promise<{ text: string; provider: AIProvider } | null> => {
    if (settings.activeProvider === 'none') return null;
    const { callActiveProviderStream } = await import('@/engine/aiProviders');
    return callActiveProviderStream(prompt, settings, onChunk, system ?? JARVIS_SYSTEM_PROMPT, history, intent);
  }, [settings]);

  const clearError = useCallback(() => setTestError(''), []);

  const secureStoreFallback = isReady ? isSecureStoreFallbackActive() : false;

  return (
    <AIProviderContext.Provider value={{
      settings, isReady, isTesting, testError, secureStoreFallback,
      setActiveProvider, saveGeminiKey, saveOpenAIKey, saveGroqKey, saveOpenRouterKey,
      testKey, generate, generateStream, clearError,
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

export function providerLabel(provider: AIProvider): string {
  if (provider === 'gemini') return 'Gemini';
  if (provider === 'openai') return 'ChatGPT';
  if (provider === 'groq') return 'Groq';
  if (provider === 'openrouter') return 'OpenRouter';
  return 'Fără AI cloud';
}

export function providerIcon(provider: AIProvider): FeatherIconName {
  if (provider === 'gemini') return 'zap';
  if (provider === 'openai') return 'message-circle';
  if (provider === 'groq') return 'cpu';
  if (provider === 'openrouter') return 'globe';
  return 'slash';
}
