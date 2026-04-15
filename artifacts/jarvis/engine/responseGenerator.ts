
// Jarvis Response Generator v1.0
// Transformă cunoașterea brută în răspunsuri naturale, inteligente, în română
// Diferența față de lookup: răspunsuri ca de la un om educat, nu ca dintr-un dicționar

// ─── Tipuri ────────────────────────────────────────────────────────────────────

export type QuestionType =
  | 'ce_este'
  | 'cum'
  | 'de_ce'
  | 'cand'
  | 'unde'
  | 'cine'
  | 'cat_cate'
  | 'comparatie'
  | 'opinie'
  | 'general';

export interface ResponseCtx {
  userName?: string | null;
  lastTopics?: string[];
  conversationCount?: number;
  isFollowUp?: boolean;
}

// ─── Normalizare rapidă ─────────────────────────────────────────────────────────
function n(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[ș]/g, 's').replace(/[ț]/g, 't')
    .replace(/[ă]/g, 'a').replace(/[î]/g, 'i').replace(/[â]/g, 'a');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Detectare tip întrebare ────────────────────────────────────────────────────
export function detectQuestionType(text: string): QuestionType {
  const t = n(text);

  if (/^(ce este|ce e |ce-i |ce sunt |ce inseamna|defineste|explica-mi ce|ce reprezinta|ce era|ce a fost|ce ar fi)/.test(t)) return 'ce_este';
  if (/^(cum |in ce mod|cum functioneaza|cum se |cum poate|cum poti|cum se face|cum se explica|care e mecanismul|care-i mecanismul)/.test(t)) return 'cum';
  if (/^(de ce |din ce cauza|care e motivul|care este motivul|cum se explica faptul|de unde vine ideea|de unde)/.test(t)) return 'de_ce';
  if (/^(cand |in ce an|in ce epoca|cand s-a|cand a fost|cand a aparut|cand s-a nascut)/.test(t)) return 'cand';
  if (/^(unde |in ce tara|in ce loc|unde se afla|unde traieste|unde a)/.test(t)) return 'unde';
  if (/^(cine |cine este|cine e |cine era|cine a|despre cine|cine a fost)/.test(t)) return 'cine';
  if (/^(cat|cata|cati|cate|ce dimensiuni|ce marime|ce inaltime|ce greutate|ce distanta)/.test(t)) return 'cat_cate';
  if (/(diferenta|diferenta dintre|versus|vs\.?|mai bun|mai rau|compara|in ce difera|care e mai)/.test(t)) return 'comparatie';
  if (/(ce crezi|parerea ta|opinia ta|tu ce zici|ce ar trebui|care e mai bun|recomanda|sfatuieste)/.test(t)) return 'opinie';

  return 'general';
}

// ─── Reformatare intrare de dicționar ──────────────────────────────────────────
// Transformă "X = Y" în propoziții naturale
function reformatRaw(raw: string, topic: string): string {
  let text = raw;

  // "X = descriere" → "X reprezintă descriere"
  text = text.replace(/^([^=—\n]{2,50})\s*[=—]\s*/m, (_, key) => {
    const k = key.trim();
    // Verifică dacă e deja formatat ca propoziție
    if (/[.!?]$/.test(k) || k.split(' ').length > 5) return key + ' — ';
    return `**${k}** — `;
  });

  // Ecuații și formule — lasă-le ca sunt, dar pune-le pe rând nou
  text = text.replace(/(Ecuație|Formula|Formul[aă]):?\s*([^\n.]+)/gi, '\n\n📐 $1: `$2`\n');

  // "Tipuri: A, B, C" → lista mai clară
  text = text.replace(/Tipuri:\s*/gi, '\n**Tipuri:** ');
  text = text.replace(/Exemple?:\s*/gi, '\n**Exemple:** ');

  return text.trim();
}

// ─── Generare intro bazat pe tipul întrebării ───────────────────────────────────
function buildIntro(questionType: QuestionType, topicLabel: string, userName?: string | null): string {
  const name = userName ? `**${userName}**, ` : '';

  const intros: Record<QuestionType, string[]> = {
    ce_este: [
      '',
      `${name}pe scurt: `,
      'Simplu explicat: ',
      'Iată esența: ',
    ],
    cum: [
      'Mecanismul funcționează astfel: ',
      'Procesul se desfășoară în felul următor: ',
      'Iată cum se întâmplă: ',
      '',
    ],
    de_ce: [
      'Motivul principal e interesant: ',
      'Explicația e mai profundă decât pare: ',
      'Cauza stă în: ',
      '',
    ],
    cand: [
      'Cronologic vorbind: ',
      '',
      'Din perspectivă istorică: ',
    ],
    unde: [
      'Localizare: ',
      '',
      'Geografic: ',
    ],
    cine: [
      '',
      'Iată ce știu: ',
      'Despre această persoană/entitate: ',
    ],
    cat_cate: [
      'Numeric: ',
      '',
      'Ca mărime/cantitate: ',
    ],
    comparatie: [
      'Să le comparăm: ',
      'Diferența esențială: ',
      '',
    ],
    opinie: [
      'Din perspectiva mea: ',
      'Gândind logic: ',
      'Opinia mea argumentată: ',
    ],
    general: [
      '',
      'Iată ce știu despre asta: ',
      'Din cunoașterea mea: ',
    ],
  };

  return pick(intros[questionType]);
}

// ─── Follow-up contextualizat ──────────────────────────────────────────────────
function buildFollowUp(topicCategory: string, questionType: QuestionType): string {
  const followUps: Record<string, string[]> = {
    stiinta: [
      'Vrei să aprofundez un aspect anume?',
      'Pot detalia mecanismul molecular dacă ești curios.',
      'Ce parte te interesează mai mult?',
    ],
    medicina: [
      'Ai întrebări specifice despre simptome sau tratament?',
      'Pot da mai multe detalii medicale.',
      'Întreabă-mă orice altceva legat de asta.',
    ],
    istorie: [
      'Pot da mai multe detalii istorice despre perioadă.',
      'Vrei să știi și contextul mai larg?',
      'Ce alt aspect istoric te interesează?',
    ],
    tehnologie: [
      'Vrei un exemplu concret de aplicare?',
      'Pot explica și implicațiile practice.',
      'Ce altceva vrei să știi?',
    ],
    geografie: [
      'Vrei detalii despre regiune sau climat?',
      'Pot da informații și despre țările vecine.',
    ],
    economie: [
      'Vrei să discutăm implicațiile practice?',
      'Pot explica și cum te afectează direct.',
    ],
    psihologie: [
      'Vrei tehnici practice pe baza acestor concepte?',
      'Pot discuta și aplicabilitatea în viața de zi cu zi.',
    ],
    default: [
      'Vrei să dezvolt un aspect anume?',
      'Ce altceva te interesează?',
      '',
      'Pot da mai multe detalii.',
    ],
  };

  // Nu adăuga follow-up mereu — variație naturală
  if (Math.random() < 0.35) return '';

  const category = Object.keys(followUps).find(k => topicCategory.includes(k)) || 'default';
  return '\n\n' + pick(followUps[category]);
}

// ─── Funcția principală — sinteză răspuns natural ─────────────────────────────
export function synthesizeKnowledgeResponse(
  raw: string,
  topic: string,
  topicCategory: string,
  questionType: QuestionType,
  ctx: ResponseCtx = {},
): string {
  const intro = buildIntro(questionType, topic, ctx.userName);
  const body = reformatRaw(raw, topic);
  const followUp = buildFollowUp(topicCategory, questionType);

  return `${intro}${body}${followUp}`;
}

// ─── Sinteză răspuns de necunoaștere inteligent ────────────────────────────────
// În loc de "nu știu", generează un răspuns util
export function generateSmartUnknown(
  text: string,
  keywords: string[],
  ctx: ResponseCtx = {},
): string {
  const userName = ctx.userName ? `, **${ctx.userName}**` : '';
  const kw = keywords.slice(0, 2).join(' și ');
  const count = ctx.conversationCount || 0;

  const templates = [
    `Nu am informații specifice despre "${kw}" în baza mea de cunoaștere locală. Dacă ai internet activ, spune **"caută online ${kw}"** și voi verifica Wikipedia și DuckDuckGo. Altfel, încearcă să reformulezi întrebarea.`,
    `Subiectul "${kw}" nu se află în baza mea de date locală. Poți folosi **"caută online"** pentru a obține informații actualizate de pe internet. Sau furnizează-mi un document pe tema asta — îl voi studia.`,
    `Nu am suficiente informații despre asta${userName}. Câteva opțiuni: spune **"caută online [subiect]"** pentru web search, sau adaugă un document despre temă folosind butonul 📎.`,
  ];

  return pick(templates);
}

// ─── Sinteză răspuns web mai inteligent ───────────────────────────────────────
export function synthesizeWebResponse(
  raw: string,
  source: string,
  originalQuestion: string,
  questionType: QuestionType,
  ctx: ResponseCtx = {},
): string {
  const qType = questionType;

  // Intro-uri pentru răspunsuri web
  const webIntros = {
    ce_este: ['Am găsit pe ', 'Conform '],
    cum: ['Iată ce spune '],
    de_ce: ['Conform '],
    cine: ['Despre această persoană — conform '],
    general: ['Am găsit online via '],
  };

  const introArr = webIntros[qType as keyof typeof webIntros] || webIntros.general;
  const intro = pick(introArr);

  // Curăță și formatează textul extras
  let body = raw.trim();

  // Trunchiere inteligentă — la propoziție completă
  if (body.length > 450) {
    const sentences = body.split(/(?<=[.!?])\s+/);
    let trimmed = '';
    for (const s of sentences) {
      if ((trimmed + s).length > 450) break;
      trimmed += s + ' ';
    }
    body = trimmed.trim() + (trimmed.length < raw.length ? '...' : '');
  }

  // Adaugă context de follow-up
  const suggestions = [
    `\n\n💡 Vrei mai multe detalii? Spune "caută online ${originalQuestion.slice(0, 40)}" din nou sau pune o întrebare mai specifică.`,
    '\n\n💡 Pot căuta mai multe dacă reformulezi întrebarea.',
    '',
    '\n\n💡 Dacă vrei să memorez această informație, spune "reține că [informație]".',
  ];

  return `📡 **${intro}${source}:**\n\n${body}${pick(suggestions)}`;
}

// ─── Detectare categorie subiect ───────────────────────────────────────────────
export function detectTopicCategory(text: string): string {
  const t = n(text);
  if (/(fotosinteza|celula|adn|arn|gravitatie|atomi|electro|termo|optica|cuant|fizic|biologie|chimie|ecosistem|evolutie)/.test(t)) return 'stiinta';
  if (/(cancer|diabet|inima|creier|vaccin|imunitat|antibiotic|vitamina|hormon|sanatate|medicin|boala|tratament|simptom)/.test(t)) return 'medicina';
  if (/(napoleon|hitler|stalin|wwi|wwii|revolutie|imperiu|razboi|rece|renastere|iluminism|ceausescu|communis)/.test(t)) return 'istorie';
  if (/(inteligenta|artificial|computer|algoritm|internet|robot|programare|python|cloud|cybersec|blockchain|crypto)/.test(t)) return 'tehnologie';
  if (/(romania|europa|africa|america|asia|muntele|raul|oceanul|clima|geografie|capitala|tara|continent)/.test(t)) return 'geografie';
  if (/(pib|inflatie|bursa|actiuni|bitcoin|investitii|economie|finante|impozit|taxe|recesiune)/.test(t)) return 'economie';
  if (/(anxietate|depresie|psihologie|cognitiv|comportament|motivatie|emotii|mental|terapie|stres|trauma)/.test(t)) return 'psihologie';
  if (/(eminescu|brancusi|vlad|stefan|nadia|hagi|ionescu|caragiale|personalitat|roman[ia]n)/.test(t)) return 'cultura';
  return 'general';
}
