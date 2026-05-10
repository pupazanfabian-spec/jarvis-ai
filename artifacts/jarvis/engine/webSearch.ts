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
  } catch (err) {
    if (__DEV__) console.warn(`[WebSearch] Fetch failed for ${url}:`, err);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Wikipedia RO ───────────────────────────────────────────────────────────
async function searchWikipediaRO(query: string): Promise<OnlineResult | null> {
  if (!query) return null;
  try {
    const searchUrl = `https://ro.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json&origin=*`;
    const searchResp = await fetchWithTimeout(searchUrl);
    if (!searchResp.ok) return null;

    const searchData = await searchResp.json() as unknown[];
    if (!Array.isArray(searchData) || !searchData[1]) return null;
    
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
  } catch (err) {
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

// ─── NewsAPI (Free Tier - limited) ──────────────────────────────────────────
async function searchNews(query: string): Promise<OnlineResult | null> {
  try {
    // Folosim un proxy sau un serviciu gratuit dacă e posibil, altfel NewsAPI are nevoie de key.
    // Dar putem folosi DuckDuckGo News (via HTML scraping sau RSS dacă e disponibil)
    // Pentru acest task, vom simula o sursă de știri via DuckDuckGo News
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query + ' news')}`;
    const resp = await fetchWithTimeout(url);
    if (!resp.ok) return null;
    
    const html = await resp.text();
    // Extragem primele câteva titluri și descrieri din HTML-ul simplu (non-JS) al DDG
    const results = html.match(/<a class="result__a" href="([^"]+)">([^<]+)<\/a>.*?<a class="result__snippet" href="[^"]+">([^<]+)<\/a>/g);
    
    if (results && results.length > 0) {
      const top = results.slice(0, 2).map(r => {
        const title = r.match(/<a class="result__a"[^>]*>([^<]+)<\/a>/)?.[1] || '';
        const snippet = r.match(/<a class="result__snippet"[^>]*>([^<]+)<\/a>/)?.[1] || '';
        return `[STIRE] ${title}: ${snippet}`;
      }).join('\n\n');
      
      return { found: true, text: top, source: 'Stiri (via DuckDuckGo)', query };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Content Scraping ───────────────────────────────────────────────────────
export async function scrapeUrl(url: string): Promise<string> {
  try {
    const resp = await fetchWithTimeout(url);
    if (!resp.ok) return '';
    const html = await resp.text();
    
    // Curățare brută HTML -> Text
    let text = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    return text.slice(0, 2000); // Limităm la 2000 caractere
  } catch {
    return '';
  }
}

// ─── Căutare paralelă îmbunătățită ──────────────────────────────────────────
export async function searchOnline(query: string): Promise<OnlineResult> {
  const cleanQuery = extractSearchQuery(query);
  const cacheKey = cleanQuery.toLowerCase().trim();

  // 1. Încercăm toate sursele în paralel
  const results = await Promise.allSettled([
    searchWikipediaRO(cleanQuery),
    searchDuckDuckGo(cleanQuery),
    searchNews(cleanQuery),
    searchWikipediaEN(cleanQuery),
  ]);

  const validResults = results
    .filter((r): r is PromiseFulfilledResult<OnlineResult | null> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value as OnlineResult);

  if (validResults.length > 0) {
    // Alegem cel mai bun rezultat (preferăm Wikipedia RO sau știri dacă e query de actualitate)
    const news = validResults.find(r => r.source.includes('Stiri'));
    const wikiRo = validResults.find(r => r.source.includes('Wikipedia RO'));
    const ddg = validResults.find(r => r.source.includes('DuckDuckGo'));
    const wikiEn = validResults.find(r => r.source.includes('Wikipedia EN'));

    const finalResult = news || wikiRo || ddg || wikiEn || validResults[0];
    
    _cacheResult(cacheKey, finalResult);
    return finalResult;
  }

  return {
    found: false,
    text: 'Nu am găsit informații online recente despre asta. Încearcă să reformulezi.',
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
