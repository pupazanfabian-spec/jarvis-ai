
// Urmăritor de entități: persoane, locuri, evenimente, numere
// Jarvis acum știe cine este "Andrei" când apare mai târziu în conversație

export type EntityType = 'person' | 'place' | 'number' | 'concept' | 'event';

export interface Entity {
  id: string;
  type: EntityType;
  value: string;          // Valoarea originală ("Andrei")
  normalized: string;     // Normalizată ("andrei")
  firstSeen: number;      // Indexul mesajului
  occurrences: number;    // De câte ori a fost menționat
  context: string;        // Prima propoziție în care a apărut
  relation?: string;      // "prietenul meu", "seful meu" etc.
}

export interface EntityTracker {
  entities: Entity[];
}

export function createEntityTracker(): EntityTracker {
  return { entities: [] };
}

// ─── Patterns de extracție ────────────────────────────────────────────────────

const RELATION_PERSON = [
  { rx: /(?:prietenul meu|prietena mea)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'prieten' },
  { rx: /(?:colegul meu|colega mea)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'coleg' },
  { rx: /(?:seful meu|managerul meu|directorul meu)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'sef' },
  { rx: /(?:profesorul meu|profa mea|invatatorul)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'profesor' },
  { rx: /(?:mama|tata|fratele|sora|bunica|bunicul)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'familie' },
  { rx: /(?:iubita mea|iubitul meu|sotia|sotul|partenerul)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'partener' },
  { rx: /(?:ma numesc|eu sunt|cheama-ma|imi zice|numele meu e)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'eu' },
  { rx: /(?:am un prieten|am o prietena|cunosc un|cunosc o)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{1,20})/, rel: 'cunostiinta' },
  { rx: /(?:despre|cu|la|pentru|despre)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{2,20})\b(?!\s*(?:este|are|face|zice))/, rel: '' },
];

const PLACE_PATTERNS = [
  /(?:in|la|din|spre|langa|aproape de)\s+((?:București|Cluj|Timișoara|Iași|Brașov|Constanța|Craiova|Galați|Oradea|Sibiu|[A-ZĂÂÎȘȚ][a-zăâîșț]{3,20}))/,
  /(?:tara|orasul|municipiul|judetul)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]{3,20})/,
];

const NUMBER_PATTERNS = [
  /(\d+(?:[.,]\d+)?)\s*(ani|an|luni|luna|zile|zi|ore|ora|minute|minut)/,
  /(\d+(?:[.,]\d+)?)\s*(metri|km|litri|kilograme|kg|lei|euro|dolari)/,
  /(\d+(?:[.,]\d+)?)\s*(procente?|%)/,
];

function normTxt(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── Extrage entități dintr-un mesaj ─────────────────────────────────────────

export function extractEntities(text: string, msgIndex: number): Entity[] {
  const entities: Entity[] = [];
  const n = normTxt(text);

  // Persoane
  for (const { rx, rel } of RELATION_PERSON) {
    const m = text.match(rx);
    if (m && m[1]) {
      entities.push({
        id: `person_${normTxt(m[1])}_${msgIndex}`,
        type: 'person',
        value: m[1],
        normalized: normTxt(m[1]),
        firstSeen: msgIndex,
        occurrences: 1,
        context: text.slice(0, 120),
        relation: rel || undefined,
      });
    }
  }

  // Locuri
  for (const rx of PLACE_PATTERNS) {
    const m = text.match(rx);
    if (m && m[1]) {
      entities.push({
        id: `place_${normTxt(m[1])}_${msgIndex}`,
        type: 'place',
        value: m[1],
        normalized: normTxt(m[1]),
        firstSeen: msgIndex,
        occurrences: 1,
        context: text.slice(0, 120),
      });
    }
  }

  // Numere cu context
  for (const rx of NUMBER_PATTERNS) {
    const m = n.match(rx);
    if (m) {
      entities.push({
        id: `number_${m[1]}_${m[2]}_${msgIndex}`,
        type: 'number',
        value: `${m[1]} ${m[2]}`,
        normalized: m[1],
        firstSeen: msgIndex,
        occurrences: 1,
        context: text.slice(0, 120),
      });
    }
  }

  return entities;
}

// ─── Actualizează tracker-ul cu mesajul nou ───────────────────────────────────

export function updateEntityTracker(
  tracker: EntityTracker,
  text: string,
  msgIndex: number,
): void {
  const newEntities = extractEntities(text, msgIndex);
  for (const ne of newEntities) {
    const existing = tracker.entities.find(
      e => e.type === ne.type && e.normalized === ne.normalized
    );
    if (existing) {
      existing.occurrences++;
    } else {
      tracker.entities.push(ne);
    }
  }
  // Păstrează maxim 100 entități
  if (tracker.entities.length > 100) {
    tracker.entities = tracker.entities.slice(-100);
  }
}

// ─── Rezolvă referință pronominală sau directă ────────────────────────────────

export function resolveReference(text: string, tracker: EntityTracker): Entity | null {
  const n = normTxt(text);
  const words = n.split(/\s+/);

  for (const word of words) {
    if (word.length < 3) continue;
    const entity = tracker.entities.find(e =>
      e.normalized === word ||
      e.normalized.startsWith(word) ||
      word.startsWith(e.normalized)
    );
    if (entity) return entity;
  }
  return null;
}

// ─── Răspuns la "cine este X" sau "ce știi despre X" ─────────────────────────

export function queryEntity(name: string, tracker: EntityTracker): string | null {
  const n = normTxt(name);
  const entity = tracker.entities.find(e =>
    e.normalized === n || e.normalized.includes(n) || n.includes(e.normalized)
  );
  if (!entity) return null;

  const relText = entity.relation ? ` (${entity.relation})` : '';
  return `**${entity.value}**${relText} a fost menționat de ${entity.occurrences}x în conversație.\n\nContext: *"${entity.context}"*`;
}

// ─── Rezumat entități ─────────────────────────────────────────────────────────

export function getEntitySummary(tracker: EntityTracker): string {
  if (tracker.entities.length === 0) return '';

  const people = tracker.entities.filter(e => e.type === 'person');
  const places = tracker.entities.filter(e => e.type === 'place');
  const numbers = tracker.entities.filter(e => e.type === 'number');

  const lines: string[] = [];
  if (people.length > 0) {
    lines.push(`👤 **Persoane menționate:** ${people.map(e =>
      `${e.value}${e.relation ? ` (${e.relation})` : ''} ×${e.occurrences}`
    ).join(', ')}`);
  }
  if (places.length > 0) {
    lines.push(`📍 **Locuri:** ${places.map(e => e.value).join(', ')}`);
  }
  if (numbers.length > 0) {
    lines.push(`🔢 **Valori numerice:** ${numbers.map(e => e.value).join(', ')}`);
  }
  return lines.join('\n');
}
