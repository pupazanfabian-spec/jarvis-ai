import { semanticSimilarity } from './semantic';

// Jarvis — Motor de căutare online v2.0 (paralel)
// Surse: Wikipedia RO, Wikipedia EN, DuckDuckGo Instant Answers — toate în paralel
// Fără API key — surse publice gratuite + cache SQLite 48h

export interface OnlineResult {
  found: boolean;
  text: string;
  source: string;
  query: string;
}

const TIMEOUT_MS = 8000;

// ─── Timeout fetch helper ───────────────────────────────────────────────────
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json', 'User-Agent': 'Jarvis-AI/2.0' },
    });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Wikipedia RO ───────────────────────────────────────────────────────────
async function searchWikipediaRO(query: string): Promise<OnlineResult | null> {
  try {
    const searchUrl = `https://ro.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json&origin=*`;
    const searchResp = await fetchWithTimeout(searchUrl);
    if (!searchResp.ok) return null;

    const searchData = await searchResp.json() as unknown[];
    const titles: string[] = Array.isArray(searchData[1]) ? searchData[1] as string[] : [];
    if (titles.length === 0) return null;

    const title = encodeURIComponent(titles[0]);
    const summaryUrl = `https://ro.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const summaryResp = await fetchWithTimeout(summaryUrl);
    if (!summaryResp.ok) return null;

    const summary = await summaryResp.json() as { extract?: string };
    const extract: string = summary.extract ?? '';
    if (!extract || extract.length < 30) return null;

    const text = extract.length > 500 ? extract.slice(0, 497) + '...' : extract;
    return { found: true, text, source: `Wikipedia RO — "${titles[0]}"`, query };
  } catch {
    return null;
  }
}

// ─── Wikipedia EN ──────────────────────────────────────────────────────────
async function searchWikipediaEN(query: string): Promise<OnlineResult | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json&origin=*`;
    const searchResp = await fetchWithTimeout(searchUrl);
    if (!searchResp.ok) return null;

    const searchData = await searchResp.json() as unknown[];
    const titles: string[] = Array.isArray(searchData[1]) ? searchData[1] as string[] : [];
    if (titles.length === 0) return null;

    const title = encodeURIComponent(titles[0]);
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const summaryResp = await fetchWithTimeout(summaryUrl);
    if (!summaryResp.ok) return null;

    const summary = await summaryResp.json() as { extract?: string };
    const extract: string = summary.extract ?? '';
    if (!extract || extract.length < 30) return null;

    const text = extract.length > 500 ? extract.slice(0, 497) + '...' : extract;
    return {
      found: true,
      text: `[Sursă în engleză]\n\n${text}`,
      source: `Wikipedia EN — "${titles[0]}"`,
      query,
    };
  } catch {
    return null;
  }
}

// ─── DuckDuckGo Instant Answers ─────────────────────────────────────────────
async function searchDuckDuckGo(query: string): Promise<OnlineResult | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    const resp = await fetchWithTimeout(url);
    if (!resp.ok) return null;

    const data = await resp.json() as {
      AbstractText?: string;
      AbstractSource?: string;
      Answer?: string;
      RelatedTopics?: Array<{ Text?: string }>;
    };

    if (data.AbstractText && data.AbstractText.length > 30) {
      const text = data.AbstractText.length > 400
        ? data.AbstractText.slice(0, 397) + '...'
        : data.AbstractText;
      return {
        found: true,
        text,
        source: `DuckDuckGo${data.AbstractSource ? ' — ' + data.AbstractSource : ''}`,
        query,
      };
    }

    if (data.Answer && data.Answer.length > 5) {
      return { found: true, text: data.Answer, source: 'DuckDuckGo — Răspuns instant', query };
    }

    const related = data.RelatedTopics ?? [];
    const first = related.find(r => r.Text && r.Text.length > 30);
    if (first?.Text) {
      return {
        found: true,
        text: first.Text.slice(0, 400),
        source: 'DuckDuckGo — Sugestii corelate',
        query,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Detectare intenție de căutare online ───────────────────────────────────
const ONLINE_TRIGGERS = [
  'caută online', 'cauta online', 'cauta pe internet', 'caută pe internet',
  'cauta pe net', 'caută pe net', 'găsește online', 'gaseste online',
  'ce zice internetul', 'ce stie internetul', 'ce știe internetul',
  'cauta informatii', 'caută informații', 'cauta informatii',
  'cauta pe google', 'caută pe google', 'intreaba internetul',
  'întreabă internetul', 'cauta acum', 'caută acum',
];

export function isOnlineIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return ONLINE_TRIGGERS.some(t => lower.includes(t));
}

export function extractSearchQuery(text: string): string {
  let query = text;
  const lower = text.toLowerCase();

  for (const trigger of ONLINE_TRIGGERS) {
    if (lower.includes(trigger)) {
      const idx = lower.indexOf(trigger);
      query = text.slice(idx + trigger.length).trim();
      break;
    }
  }

  query = query.replace(/[?!.,;:]+$/, '').trim();
  return query.length > 2 ? query : text;
}

// ─── Căutare paralelă — cel mai rapid răspuns valid câștigă ─────────────────
// Wikipedia RO și DuckDuckGo pornesc simultan.
// Dacă Wikipedia RO nu are rezultate, încercăm Wikipedia EN ca fallback.
export async function searchOnline(query: string): Promise<OnlineResult> {
  const cleanQuery = extractSearchQuery(query);
  const cacheKey = cleanQuery.toLowerCase().trim();

  // Verifică cache-ul SQLite înainte de orice request HTTP
  try {
    const { getCachedWebResult } = await import('./database');
    const cached = await getCachedWebResult(cacheKey);
    if (cached && cached.found) {
      return { ...cached, query: cleanQuery };
    }
  } catch {}

  // 1. Încercăm Wikipedia RO și DuckDuckGo în paralel
  let result = await Promise.any([
    searchWikipediaRO(cleanQuery).then(r => { if (!r) throw new Error('empty'); return r; }),
    searchDuckDuckGo(cleanQuery).then(r => { if (!r) throw new Error('empty'); return r; }),
  ]).catch(() => null);

  // 2. Fallback la Wikipedia EN dacă nu am găsit nimic satisfăcător pe RO
  if (!result || (result.source.includes('Wikipedia RO') && result.text.length < 100)) {
    const enResult = await searchWikipediaEN(cleanQuery);
    if (enResult && enResult.found) {
      result = enResult;
    }
  }

  if (result) {
    _cacheResult(cacheKey, result);
    return result;
  }

  return {
    found: false,
    text: 'Nu am găsit informații online despre asta. Încearcă să reformulezi întrebarea sau verifică conexiunea la internet.',
    source: '',
    query: cleanQuery,
  };
}

// Cache async, non-blocking — acum 24h
function _cacheResult(cacheKey: string, result: OnlineResult): void {
  import('./database').then(({ setCachedWebResult }) => {
    setCachedWebResult(cacheKey, result, 24).catch(() => {});
  }).catch(() => {});
}

// ─── Extrage top 3 propoziții relevante din text web ─────────────────────────
// Scor îmbunătățit: semanticSimilarity + bonus pentru cuvinte cheie exacte
export function extractTopSentences(rawText: string, query: string, maxSentences = 3): string {
  const sentences = rawText
    .split(/[.!?](?:\s|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 500);

  if (sentences.length <= maxSentences) return rawText;

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const scored = sentences.map(s => {
    const simScore = semanticSimilarity(query, s);
    let keywordBonus = 0;
    const sLower = s.toLowerCase();
    queryWords.forEach(w => {
      if (sLower.includes(w)) keywordBonus += 0.15;
    });
    return {
      s,
      score: simScore + keywordBonus,
    };
  });

  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    // Restaurează ordinea originală din text
    .sort((a, b) => sentences.indexOf(a.s) - sentences.indexOf(b.s))
    .map(x => x.s);

  return topSentences.join('. ') + (topSentences.length > 0 ? '.' : '');
}

// ─── Căutare online cu sinteză semantică ─────────────────────────────────────
// Versiune extinsă a searchOnline care extrage top fraze relevante
export async function searchOnlineSynthesized(query: string): Promise<OnlineResult> {
  const result = await searchOnline(query);
  if (!result.found || !result.text) return result;

  // Aplică extragere semantică — returnează top 3 propoziții relevante
  const synthesized = extractTopSentences(result.text, query, 3);
  return { ...result, text: synthesized };
}
