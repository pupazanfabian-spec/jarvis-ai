
// Jarvis Project Memory — stare proiect activ, multi-proiect, pași planificați/finalizați

import { getDB } from './database';

export interface ProjectFile {
  path: string;
  language: string;
  content: string;
  savedAt: number;
}

export interface ProjectStep {
  id: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export interface Project {
  id: string;
  name: string;
  stack: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  steps: ProjectStep[];
  files: ProjectFile[];
  isActive: boolean;
}

// ─── SQLite schema init ────────────────────────────────────────────────────────

export async function initProjectTables(): Promise<void> {
  try {
    const db = await getDB();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS dev_projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        stack TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at INTEGER DEFAULT (strftime('%s','now')*1000),
        updated_at INTEGER DEFAULT (strftime('%s','now')*1000),
        is_active INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS project_steps (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'planned',
        created_at INTEGER DEFAULT (strftime('%s','now')*1000),
        completed_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS project_files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES dev_projects(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        language TEXT DEFAULT 'typescript',
        content TEXT NOT NULL,
        saved_at INTEGER DEFAULT (strftime('%s','now')*1000)
      );
    `);
  } catch (e) {
    if (__DEV__) console.warn('[ProjectMemory] Init failed:', e);
  }
}

// ─── CRUD Proiecte ─────────────────────────────────────────────────────────────

export async function createProject(name: string, stack: string, description: string): Promise<Project> {
  const db = await getDB();
  const id = `proj_${Date.now()}`;
  const now = Date.now();

  // Dezactivează toate proiectele existente
  await db.runAsync('UPDATE dev_projects SET is_active = 0');

  await db.runAsync(
    'INSERT INTO dev_projects (id, name, stack, description, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [id, name, stack, description, now, now],
  );

  return { id, name, stack, description, createdAt: now, updatedAt: now, steps: [], files: [], isActive: true };
}

export async function getActiveProject(): Promise<Project | null> {
  try {
    const db = await getDB();
    const row = await db.getFirstAsync<{
      id: string; name: string; stack: string; description: string;
      created_at: number; updated_at: number;
    }>('SELECT * FROM dev_projects WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1');
    if (!row) return null;

    const steps = await db.getAllAsync<{
      id: string; description: string; status: string; created_at: number; completed_at: number | null;
    }>('SELECT * FROM project_steps WHERE project_id = ? ORDER BY created_at ASC', [row.id]);

    const files = await db.getAllAsync<{
      id: string; path: string; language: string; content: string; saved_at: number;
    }>('SELECT * FROM project_files WHERE project_id = ? ORDER BY saved_at DESC', [row.id]);

    return {
      id: row.id,
      name: row.name,
      stack: row.stack,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: true,
      steps: steps.map(s => ({
        id: s.id,
        description: s.description,
        status: s.status as ProjectStep['status'],
        createdAt: s.created_at,
        completedAt: s.completed_at ?? undefined,
      })),
      files: files.map(f => ({
        path: f.path,
        language: f.language,
        content: f.content,
        savedAt: f.saved_at,
      })),
    };
  } catch {
    return null;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const db = await getDB();
    const rows = await db.getAllAsync<{
      id: string; name: string; stack: string; description: string;
      created_at: number; updated_at: number; is_active: number;
    }>('SELECT * FROM dev_projects ORDER BY updated_at DESC');

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      stack: r.stack,
      description: r.description,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      isActive: r.is_active === 1,
      steps: [],
      files: [],
    }));
  } catch {
    return [];
  }
}

export async function setActiveProject(projectId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.runAsync('UPDATE dev_projects SET is_active = 0');
    await db.runAsync('UPDATE dev_projects SET is_active = 1, updated_at = ? WHERE id = ?', [Date.now(), projectId]);
  } catch {}
}

// ─── Pași proiect ──────────────────────────────────────────────────────────────

export async function addProjectStep(projectId: string, description: string): Promise<ProjectStep> {
  const db = await getDB();
  const id = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = Date.now();
  await db.runAsync(
    'INSERT INTO project_steps (id, project_id, description, status, created_at) VALUES (?, ?, ?, "planned", ?)',
    [id, projectId, description, now],
  );
  await db.runAsync('UPDATE dev_projects SET updated_at = ? WHERE id = ?', [now, projectId]);
  return { id, description, status: 'planned', createdAt: now };
}

export async function updateStepStatus(stepId: string, status: ProjectStep['status']): Promise<void> {
  try {
    const db = await getDB();
    const completedAt = status === 'completed' ? Date.now() : null;
    await db.runAsync(
      'UPDATE project_steps SET status = ?, completed_at = ? WHERE id = ?',
      [status, completedAt, stepId],
    );
  } catch {}
}

// ─── Fișiere proiect ──────────────────────────────────────────────────────────

export async function saveProjectFile(projectId: string, path: string, language: string, content: string): Promise<void> {
  try {
    const db = await getDB();
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    // Upsert: dacă path există deja în proiect, actualizează
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM project_files WHERE project_id = ? AND path = ?',
      [projectId, path],
    );

    if (existing) {
      await db.runAsync(
        'UPDATE project_files SET content = ?, language = ?, saved_at = ? WHERE id = ?',
        [content, language, now, existing.id],
      );
    } else {
      await db.runAsync(
        'INSERT INTO project_files (id, project_id, path, language, content, saved_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, projectId, path, language, content, now],
      );
    }

    await db.runAsync('UPDATE dev_projects SET updated_at = ? WHERE id = ?', [now, projectId]);
  } catch (e) {
    if (__DEV__) console.warn('[ProjectMemory] saveProjectFile failed:', e);
  }
}

// ─── Generare context pentru AI ───────────────────────────────────────────────

export function buildProjectContext(project: Project): string {
  const completedSteps = project.steps.filter(s => s.status === 'completed');
  const pendingSteps = project.steps.filter(s => s.status === 'planned');
  const recentFiles = project.files.slice(0, 3);

  const lines = [
    `Proiect: ${project.name} (${project.stack})`,
    `Descriere: ${project.description}`,
  ];

  if (completedSteps.length > 0) {
    lines.push(`Completat: ${completedSteps.map(s => s.description).join(', ')}`);
  }
  if (pendingSteps.length > 0) {
    lines.push(`În plan: ${pendingSteps.map(s => s.description).join(', ')}`);
  }
  if (recentFiles.length > 0) {
    lines.push(`Fișiere generate: ${recentFiles.map(f => f.path).join(', ')}`);
  }

  return lines.join('\n');
}

// ─── Format summary proiect activ ─────────────────────────────────────────────

export function formatProjectSummary(project: Project): string {
  const completed = project.steps.filter(s => s.status === 'completed').length;
  const total = project.steps.length;
  const progress = total > 0 ? `${completed}/${total} pași finalizați` : 'niciun pas definit';

  return `**Proiect activ: ${project.name}**
Stack: ${project.stack}
${project.description ? `Descriere: ${project.description}\n` : ''}Progress: ${progress}
Fișiere: ${project.files.length}`;
}
