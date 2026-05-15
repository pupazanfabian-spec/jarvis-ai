import AsyncStorage from '@react-native-async-storage/async-storage';
import { semanticSimilarity } from './semantic';
import { detectContradiction } from './inference';
import { writeMemoryEntry } from './memoryFolder';
import { Message } from './brain';
import { loadProviderSettings, callGroq, callGemini, callOpenRouter } from './aiProviders';

export interface MemoryEntry {
  id: string;
  category: 'reguli' | 'sistem' | 'importanta' | 'mai_putin' | 'irelevanta';
  content: string;
  tags: string[];
  createdAt: number;
  lastAccess: number;
  accessCount: number;
  importance: number;     // 1-10
  source: 'user_explicit' | 'jarvis_inferred' | 'conversation' | 'web';
  relatedTo?: string[];
  expiresAt?: number;
}

const CATEGORY_CAPS = {
  reguli: 500,
  sistem: 1000,
  importanta: 1000,
  mai_putin: 2000,
  irelevanta: 3000,
};

const STORAGE_KEYS = {
  reguli: '@jarvis_memory_reguli',
  sistem: '@jarvis_memory_sistem',
  importanta: '@jarvis_memory_importanta',
  mai_putin: '@jarvis_memory_mai_putin',
  irelevanta: '@jarvis_memory_irelevanta',
};

// Internal cache
let _memoryCache: Record<string, MemoryEntry[]> = {
  reguli: [],
  sistem: [],
  importanta: [],
  mai_putin: [],
  irelevanta: [],
};

let _isLoaded = false;

async function _loadAll() {
  if (_isLoaded) return;
  for (const [cat, key] of Object.entries(STORAGE_KEYS)) {
    try {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        _memoryCache[cat] = JSON.parse(data);
      }
    } catch (e) {
      console.error(`[MemoryManager] Failed to load ${cat}:`, e);
    }
  }
  _isLoaded = true;
}

async function _saveCategory(category: keyof typeof STORAGE_KEYS) {
  try {
    const key = STORAGE_KEYS[category];
    const data = _memoryCache[category].slice(-CATEGORY_CAPS[category]);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[MemoryManager] Failed to save ${category}:`, e);
  }
}

export function autoCategorize(content: string, source: MemoryEntry['source']): MemoryEntry['category'] | null {
  const c = content.toLowerCase().trim();
  
  // STEP 1 — Keywords sigure & Delete pattern
  if (c.startsWith('uită ') || c.startsWith('uita ')) return null;

  if (source === 'user_explicit') {
    // Pattern "vreau să respecți regula:" / "regula este să" / "obligatoriu să"
    const hasRegulaKey = c.includes('regulă') || c.includes('regula') || c.includes('obligatoriu');
    const isExplicitRequest = c.includes('vreau să') || c.includes('vreau sa') || c.includes('trebuie să') || c.includes('trebuie sa');
    
    if (hasRegulaKey || isExplicitRequest) {
      // STEP 2 — Keywords RESPINSE (anti-pattern)
      const isQuestion = c.includes('explică-mi') || c.includes('explica-mi') || 
                        c.includes('ce este') || c.includes('ce e ') || 
                        c.includes('cum funcționează') || c.includes('cât este') || 
                        c.includes('care este') || c.includes('?') || c.startsWith('de ce');
      
      if (!isQuestion && (hasRegulaKey || isExplicitRequest)) {
        return 'reguli';
      }
    }

    // Fapte despre user (importanta)
    if (c.includes('îmi place') || c.includes('imi place') || c.includes('prefer') || 
        c.includes('locuiesc') || c.includes('numele meu') || c.includes('mă numesc') || 
        c.includes('ma numesc') || c.includes('sunt un') || c.includes('lucrez ca')) {
      return 'importanta';
    }
  }
  
  if (source === 'jarvis_inferred') {
    if (c.includes('eu sunt jarvis') || c.includes('eu pot să') || c.includes('eu pot sa') || c.includes('identitatea mea')) {
      return 'sistem';
    }
  }

  // STEP 3 — Heuristică pentru fapte (dacă nu e match pe keywords)
  // Salvăm doar dacă pare a fi o afirmație despre sine sau context personal
  if (source === 'user_explicit' && c.length > 15 && !c.includes('?')) {
    if (/(?:eu sunt|am |lucrez|stau în|stau in|vreau ca|mi-ar plăcea|mi-ar placea)/.test(c)) {
      return 'importanta';
    }
  }
  
  return null;
}

export async function deleteByKeyword(keyword: string): Promise<number> {
  await _loadAll();
  let count = 0;
  const kw = keyword.toLowerCase().trim();
  if (!kw) return 0;

  for (const cat of Object.keys(_memoryCache)) {
    const initialLen = _memoryCache[cat].length;
    _memoryCache[cat] = _memoryCache[cat].filter(e => !e.content.toLowerCase().includes(kw));
    const deleted = initialLen - _memoryCache[cat].length;
    if (deleted > 0) {
      count += deleted;
      await _saveCategory(cat as any);
    }
  }
  return count;
}

export async function addEntry(
  content: string, 
  source: MemoryEntry['source'], 
  hints?: Partial<MemoryEntry>,
  classifier?: (text: string) => Promise<MemoryEntry['category'] | null>
): Promise<MemoryEntry | null> {
  await _loadAll();
  
  let category = hints?.category || autoCategorize(content, source);
  
  // STEP 3 — AI Fallback dacă e ambiguu și avem un classifier
  if (!category && classifier && source === 'user_explicit' && content.length > 10 && !content.includes('?')) {
    try {
      const aiCategory = await classifier(content);
      if (aiCategory) category = aiCategory;
    } catch (e) {
      console.warn('[MemoryManager] AI Classification failed:', e);
    }
  }

  if (!category) return null;

  const entry: MemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category,
    content,
    tags: hints?.tags || [],
    createdAt: Date.now(),
    lastAccess: Date.now(),
    accessCount: 1,
    importance: hints?.importance || (category === 'reguli' ? 10 : category === 'importanta' ? 8 : 5),
    source,
    relatedTo: hints?.relatedTo || [],
    expiresAt: hints?.expiresAt,
  };

  _memoryCache[category].push(entry);
  await _saveCategory(category);
  return entry;
}

export async function updateEntry(id: string, updates: Partial<MemoryEntry>): Promise<void> {
  await _loadAll();
  for (const cat of Object.keys(_memoryCache)) {
    const idx = _memoryCache[cat].findIndex(e => e.id === id);
    if (idx !== -1) {
      _memoryCache[cat][idx] = { 
        ..._memoryCache[cat][idx], 
        ...updates, 
        lastAccess: Date.now(),
        accessCount: _memoryCache[cat][idx].accessCount + 1 
      };
      await _saveCategory(cat as any);
      return;
    }
  }
}

export async function deleteEntry(id: string): Promise<void> {
  await _loadAll();
  for (const cat of Object.keys(_memoryCache)) {
    const idx = _memoryCache[cat].findIndex(e => e.id === id);
    if (idx !== -1) {
      const entry = _memoryCache[cat][idx];
      // Soft delete with archive
      await writeMemoryEntry(entry.content, entry.source, entry.category as any, 'archived_from_manager');
      _memoryCache[cat].splice(idx, 1);
      await _saveCategory(cat as any);
      return;
    }
  }
}

export async function recallContext(query: string, recentMessages: string[] = []): Promise<string> {
  await _loadAll();
  
  const ctxQuery = query + " " + recentMessages.join(" ");
  
  // TOATE din reguli (max 500)
  const reguli = _memoryCache.reguli.map(e => `- [REGULĂ] ${e.content}`);
  
  // TOP 5 sistem
  const sistem = _memoryCache.sistem
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map(e => `- [SISTEM] ${e.content}`);
    
  // TOP 10 importanta (semanticSimilarity)
  const importanta = _memoryCache.importanta
    .map(e => ({ e, score: semanticSimilarity(ctxQuery, e.content) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(x => `- [FAPT] ${x.e.content}`);
    
  // TOP 5 mai_putin
  const mai_putin = _memoryCache.mai_putin
    .map(e => ({ e, score: semanticSimilarity(ctxQuery, e.content) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(x => `- [DETALIU] ${x.e.content}`);
    
  // TOP 3 irelevanta
  const irelevanta = _memoryCache.irelevanta
    .map(e => ({ e, score: semanticSimilarity(ctxQuery, e.content) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => `- [OBSERVAȚIE] ${x.e.content}`);

  const lines = [
    ...reguli,
    ...sistem,
    ...importanta,
    ...mai_putin,
    ...irelevanta
  ];
  
  if (lines.length === 0) return "";
  
  return `### MEMORIE PERSISTENTĂ ȘI REGULI:\n${lines.join('\n')}`;
}

export async function migrateLifecycle(): Promise<void> {
  await _loadAll();
  const now = Date.now();
  const sixtyDays = 60 * 24 * 3600 * 1000;
  const ninetyDays = 90 * 24 * 3600 * 1000;
  const halfYear = 180 * 24 * 3600 * 1000;

  // Migration logic
  const toMoveToMaiPutin: MemoryEntry[] = [];
  const toMoveToIrelevanta: MemoryEntry[] = [];
  const toDelete: string[] = [];

  // 1. importanta nefolosit 60+ zile → mai_putin
  _memoryCache.importanta = _memoryCache.importanta.filter(e => {
    if (now - e.lastAccess > sixtyDays) {
      toMoveToMaiPutin.push({ ...e, category: 'mai_putin' });
      return false;
    }
    return true;
  });

  // 2. mai_putin nefolosit 90+ zile → irelevanta
  _memoryCache.mai_putin = _memoryCache.mai_putin.filter(e => {
    if (now - e.lastAccess > ninetyDays) {
      toMoveToIrelevanta.push({ ...e, category: 'irelevanta' });
      return false;
    }
    return true;
  });

  // 3. irelevanta nefolosit 180+ zile → DELETE (arhivă pe disk)
  _memoryCache.irelevanta = _memoryCache.irelevanta.filter(e => {
    if (now - e.lastAccess > halfYear) {
      toDelete.push(e.id);
      return false;
    }
    return true;
  });

  // Apply moves
  _memoryCache.mai_putin.push(...toMoveToMaiPutin);
  _memoryCache.irelevanta.push(...toMoveToIrelevanta);
  
  for (const id of toDelete) {
    await deleteEntry(id);
  }

  // Save changes
  await _saveCategory('importanta');
  await _saveCategory('mai_putin');
  await _saveCategory('irelevanta');
}

export async function promoteEntry(id: string): Promise<void> {
  await _loadAll();
  const SEVEN_DAYS = 7 * 24 * 3600 * 1000;
  const now = Date.now();

  for (const cat of ['irelevanta', 'mai_putin', 'importanta']) {
    const idx = _memoryCache[cat].findIndex(e => e.id === id);
    if (idx !== -1) {
      const entry = _memoryCache[cat][idx];
      // accesat 3+ ori în 7 zile → urcă o categorie
      // Simplificăm verificarea "în 7 zile" prin accesCount global și lastAccess recent
      if (entry.accessCount >= 3 && (now - entry.lastAccess < SEVEN_DAYS)) {
        const nextCat = cat === 'irelevanta' ? 'mai_putin' : cat === 'mai_putin' ? 'importanta' : 'importanta';
        if (nextCat !== cat) {
          _memoryCache[cat].splice(idx, 1);
          entry.category = nextCat as any;
          _memoryCache[nextCat].push(entry);
          await _saveCategory(cat as any);
          await _saveCategory(nextCat as any);
        }
      }
      return;
    }
  }
}

export async function checkContradiction(content: string, engine: any): Promise<string | null> {
  // engine is InferenceEngine
  return detectContradiction(engine, content);
}

export async function exportAll(): Promise<string> {
  await _loadAll();
  return JSON.stringify(_memoryCache);
}

export async function importAll(json: string): Promise<void> {
  try {
    const data = JSON.parse(json);
    _memoryCache = { ..._memoryCache, ...data };
    for (const cat of Object.keys(STORAGE_KEYS)) {
      await _saveCategory(cat as any);
    }
  } catch (e) {
    console.error('[MemoryManager] Import failed:', e);
  }
}

export async function getStats() {
  await _loadAll();
  return {
    reguli: _memoryCache.reguli.length,
    sistem: _memoryCache.sistem.length,
    importanta: _memoryCache.importanta.length,
    mai_putin: _memoryCache.mai_putin.length,
    irelevanta: _memoryCache.irelevanta.length,
  };
}

export async function getAllEntries(category: keyof typeof STORAGE_KEYS) {
  await _loadAll();
  return _memoryCache[category];
}

export async function summarizeAndSave(messages: Message[], sessionId: string): Promise<void> {
  if (messages.length === 0) return;
  
  const settings = await loadProviderSettings();
  const apiKey = settings.groqKey || settings.geminiKey || settings.openrouterKey;
  if (!apiKey) return;

  const prompt = `Rezumă această conversație în 3-5 propoziții. Extrage fapte importante despre user, decizii luate, probleme nerezolvate. Format: REZUMAT: <text>\n\nConversație:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  let summary: string | null = null;
  try {
    if (settings.groqKey) {
      summary = await callGroq(prompt, settings.groqKey);
    } else if (settings.geminiKey) {
      summary = await callGemini(prompt, settings.geminiKey);
    } else if (settings.openrouterKey) {
      summary = await callOpenRouter(prompt, settings.openrouterKey);
    }
  } catch (e) {
    console.error('[MemoryManager] Summarization failed:', e);
    return;
  }

  if (summary && summary.includes('REZUMAT:')) {
    const text = summary.split('REZUMAT:')[1].trim();
    await addEntry(text, 'conversation', {
      category: 'mai_putin',
      tags: ['session_summary', sessionId]
    });

    // Extracție fapte: regex "utilizatorul a spus că X"
    const facts = text.match(/(?:utilizatorul|user|user-ul|utilizator a spus că) (.*?)(?:\.|$)/gi) || [];
    for (const fact of facts) {
       await addEntry(fact.trim(), 'conversation', { category: 'importanta' });
    }
  }
}
