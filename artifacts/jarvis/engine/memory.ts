import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMORY_KEY = '@jarvis_memory_json';

export interface MemoryEntry {
  fact: string;
  source: string;
  addedAt: string;
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
    const trimmed: MemoryStore = {
      entries: mem.entries.slice(-150),
    };
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(trimmed));
  } catch {
    if (__DEV__) console.warn('[Jarvis Memory] saveMemory failed');
  }
}

const MAX_ENTRIES = 150;

export function addMemoryEntry(
  mem: MemoryStore,
  fact: string,
  source: string,
): MemoryStore {
  const isDuplicate = mem.entries.some(
    e => e.fact.toLowerCase() === fact.toLowerCase(),
  );
  if (isDuplicate) return mem;

  const newEntries = [
    ...mem.entries,
    { fact, source, addedAt: new Date().toISOString() },
  ].slice(-MAX_ENTRIES);

  return { entries: newEntries };
}

export function getRelevantMemories(
  mem: MemoryStore,
  _query: string,
  maxCount = 10,
): string[] {
  return mem.entries.slice(-maxCount).map(e => e.fact);
}
