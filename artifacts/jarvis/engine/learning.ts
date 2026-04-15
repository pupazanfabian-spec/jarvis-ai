
// Sistem de auto-învățare — Jarvis se îmbunătățește după fiecare conversație
// v5: calitatea răspunsurilor indexată per intenție + corecții legate de răspunsul greșit

export interface CorrectionRecord {
  wrongResponse: string;   // Răspunsul greșit al lui Jarvis (primele 150 chars)
  correction: string;       // Ce a spus utilizatorul că e corect
  intent: string;           // Intenția care a generat răspunsul greșit
  at: number;
}

export interface SelfKnowledge {
  topicFrequency: Record<string, number>;
  learnedKeywords: Record<string, string>;
  preferredStyle: 'concis' | 'detaliat' | 'normal';
  corrections: CorrectionRecord[];
  sessionsCompleted: number;
  intelligenceVersion: number;
  learnedFacts: string[];
  lastUpdate: number;
  // v5 — nou
  responseQualityMap: Record<string, number>; // intent → scor mediu 0-1
  totalMessages: number;
}

export function createSelfKnowledge(): SelfKnowledge {
  return {
    topicFrequency: {},
    learnedKeywords: {},
    preferredStyle: 'normal',
    corrections: [],
    sessionsCompleted: 0,
    intelligenceVersion: 1,
    learnedFacts: [],
    lastUpdate: Date.now(),
    responseQualityMap: {},
    totalMessages: 0,
  };
}

// ─── Detectează subiectul ─────────────────────────────────────────────────────

const TOPIC_PATTERNS: [RegExp, string][] = [
  [/(fotosinteza|plante|biologie|celula|adn|evolutie|bacterii|ecosistem|organism)/, 'biologie'],
  [/(fizica|gravitatie|cuantic|relativitate|energie|forta|viteza|electromagnetism)/, 'fizica'],
  [/(matematica|calcul|ecuatie|geometrie|algebra|statistica|probabilitate)/, 'matematica'],
  [/(programare|cod|algoritm|calculator|software|hardware|internet|python|javascript)/, 'informatica'],
  [/(filosofie|constiinta|existenta|sens|adevar|realitate|gandire|etica|morala)/, 'filosofie'],
  [/(psihologie|emotie|comportament|memorie|invatare|personalitate|anxietate)/, 'psihologie'],
  [/(economie|bani|inflatie|pib|investitie|piata|finante|bursa)/, 'economie'],
  [/(istorie|razboi|revolutie|civilizatie|imperiul|regele|antichitate|napoleon)/, 'istorie'],
  [/(geografie|tara|oras|continent|ocean|munte|clima|romania|europa)/, 'geografie'],
  [/(chimie|element|molecula|reactie|acid|baza|atom|periodic|legatura)/, 'chimie'],
  [/(cosmos|univers|stele|planeta|gaura neagra|spatiu|nasa|astronom)/, 'cosmologie'],
  [/(arta|pictura|muzica|literatura|cinema|arhitectura|cultura|roman)/, 'cultura'],
  [/(sanatate|medicina|boala|tratament|vitamina|proteina|corp|nutritie)/, 'medicina'],
  [/(religie|dumnezeu|credinta|spiritualitate|rugaciune|suflet|karma)/, 'spiritualitate'],
  [/(tehnica|inginerie|constructie|mecanic|electric|electronic|robot)/, 'tehnica'],
];

export function detectTopic(text: string): string {
  const n = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [pattern, topic] of TOPIC_PATTERNS) {
    if (pattern.test(n)) return topic;
  }
  return 'general';
}

// ─── Detectează stilul preferat ───────────────────────────────────────────────

export function detectPreferredStyle(
  messages: { role: string; content: string }[]
): 'concis' | 'detaliat' | 'normal' {
  const userMsgs = messages.filter(m => m.role === 'user');
  if (userMsgs.length < 3) return 'normal';
  const avg = userMsgs.reduce((s, m) => s + m.content.length, 0) / userMsgs.length;
  if (avg < 25) return 'concis';
  if (avg > 80) return 'detaliat';
  return 'normal';
}

// ─── Evaluează calitatea răspunsului ─────────────────────────────────────────

function estimateResponseQuality(
  userMessage: string,
  aiResponse: string,
): number {
  // Penalizare: răspunsuri prea scurte la întrebări lungi
  if (userMessage.length > 50 && aiResponse.length < 30) return 0.3;
  // Penalizare: fallback generic
  if (/nu am date|nu stiu|nu pot|nu am informatii/i.test(aiResponse) && aiResponse.length < 100) return 0.4;
  // Bonus: răspuns cu structură (bold, bullet)
  if (/\*\*/.test(aiResponse) && aiResponse.length > 80) return 0.85;
  // Răspuns normal
  if (aiResponse.length > 50) return 0.75;
  return 0.6;
}

// ─── Detectează cerere de sfat bazată pe corecție ────────────────────────────

export function isCorrectionMessage(text: string): boolean {
  return /^(?:nu[,!]?\s+|gresit[,!]?\s+|incorect[,!]?\s+|nu e asa|asta nu e corect|ai gresit)/i.test(text);
}

// ─── Auto-actualizare după fiecare mesaj ──────────────────────────────────────

export function selfUpdate(
  userMessage: string,
  aiResponse: string,
  sk: SelfKnowledge,
  messageHistory: { role: string; content: string }[],
  lastIntent = 'unknown',
): void {
  const topic = detectTopic(userMessage);
  sk.topicFrequency[topic] = (sk.topicFrequency[topic] || 0) + 1;
  sk.totalMessages = (sk.totalMessages || 0) + 1;

  // Indexare cuvinte cheie noi
  const words = userMessage.toLowerCase().split(/\s+/)
    .filter(w => w.length > 5 && /^[a-z\u00c0-\u017f]+$/.test(w));
  for (const word of words) {
    if (!sk.learnedKeywords[word]) sk.learnedKeywords[word] = topic;
  }

  // Detectare corecție — leagă corecția de răspunsul greșit
  if (isCorrectionMessage(userMessage)) {
    const corrMatch = userMessage.match(/^(?:nu[,!]?\s+|gresit[,!]?\s+|incorect[,!]?\s+|nu e asa[,!]?\s+|asta nu e corect[,!]?\s+|ai gresit[,!]?\s+)(.+)/i);
    if (corrMatch && sk.corrections.length < 100) {
      const lastAI = messageHistory.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
      sk.corrections.push({
        wrongResponse: lastAI.slice(0, 150),
        correction: corrMatch[1].trim(),
        intent: lastIntent,
        at: Date.now(),
      });
      // Scade calitatea intențiii respective
      const q = sk.responseQualityMap[lastIntent] ?? 0.7;
      sk.responseQualityMap[lastIntent] = Math.max(0.1, q - 0.15);
    }
  } else {
    // Actualizează calitatea dacă nu e corecție
    const quality = estimateResponseQuality(userMessage, aiResponse);
    const prev = sk.responseQualityMap[lastIntent] ?? quality;
    sk.responseQualityMap[lastIntent] = prev * 0.7 + quality * 0.3;
  }

  // Învață fapte noi din mesaj
  const factPatterns = [
    /(?:stiai ca|de fapt|retine ca|faptul ca|important:|nota:|știi că)\s+(.{10,200})/i,
    /(?:am aflat ca|am citit ca|am vazut ca|am auzit ca)\s+(.{10,200})/i,
    /(?:iti spun ca|vreau sa stii ca|sa stii ca)\s+(.{10,200})/i,
  ];
  for (const rx of factPatterns) {
    const m = userMessage.match(rx);
    if (m && sk.learnedFacts.length < 150) {
      const fact = m[1].trim().replace(/\.$/, '');
      if (!sk.learnedFacts.includes(fact)) sk.learnedFacts.push(fact);
      break;
    }
  }

  // Stil preferat adaptat
  sk.preferredStyle = detectPreferredStyle(messageHistory);

  // Versiunea inteligenței crește la fiecare 10 mesaje
  sk.intelligenceVersion = 1 + Math.floor(sk.totalMessages / 10);
  sk.lastUpdate = Date.now();
}

// ─── Caută corecție relevantă ─────────────────────────────────────────────────

export function findRelevantCorrection(text: string, sk: SelfKnowledge): string | null {
  if (sk.corrections.length === 0) return null;
  const n = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const corr of sk.corrections.slice(-20)) {
    const cn = corr.wrongResponse.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Dacă există overlap semnificativ de cuvinte
    const cnWords = cn.split(/\s+/).filter(w => w.length > 4);
    const nWords = n.split(/\s+/);
    const overlap = cnWords.filter(w => nWords.includes(w)).length;
    if (overlap >= 2) return corr.correction;
  }
  return null;
}

// ─── Raport de învățare ───────────────────────────────────────────────────────

export function getLearningReport(sk: SelfKnowledge): string {
  const topTopics = Object.entries(sk.topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t, c]) => `${t} (${c}x)`);

  const qualityEntries = Object.entries(sk.responseQualityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([intent, q]) => `${intent}: ${Math.round(q * 100)}%`);

  const lines = [
    `**Raport auto-actualizare v${sk.intelligenceVersion}**`,
    '',
    `📊 **Topicuri studiate:** ${topTopics.join(', ') || 'niciuna'}`,
    `📝 **Fapte noi:** ${sk.learnedFacts.length}`,
    `🔧 **Corecții primite:** ${sk.corrections.length}`,
    `💬 **Stil detectat:** ${sk.preferredStyle}`,
    `🧠 **Cuvinte cheie indexate:** ${Object.keys(sk.learnedKeywords).length}`,
    `💬 **Mesaje totale:** ${sk.totalMessages || 0}`,
  ];

  if (qualityEntries.length > 0) {
    lines.push(`📈 **Calitate răspunsuri:** ${qualityEntries.join(' | ')}`);
  }

  if (sk.learnedFacts.length > 0) {
    lines.push('', '**Ultimele fapte reținute:**');
    sk.learnedFacts.slice(-3).forEach((f, i) => lines.push(`${i + 1}. ${f}`));
  }

  if (sk.corrections.length > 0) {
    lines.push('', '**Ultima corecție:**');
    const last = sk.corrections[sk.corrections.length - 1];
    lines.push(`• Corect: "${last.correction}"`);
  }

  return lines.join('\n');
}

// ─── Adaptare stil răspuns ────────────────────────────────────────────────────

export function adaptResponseStyle(response: string, style: 'concis' | 'detaliat' | 'normal'): string {
  if (style === 'concis') {
    const paras = response.split('\n\n').filter(p => p.trim().length > 0);
    if (paras.length > 2) return paras.slice(0, 2).join('\n\n');
  }
  return response;
}
