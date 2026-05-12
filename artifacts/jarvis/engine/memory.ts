import AsyncStorage from '@react-native-async-storage/async-storage';
import { semanticSimilarity } from './semantic';

const MEMORY_KEY = '@jarvis_memory_v2_json';

export type MemoryCategory = 'fapte_utilizator' | 'preferinte' | 'obiective' | 'conversatii_importante' | 'general';

export interface MemoryEntry {
  fact: string;
  source: string;
  category: MemoryCategory;
  addedAt: string;
  importance?: number;
  strength?: number;
  occurrences?: number;
}

export interface UserModel {
  interests: string[];
  knowledgeLevel: 'beginner' | 'intermediate' | 'expert';
  preferredStyle: string;
  frequentQuestions: string[];
  lastUpdated: number;
}

const USER_MODEL_KEY = '@jarvis_user_model_v1';

export async function saveUserModel(model: UserModel): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_MODEL_KEY, JSON.stringify(model));
  } catch {}
}

export async function loadUserModel(): Promise<UserModel> {
  try {
    const data = await AsyncStorage.getItem(USER_MODEL_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return {
    interests: [],
    knowledgeLevel: 'intermediate',
    preferredStyle: 'direct',
    frequentQuestions: [],
    lastUpdated: Date.now(),
  };
}

export async function extractAndUpdateUserModel(history: string[]): Promise<void> {
  const model = await loadUserModel();
  const text = history.join(' ').toLowerCase();

  // Detecție nivel cunoștințe
  if (/(cum instalez|ce este|nu stiu|ajuta-ma cu|incepator|invata-ma|simplu|nu inteleg)/.test(text)) {
    model.knowledgeLevel = 'beginner';
  } else if (/(arhitectura|optimizare|performanta|avansat|complex|microservicii|scalabilitate|implementare|refactorizare)/.test(text)) {
    model.knowledgeLevel = 'expert';
  }

  // Detecție interese și concepte recurente (> 3 ori)
  const words = text.split(/[ \n\t,.]+/)
    .filter(w => w.length > 5 && !['asistent', 'mesaj', 'utilizator', 'raspuns', 'pentru', 'despre'].includes(w));
  
  const counts: Record<string, number> = {};
  words.forEach(w => counts[w] = (counts[w] || 0) + 1);
  
  // Identificăm concepte care au apărut de mai mult de 3 ori
  const recurringConcepts = Object.entries(counts)
    .filter(([_, count]) => count >= 3)
    .map(([word]) => word);

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const newInterests = sorted.slice(0, 5).map(e => e[0]);
  
  // Combinăm interesele noi cu cele recurente
  model.interests = [...new Set([...model.interests, ...newInterests, ...recurringConcepts])].slice(-20);
  
  // Păstrăm ultimele întrebări frecvente (primele 3 din istoric care au semnul ?)
  const questions = history.filter(h => h.includes('?')).slice(-3);
  model.frequentQuestions = [...new Set([...model.frequentQuestions, ...questions])].slice(-5);

  model.lastUpdated = Date.now();
  await saveUserModel(model);
}

export interface MemoryStore {
  entries: MemoryEntry[];
}

export async function loadMemory(): Promise<MemoryStore> {
  try {
    const raw = await AsyncStorage.getItem(MEMORY_KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as MemoryStore;
    if (!Array.isArray(parsed.entries)) return { entries: [] };
    const valid = parsed.entries.filter(
      (e): e is MemoryEntry =>
        typeof e === 'object' && e !== null &&
        typeof e.fact === 'string' && e.fact.length > 0 &&
        typeof e.source === 'string' &&
        typeof e.addedAt === 'string',
    );
    return { entries: valid };
  } catch {
    return { entries: [] };
  }
}

export async function saveMemory(mem: MemoryStore): Promise<void> {
  try {
    // Păstrăm ultimele 500 de amintiri (am crescut limita de la 150)
    const trimmed: MemoryStore = {
      entries: mem.entries.slice(-500),
    };
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(trimmed));
  } catch {
    if (__DEV__) console.warn('[Jarvis Memory] saveMemory failed');
  }
}

const MAX_ENTRIES = 500;

export function addMemoryEntry(
  mem: MemoryStore,
  fact: string,
  source: string,
  category: MemoryCategory = 'general',
  importance = 0.5,
): MemoryStore {
  const isDuplicate = mem.entries.some(
    e => e.fact.toLowerCase() === fact.toLowerCase(),
  );
  if (isDuplicate) return mem;

  const newEntries = [
    ...mem.entries,
    { fact, source, category, addedAt: new Date().toISOString(), importance },
  ].slice(-MAX_ENTRIES);

  return { entries: newEntries };
}

/**
 * Returnează amintirile cele mai relevante pentru un query, folosind similaritate semantică.
 */
export function getRelevantMemories(
  mem: MemoryStore,
  query: string,
  maxCount = 15,
): MemoryEntry[] {
  if (!query || mem.entries.length === 0) {
    // Dacă nu avem query, returnăm cele mai recente amintiri importante
    return mem.entries
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .slice(0, maxCount);
  }

  const scored = mem.entries.map(entry => {
    const sim = semanticSimilarity(query, entry.fact);
    // Bonus pentru importanță și prospețime
    const importanceBonus = (entry.importance || 0) * 0.2;
    return { entry, score: sim + importanceBonus };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map(x => x.entry);
}

/**
 * Formatează amintirile pentru a fi incluse în System Prompt.
 */
export function formatMemoriesForPrompt(entries: MemoryEntry[]): string {
  if (entries.length === 0) return '';

  const categories: Record<MemoryCategory, string[]> = {
    fapte_utilizator: [],
    preferinte: [],
    obiective: [],
    conversatii_importante: [],
    general: [],
  };

  entries.forEach(e => {
    categories[e.category || 'general'].push(e.fact);
  });

  let output = '### MEMORIE PERSISTENTĂ (Context Utilizator):\n';
  
  if (categories.fapte_utilizator.length > 0) {
    output += `**Fapte despre utilizator:** ${categories.fapte_utilizator.join('; ')}\n`;
  }
  if (categories.preferinte.length > 0) {
    output += `**Preferințe:** ${categories.preferinte.join('; ')}\n`;
  }
  if (categories.obiective.length > 0) {
    output += `**Obiective:** ${categories.obiective.join('; ')}\n`;
  }
  if (categories.conversatii_importante.length > 0) {
    output += `**Conversații cheie:**\n- ${categories.conversatii_importante.join('\n- ')}\n`;
  }
  if (categories.general.length > 0 && output.length < 500) {
    output += `**Alte detalii:** ${categories.general.slice(0, 5).join('; ')}\n`;
  }

  return output;
}
