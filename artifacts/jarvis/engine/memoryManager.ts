import AsyncStorage from '@react-native-async-storage/async-storage';
import { semanticSimilarity } from './semantic';
import { detectContradiction } from './inference';
import { writeMemoryEntry } from './memoryFolder';

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

export function autoCategorize(content: string, source: MemoryEntry['source']): MemoryEntry['category'] {
  const c = content.toLowerCase();
  
  if (source === 'user_explicit' && (c.includes('regulă') || c.includes('regula') || c.includes('vreau să') || c.includes('vreau sa') || c.includes('obligatoriu') || c.includes('niciodată') || c.includes('niciodata'))) {
    return 'reguli';
  }
  
  if (source === 'jarvis_inferred' && (c.includes('eu sunt') || c.includes('eu pot') || c.includes('pot să') || c.includes('pot sa') || c.includes('capabilitățile mele'))) {
    return 'sistem';
  }
  
  if (c.includes('îmi place') || c.includes('imi place') || c.includes('prefer') || c.includes('locuiesc') || c.includes('numele meu') || c.includes('sunt un')) {
    return 'importanta';
  }
  
  if (source === 'conversation' || source === 'jarvis_inferred') {
    return 'mai_putin';
  }
  
  return 'irelevanta';
}

export async function addEntry(content: string, source: MemoryEntry['source'], hints?: Partial<MemoryEntry>): Promise<MemoryEntry> {
  await _loadAll();
  
  const category = hints?.category || autoCategorize(content, source);
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
