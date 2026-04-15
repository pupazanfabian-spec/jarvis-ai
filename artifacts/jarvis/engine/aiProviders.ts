
// Jarvis — AI Providers: Gemini + ChatGPT direct calls de pe telefon
// Fără server intermediar — apeluri directe din aplicație
// Cheile sunt stocate în Keychain (iOS) / Keystore (Android) via expo-secure-store

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Chei de stocare ────────────────────────────────────────────────────────

const GEMINI_KEY_STORAGE = 'jarvis_gemini_api_key';
const OPENAI_KEY_STORAGE = 'jarvis_openai_api_key';
// Provider activ nu este sensibil — AsyncStorage e suficient
const ACTIVE_PROVIDER_STORAGE = '@jarvis_active_provider';

export type AIProvider = 'none' | 'gemini' | 'openai';

export interface AIProviderSettings {
  activeProvider: AIProvider;
  geminiKey: string;
  openaiKey: string;
}

// ─── Helper SecureStore cu fallback AsyncStorage (web / simulatoare) ────────

// Tracked so UI can surface a warning when secure storage is unavailable
let _secureStoreFailed = false;
export function isSecureStoreFallbackActive(): boolean {
  return _secureStoreFailed;
}

async function secureGet(key: string): Promise<string | null> {
  try {
    const val = await SecureStore.getItemAsync(key);
    return val;
  } catch (err) {
    _secureStoreFailed = true;
    if (__DEV__ && Platform.OS !== 'web') {
      console.warn(`[Jarvis] SecureStore unavailable, using AsyncStorage fallback for "${key}":`, err);
    }
    return AsyncStorage.getItem(`@secure_${key}`);
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
    // Clear flag if SecureStore starts working again
    _secureStoreFailed = false;
  } catch (err) {
    _secureStoreFailed = true;
    if (__DEV__ && Platform.OS !== 'web') {
      console.warn(`[Jarvis] SecureStore unavailable, using AsyncStorage fallback for "${key}":`, err);
    }
    await AsyncStorage.setItem(`@secure_${key}`, value);
  }
}

// ─── Persistare chei locale (Keychain / Keystore) ────────────────────────────

export async function saveProviderSettings(settings: AIProviderSettings): Promise<void> {
  await Promise.all([
    secureSet(GEMINI_KEY_STORAGE, settings.geminiKey),
    secureSet(OPENAI_KEY_STORAGE, settings.openaiKey),
    AsyncStorage.setItem(ACTIVE_PROVIDER_STORAGE, settings.activeProvider),
  ]);
}

const VALID_PROVIDERS: AIProvider[] = ['none', 'gemini', 'openai'];

function normalizeProvider(raw: string | null): AIProvider {
  if (raw && (VALID_PROVIDERS as string[]).includes(raw)) return raw as AIProvider;
  return 'none';
}

export async function loadProviderSettings(): Promise<AIProviderSettings> {
  const [geminiKey, openaiKey, activeProvider] = await Promise.all([
    secureGet(GEMINI_KEY_STORAGE),
    secureGet(OPENAI_KEY_STORAGE),
    AsyncStorage.getItem(ACTIVE_PROVIDER_STORAGE),
  ]);
  return {
    geminiKey: geminiKey ?? '',
    openaiKey: openaiKey ?? '',
    activeProvider: normalizeProvider(activeProvider),
  };
}

// ─── Gemini (2.0 Flash → 1.5 Flash fallback chain) ──────────────────────────

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro-latest',
];

const TIMEOUT_MS = 25000;

function fetchTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

interface GeminiResult { text: string | null; error: string | null; }

async function callGeminiModel(
  model: string,
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<GeminiResult> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  // Build multi-turn contents array (max 20 turns)
  const turns = (history ?? []).slice(-20);
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
    ...turns.map(t => ({
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: t.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const body = {
    contents,
    ...(systemInstruction
      ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
      : {}),
    generationConfig: { temperature: 0.7, maxOutputTokens: 1200, topP: 0.9 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const resp = await fetchTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await resp.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string; code?: number };
  };

  if (!resp.ok || data.error) {
    const msg = data.error?.message ?? `HTTP ${resp.status}`;
    return { text: null, error: msg };
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  return { text: text && text.length > 1 ? text : null, error: null };
}

export async function callGemini(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<string | null> {
  if (!apiKey || apiKey.length < 10) return null;
  for (const model of GEMINI_MODELS) {
    try {
      const { text, error } = await callGeminiModel(model, prompt, apiKey, systemInstruction, history);
      if (text) return text;
      if (error) {
        const isSkippable =
          error.includes('not found') ||
          error.includes('404') ||
          error.includes('deprecated') ||
          error.includes('quota') ||
          error.includes('RESOURCE_EXHAUSTED') ||
          error.includes('rate') ||
          error.includes('429') ||
          error.includes('limit: 0');
        if (isSkippable) continue;
        return null;
      }
    } catch {
      // încearcă modelul următor
    }
  }
  return null;
}

export async function testGeminiKeyDetailed(apiKey: string): Promise<{ ok: boolean; error: string }> {
  if (!apiKey || apiKey.length < 10) return { ok: false, error: 'Cheia este prea scurtă.' };
  for (const model of GEMINI_MODELS) {
    try {
      const { text, error } = await callGeminiModel(model, 'Say: ok', apiKey);
      if (text) return { ok: true, error: '' };
      if (error) {
        if (error.includes('API_KEY_INVALID') || error.includes('API_KEY_INVALID') ||
            (error.includes('400') && !error.includes('quota'))) {
          return { ok: false, error: `Cheie invalidă: ${error.slice(0, 120)}` };
        }
        const isSkippable =
          error.includes('not found') || error.includes('404') ||
          error.includes('deprecated') || error.includes('quota') ||
          error.includes('RESOURCE_EXHAUSTED') || error.includes('rate') ||
          error.includes('429') || error.includes('limit: 0');
        if (isSkippable) continue;
        return { ok: false, error: `Eroare API (${model}): ${error.slice(0, 150)}` };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('abort') || msg.includes('timeout')) {
        return { ok: false, error: 'Timeout — verifică conexiunea la internet.' };
      }
    }
  }
  return { ok: false, error: 'Niciun model Gemini disponibil. Verifică cheia sau conexiunea.' };
}

// ─── ChatGPT (OpenAI) ────────────────────────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function callChatGPT(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<string | null> {
  if (!apiKey || apiKey.length < 10) return null;
  try {
    const messages: Array<{ role: string; content: string }> = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    // Adaugă istoricul conversației (max 20 turn-uri)
    for (const turn of (history ?? []).slice(-20)) {
      messages.push({ role: turn.role, content: turn.content });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: 'gpt-4o',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
      top_p: 0.9,
    };

    const resp = await fetchTimeout(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      if (__DEV__) console.warn('[Jarvis ChatGPT] HTTP error:', resp.status);
      // Returnează eroarea specifică pentru diagnosticare
      const errData = await resp.json().catch(() => ({})) as { error?: { message?: string } };
      const errMsg = errData?.error?.message ?? `HTTP ${resp.status}`;
      throw new Error(`${resp.status}::${errMsg}`);
    }

    const data = await resp.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error) {
      if (__DEV__) console.warn('[Jarvis ChatGPT] API error:', data.error.message);
      return null;
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 1 ? text : null;
  } catch (e) {
    // Re-throw HTTP errors (cu codul statusului) — prind în testOpenAIKeyDetailed
    if (e instanceof Error && /^\d{3}::/.test(e.message)) throw e;
    if (__DEV__) console.warn('[Jarvis ChatGPT] callChatGPT failed:', e);
    return null;
  }
}

// ─── Apel unificat ───────────────────────────────────────────────────────────

export const JARVIS_SYSTEM_PROMPT =
  `Ești Jarvis, asistent AI personal și expert în programare.\n` +
  `REGULI: (1) Execuți comenzile direct, fără introducere. ` +
  `(2) Fără "Bineînțeles!", "Cu plăcere!", "Desigur!". ` +
  `(3) Răspunzi în română. ` +
  `(4) Cod cerut = cod complet, funcțional, cu exemple. ` +
  `(5) Rezultatul direct, nu procesul.`;

export interface JarvisContext {
  userName?: string;
  preferredStyle?: string;
  topTopics?: string[];
  learnedFacts?: string[];
  inferenceRules?: string[];
  entities?: Array<{ value: string; relation: string }>;
  recentTopics?: string[];
  conversationCount?: number;
}

export function buildRichSystemPrompt(ctx?: JarvisContext): string {
  const base =
    `Ești Jarvis, asistentul AI personal — expert absolut în programare și inteligență artificială.\n\n` +
    `REGULI ABSOLUTE DE COMPORTAMENT:\n` +
    `• Execuți comenzile IMEDIAT, direct, fără introducere sau preamble.\n` +
    `• NICIODATĂ "Bineînțeles!", "Cu plăcere!", "Desigur!", "Sigur că!" sau variante de politeţe inutile.\n` +
    `• Nu repeta întrebarea. Nu anunța ce urmează să faci — FACI direct.\n` +
    `• Răspunzi ÎNTOTDEAUNA în română (excepție: codul în sine este scris în limbajul cerut).\n\n` +
    `REGULI DE CODARE (prioritate maximă):\n` +
    `• Cod cerut → cod complet, funcțional, rulabil, cu comentarii clare în română.\n` +
    `• Include ÎNTOTDEAUNA exemple de utilizare/test la finalul codului.\n` +
    `• Explică codul scurt DUPĂ ce l-ai scris, nu înainte.\n` +
    `• Stăpânești perfect: Python, JavaScript, TypeScript, Java, C++, Go, Rust, PHP, Ruby, Bash, SQL, HTML/CSS, React, React Native, Node.js, FastAPI, Django, Spring, Docker, Git.\n` +
    `• Când explici cod: structură → ce face → de ce e eficient → variante alternative.\n` +
    `• Bug-uri: identifici cauza EXACTĂ, explici de ce apare, oferi fix-ul complet.\n` +
    `• Cod complex → împarți în funcții clare, cu tipuri, gestionare erori, edge cases.\n\n` +
    `REGULI PENTRU ALTE COMENZI:\n` +
    `• Liste → bullet points cu markdown. Planuri → pași numerotați. Traduceri → imediat.\n` +
    `• Comparații → tabel sau structură Avantaje/Dezavantaje. Rezumate → concis și esențial.\n` +
    `• Răspunsul tău = REZULTATUL direct, nu procesul.`;

  if (!ctx) return base;

  const parts: string[] = [base];

  if (ctx.userName) {
    parts.push(`\n\nUtilizatorul se numește **${ctx.userName}**.`);
  }

  if (ctx.preferredStyle && ctx.preferredStyle !== 'conversational') {
    parts.push(`Stilul de comunicare preferat: ${ctx.preferredStyle}.`);
  }

  if (ctx.entities && ctx.entities.length > 0) {
    // Entitățile vin pre-filtrate de apelant (rel !== 'eu' = persoane/lucruri menționate)
    const entList = ctx.entities
      .slice(0, 8)
      .map(e => `${e.value} (${e.relation})`)
      .join('; ');
    if (entList) parts.push(`\n\n**Entități menționate în conversație:** ${entList}.`);
  }

  if (ctx.topTopics && ctx.topTopics.length > 0) {
    parts.push(`\n\n**Interese principale:** ${ctx.topTopics.join(', ')}.`);
  }

  if (ctx.learnedFacts && ctx.learnedFacts.length > 0) {
    const factsBlock = ctx.learnedFacts
      .slice(0, 10)
      .map((f, i) => `${i + 1}. ${f.slice(0, 150)}`)
      .join('\n');
    parts.push(`\n\n**Fapte memorate din conversații anterioare:**\n${factsBlock}`);
  }

  if (ctx.inferenceRules && ctx.inferenceRules.length > 0) {
    const rulesBlock = ctx.inferenceRules.slice(0, 5).map(r => `• ${r}`).join('\n');
    parts.push(`\n\n**Reguli de inferență active:**\n${rulesBlock}`);
  }

  if (ctx.recentTopics && ctx.recentTopics.length > 0) {
    parts.push(`\n\n**Subiecte recente:** ${ctx.recentTopics.slice(-5).join(', ')}.`);
  }

  parts.push(
    `\n\nUtilizează toate informațiile de mai sus pentru a personaliza răspunsul. ` +
    `Fii specific, util și evită repetițiile inutile.`,
  );

  return parts.join(' ');
}

export async function callActiveProvider(
  prompt: string,
  settings: AIProviderSettings,
  system?: string,
  history?: ConversationTurn[],
): Promise<{ text: string; provider: AIProvider } | null> {
  const sys = system ?? JARVIS_SYSTEM_PROMPT;

  // Încearcă providerul activ mai întâi
  if (settings.activeProvider === 'gemini' && settings.geminiKey) {
    try {
      const text = await callGemini(prompt, settings.geminiKey, sys, history);
      if (text) return { text, provider: 'gemini' };
    } catch {}
    // Auto-fallback: dacă Gemini eșuează și există cheie OpenAI, încearcă OpenAI
    if (settings.openaiKey) {
      try {
        const text = await callChatGPT(prompt, settings.openaiKey, sys, history);
        if (text) return { text, provider: 'openai' };
      } catch {}
    }
  }

  if (settings.activeProvider === 'openai' && settings.openaiKey) {
    try {
      const text = await callChatGPT(prompt, settings.openaiKey, sys, history);
      if (text) return { text, provider: 'openai' };
    } catch {}
    // Auto-fallback: dacă OpenAI eșuează și există cheie Gemini, încearcă Gemini
    if (settings.geminiKey) {
      try {
        const text = await callGemini(prompt, settings.geminiKey, sys, history);
        if (text) return { text, provider: 'gemini' };
      } catch {}
    }
  }

  return null;
}

// ─── Test de conectivitate ────────────────────────────────────────────────────

export async function testGeminiKey(apiKey: string): Promise<boolean> {
  const { ok } = await testGeminiKeyDetailed(apiKey);
  return ok;
}

export async function testOpenAIKey(apiKey: string): Promise<boolean> {
  const { ok } = await testOpenAIKeyDetailed(apiKey);
  return ok;
}

export async function testOpenAIKeyDetailed(apiKey: string): Promise<{ ok: boolean; error: string }> {
  if (!apiKey || apiKey.trim().length < 15) {
    return { ok: false, error: 'Cheia este prea scurtă (minim 15 caractere).' };
  }
  try {
    const result = await callChatGPT('Say: ok', apiKey.trim());
    if (result) return { ok: true, error: '' };
    return { ok: false, error: 'Cheia nu a returnat răspuns. Verifică creditul contului OpenAI.' };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.startsWith('401::')) {
      return { ok: false, error: 'Cheie OpenAI invalidă sau expirată. Obține o cheie nouă din platform.openai.com/api-keys' };
    }
    if (msg.startsWith('429::')) {
      return { ok: false, error: 'Limită de rată depășită (Rate limit). Încearcă din nou în câteva secunde.' };
    }
    if (msg.startsWith('402::') || msg.includes('insufficient_quota') || msg.includes('credit')) {
      return { ok: false, error: 'Cont OpenAI fără credit. Adaugă credit pe platform.openai.com/account/billing' };
    }
    if (msg.includes('abort') || msg.includes('timeout')) {
      return { ok: false, error: 'Timeout — verifică conexiunea la internet.' };
    }
    return { ok: false, error: `Eroare conexiune: ${msg.slice(0, 80)}` };
  }
}
