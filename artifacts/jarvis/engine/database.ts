// Jarvis — Bază de date locală SQLite cu Fallback
// Gestionează: knowledge_entries, web_cache, dynamic_concepts, learned_facts, entities, brain_state
// expo-sqlite v16 (async API, Expo SDK 54)

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipul rezultat de la searchOnline — duplicat local pentru a evita import circular
export interface CachedWebResult {
  found: boolean;
  text: string;
  source: string;
  query: string;
}

let _db: SQLite.SQLiteDatabase | null = null;
let _dbHealthy = true;

// ─── Deschide / Inițializează DB ─────────────────────────────────────────────

export async function getDB(): Promise<SQLite.SQLiteDatabase | null> {
  if (_db) return _db;
  if (!_dbHealthy) return null;

  try {
    _db = await SQLite.openDatabaseAsync('jarvis_v3.db');
    await initSchema(_db);
    return _db;
  } catch (err) {
    console.error('[Database] Failed to open/init SQLite:', err);
    _dbHealthy = false;
    return null;
  }
}

export function isSQLiteAvailable(): boolean {
  return _dbHealthy;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS knowledge_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        label TEXT,
        source TEXT DEFAULT 'user',
        domain TEXT DEFAULT 'general',
        importance REAL DEFAULT 0.5,
        access_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        last_accessed INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ke_domain ON knowledge_entries(domain);
      CREATE INDEX IF NOT EXISTS idx_ke_importance ON knowledge_entries(importance);
      CREATE INDEX IF NOT EXISTS idx_ke_last_accessed ON knowledge_entries(last_accessed);

      CREATE TABLE IF NOT EXISTS web_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_hash TEXT NOT NULL UNIQUE,
        query_text TEXT NOT NULL,
        result_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        ttl_hours INTEGER DEFAULT 24
      );

      CREATE INDEX IF NOT EXISTS idx_wc_hash ON web_cache(query_hash);

      CREATE TABLE IF NOT EXISTS dynamic_concepts (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        domain TEXT DEFAULT 'general',
        description TEXT NOT NULL,
        related_json TEXT DEFAULT '[]',
        facts_json TEXT DEFAULT '[]',
        jarvis_opinion TEXT,
        created_at INTEGER NOT NULL,
        source TEXT DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS learned_facts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        confidence REAL DEFAULT 0.7,
        source TEXT DEFAULT 'user',
        category TEXT DEFAULT 'general',
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS entities (
        name TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data_json TEXT NOT NULL,
        last_updated INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ent_type ON entities(type);
      CREATE INDEX IF NOT EXISTS idx_ent_updated ON entities(last_updated);

      CREATE TABLE IF NOT EXISTS brain_state (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
  } catch (err) {
    console.error('[Database] Schema init error:', err);
    throw err;
  }
}

// ─── Knowledge Entries ────────────────────────────────────────────────────────

export interface KnowledgeEntry {
  id?: number;
  content: string;
  label?: string;
  source?: string;
  domain?: string;
  importance?: number;
  access_count?: number;
  created_at?: number;
  last_accessed?: number;
}

export async function insertKnowledgeEntry(entry: KnowledgeEntry): Promise<number> {
  try {
    const db = await getDB();
    if (!db) return -1;
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT OR IGNORE INTO knowledge_entries
        (content, label, source, domain, importance, access_count, created_at, last_accessed)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        entry.content,
        entry.label ?? null,
        entry.source ?? 'user',
        entry.domain ?? 'general',
        entry.importance ?? 0.5,
        now,
        now,
      ]
    );
    return result.lastInsertRowId;
  } catch (err) {
    console.error('[Database] insertKnowledgeEntry error:', err);
    return -1;
  }
}

export async function searchKnowledgeEntries(
  query: string,
  limit = 5,
): Promise<KnowledgeEntry[]> {
  try {
    const db = await getDB();
    if (!db) return [];
    const q = `%${query.toLowerCase()}%`;
    const rows = await db.getAllAsync<KnowledgeEntry>(
      `SELECT * FROM knowledge_entries
       WHERE lower(content) LIKE ? OR lower(label) LIKE ?
       ORDER BY importance DESC, access_count DESC
       LIMIT ?`,
      [q, q, limit]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function queryKnowledgeForAnswer(
  query: string,
  minImportance = 0.4,
): Promise<{ content: string; label: string | null; source: string | null; id: number } | null> {
  try {
    const db = await getDB();
    if (!db) return null;

    const words = query.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    if (words.length === 0) return null;

    const conditions = words.map(() => '(lower(content) LIKE ? OR lower(label) LIKE ?)').join(' OR ');
    const likeParams: (string | number)[] = [];
    for (const w of words) {
      likeParams.push(`%${w}%`, `%${w}%`);
    }
    likeParams.push(minImportance, 1);

    const row = await db.getFirstAsync<{
      id: number;
      content: string;
      label: string | null;
      source: string | null;
      importance: number;
    }>(
      `SELECT id, content, label, source, importance
       FROM knowledge_entries
       WHERE (${conditions}) AND importance >= ?
       ORDER BY importance DESC, access_count DESC
       LIMIT ?`,
      likeParams
    );

    if (!row) return null;

    bumpKnowledgeAccess(row.id).catch(() => {});

    return { content: row.content, label: row.label, source: row.source, id: row.id };
  } catch {
    return null;
  }
}

export async function bumpKnowledgeAccess(id: number): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    const now = Date.now();
    await db.runAsync(
      `UPDATE knowledge_entries SET
         access_count = access_count + 1,
         last_accessed = ?,
         importance = MIN(1.0, importance + 0.05)
       WHERE id = ?`,
      [now, id]
    );
  } catch {}
}

export async function getAllKnowledgeEntries(domain?: string): Promise<KnowledgeEntry[]> {
  try {
    const db = await getDB();
    if (!db) return [];
    if (domain) {
      return db.getAllAsync<KnowledgeEntry>(
        'SELECT * FROM knowledge_entries WHERE domain = ? ORDER BY importance DESC',
        [domain]
      );
    }
    return db.getAllAsync<KnowledgeEntry>(
      'SELECT * FROM knowledge_entries ORDER BY importance DESC'
    );
  } catch {
    return [];
  }
}

function hashQuery(query: string): string {
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const chr = query.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function getCachedWebResult(query: string): Promise<CachedWebResult | null> {
  try {
    const db = await getDB();
    if (!db) return null;
    const qHash = hashQuery(query.toLowerCase().trim());
    const now = Date.now();
    const row = await db.getFirstAsync<{ result_json: string; created_at: number; ttl_hours: number }>(
      'SELECT result_json, created_at, ttl_hours FROM web_cache WHERE query_hash = ?',
      [qHash]
    );
    if (!row) return null;

    const expiresAt = row.created_at + row.ttl_hours * 3600 * 1000;
    if (now > expiresAt) {
      await db.runAsync('DELETE FROM web_cache WHERE query_hash = ?', [qHash]);
      return null;
    }

    const parsed = JSON.parse(row.result_json) as CachedWebResult;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedWebResult(
  query: string,
  result: CachedWebResult,
  ttlHours = 48,
): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    const qHash = hashQuery(query.toLowerCase().trim());
    const now = Date.now();
    await db.runAsync(
      `INSERT OR REPLACE INTO web_cache
         (query_hash, query_text, result_json, created_at, ttl_hours)
       VALUES (?, ?, ?, ?, ?)`,
      [qHash, query, JSON.stringify(result), now, ttlHours]
    );
  } catch {}
}

export interface DBDynamicConcept {
  id: string;
  label: string;
  domain: string;
  description: string;
  related_json: string;
  facts_json: string;
  jarvis_opinion?: string | null;
  created_at: number;
  source: string;
}

export async function saveDynamicConcept(concept: {
  id: string;
  label: string;
  domain: string;
  description: string;
  related: string[];
  facts: string[];
  jarvisOpinion?: string;
  source?: string;
}): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    const now = Date.now();
    await db.runAsync(
      `INSERT OR IGNORE INTO dynamic_concepts
         (id, label, domain, description, related_json, facts_json, jarvis_opinion, created_at, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        concept.id,
        concept.label,
        concept.domain,
        concept.description,
        JSON.stringify(concept.related),
        JSON.stringify(concept.facts),
        concept.jarvisOpinion ?? null,
        now,
        concept.source ?? 'user',
      ]
    );
  } catch {}
}

export async function loadAllDynamicConcepts(): Promise<DBDynamicConcept[]> {
  try {
    const db = await getDB();
    if (!db) return [];
    return db.getAllAsync<DBDynamicConcept>(
      'SELECT * FROM dynamic_concepts ORDER BY created_at DESC'
    );
  } catch {
    return [];
  }
}

export async function insertLearnedFact(
  content: string,
  confidence = 0.7,
  source = 'user',
  category = 'general',
): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO learned_facts (content, confidence, source, category, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [content, confidence, source, category, now]
    );
  } catch {}
}

export async function getRecentLearnedFacts(limit = 50): Promise<{ content: string; confidence: number; source: string; category: string }[]> {
  try {
    const db = await getDB();
    if (!db) return [];
    return db.getAllAsync(
      'SELECT content, confidence, source, category FROM learned_facts ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  } catch {
    return [];
  }
}

export interface EntityData {
  value: string;
  firstSeen: number;
  occurrences: number;
  context: string;
  relation?: string;
}

export async function upsertEntity(
  name: string,
  type: string,
  data: EntityData | Record<string, string | number | undefined>,
): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    const now = Date.now();
    await db.runAsync(
      `INSERT OR REPLACE INTO entities (name, type, data_json, last_updated)
       VALUES (?, ?, ?, ?)`,
      [name, type, JSON.stringify(data), now]
    );
  } catch {}
}

export async function loadAllEntities(): Promise<Array<{
  name: string;
  type: string;
  data: EntityData;
  last_updated: number;
}>> {
  try {
    const db = await getDB();
    if (!db) return [];
    const rows = await db.getAllAsync<{ name: string; type: string; data_json: string; last_updated: number }>(
      'SELECT name, type, data_json, last_updated FROM entities ORDER BY last_updated DESC'
    );
    return rows.map(r => {
      let data: EntityData = { value: r.name, firstSeen: 0, occurrences: 1, context: '' };
      try {
        const parsed = JSON.parse(r.data_json) as Record<string, unknown>;
        data = {
          value: typeof parsed.value === 'string' ? parsed.value : r.name,
          firstSeen: typeof parsed.firstSeen === 'number' ? parsed.firstSeen : 0,
          occurrences: typeof parsed.occurrences === 'number' ? parsed.occurrences : 1,
          context: typeof parsed.context === 'string' ? parsed.context : '',
          relation: typeof parsed.relation === 'string' ? parsed.relation : undefined,
        };
      } catch {}
      return { name: r.name, type: r.type, data, last_updated: r.last_updated };
    });
  } catch {
    return [];
  }
}

export async function saveBrainStateComponent(
  key: string,
  value: unknown,
): Promise<void> {
  const jsonValue = JSON.stringify(value);
  try {
    const db = await getDB();
    if (db) {
      const now = Date.now();
      await db.runAsync(
        `INSERT OR REPLACE INTO brain_state (key, value_json, updated_at)
         VALUES (?, ?, ?)`,
        [key, jsonValue, now]
      );
    }
  } catch {
    _dbHealthy = false;
  }
  try {
    await AsyncStorage.setItem(`@jarvis_fallback_${key}`, jsonValue);
  } catch {}
}

export async function loadBrainStateComponent<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    if (db) {
      const row = await db.getFirstAsync<{ value_json: string }>(
        'SELECT value_json FROM brain_state WHERE key = ?',
        [key]
      );
      if (row) return JSON.parse(row.value_json) as T;
    }
  } catch {}

  try {
    const fallback = await AsyncStorage.getItem(`@jarvis_fallback_${key}`);
    if (fallback) return JSON.parse(fallback) as T;
  } catch {}
  return null;
}

export async function saveBrainStateFull(stateJson: string): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      const now = Date.now();
      await db.runAsync(
        `INSERT OR REPLACE INTO brain_state (key, value_json, updated_at)
         VALUES ('full_state', ?, ?)`,
        [stateJson, now]
      );
    }
  } catch {
    _dbHealthy = false;
  }
  try {
    await AsyncStorage.setItem('@jarvis_fallback_full_state', stateJson);
  } catch {}
}

export async function loadBrainStateFull(): Promise<string | null> {
  try {
    const db = await getDB();
    if (db) {
      const row = await db.getFirstAsync<{ value_json: string }>(
        "SELECT value_json FROM brain_state WHERE key = 'full_state'"
      );
      if (row) return row.value_json;
    }
  } catch {}

  return AsyncStorage.getItem('@jarvis_fallback_full_state');
}

export async function saveMessagesFull(messagesJson: string): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      const now = Date.now();
      await db.runAsync(
        `INSERT OR REPLACE INTO brain_state (key, value_json, updated_at)
         VALUES ('messages', ?, ?)`,
        [messagesJson, now]
      );
    }
  } catch {
    _dbHealthy = false;
  }
  try {
    await AsyncStorage.setItem('@jarvis_fallback_messages', messagesJson);
  } catch {}
}

export async function loadMessagesFull(): Promise<string | null> {
  try {
    const db = await getDB();
    if (db) {
      const row = await db.getFirstAsync<{ value_json: string }>(
        "SELECT value_json FROM brain_state WHERE key = 'messages'"
      );
      if (row) return row.value_json;
    }
  } catch {}
  return AsyncStorage.getItem('@jarvis_fallback_messages');
}

export async function markMigrationDone(): Promise<void> {
  try {
    const db = await getDB();
    if (db) {
      await db.runAsync(
        `INSERT OR REPLACE INTO brain_state (key, value_json, updated_at)
         VALUES ('migration_done', 'true', ?)`,
        [Date.now()]
      );
    }
  } catch {}
}

export async function isMigrationDone(): Promise<boolean> {
  try {
    const db = await getDB();
    if (db) {
      const row = await db.getFirstAsync<{ value_json: string }>(
        "SELECT value_json FROM brain_state WHERE key = 'migration_done'"
      );
      return row?.value_json === 'true';
    }
  } catch {}
  return false;
}

// ─── Data Management & Analysis ──────────────────────────────────────────────

export async function analyzeDatabaseHealth(): Promise<{
  duplicates: number;
  staleEntries: number;
  totalSize: number;
}> {
  try {
    const db = await getDB();
    if (!db) return { duplicates: 0, staleEntries: 0, totalSize: 0 };

    const dupRow = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) - COUNT(DISTINCT content) as cnt FROM knowledge_entries'
    );

    const cutoff = Date.now() - 90 * 24 * 3600 * 1000;
    const staleRow = await db.getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM knowledge_entries WHERE last_accessed < ? AND importance < 0.3',
      [cutoff]
    );

    return {
      duplicates: dupRow?.cnt ?? 0,
      staleEntries: staleRow?.cnt ?? 0,
      totalSize: 0,
    };
  } catch {
    return { duplicates: 0, staleEntries: 0, totalSize: 0 };
  }
}

export async function compactKnowledgeBase(): Promise<number> {
  try {
    const db = await getDB();
    if (!db) return 0;

    await db.runAsync(`
      DELETE FROM knowledge_entries
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM knowledge_entries
        GROUP BY content
      )
    `);

    const now = Date.now();
    await db.runAsync('DELETE FROM web_cache WHERE (created_at + ttl_hours * 3600000) < ?', [now]);
    await db.execAsync('VACUUM');

    return 1;
  } catch {
    return 0;
  }
}

export async function clearCacheDB(): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    await db.runAsync('DELETE FROM web_cache');
    await db.execAsync('VACUUM');
  } catch {}
}

export async function autoPruneKnowledge(): Promise<number> {
  try {
    const db = await getDB();
    if (!db) return 0;
    const cutoff = Date.now() - 60 * 24 * 3600 * 1000;
    const result = await db.runAsync(
      `DELETE FROM knowledge_entries
       WHERE importance < 0.2
         AND last_accessed < ?
         AND access_count < 3`,
      [cutoff]
    );

    const now = Date.now();
    await db.runAsync(
      `DELETE FROM web_cache
       WHERE (created_at + ttl_hours * 3600000) < ?`,
      [now]
    );

    return result.changes;
  } catch {
    return 0;
  }
}

export async function deleteKnowledgeEntry(id: number): Promise<void> {
  try {
    const db = await getDB();
    if (!db) return;
    await db.runAsync('DELETE FROM knowledge_entries WHERE id = ?', [id]);
  } catch {}
}

export async function getDBStats(): Promise<{
  knowledgeCount: number;
  cacheCount: number;
  conceptsCount: number;
  factsCount: number;
  entitiesCount: number;
}> {
  try {
    const db = await getDB();
    if (!db) return { knowledgeCount: 0, cacheCount: 0, conceptsCount: 0, factsCount: 0, entitiesCount: 0 };
    const [k, c, dc, lf, ent] = await Promise.all([
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM knowledge_entries'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM web_cache'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM dynamic_concepts'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM learned_facts'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM entities'),
    ]);
    return {
      knowledgeCount: k?.cnt ?? 0,
      cacheCount: c?.cnt ?? 0,
      conceptsCount: dc?.cnt ?? 0,
      factsCount: lf?.cnt ?? 0,
      entitiesCount: ent?.cnt ?? 0,
    };
  } catch {
    return { knowledgeCount: 0, cacheCount: 0, conceptsCount: 0, factsCount: 0, entitiesCount: 0 };
  }
}
