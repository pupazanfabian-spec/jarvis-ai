import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_DIR = `${FileSystem.documentDirectory}JarvisMemory/`;
const CONVERSATIONS_DIR = `${BASE_DIR}conversations/`;
const KNOWLEDGE_DIR = `${BASE_DIR}knowledge/`;
const CACHE_DIR = `${BASE_DIR}cache/`;

const INDEX_FILE = `${KNOWLEDGE_DIR}_index.json`;
const MIGRATED_KEY = '@jarvis_memory_migrated_v3';

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

export async function ensureDirs(): Promise<void> {
  const dirs = [BASE_DIR, CONVERSATIONS_DIR, KNOWLEDGE_DIR, CACHE_DIR];
  for (const dir of dirs) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  }
}

async function loadIndexFromDisk(): Promise<MemoryIndex> {
  try {
    const info = await FileSystem.getInfoAsync(INDEX_FILE);
    if (!info.exists) return { entries: [], lastUpdated: new Date().toISOString() };
    const raw = await FileSystem.readAsStringAsync(INDEX_FILE);
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
    await FileSystem.writeAsStringAsync(INDEX_FILE, JSON.stringify(index));
  } catch {
    if (__DEV__) console.warn('[MemoryFolder] Failed to save index');
  }
}

export async function initMemoryFolder(): Promise<number> {
  await ensureDirs();
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

  const filePath = `${KNOWLEDGE_DIR}${entry.id}.json`;
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(entry));

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
    const filePath = `${KNOWLEDGE_DIR}${id}.json`;
    await FileSystem.deleteAsync(filePath, { idempotent: true });
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
    const files = await FileSystem.readDirectoryAsync(KNOWLEDGE_DIR);
    for (const file of files) {
      await FileSystem.deleteAsync(`${KNOWLEDGE_DIR}${file}`, { idempotent: true });
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

export function getMemoryStats(): { total: number; byCategory: Record<string, number>; storageUsed: number } {
  if (!_cachedIndex) return { total: 0, byCategory: {}, storageUsed: 0 };
  const byCategory: Record<string, number> = {};
  for (const e of _cachedIndex.entries) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }
  return { total: _cachedIndex.entries.length, byCategory, storageUsed: 0 }; // TODO: calculate actual size
}

export async function saveConversation(id: string, messages: any[]): Promise<void> {
  await ensureDirs();
  const filePath = `${CONVERSATIONS_DIR}${id}.json`;
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify({
    id,
    timestamp: new Date().toISOString(),
    messages
  }));
}

export async function listConversations(): Promise<string[]> {
  await ensureDirs();
  try {
    return await FileSystem.readDirectoryAsync(CONVERSATIONS_DIR);
  } catch {
    return [];
  }
}

export async function deleteOldConversations(days = 30): Promise<number> {
  await ensureDirs();
  const files = await FileSystem.readDirectoryAsync(CONVERSATIONS_DIR);
  let deletedCount = 0;
  const now = Date.now();
  const cutoff = days * 24 * 3600 * 1000;

  for (const file of files) {
    try {
      const info = await FileSystem.getInfoAsync(`${CONVERSATIONS_DIR}${file}`);
      if (info.exists && (now - info.modificationTime * 1000) > cutoff) {
        await FileSystem.deleteAsync(`${CONVERSATIONS_DIR}${file}`);
        deletedCount++;
      }
    } catch {}
  }
  return deletedCount;
}

export async function getStorageSize(): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(BASE_DIR);
    if (!info.exists) return 0;
    // Note: getInfoAsync on directory doesn't always return size on all platforms
    // For a robust implementation, we would need to recurse, but this is a placeholder
    return 0; 
  } catch {
    return 0;
  }
}

export async function clearCache(): Promise<void> {
  try {
    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    for (const file of files) {
      await FileSystem.deleteAsync(`${CACHE_DIR}${file}`, { idempotent: true });
    }
  } catch {}
}

export async function migrateFromOldVersion(): Promise<number> {
  try {
    const migrated = await AsyncStorage.getItem(MIGRATED_KEY);
    if (migrated === 'true') return 0;

    const oldDir = `${FileSystem.documentDirectory}jarvis_memory/`;
    const oldInfo = await FileSystem.getInfoAsync(oldDir);
    if (!oldInfo.exists) {
      await AsyncStorage.setItem(MIGRATED_KEY, 'true');
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(oldDir);
    let count = 0;
    for (const file of files) {
      if (file === '_index.json' || !file.endsWith('.json')) continue;
      try {
        const raw = await FileSystem.readAsStringAsync(`${oldDir}${file}`);
        const entry = JSON.parse(raw);
        if (entry.fact) {
          await writeMemoryEntry(entry.fact, entry.source || 'migrated', entry.category || 'general');
          count++;
        }
      } catch {}
    }

    await AsyncStorage.setItem(MIGRATED_KEY, 'true');
    return count;
  } catch {
    return 0;
  }
}
