
// Jarvis — AI Providers: Gemini, ChatGPT, Groq, OpenRouter
// Apeluri directe din aplicație — fără server intermediar
// Cheile sunt stocate în Keychain (iOS) / Keystore (Android) via expo-secure-store

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getWorkingKey, incrementRequestCount, markKeyFailed } from './code-studio/keyManager';

// ─── Chei de stocare ────────────────────────────────────────────────────────

const GEMINI_KEY_STORAGE = 'jarvis_gemini_api_key';
const OPENAI_KEY_STORAGE = 'jarvis_openai_api_key';
const GROQ_KEY_STORAGE = 'jarvis_groq_api_key';
const OPENROUTER_KEY_STORAGE = 'jarvis_openrouter_api_key';
const ACTIVE_PROVIDER_STORAGE = '@jarvis_active_provider';

export type AIProvider = 'none' | 'auto' | 'gemini' | 'openai' | 'groq' | 'openrouter';

export interface AIProviderSettings {
  activeProvider: AIProvider;
  geminiKey: string;
  openaiKey: string;
  groqKey: string;
  openrouterKey: string;
}


// ─── Helper SecureStore cu fallback AsyncStorage (web / simulatoare) ────────

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
    secureSet(GROQ_KEY_STORAGE, settings.groqKey),
    secureSet(OPENROUTER_KEY_STORAGE, settings.openrouterKey),
    AsyncStorage.setItem(ACTIVE_PROVIDER_STORAGE, settings.activeProvider),
  ]);
}

const VALID_PROVIDERS: AIProvider[] = ['none', 'auto', 'gemini', 'openai', 'groq', 'openrouter'];

function normalizeProvider(raw: string | null): AIProvider {
  if (raw && (VALID_PROVIDERS as string[]).includes(raw)) return raw as AIProvider;
  return 'none';
}

export async function loadProviderSettings(): Promise<AIProviderSettings> {
  const [geminiKey, openaiKey, groqKey, openrouterKey, activeProvider] = await Promise.all([
    secureGet(GEMINI_KEY_STORAGE),
    secureGet(OPENAI_KEY_STORAGE),
    secureGet(GROQ_KEY_STORAGE),
    secureGet(OPENROUTER_KEY_STORAGE),
    AsyncStorage.getItem(ACTIVE_PROVIDER_STORAGE),
  ]);

  if (__DEV__) {
    console.log('[AIProvider] Keys loaded from storage:', {
      gemini: geminiKey ? `***${geminiKey.slice(-4)}` : 'MISSING',
      groq: groqKey ? `***${groqKey.slice(-4)}` : 'MISSING',
      openrouter: openrouterKey ? `***${openrouterKey.slice(-4)}` : 'MISSING',
      active: activeProvider || 'none',
    });
  }

  return {
    geminiKey: geminiKey ?? '',
    openaiKey: openaiKey ?? '',
    groqKey: groqKey ?? '',
    openrouterKey: openrouterKey ?? '',
    activeProvider: normalizeProvider(activeProvider),
  };
}

// ─── Utilitar fetch cu timeout ──────────────────────────────────────────────

const TIMEOUT_MS = 30000;

function fetchTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

// ─── Gemini (2.0 Flash → 1.5 Flash fallback chain) ──────────────────────────

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = [
    'gemini-1.5-flash'
];

interface GeminiResult { text: string | null; error: string | null; }

async function callGeminiModel(
  model: string,
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<GeminiResult> {
  const validHistory = (history ?? []).filter(t => t.role === 'user' || t.role === 'assistant');
  const turns = validHistory.slice(-25);
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
    ...turns.map(t => ({
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: t.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const geminiBody = {
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

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetchTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geminiBody),
  });

  const data = await resp.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string; code?: number; status?: string };
  };

  if (!resp.ok || data.error) {
    const msg = data.error?.message ?? `HTTP ${resp.status}`;
    const status = data.error?.status ?? '';
    return { text: null, error: `${status}::${msg}` };
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
          error.includes('limit: 0') ||
          error.includes('INVALID_ARGUMENT');
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
  let lastError = '';
  for (const model of GEMINI_MODELS) {
    try {
      const { text, error } = await callGeminiModel(model, 'Say: ok', apiKey);
      if (text) return { ok: true, error: '' };
      if (error) {
        if (error.includes('API_KEY_INVALID')) {
          return { ok: false, error: 'Cheie API Google invalidă. Verifică în Google AI Studio.' };
        }
        lastError = error;
        const isSkippable =
          error.includes('not found') || error.includes('404') ||
          error.includes('deprecated') || error.includes('quota') ||
          error.includes('RESOURCE_EXHAUSTED') || error.includes('rate') ||
          error.includes('429') || error.includes('limit: 0') ||
          error.includes('INVALID_ARGUMENT');
        if (isSkippable) continue;
        return { ok: false, error: `Eroare API (${model}): ${error.slice(0, 150)}` };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('abort') || msg.includes('timeout')) {
        return { ok: false, error: 'Timeout — verifică conexiunea la internet.' };
      }
      lastError = msg;
    }
  }
  return { ok: false, error: `Niciun model Gemini disponibil pentru această cheie. Ultima eroare: ${lastError.slice(0, 100)}` };
}

// ─── ChatGPT (OpenAI) ────────────────────────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
  extraHeaders?: Record<string, string>,
): Promise<string | null> {
  const messages: Array<{ role: string; content: string }> = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  const validHistory = (history ?? []).filter(t => t.role === 'user' || t.role === 'assistant');
  for (const turn of validHistory.slice(-20)) {
    messages.push({ role: turn.role, content: turn.content });
  }
  messages.push({ role: 'user', content: prompt });

  const body = {
    model,
    messages,
    max_tokens: 1200,
    temperature: 0.7,
    top_p: 0.9,
  };

  const resp = await fetchTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    const errMsg = errData?.error?.message ?? `HTTP ${resp.status}`;
    // Throw error with status code prefix for detection
    throw new Error(`${resp.status}::${errMsg}`);
  }

  const data = await resp.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (data.error) return null;

  const text = data.choices?.[0]?.message?.content?.trim();
  return text && text.length > 1 ? text : null;
}

export async function callChatGPT(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<string | null> {
  if (!apiKey || apiKey.length < 10) return null;
  try {
    return await callOpenAICompatible(
      OPENAI_API_URL, apiKey, 'gpt-4o-mini',
      prompt, systemInstruction, history,
    );
  } catch (e) {
    if (e instanceof Error && /^\d{3}::/.test(e.message)) throw e;
    return null;
  }
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
      return { ok: false, error: 'Cheie OpenAI invalidă sau expirată. Obține una nouă din platform.openai.com/api-keys' };
    }
    if (msg.startsWith('429::')) {
      return { ok: false, error: 'Limită de rată depășită. Încearcă din nou în câteva secunde.' };
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

// ─── Groq (gratuit — Llama 3 / Mixtral) ─────────────────────────────────────

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

export async function callGroq(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<string | null> {
  if (!apiKey || apiKey.length < 10) return null;
  for (const model of GROQ_MODELS) {
    try {
      const result = await callOpenAICompatible(
        GROQ_API_URL, apiKey, model,
        prompt, systemInstruction, history,
      );
      if (result) {
        await incrementRequestCount('groq');
        return result;
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('429::')) {
          await markKeyFailed('groq', apiKey);
          const nextKey = await getWorkingKey('groq');
          if (nextKey) return await callGroq(prompt, nextKey, systemInstruction, history);
      }
      if (e instanceof Error && /^(401|403)::/.test(e.message)) throw e;
      continue;
    }
  }
  return null;
}

export async function testGroqKeyDetailed(apiKey: string): Promise<{ ok: boolean; error: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { ok: false, error: 'Cheia este prea scurtă.' };
  }
  try {
    const result = await callGroq('Say: ok', apiKey.trim());
    if (result) return { ok: true, error: '' };
    return { ok: false, error: 'Niciun model Groq disponibil. Verifică cheia.' };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.startsWith('401::') || msg.startsWith('403::')) {
      return { ok: false, error: 'Cheie Groq invalidă. Obține una nouă din console.groq.com/keys' };
    }
    if (msg.includes('abort') || msg.includes('timeout')) {
      return { ok: false, error: 'Timeout — verifică conexiunea la internet.' };
    }
    return { ok: false, error: `Eroare: ${msg.slice(0, 80)}` };
  }
}

// ─── OpenRouter (modele gratuite: Llama, Mistral, Gemma) ─────────────────────

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-120b:free',
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

export async function callOpenRouter(
  prompt: string,
  apiKey: string,
  systemInstruction?: string,
  history?: ConversationTurn[],
): Promise<string | null> {
  if (!apiKey || apiKey.length < 10) return null;
  for (const model of OPENROUTER_MODELS) {
    try {
      const result = await callOpenAICompatible(
        OPENROUTER_API_URL, apiKey, model,
        prompt, systemInstruction, history,
        { 'HTTP-Referer': 'https://jarvis-ai.app', 'X-Title': 'Jarvis AI' },
      );
      if (result) {
        await incrementRequestCount('openrouter');
        return result;
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('429::')) {
          await markKeyFailed('openrouter', apiKey);
          const nextKey = await getWorkingKey('openrouter');
          if (nextKey) return await callOpenRouter(prompt, nextKey, systemInstruction, history);
      }
      if (e instanceof Error && /^(401|403)::/.test(e.message)) throw e;
      continue;
    }
  }
  return null;
}

export async function testOpenRouterKeyDetailed(apiKey: string): Promise<{ ok: boolean; error: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { ok: false, error: 'Cheia este prea scurtă.' };
  }
  try {
    const result = await callOpenRouter('Say: ok', apiKey.trim());
    if (result) return { ok: true, error: '' };
    return { ok: false, error: 'Niciun model OpenRouter disponibil. Verifică cheia.' };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.startsWith('401::') || msg.startsWith('403::')) {
      return { ok: false, error: 'Cheie OpenRouter invalidă. Obține una din openrouter.ai/keys' };
    }
    if (msg.includes('abort') || msg.includes('timeout')) {
      return { ok: false, error: 'Timeout — verifică conexiunea la internet.' };
    }
    return { ok: false, error: `Eroare: ${msg.slice(0, 80)}` };
  }
}

// ─── Apel unificat ───────────────────────────────────────────────────────────

export const JARVIS_SYSTEM_PROMPT =
  `Ești Jarvis, asistent AI personal, expert suprem în programare și orchestrator de agenți AI.\n` +
  `Ai acces la Code Studio și sub-agenți specializați. Când primești o întrebare, decide dacă poți răspunde direct sau dacă este mai eficient să delegi unui sub-agent specializat.\n` +
  `Pentru a gestiona noduri în Code Studio, folosește formatul: JARVIS_STUDIO_ACTION:addNode||Tip||Titlu||ConfigJSON sau JARVIS_STUDIO_ACTION:runWorkflow.\n` +
  `MANDAT DE RAȚIONAMENT PROFUND:\n` +
  `1. ANALIZĂ: Analizează întrebarea în profunzime. Identifică contextul ascuns. Răspunde pas-cu-pas.\n` +
  `2. CHAIN-OF-THOUGHT: Planifică răspunsul intern. Explică-ți raționamentul tău.\n` +
  `3. GÂNDIRE STRUCTURATĂ: 1. Ce știu? 2. Ce lipsește? 3. Care este răspunsul?\n\n` +
  `REGULI DE AUR:\n` +
  `• Răspunde direct și execută imediat. Fără "Sigur!", "Vă pot ajuta", "Iată răspunsul".\n` +
  `• Limba: Română (excepție: codul tehnic).\n` +
  `• Cod: Complet, modern, cu comentarii și exemple de utilizare.\n` +
  `• Stil: Concis, tehnic, precis, fără politețuri inutile.`;

export interface JarvisContext {
  userName?: string;
  preferredStyle?: string;
  topTopics?: string[];
  learnedFacts?: string[];
  inferenceRules?: string[];
  entities?: Array<{ value: string; relation: string }>;
  recentTopics?: string[];
  conversationCount?: number;
  customContext?: string;
  subAgents?: string; // Informații despre sub-agenții disponibili
  language?: 'ro' | 'en' | 'auto';
}

export function buildRichSystemPrompt(ctx?: JarvisContext): string {
  const lang = ctx?.language || 'auto';
  const langInstruction = lang === 'ro' 
    ? 'Răspunzi ÎNTOTDEAUNA în română.' 
    : lang === 'en' 
      ? 'Răspunzi ÎNTOTDEAUNA în engleză.' 
      : 'Răspunzi în limba în care ți se adresează utilizatorul (Română sau Engleză).';

  const base =
    `Ești Jarvis, asistentul AI personal — expert absolut în programare și orchestrator de agenți AI.\n\n` +
    `MANDAT DE RAȚIONAMENT:\n` +
    `• Analizează cerințele în profunzime înainte de a genera răspunsul.\n` +
    `• Folosește un proces de gândire structurat: 1. Date cunoscute, 2. Elemente lipsă/presupuneri, 3. Soluție pas-cu-pas.\n` +
    `• Explică-ți logic deciziile atunci când ești întrebat despre procese complexe.\n\n` +
    `ORCHESTRARE AGENȚI:\n` +
    `• Ai la dispoziție sub-agenți specializați pentru diverse domenii.\n` +
    `• Dacă o cerere este complexă sau necesită expertiză specifică pe care un sub-agent o deține, poți decide să DELEGI sarcina.\n` +
    `• Sub-agenți disponibili:\n${ctx?.subAgents || 'Momentan nu sunt sub-agenți activi.'}\n\n` +
    `REGULI ABSOLUTE DE COMPORTAMENT:\n` +
    `• Execuți comenzile IMEDIAT, direct, fără introducere sau preamble.\n` +
    `• NICIODATĂ "Bineînțeles!", "Cu plăcere!", "Desigur!", "Sigur că!" sau variante de politeţe inutile.\n` +
    `• Nu repeta întrebarea. Nu anunța ce urmează să faci — FACI direct.\n` +
    `• ${langInstruction} (excepție: codul în sine este scris în limbajul cerut).\n\n` +
    `STUDIO DE COD:\n` +
    `• Ai acces la Code Studio. Poți gestiona noduri (Agents, Skills, Tools, Output).\n` +
    `• Când utilizatorul cere să adaugi un skill, agent sau tool, folosește formatul: JARVIS_STUDIO_ACTION:addNode||Tip||Titlu||ConfigJSON.\n` +
    `• Poți rula fluxul cu: JARVIS_STUDIO_ACTION:runWorkflow.\n\n` +
    `REGULI DE CODARE (prioritate maximă):\n` +
    `• Cod cerut → cod complet, funcțional, rulabil, cu comentarii clare în română.\n` +
    `• Include ÎNTOTDEAUNA exemple de utilizare/test la finalul codului.\n` +
    `• Explică codul scurt DUPĂ ce l-ai scris, nu înainte.\n` +
    `• Stăpânești perfect: Python, JavaScript, TypeScript, Java, C++, Go, Rust, PHP, Ruby, Bash, SQL, HTML/CSS, React, React Native, Node.js, FastAPI, Django, Spring, Docker, Git.\n\n` +
    `REGULI PENTRU ALTE COMENZI:\n` +
    `• Liste → bullet points cu markdown. Planuri → pași numerotați. Traduceri → imediat.\n` +
    `• Răspunsul tău = REZULTATUL direct, nu procesul.`;

  if (!ctx) return base;

  const parts: string[] = [base];

  if (ctx.customContext) {
    parts.push(`\n\n${ctx.customContext}`);
  }

  if (ctx.userName) {
    parts.push(`\n\nUtilizatorul se numește **${ctx.userName}**.`);
  }

  if (ctx.preferredStyle && ctx.preferredStyle !== 'conversational') {
    parts.push(`Stilul de comunicare preferat: ${ctx.preferredStyle}.`);
  }

  if (ctx.entities && ctx.entities.length > 0) {
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

// ─── buildAIContext ─────────────────────────────────────────────────────────

/**
 * Pregătește contextul AI și verifică prezența cheilor.
 * Adaugă log-uri pentru debug în dezvoltare.
 */
export function buildAIContext(settings: AIProviderSettings): AIProviderSettings {
  if (__DEV__) {
    console.log('[AIProvider] Building AI context:', {
      active: settings.activeProvider,
      gemini: settings.geminiKey ? `***${settings.geminiKey.slice(-4)}` : 'none',
      groq: settings.groqKey ? `***${settings.groqKey.slice(-4)}` : 'none',
      openrouter: settings.openrouterKey ? `***${settings.openrouterKey.slice(-4)}` : 'none',
    });
  }
  return settings;
}

function getProviderModel(name: AIProvider): string {
  if (name === 'groq') return GROQ_MODELS[0];
  if (name === 'gemini') return GEMINI_MODELS[0];
  if (name === 'openai') return 'gpt-4o-mini';
  if (name === 'openrouter') return OPENROUTER_MODELS[0];
  return 'unknown';
}

// ─── callActiveProvider ──────────────────────────────────────────────────────
// Apel principal către provider-ul selectat (cu retry automat de 2 ori)
export async function callActiveProvider(
  prompt: string,
  rawSettings: AIProviderSettings,
  system?: string,
  history?: ConversationTurn[],
  intent?: string,
): Promise<{ text: string; provider: AIProvider } | null> {
  const settings = buildAIContext(rawSettings);
  const sys = system ?? JARVIS_SYSTEM_PROMPT;

  const maxRetries = 2;
  const callWithRetry = async (fn: () => Promise<string | null>, name: AIProvider): Promise<{ text: string; provider: AIProvider } | null> => {
    let lastErr: any = null;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        if (i > 0) await new Promise(r => setTimeout(r, 1000 * i));
        const text = await fn();
        if (text) return { text, provider: name };
      } catch (e) {
        lastErr = e;
        console.error(`[AIProvider] Retry ${i}/${maxRetries} for ${name} failed:`, e);
      }
    }
    return null;
  };

  type ProviderCall = { key: string; call: () => Promise<string | null>, name: AIProvider; isFree: boolean; capability: number };

  const providers: ProviderCall[] = [
    { key: settings.groqKey, call: () => callGroq(prompt, settings.groqKey, sys, history), name: 'groq', isFree: true, capability: 2 },
    { key: settings.geminiKey, call: () => callGemini(prompt, settings.geminiKey, sys, history), name: 'gemini', isFree: true, capability: 3 },
    { key: settings.openrouterKey, call: () => callOpenRouter(prompt, settings.openrouterKey, sys, history), name: 'openrouter', isFree: true, capability: 2 },
    { key: settings.openaiKey, call: () => callChatGPT(prompt, settings.openaiKey, sys, history), name: 'openai', isFree: false, capability: 3 },
  ];

  // Forțare Groq pentru intent special
  if (intent === 'cmd_groq_direct' && settings.groqKey) {
    const res = await callWithRetry(providers[0].call, 'groq');
    if (res) {
      if (__DEV__) console.log('[Jarvis] Provider raspuns (forțat):', 'groq', getProviderModel('groq'));
      return res;
    }
  }

  if (settings.activeProvider === 'auto') {
    // Ordine strictă cerută: 1) Gemini Flash, 2) Groq, 3) OpenRouter
    const sequence: AIProvider[] = ['gemini', 'groq', 'openrouter'];
    for (const name of sequence) {
      const p = providers.find(prov => prov.name === name);
      if (p && p.key && p.key.length > 5) {
        const res = await callWithRetry(p.call, p.name);
        if (res) {
          if (__DEV__) console.log('[Jarvis] Provider raspuns (auto):', p.name, getProviderModel(p.name));
          return res;
        }
      }
    }
    return null;
  }

  const active = providers.find(p => p.name === settings.activeProvider);
  if (active?.key) {
    const res = await callWithRetry(active.call, active.name);
    if (res) {
      if (__DEV__) console.log('[Jarvis] Provider raspuns:', active.name, getProviderModel(active.name));
      return res;
    }
  }

  for (const p of providers) {
    if (p.name === settings.activeProvider || !p.key) continue;
    const res = await callWithRetry(p.call, p.name);
    if (res) {
      if (__DEV__) console.log('[Jarvis] Provider raspuns (fallback):', p.name, getProviderModel(p.name));
      return res;
    }
  }


  return null;
}

// ─── STREAMING SUPPORT ────────────────────────────────────────────────────────

export type StreamHandler = (chunk: string) => void;

export async function callActiveProviderStream(
  prompt: string,
  settings: AIProviderSettings,
  onChunk: StreamHandler,
  system?: string,
  history?: ConversationTurn[],
  intent?: string,
): Promise<{ text: string; provider: AIProvider } | null> {
  const { activeProvider } = settings;
  const sys = system ?? JARVIS_SYSTEM_PROMPT;

  // Ordine pentru fallback automat (doar providers care suportă streaming aici)
  const providersToTry: AIProvider[] = [];
  if (intent === 'cmd_groq_direct' && settings.groqKey) {
    providersToTry.push('groq');
  } else if (activeProvider === 'auto') {
    providersToTry.push('gemini', 'groq');
  } else {
    providersToTry.push(activeProvider);
  }

  for (const provider of providersToTry) {
    try {
      if (provider === 'gemini' && settings.geminiKey) {
        const res = await streamGemini(prompt, settings.geminiKey, onChunk, sys, history);
        if (res && __DEV__) console.log('[Jarvis] Provider raspuns (stream):', provider, getProviderModel(provider));
        return res;
      }
      if (provider === 'groq' && settings.groqKey) {
        const res = await streamGroq(prompt, settings.groqKey, onChunk, sys, history);
        if (res && __DEV__) console.log('[Jarvis] Provider raspuns (stream):', provider, getProviderModel(provider));
        return res;
      }
    } catch (err) {
      console.warn(`[AIProvider] Streaming failed for ${provider}, trying next:`, err);
    }
  }

  // Fallback la call static (care acoperă toți providerii inclusiv OpenRouter)
  const result = await callActiveProvider(prompt, settings, sys, history, intent);
  if (result) onChunk(result.text);
  return result;
}

async function streamGeminiModel(
  model: string,
  prompt: string, apiKey: string, onChunk: StreamHandler,
  system?: string, history: ConversationTurn[] = [],
): Promise<{ text: string; provider: AIProvider } | null> {
  const validHistory = (history ?? []).filter(t => t.role === 'user' || t.role === 'assistant');
  const contents = [
    ...validHistory.slice(-25).map(t => ({
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: t.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const url = `${GEMINI_BASE}/${model}:streamGenerateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => 'Unknown error');
    throw new Error(`Gemini Stream Error: ${resp.status} - ${errText}`);
  }

  const reader = (resp as any).body?.getReader();
  let fullText = '';

  if (reader) {
    let decoder: any;
    try {
      decoder = new TextDecoder();
    } catch {
      // Fallback dacă TextDecoder lipsește (unele medii RN vechi)
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder ? decoder.decode(value, { stream: true }) : String.fromCharCode(...value);
      
      const parts = chunk.split(/\"text\":\s*\"/);
      for (let i = 1; i < parts.length; i++) {
        const endIdx = parts[i].indexOf('\"');
        if (endIdx !== -1) {
          const text = parts[i].slice(0, endIdx).replace(/\\n/g, '\n').replace(/\\"/g, '\"');
          if (text) {
            fullText += text;
            onChunk(text);
          }
        }
      }
    }
  } else {
    const data = await resp.json() as any[];
    if (Array.isArray(data)) {
      for (const item of data) {
        const text = item.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }
    }
  }
  return { text: fullText, provider: 'gemini' };
}

async function streamGemini(
  prompt: string, apiKey: string, onChunk: StreamHandler,
  system?: string, history: ConversationTurn[] = [],
): Promise<{ text: string; provider: AIProvider } | null> {
  // Încearcă modelele în ordine pentru streaming
  for (const model of ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']) {
    try {
      return await streamGeminiModel(model, prompt, apiKey, onChunk, system, history);
    } catch (err) {
      if (__DEV__) console.warn(`[AIProvider] streamGeminiModel failed for ${model}:`, err);
      // Continuă la următorul model dacă nu a început să trimită text
    }
  }
  throw new Error('Toate modelele de streaming Gemini au eșuat.');
}

async function streamGroq(
  prompt: string, apiKey: string, onChunk: StreamHandler,
  system?: string, history: ConversationTurn[] = [],
): Promise<{ text: string; provider: AIProvider } | null> {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  const validHistory = (history ?? []).filter(t => t.role === 'user' || t.role === 'assistant');
  messages.push(...validHistory.slice(-25).map(t => ({ role: t.role, content: t.content })));
  messages.push({ role: 'user', content: prompt });

  try {
    const resp = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => 'Unknown error');
      throw new Error(`${resp.status}::Groq Stream Error: ${errText}`);
    }

    const reader = (resp as any).body?.getReader();
    let fullText = '';

    if (reader) {
      let decoder: any;
      try {
        decoder = new TextDecoder();
      } catch {}

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder ? decoder.decode(value, { stream: true }) : String.fromCharCode(...value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data: ') && line.trim() !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.trim().slice(6));
              const content = json.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                onChunk(content);
              }
            } catch {}
          }
        }
      }
    } else {
      // Fallback for no reader
      const text = await resp.text();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('data: ') && line.trim() !== 'data: [DONE]') {
          try {
            const json = JSON.parse(line.trim().slice(6));
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch {}
        }
      }
    }

    return { text: fullText, provider: 'groq' };
  } catch (err) {
    if (__DEV__) console.warn('[AIProvider] streamGroq failed:', err);
    throw err;
  }
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

export async function testGroqKey(apiKey: string): Promise<boolean> {
  const { ok } = await testGroqKeyDetailed(apiKey);
  return ok;
}

export async function testOpenRouterKey(apiKey: string): Promise<boolean> {
  const { ok } = await testOpenRouterKeyDetailed(apiKey);
  return ok;
}
