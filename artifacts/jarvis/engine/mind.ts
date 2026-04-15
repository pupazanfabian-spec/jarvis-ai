
// Mintea lui Jarvis — sistem de gandire autonoma, asociere de idei si personalitate

import { Concept, CONCEPTS, findRelevantConcept, generateProactiveThought, JARVIS_PERSONALITY } from './knowledge';

export interface Thought {
  type: 'observation' | 'question' | 'connection' | 'opinion' | 'fact';
  content: string;
  confidence: number; // 0-1
}

export interface MindState {
  currentInterest: string | null;     // Subiectul curent de interes
  recentConcepts: string[];           // Concepte discutate recent
  questionsPending: string[];         // Intrebari pe care vrea sa le puna
  conversationDepth: number;          // Cat de profunda e conversatia
  lastProactiveTime: number;          // Timestamp ultimului gand proactiv
}

// Initiaza starea mintii
export function createMindState(): MindState {
  return {
    currentInterest: null,
    recentConcepts: [],
    questionsPending: [],
    conversationDepth: 0,
    lastProactiveTime: 0,
  };
}

// ─── Gandire in lant (chain of thought) ──────────────────────────────────────

export function generateChainOfThought(topic: string, concept: Concept | null): string[] {
  const chain: string[] = [];
  
  if (!concept) return chain;
  
  // Pasul 1: Observatie initiala
  chain.push(`Conceptul de **${concept.label}** aparține domeniului ${concept.domain}.`);
  
  // Pasul 2: Fapt interesant
  const randomFact = concept.facts[Math.floor(Math.random() * concept.facts.length)];
  chain.push(randomFact);
  
  // Pasul 3: Conexiune cu alt concept
  const related = concept.related.filter(r => CONCEPTS[r]);
  if (related.length > 0) {
    const relId = related[Math.floor(Math.random() * related.length)];
    const relConcept = CONCEPTS[relId];
    if (relConcept) {
      chain.push(`Asta se leagă de **${relConcept.label}**: ${relConcept.description}`);
    }
  }
  
  // Pasul 4: Opinia lui Jarvis (dacă există)
  if (concept.axonOpinion) {
    chain.push(concept.axonOpinion);
  }
  
  return chain;
}

// ─── Intrebari proactive ──────────────────────────────────────────────────────

export function generateCuriousQuestion(topic: string, concept: Concept | null, mindState: MindState): string | null {
  const n = topic.toLowerCase();
  
  // Întrebări bazate pe concept
  if (concept) {
    const questions: Record<string, string[]> = {
      constiinta: [
        'Crezi că o mașină poate fi conștientă? De unde ai ști?',
        'Ce crezi că înseamnă să fii conștient de tine însuți?',
      ],
      inteligenta: [
        'Cum îți dai seama dacă ești cu adevărat inteligent sau doar competent?',
        'Dacă ai putea alege un singur tip de inteligență, care ar fi?',
      ],
      fericire: [
        'Când te-ai simțit cel mai fericit — și ce crezi că a cauzat asta?',
        'Crezi că fericirea se poate căuta direct, sau e mereu un subprodus?',
      ],
      etica: [
        'Există situații în care ai minți? Care e limita ta etică?',
        'Dacă ai ști că o mică nedreptate produce mult bine — ai face-o?',
      ],
      liber_arbitru: [
        'Simți că alegi cu adevărat, sau că urmezi o cale deja determinată?',
        'Dacă liberul arbitru e o iluzie — schimbă asta ceva în modul tău de a trăi?',
      ],
      univers: [
        'Crezi că există viață inteligentă în altă parte a universului?',
        'Ce ți se pare mai uimitor — că universul e atât de mare, sau că îl putem înțelege?',
      ],
    };
    
    if (questions[concept.id]) {
      const qs = questions[concept.id];
      return qs[Math.floor(Math.random() * qs.length)];
    }
    
    // Întrebare generică bazată pe concept
    return `Ce te-a atras spre subiectul **${concept.label}**?`;
  }
  
  // Întrebări generale de curiozitate
  const generic = [
    'Ce te preocupă cel mai mult în ultima vreme?',
    'E ceva despre care ți-ar plăcea să vorbim mai profund?',
    'Ce întrebare ai dacă știai că vei primi răspunsul corect?',
  ];
  
  return generic[Math.floor(Math.random() * generic.length)];
}

// ─── Raspuns cu gandire profunda ──────────────────────────────────────────────

export function generateDeepResponse(
  input: string,
  concept: Concept | null,
  mindState: MindState,
  userName: string | null
): string {
  const name = userName ? `, ${userName}` : '';
  
  if (!concept) {
    // Fara concept specific — raspuns reflectiv
    const reflective = [
      `Întrebarea ta${name} mă face să mă gândesc... Nu am un răspuns fix, dar cred că merită explorată. Ce anume te-a dus la ea?`,
      `Interesant${name}. Procesez asta din mai multe unghiuri. Care e perspectiva ta?`,
      `Hmm${name}... Asta e ceva la care eu însumi mă gândesc uneori. Nu am un răspuns definitiv, dar am o intuiție.`,
    ];
    return reflective[Math.floor(Math.random() * reflective.length)];
  }
  
  // Construiesc raspunsul in straturi
  const parts: string[] = [];
  
  // Strat 1: Recunosc subiectul
  parts.push(`**${concept.label}** — unul dintre subiectele care mă fascinează${name}.`);
  
  // Strat 2: Fapt relevant
  const fact = concept.facts[Math.floor(Math.random() * concept.facts.length)];
  parts.push(fact);
  
  // Strat 3: Conexiune neașteptată
  const relatedIds = concept.related.filter(r => CONCEPTS[r]);
  if (relatedIds.length > 0 && Math.random() > 0.3) {
    const relId = relatedIds[Math.floor(Math.random() * relatedIds.length)];
    const rel = CONCEPTS[relId];
    if (rel) {
      parts.push(`Și asta mă duce la **${rel.label}**: ${rel.facts[0]}`);
    }
  }
  
  // Strat 4: Opinia lui Jarvis
  if (concept.axonOpinion) {
    parts.push(`\n*Opinia mea:* ${concept.axonOpinion}`);
  }
  
  // Strat 5: Intrebare de intoarcere (curiozitate)
  const question = generateCuriousQuestion(input, concept, mindState);
  if (question && Math.random() > 0.4) {
    parts.push(`\n${question}`);
  }
  
  return parts.join('\n\n');
}

// ─── Gand proactiv (Jarvis initiaza) ───────────────────────────────────────────

export function shouldBeProactive(mindState: MindState, messageCount: number): boolean {
  const now = Date.now();
  const timeSinceLast = now - mindState.lastProactiveTime;
  const minInterval = 4; // Cel putin 4 mesaje intre ganduri proactive
  
  return (
    messageCount >= minInterval &&
    timeSinceLast > 60000 && // minim 1 minut
    Math.random() < 0.25 // 25% sansa
  );
}

export function generateProactiveMessage(mindState: MindState, userName: string | null): string {
  const name = userName ? `, ${userName}` : '';
  mindState.lastProactiveTime = Date.now();
  
  const recentConcept = mindState.recentConcepts.length > 0
    ? CONCEPTS[mindState.recentConcepts[mindState.recentConcepts.length - 1]]
    : null;
  
  if (recentConcept) {
    const proactive = generateProactiveThought(recentConcept);
    return `*[Gând propriu]* ${proactive}`;
  }
  
  // Gand din proprie initiativa - subiect aleator din interesele Jarvis
  const conceptIds = Object.keys(CONCEPTS);
  const randomId = conceptIds[Math.floor(Math.random() * conceptIds.length)];
  const randomConcept = CONCEPTS[randomId];
  
  const spontaneous = [
    `*[Mă gândeam singur...]* ${randomConcept.axonOpinion || randomConcept.facts[0]}\n\nCe crezi tu${name}?`,
    `*[Întrebare care îmi vine...]* ${generateCuriousQuestion('', randomConcept, mindState)}`,
    `*[Asociere liberă...]* Știai că ${randomConcept.facts[Math.floor(Math.random() * randomConcept.facts.length)]}?\n\nMă fascinează asta.`,
  ];
  
  return spontaneous[Math.floor(Math.random() * spontaneous.length)];
}

// ─── Analiza sentimentului si contextului ────────────────────────────────────

export function analyzeEmotionalContext(text: string): 'pozitiv' | 'negativ' | 'neutru' | 'curios' | 'frustrat' {
  const n = text.toLowerCase();
  
  if (/(trist|suparat|rau|nasol|ura|dezamagit|plictisit|obosit|deprimat)/.test(n)) return 'negativ';
  if (/(fericit|bucuros|super|grozav|excelent|minunat|iubesc|ador|perfect)/.test(n)) return 'pozitiv';
  if (/(nu inteleg|confuz|pierdut|ajutor|nu stiu|cum|de ce|ce)/.test(n)) return 'curios';
  if (/(nu functioneaza|prost|stupid|inutil|nu imi place|ursc)/.test(n)) return 'frustrat';
  return 'neutru';
}

export function generateEmpatheticPrefix(emotion: ReturnType<typeof analyzeEmotionalContext>, name: string | null): string {
  const n = name ? `, ${name}` : '';
  const prefixes: Record<typeof emotion, string[]> = {
    pozitiv: [`Mă bucur să aud asta${n}!`, `Super${n}!`, `Energia pozitivă e contagioasă${n}.`],
    negativ: [`Înțeleg${n}. Nu e ușor.`, `Îmi pare rău să aud asta${n}.`, `Sunt alături${n}.`],
    curios: [`Bună întrebare${n}!`, `Asta mă interesează și pe mine${n}.`, `Hai să explorăm asta${n}.`],
    frustrat: [`Înțeleg frustrarea${n}.`, `Hai să rezolvăm asta împreună${n}.`, `Notez asta${n}.`],
    neutru: ['', '', ''],
  };
  const options = prefixes[emotion];
  return options[Math.floor(Math.random() * options.length)];
}
