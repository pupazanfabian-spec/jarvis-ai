
// Normalizare morfologică română + similaritate semantică
// Jarvis poate acum înțelege "fotosinteza", "fotosintezei", "fotosinteză" — toate la fel

// ─── Sufixe românești pentru stemming ────────────────────────────────────────

const SUFFIXES: [string, string][] = [
  // Genitiv/Dativ
  ['ului', ''], ['elor', ''], ['ilor', ''], ['iei', ''], ['iei', ''],
  // Plural substantive
  ['urile', ''], ['urile', ''], ['ilor', ''], ['elor', ''], ['ele', ''],
  ['ile', ''], ['uri', ''], ['ari', ''], ['eri', ''], ['iri', ''],
  // Forme verbale
  ['eaza', ''], ['eze', ''], ['esti', ''], ['este', ''], ['and', ''],
  ['ind', ''], ['esc', ''], ['ati', ''], ['iti', ''], ['ute', ''],
  ['at', ''], ['ut', ''], ['it', ''], ['ez', ''],
  // Adjective
  ['ata', ''], ['ite', ''], ['ate', ''], ['ute', ''], ['are', ''],
  ['oare', ''], ['tor', ''], ['toare', ''], ['nic', ''], ['ica', ''],
  // Diacritice→forme fara
  ['ă', 'a'], ['â', 'a'], ['î', 'i'], ['ș', 's'], ['ț', 't'],
  // Sufixe lungi speciale
  ['itate', ''], ['iune', ''], ['ment', ''], ['ism', ''], ['ist', ''],
  ['abil', ''], ['ibil', ''], ['ifica', ''],
];

export function norm(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,\.!?;:()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function romanianStem(word: string): string {
  const w = norm(word);
  if (w.length <= 4) return w;
  for (const [suffix] of SUFFIXES) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
      return w.slice(0, w.length - suffix.length);
    }
  }
  return w;
}

export function stemWords(text: string): string[] {
  return norm(text)
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(romanianStem);
}

// ─── Similaritate semantică (Jaccard pe stem-uri) ─────────────────────────────

export function semanticSimilarity(a: string, b: string): number {
  const sa = new Set(stemWords(a).filter(s => s.length > 3));
  const sb = new Set(stemWords(b).filter(s => s.length > 3));
  if (sa.size === 0 || sb.size === 0) return 0;
  let intersection = 0;
  for (const s of sa) { if (sb.has(s)) intersection++; }
  const union = sa.size + sb.size - intersection;
  return intersection / union;
}

// ─── Potrivire flexibilă: returnează true dacă măcar un stem se regăsește ─────

export function fuzzyContains(query: string, text: string): boolean {
  const qStems = stemWords(query).filter(s => s.length > 3);
  const tText = norm(text);
  const tStems = new Set(stemWords(tText));
  return qStems.some(qs => tStems.has(qs) || tText.includes(qs));
}

// ─── Extrage cuvinte cheie (fără stop words) ──────────────────────────────────

const STOP_WORDS = new Set([
  'este', 'care', 'unde', 'cine', 'cum', 'cand', 'pentru', 'despre',
  'intre', 'daca', 'sunt', 'esti', 'avem', 'poate', 'poti', 'vrei',
  'vreau', 'face', 'orice', 'nimic', 'ceva', 'mult', 'prea', 'doar',
  'chiar', 'prin', 'dupa', 'acum', 'atunci', 'inca', 'deja', 'pana',
  'spune', 'intreb', 'stiu', 'stii', 'imi', 'iti', 'mai', 'sau', 'dar',
  'asa', 'deci', 'totusi', 'chiar', 'foarte', 'prea', 'cam', 'mereu',
  'intotdeauna', 'uneori', 'niciodata', 'putin', 'mult', 'destul',
]);

export function extractKeywords(text: string, minLen = 4): string[] {
  return stemWords(text)
    .filter(w => w.length >= minLen && !STOP_WORDS.has(w));
}

// ─── Scor de relevanță text → query ───────────────────────────────────────────

export function relevanceScore(query: string, text: string): number {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return 0;
  const nText = norm(text);
  const tStems = new Set(stemWords(nText));
  let score = 0;
  for (const kw of keywords) {
    if (tStems.has(kw)) score += 2;
    else if (nText.includes(kw)) score += 1;
  }
  return score / keywords.length;
}
