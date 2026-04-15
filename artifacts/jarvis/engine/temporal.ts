
// Memorie temporală — Jarvis știe ce s-a discutat azi, ieri, săptămâna trecută
// Sesiunile sunt indexate cronologic și pot fi interogate temporal

export interface Session {
  id: string;
  startTime: number;
  endTime: number;
  messageCount: number;
  topics: string[];
  entities: string[];   // Persoane/locuri menționate
  summary: string;
}

export interface TemporalMemory {
  sessions: Session[];
  currentSessionId: string;
  currentSessionStart: number;
}

export function createTemporalMemory(): TemporalMemory {
  const id = `ses_${Date.now()}`;
  return {
    sessions: [],
    currentSessionId: id,
    currentSessionStart: Date.now(),
  };
}

// ─── Finalizează sesiunea curentă și creează alta nouă ───────────────────────

export function closeAndStartNewSession(
  tm: TemporalMemory,
  messageCount: number,
  topics: string[],
  entities: string[],
  summary: string,
): void {
  if (messageCount > 0) {
    tm.sessions.push({
      id: tm.currentSessionId,
      startTime: tm.currentSessionStart,
      endTime: Date.now(),
      messageCount,
      topics,
      entities,
      summary,
    });
    // Păstrează maxim 50 de sesiuni
    if (tm.sessions.length > 50) {
      tm.sessions = tm.sessions.slice(-50);
    }
  }
  tm.currentSessionId = `ses_${Date.now()}`;
  tm.currentSessionStart = Date.now();
}

// ─── Formatare timp relativ ───────────────────────────────────────────────────

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);

  if (m < 1) return 'acum câteva secunde';
  if (m < 60) return `acum ${m} minut${m === 1 ? '' : 'e'}`;
  if (h < 24) return `acum ${h} or${h === 1 ? 'ă' : 'e'}`;
  if (d === 1) return 'ieri';
  if (d < 7) return `acum ${d} zile`;
  if (d < 30) return `acum ${Math.floor(d / 7)} săptămân${Math.floor(d / 7) === 1 ? 'ă' : 'i'}`;
  return `acum ${Math.floor(d / 30)} lun${Math.floor(d / 30) === 1 ? 'ă' : 'i'}`;
}

// ─── Filtre temporale ─────────────────────────────────────────────────────────

function dayStart(offset = 0): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime() - offset * 86400000;
}

function matchesTemporal(query: string, session: Session): boolean {
  const n = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const today = dayStart();
  const yesterday = dayStart(1);

  if (/(azi|astazi|azi dimineata|sesiunea de azi)/.test(n)) {
    return session.startTime >= today;
  }
  if (/(ieri|sesiunea de ieri|ziua de ieri)/.test(n)) {
    return session.startTime >= yesterday && session.startTime < today;
  }
  if (/(saptamana trecuta|saptamana asta|in aceasta saptamana)/.test(n)) {
    return session.startTime >= dayStart(7);
  }
  if (/(luna trecuta|luna asta)/.test(n)) {
    return session.startTime >= dayStart(30);
  }
  if (/(recent|de curand|ultima oara|ultima sesiune)/.test(n)) {
    return true; // Va lua ultimele sesiuni
  }
  return false;
}

export function hasTemporalReference(query: string): boolean {
  const n = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /(azi|astazi|ieri|saptamana trecuta|luna trecuta|recent|ultima sesiune|de curand|ultima oara|sesiunea de)/.test(n);
}

// ─── Interogare temporală ─────────────────────────────────────────────────────

export function queryTemporalMemory(query: string, tm: TemporalMemory): string | null {
  if (!hasTemporalReference(query)) return null;
  if (tm.sessions.length === 0) {
    return 'Nu am sesiuni anterioare înregistrate. Aceasta este prima noastră conversație.';
  }

  const n = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isRecent = /(recent|ultima oara|ultima sesiune|de curand)/.test(n);

  let matched = isRecent
    ? tm.sessions.slice(-3)
    : tm.sessions.filter(s => matchesTemporal(query, s));

  if (matched.length === 0) {
    return 'Nu am sesiuni înregistrate în acea perioadă de timp.';
  }

  const total = matched.reduce((s, ses) => s + ses.messageCount, 0);
  const topics = [...new Set(matched.flatMap(s => s.topics))].slice(0, 5);
  const entities = [...new Set(matched.flatMap(s => s.entities))].slice(0, 5);
  const summaries = matched.filter(s => s.summary).map(s =>
    `• ${formatTimeAgo(s.startTime)}: ${s.summary}`
  );

  const lines = [
    `**Memorie temporală — ${matched.length} sesiune${matched.length > 1 ? 'i' : ''}:**`,
    `📊 ${total} mesaje totale`,
  ];
  if (topics.length > 0) lines.push(`📌 Topicuri: ${topics.join(', ')}`);
  if (entities.length > 0) lines.push(`👤 Menționate: ${entities.join(', ')}`);
  if (summaries.length > 0) lines.push('', ...summaries);

  return lines.join('\n');
}

// ─── Generează sumar pentru sesiunea curentă ──────────────────────────────────

export function generateSessionSummary(
  messageCount: number,
  topics: string[],
  entities: string[],
): string {
  if (messageCount === 0) return '';
  const topicStr = topics.length > 0 ? topics.slice(0, 3).join(', ') : 'general';
  const entityStr = entities.length > 0 ? ` cu ${entities.slice(0, 2).join(', ')}` : '';
  return `${messageCount} mesaje despre ${topicStr}${entityStr}.`;
}
