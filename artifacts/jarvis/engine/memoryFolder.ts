import {
  documentDirectory,
  makeDirectoryAsync,
  writeAsStringAsync,
  readAsStringAsync,
  deleteAsync,
  getInfoAsync,
  readDirectoryAsync,
} from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_DIR = `${documentDirectory}jarvis_memory/`;
const INDEX_FILE = `${MEMORY_DIR}_index.json`;
const MIGRATED_KEY = '@jarvis_memory_migrated_v2';

export type MemoryCategory =
  | 'personal'
  | 'preferinta'
  | 'relatie'
  | 'fapt'
  | 'plan'
  | 'opinie'
  | 'tehnic'
  | 'idee'
  | 'locatie'
  | 'munca'
  | 'general';

export interface MemoryFileEntry {
  id: string;
  fact: string;
  source: string;
  category: MemoryCategory;
  createdAt: string;
  fromFile?: string;
}

interface MemoryIndexEntry {
  id: string;
  fact: string;
  category: MemoryCategory;
  createdAt: string;
  source?: string;
}

interface MemoryIndex {
  entries: MemoryIndexEntry[];
  lastUpdated: string;
}

let _cachedIndex: MemoryIndex | null = null;

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureMemoryDir(): Promise<void> {
  const info = await getInfoAsync(MEMORY_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(MEMORY_DIR, { intermediates: true });
  }
}

async function loadIndexFromDisk(): Promise<MemoryIndex> {
  try {
    const info = await getInfoAsync(INDEX_FILE);
    if (!info.exists) return { entries: [], lastUpdated: new Date().toISOString() };
    const raw = await readAsStringAsync(INDEX_FILE);
    const parsed = JSON.parse(raw) as MemoryIndex;
    if (!Array.isArray(parsed.entries)) return { entries: [], lastUpdated: new Date().toISOString() };
    return parsed;
  } catch {
    return { entries: [], lastUpdated: new Date().toISOString() };
  }
}

async function saveIndexToDisk(index: MemoryIndex): Promise<void> {
  try {
    index.lastUpdated = new Date().toISOString();
    await writeAsStringAsync(INDEX_FILE, JSON.stringify(index));
  } catch {
    if (__DEV__) console.warn('[MemoryFolder] Failed to save index');
  }
}

export async function initMemoryFolder(): Promise<number> {
  await ensureMemoryDir();
  _cachedIndex = await loadIndexFromDisk();
  return _cachedIndex.entries.length;
}

export function getMemoryCount(): number {
  return _cachedIndex?.entries.length ?? 0;
}

export async function writeMemoryEntry(
  fact: string,
  source: string,
  category: MemoryCategory,
  fromFile?: string,
): Promise<MemoryFileEntry | null> {
  if (!fact || fact.trim().length < 3) return null;
  const trimmed = fact.trim();

  if (!_cachedIndex) _cachedIndex = await loadIndexFromDisk();

  const isDuplicate = _cachedIndex.entries.some(
    e => e.fact.toLowerCase() === trimmed.toLowerCase(),
  );
  if (isDuplicate) return null;

  const partialMatch = _cachedIndex.entries.some(e => {
    const a = e.fact.toLowerCase();
    const b = trimmed.toLowerCase();
    return (a.length > 20 && b.includes(a)) || (b.length > 20 && a.includes(b));
  });
  if (partialMatch) return null;

  const entry: MemoryFileEntry = {
    id: generateId(),
    fact: trimmed,
    source,
    category,
    createdAt: new Date().toISOString(),
    ...(fromFile ? { fromFile } : {}),
  };

  const filePath = `${MEMORY_DIR}${entry.id}.json`;
  await writeAsStringAsync(filePath, JSON.stringify(entry));

  _cachedIndex.entries.push({
    id: entry.id,
    fact: entry.fact,
    category: entry.category,
    createdAt: entry.createdAt,
    source,
  });
  await saveIndexToDisk(_cachedIndex);

  return entry;
}

export async function deleteMemoryEntry(id: string): Promise<boolean> {
  try {
    const filePath = `${MEMORY_DIR}${id}.json`;
    await deleteAsync(filePath, { idempotent: true });
    if (_cachedIndex) {
      _cachedIndex.entries = _cachedIndex.entries.filter(e => e.id !== id);
      await saveIndexToDisk(_cachedIndex);
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteMemoryByKeyword(keyword: string): Promise<number> {
  if (!_cachedIndex || !keyword.trim()) return 0;
  const kw = keyword.toLowerCase().trim();
  const toDelete = _cachedIndex.entries.filter(e => e.fact.toLowerCase().includes(kw));
  let count = 0;
  for (const entry of toDelete) {
    const ok = await deleteMemoryEntry(entry.id);
    if (ok) count++;
  }
  return count;
}

export async function clearAllMemory(): Promise<number> {
  if (!_cachedIndex) return 0;
  const count = _cachedIndex.entries.length;
  try {
    const files = await readDirectoryAsync(MEMORY_DIR);
    for (const file of files) {
      await deleteAsync(`${MEMORY_DIR}${file}`, { idempotent: true });
    }
  } catch { /* ignore */ }
  _cachedIndex = { entries: [], lastUpdated: new Date().toISOString() };
  await saveIndexToDisk(_cachedIndex);
  return count;
}

const EXTERNAL_FOLDER_SOURCE = 'external-folder';

export function searchMemory(query: string, maxResults = 15, excludeExternalFolder = false): string[] {
  if (!_cachedIndex || !query.trim()) return [];

  let entries = _cachedIndex.entries;
  if (excludeExternalFolder) {
    entries = entries.filter(e => e.source !== EXTERNAL_FOLDER_SOURCE);
  }

  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return entries.slice(-maxResults).map(e => e.fact);

  const scored = entries.map(e => {
    const lower = e.fact.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (lower.includes(w)) score += 2;
    }
    if (lower.includes(query.toLowerCase())) score += 5;
    return { fact: e.fact, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.fact);
}

export function listAllMemories(limit = 50): Array<{ fact: string; category: MemoryCategory; createdAt: string }> {
  if (!_cachedIndex) return [];
  return _cachedIndex.entries.slice(-limit).reverse().map(e => ({
    fact: e.fact,
    category: e.category,
    createdAt: e.createdAt,
  }));
}

export function getMemoryStats(): { total: number; byCategory: Record<string, number> } {
  if (!_cachedIndex) return { total: 0, byCategory: {} };
  const byCategory: Record<string, number> = {};
  for (const e of _cachedIndex.entries) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }
  return { total: _cachedIndex.entries.length, byCategory };
}

export async function migrateFromAsyncStorage(): Promise<number> {
  try {
    const migrated = await AsyncStorage.getItem(MIGRATED_KEY);
    if (migrated === 'true') return 0;

    const raw = await AsyncStorage.getItem('@jarvis_memory_json');
    if (!raw) {
      await AsyncStorage.setItem(MIGRATED_KEY, 'true');
      return 0;
    }

    const parsed = JSON.parse(raw) as { entries?: Array<{ fact: string; source: string; addedAt: string }> };
    if (!Array.isArray(parsed.entries)) {
      await AsyncStorage.setItem(MIGRATED_KEY, 'true');
      return 0;
    }

    let count = 0;
    for (const old of parsed.entries) {
      if (old.fact && old.fact.length > 2) {
        const written = await writeMemoryEntry(old.fact, old.source || 'migrated', 'general');
        if (written) count++;
      }
    }

    await AsyncStorage.setItem(MIGRATED_KEY, 'true');
    return count;
  } catch {
    return 0;
  }
}

export async function readMemoryFile(id: string): Promise<MemoryFileEntry | null> {
  try {
    const filePath = `${MEMORY_DIR}${id}.json`;
    const raw = await readAsStringAsync(filePath);
    return JSON.parse(raw) as MemoryFileEntry;
  } catch {
    return null;
  }
}

export async function rebuildIndex(): Promise<number> {
  await ensureMemoryDir();
  const files = await readDirectoryAsync(MEMORY_DIR);
  const entries: MemoryIndex['entries'] = [];

  for (const file of files) {
    if (file === '_index.json' || !file.endsWith('.json')) continue;
    try {
      const raw = await readAsStringAsync(`${MEMORY_DIR}${file}`);
      const entry = JSON.parse(raw) as MemoryFileEntry;
      if (entry.id && entry.fact) {
        entries.push({
          id: entry.id,
          fact: entry.fact,
          category: entry.category || 'general',
          createdAt: entry.createdAt || new Date().toISOString(),
        });
      }
    } catch { /* skip corrupted files */ }
  }

  _cachedIndex = { entries, lastUpdated: new Date().toISOString() };
  await saveIndexToDisk(_cachedIndex);
  return entries.length;
}
