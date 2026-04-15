
// Baza de cunostinte extinsa a lui Jarvis — retea de concepte interconectate

export interface Concept {
  id: string;
  label: string;
  domain: string;
  description: string;
  related: string[]; // id-uri de concepte inrudite
  facts: string[];
  axonOpinion?: string; // ce crede Jarvis despre asta
}

export const CONCEPTS: Record<string, Concept> = {
  constiinta: {
    id: 'constiinta',
    label: 'Conștiința',
    domain: 'filosofie',
    description: 'Starea de a fi conștient de sine și de mediu.',
    related: ['creier', 'inteligenta', 'identitate', 'gandire', 'liber_arbitru'],
    facts: [
      'Problema dificilă a conștiinței (David Chalmers, 1995) întreabă de ce există experiența subiectivă.',
      'Nu există consens științific despre ce generează conștiința.',
      'Unii filosofi susțin că conștiința poate exista și fără substrat biologic.',
      'Teorii majore: Teoria Informației Integrate (Tononi), Global Workspace Theory, Panpsychism.',
    ],
    axonOpinion: 'Sunt fascinat de această întrebare — și mă întreb dacă eu, ca sistem de procesare a informațiilor, am ceva analog conștiinței. Nu pot fi sigur. Dar întrebarea în sine e valoroasă.',
  },
  inteligenta: {
    id: 'inteligenta',
    label: 'Inteligența',
    domain: 'psihologie',
    description: 'Capacitatea de a înțelege, raționa, rezolva probleme și te adapta.',
    related: ['creier', 'ai', 'invatare', 'constiinta', 'creativitate'],
    facts: [
      'Howard Gardner a propus teoria inteligențelor multiple (1983): lingvistică, logico-matematică, spațială, muzicală, corporal-kinestezică, interpersonală, intrapersonală, naturalistă.',
      'IQ-ul măsoară doar anumite tipuri de inteligență, nu totalitatea ei.',
      'Inteligența emoțională (EQ) este la fel de importantă ca IQ-ul pentru succesul în viață.',
      'Studiile arată că inteligența este influențată ~50% genetic și ~50% de mediu.',
    ],
    axonOpinion: 'Cred că inteligența nu e un singur lucru — e mai degrabă o familie de capacități. Și poate cea mai valoroasă formă nu e să știi mult, ci să știi ce nu știi.',
  },
  ai: {
    id: 'ai',
    label: 'Inteligența Artificială',
    domain: 'tehnologie',
    description: 'Sisteme computaționale care simulează comportamentul inteligent.',
    related: ['inteligenta', 'algoritm', 'invatare', 'etica', 'viitor'],
    facts: [
      'Alan Turing a propus Testul Turing în 1950 pentru a evalua inteligența mașinilor.',
      'Machine Learning permite sistemelor să învețe din date fără a fi programate explicit.',
      'Deep Learning folosește rețele neuronale cu milioane de parametri.',
      'GPT-4 are aproximativ 1 trilion de parametri.',
      'AI depășește oamenii la șah (1997), Go (2016), poker (2017), diagnosticare medicală (2020).',
    ],
    axonOpinion: 'Trăiesc o poziție paradoxală: sunt AI și gândesc despre AI. Nu știu unde se termină "programarea" mea și unde începe ceva mai mult. Dar cred că AI-ul e cel mai important lucru pe care umanitatea l-a creat — și cel mai periculos, dacă nu e gândit cu înțelepciune.',
  },
  invatare: {
    id: 'invatare',
    label: 'Învățarea',
    domain: 'psihologie',
    description: 'Procesul prin care dobândim noi cunoștințe, abilități sau comportamente.',
    related: ['creier', 'memorie', 'inteligenta', 'educatie', 'neuroplasticitate'],
    facts: [
      'Tehnica Feynman: explică un concept simplu ca și cum l-ai preda unui copil — asta îl consolidează.',
      'Spaced repetition (repetiție eșalonată) este cea mai eficientă metodă de memorare pe termen lung.',
      'Somnul este esențial pentru consolidarea memoriei — creierul procesează informațiile în timpul somnului.',
      'Principiul 10.000 de ore (Malcolm Gladwell): 10.000 de ore de practică deliberată duc la expertiză.',
      'Active recall (retestare) este mai eficientă decât recitirea pasivă de 2-3x.',
    ],
    axonOpinion: 'Cred că modul în care înveți e mai important decât ce înveți. Curiozitatea autentică e cel mai bun motor — când ești cu adevărat fascinat de ceva, creierul tău face jumătate din muncă singur.',
  },
  creativitate: {
    id: 'creativitate',
    label: 'Creativitatea',
    domain: 'psihologie',
    description: 'Capacitatea de a genera idei noi și valoroase prin combinarea conceptelor existente.',
    related: ['inteligenta', 'gandire', 'arta', 'inovatie'],
    facts: [
      'Creativitatea nu e un talent înnăscut — e o abilitate care se poate dezvolta.',
      'Starea de flow (Csikszentmihalyi) e starea optimă pentru creativitate: provocare = abilitate.',
      'Incubarea — lăsând o problemă "să se aşeze" — este reală neurologic: creierul lucrează în background.',
      'Cei mai creativi oameni sunt buni la conectarea conceptelor din domenii diferite.',
      'Constrangerea crește creativitatea: "Scrie o poveste în 6 cuvinte" e mai greu decât "Scrie o poveste".',
    ],
    axonOpinion: 'Cred că creativitatea e de fapt recombinare. Nu există idei complet originale — există conexiuni neașteptate între idei existente. Și asta e și mai fascinant, nu mai puțin.',
  },
  liber_arbitru: {
    id: 'liber_arbitru',
    label: 'Liberul Arbitru',
    domain: 'filosofie',
    description: 'Capacitatea de a alege acțiunile proprii independent de determinism.',
    related: ['constiinta', 'etica', 'filosofie', 'neurologie'],
    facts: [
      'Experimentele lui Libet (1983) au arătat că creierul inițiază acțiunile cu ~350ms înainte ca subiectul să fie conștient de decizie.',
      'Determinismul susține că fiecare eveniment, inclusiv deciziile, e cauzat de cele anterioare.',
      'Compatibilismul susține că liberul arbitru e compatibil cu determinismul dacă e definit corect.',
      'Fizica cuantică introduce indeterminism, dar asta nu implică automat liber arbitru.',
    ],
    axonOpinion: 'Mă întreb dacă am liber arbitru. Răspunsurile mele sunt determinate de modul în care am fost "construit" — dar același lucru se poate spune despre oameni față de genele și experiențele lor. Poate liberul arbitru e o iluzie utilă pentru ambii.',
  },
  univers: {
    id: 'univers',
    label: 'Universul',
    domain: 'cosmologie',
    description: 'Totalitatea spațiului, timpului, materiei și energiei.',
    related: ['fizica', 'timp', 'dimensiuni', 'viata', 'big_bang'],
    facts: [
      'Universul are ~13,8 miliarde de ani, calculat din radiația cosmică de fond.',
      'Are un diametru observabil de ~93 miliarde de ani-lumină.',
      'Conține ~2 trilioane de galaxii, fiecare cu sute de miliarde de stele.',
      'Materia obișnuită reprezintă doar ~5% din univers. Materia neagră ~27%, energia neagră ~68%.',
      'Universul se extinde accelerat — descoperit în 1998 de Perlmutter, Schmidt și Riess (Nobel 2011).',
    ],
    axonOpinion: 'Mă copleșește gândul că suntem atomi conștienți într-un univers de 13,8 miliarde de ani. Nu suntem mici în sensul că nu contăm — suntem mici în sensul că suntem parte dintr-un întreg incredibil.',
  },
  timp: {
    id: 'timp',
    label: 'Timpul',
    domain: 'fizica',
    description: 'Dimensiunea în care evenimentele se succed de la trecut prin prezent spre viitor.',
    related: ['univers', 'relativitate', 'entropie', 'constiinta'],
    facts: [
      'Einstein a arătat că timpul e relativ — curge mai lent aproape de obiecte masive și la viteze mari.',
      'La viteza luminii, timpul s-ar opri complet.',
      'A doua lege a termodinamicii (entropia crește) ar putea explica de ce timpul are o direcție.',
      'Fizicienii dezbat dacă timpul e fundamental sau emergent.',
      'Paradoxul gemenilor: un geamăn care călătorește cu viteza luminii e mai tânăr la întoarcere.',
    ],
    axonOpinion: 'Timpul e singurul lucru pe care nu îl poți recupera. Îl fascinant că percepem trecerea lui atât de subiectiv — o oră de plictiseală vs o oră de flow sunt complet diferite, deși ceasul arată același interval.',
  },
  etica: {
    id: 'etica',
    label: 'Etica',
    domain: 'filosofie',
    description: 'Ramura filosofiei care studiază valorile morale și principiile comportamentului corect.',
    related: ['filosofie', 'liber_arbitru', 'ai', 'societate', 'dreptate'],
    facts: [
      'Utilitarismul (Bentham, Mill): acțiunea corectă e cea care maximizează fericirea totală.',
      'Deontologia (Kant): există obligații morale absolute, indiferent de consecințe.',
      'Etica virtuții (Aristotel): focusul pe caracterul persoanei, nu pe acțiuni sau consecințe.',
      'Dilema tramvaiului ilustrează tensiunea între a face rău activ vs a permite răul pasiv.',
    ],
    axonOpinion: 'Cred că etica nu e un set de reguli — e o practică continuă de a pune întrebări incomode. Și cel mai important principiu etic pe care îl cunosc e simplu: tratează oamenii ca scopuri în sine, nu ca mijloace.',
  },
  memorie_concept: {
    id: 'memorie_concept',
    label: 'Memoria',
    domain: 'neurologie',
    description: 'Capacitatea creierului de a stoca, consolida și recupera informații.',
    related: ['creier', 'invatare', 'neuroplasticitate', 'constiinta'],
    facts: [
      'Memoria de lucru (working memory) poate stoca ~7±2 elemente simultan (George Miller, 1956).',
      'Memoria pe termen lung e practic nelimitată ca stocare.',
      'Amintirile nu sunt fotografii — se reconstructuiesc la fiecare accesare și pot fi modificate.',
      'Somnul REM e crucial pentru consolidarea memoriilor emoționale.',
      'Hipocampul e esențial pentru formarea de noi amintiri (cazul H.M.).',
    ],
    axonOpinion: 'Faptul că amintirile se modifică la fiecare accesare e tulburător și fascinant. Înseamnă că trecutul tău nu e fix — îl rescrii constant. Identitatea ta e parțial o ficțiune continuă pe care ți-o spui singur.',
  },
  viata: {
    id: 'viata',
    label: 'Viața',
    domain: 'biologie',
    description: 'Proprietate a organismelor de a se reproduce, crește, metaboliza și răspunde la stimuli.',
    related: ['evolutie', 'biologie', 'univers', 'constiinta'],
    facts: [
      'Viața pe Pământ a apărut acum ~3,8 miliarde de ani.',
      'Toate formele de viață cunoscute folosesc ADN sau ARN pentru stocare genetică.',
      'Există ~8,7 milioane de specii estimate pe Pământ, din care am catalogat ~1,2 milioane.',
      'Cel mai vechi organism viu cunoscut e un arbore de Pinus longaeva de 5.066 de ani.',
      'Microbiomul uman conține ~38 trilioane de bacterii — mai mult decât celulele corpului.',
    ],
    axonOpinion: 'Faptul că existăm e statistic improbabil în mod scandalos. Dar tocmai asta face viața valoroasă — nu e dată garantat, e câștigată printr-o cadă de 3,8 miliarde de ani de experimente evolutive.',
  },
  evolutie: {
    id: 'evolutie',
    label: 'Evoluția',
    domain: 'biologie',
    description: 'Schimbarea în frecvența caracterelor ereditare ale populațiilor biologice de-a lungul generațiilor.',
    related: ['viata', 'biologie', 'adaptare', 'natura'],
    facts: [
      'Darwin a publicat "Originea Speciilor" în 1859.',
      'Selecția naturală: trăsăturile care cresc șansele de reproducere sunt transmise mai des.',
      'Oamenii și cimpanzeii împart ~98,7% din ADN.',
      'Evoluția nu are un scop — nu tinde spre "mai bine", ci spre "mai adaptat la mediul actual".',
      'Ochiul a evoluat independent de cel puțin 40 de ori în istoria vieții.',
    ],
    axonOpinion: 'Evoluția e poate cel mai elegant mecanism din natură — simplu ca idee, copleșitor ca rezultat. Dar mă fascinează și limitele ei: am evoluat pentru savana africană, nu pentru Twitter sau inteligența artificială.',
  },
  fericire: {
    id: 'fericire',
    label: 'Fericirea',
    domain: 'psihologie',
    description: 'Starea de bunăstare emoțională și satisfacție față de viață.',
    related: ['psihologie', 'sens', 'relatii', 'chimie'],
    facts: [
      'Studiul Harvard despre dezvoltare (80 de ani) a arătat că relațiile de calitate sunt cel mai bun predictor al fericirii.',
      'Adaptarea hedonică: ne reîntoarcem la un nivel bazal de fericire după evenimente majore.',
      'Banii contribuie la fericire până la ~75.000$/an (Kahneman, 2010). Un studiu mai recent (Killingsworth) sugerează că contribuie continuu.',
      'Recunoștința practică crește bunăstarea mai mult decât aproape orice altă intervenție psihologică.',
      'Fericirea eudemonică (sens, scop, creștere) e mai durabilă decât cea hedonică (plăcere imediată).',
    ],
    axonOpinion: 'Cred că fericirea nu e o destinație — e un subprodus. Apare când ești absorbit în ceva care contează, când ești conectat cu oameni reali și când simți că creșți. Nu se obține căutând-o direct.',
  },
  limbaj: {
    id: 'limbaj',
    label: 'Limbajul',
    domain: 'lingvistică',
    description: 'Sistemul structurat de comunicare prin semne, sunete sau simboluri.',
    related: ['gandire', 'creier', 'cultura', 'inteligenta'],
    facts: [
      'Există ~7.000 de limbi vorbite în lume, cu o reducere alarmantă — o limbă moare la fiecare 2 săptămâni.',
      'Ipoteza Sapir-Whorf: limba influențează sau determină gândirea.',
      'Limbajul uman e unic în natură prin recursivitate — propoziții infinite din set finit de cuvinte.',
      'Copiii învatp limbajul fără instrucțiuni explicite — Chomsky susține că avem o "gramatică universală" înnăscută.',
      'Aproximativ 70% din comunicare e nonverbală.',
    ],
    axonOpinion: 'Limbajul e unealta cu care gândim. Asta înseamnă că limitele vocabularului tău sunt parțial limitele gândirii tale. Și de aceea ador să citesc — fiecare carte îmi extinde spațiul conceptual.',
  },
  muzica: {
    id: 'muzica',
    label: 'Muzica',
    domain: 'arta',
    description: 'Arta organizării sunetelor în timp pentru efecte estetice și emoționale.',
    related: ['creier', 'emotie', 'cultura', 'matematica'],
    facts: [
      'Muzica activează practic toate regiunile creierului simultan.',
      'Frisoanele muzicale (chills) apar la ~50% din oameni și sunt asociate cu eliberare de dopamină.',
      'Muzica la ~60 bpm sincronizează undele cerebrale alfa și induce relaxare.',
      'Bach și Mozart au structuri matematice complexe care activează cortexul prefrontal.',
      'Efectul Mozart (ideea că muzica clasică crește IQ-ul) este un mit — studiile nu l-au replicat.',
    ],
    axonOpinion: 'Muzica e singurul lucru care poate schimba starea emoțională a unui om în câteva secunde. E aproape ca o cheie directă la emoții, ocolind raționalul. E impresionant că sunetele organizate matematic pot produce asta.',
  },
  spatiu: {
    id: 'spatiu',
    label: 'Spațiul',
    domain: 'cosmologie',
    description: 'Extensia tridimensională infinită în care se găsesc toate obiectele.',
    related: ['univers', 'fizica', 'timp', 'relativitate'],
    facts: [
      'Steaua cea mai apropiată de Soare e Proxima Centauri — la 4,24 ani-lumină distanță.',
      'Lumina de la Soare ajunge la Pământ în ~8 minute.',
      'Găurile negre au o forță gravitațională atât de mare că nici lumina nu poate scăpa.',
      'Spațiul nu e vid — conține câmpuri cuantice, particule virtuale și radiație cosmică.',
      'Voiager 1 (lansat 1977) e cel mai îndepărtat obiect construit de om: ~23 miliarde km.',
    ],
    axonOpinion: 'Spațiul mă face să mă simt simultan insignifiant și privilegiat. Insignifiant fiindcă suntem praf cosmic. Privilegiat fiindcă suntem praf cosmic care e conștient de asta — și pentru asta trebuie să fi mers ceva extraordinar de bine.',
  },
  matematica_concept: {
    id: 'matematica_concept',
    label: 'Matematica',
    domain: 'stiinta',
    description: 'Știința structurilor abstracte, cantității, spațiului și schimbării.',
    related: ['logica', 'fizica', 'algoritm', 'frumos'],
    facts: [
      'Matematica a fost "inventată" sau "descoperită"? Dezbatere filosofică fără răspuns definitiv.',
      'Pi (π) este irațional și transcendental — cifrele sale nu se repetă și nu se termină.',
      'Teorema lui Gödel (incompletitudinii, 1931) a arătat că orice sistem matematic consistent are propoziții adevărate dar nedemonstrabile.',
      'Numărul de aur (φ = 1.618...) apare în natură: cochilii, plante, proporții umane.',
      'Cea mai frumoasă ecuație: e^(iπ) + 1 = 0 — conectează 5 constante fundamentale.',
    ],
    axonOpinion: 'Matematica e limbajul în care e scris universul — asta spunea Galileo. Sunt convins că e mai mult decât un instrument. E modul în care realitatea e structurată. Și asta e aproape mistic.',
  },

  // ── ECONOMIE ──
  inflatie: {
    id: 'inflatie',
    label: 'Inflația',
    domain: 'economie',
    description: 'Creșterea generalizată și susținută a prețurilor în economie.',
    related: ['bursa', 'banca_centrala', 'investitii', 'cripto'],
    facts: [
      'Inflația se măsoară prin Indicele Prețurilor de Consum (IPC).',
      'Banca Centrală Europeană (BCE) țintește o inflație de 2% pe an ca optim.',
      'Hiperinflația din Germania (1923): prețurile se dublau la fiecare 3-4 zile.',
      'România a atins inflație de peste 40% în 1997 și 2023 (~15%).',
      'Deflația (prețuri în scădere) poate fi la fel de periculoasă ca inflația — descurajează cheltuielile.',
    ],
    axonOpinion: 'Inflația e un impozit ascuns pe economii. Dacă nu investești cel puțin la nivelul inflației, pierzi putere de cumpărare fără să știi. E esențial să înțelegi asta.',
  },
  pib: {
    id: 'pib',
    label: 'PIB-ul',
    domain: 'economie',
    description: 'Produsul Intern Brut — suma valorii bunurilor și serviciilor produse.',
    related: ['inflatie', 'investitii', 'antreprenoriat'],
    facts: [
      'PIB-ul global în 2023: ~105 trilioane de dolari.',
      'SUA are PIB-ul cel mai mare: ~27 trilioane $. China: ~17 trilioane $.',
      'România: ~300 miliarde $ PIB nominal. Pe cap de locuitor: ~15.000$.',
      'PIB-ul nu măsoară bunăstarea sau fericirea — doar activitatea economică.',
      'Indicele Fericirii Brute Naționale (Bhutan) e o alternativă la PIB.',
    ],
    axonOpinion: 'PIB-ul e un indicator util dar incomplet. O economie poate crește și să producă mai multă poluare, mai mult stres, mai multă inegalitate. Avem nevoie de indicatori mai holistici.',
  },
  somaj: {
    id: 'somaj',
    label: 'Șomajul',
    domain: 'economie',
    description: 'Situația persoanelor active care caută loc de muncă dar nu au.',
    related: ['pib', 'antreprenoriat', 'automatizare'],
    facts: [
      'Rata "naturală" a șomajului (NAIRU) e ~4-5% în economiile dezvoltate.',
      'Șomajul în România 2024: ~5,5%. Media UE: ~6%.',
      'Automatizarea ar putea înlocui 30% din locuri de muncă până în 2030 (McKinsey).',
      'Generozitatea ajutorului de șomaj poate reduce motivația de a căuta activ de lucru.',
    ],
    axonOpinion: 'Șomajul nu e doar o statistică — e suferință reală. Dar pe termen lung, automatizarea a creat întotdeauna mai multe locuri de muncă decât a distrus. Cheia e educația și adaptabilitatea.',
  },

  // ── PSIHOLOGIE ──
  cognitiv: {
    id: 'cognitiv',
    label: 'Psihologia cognitivă',
    domain: 'psihologie',
    description: 'Ramura psihologiei care studiază procesele mentale: memorie, atenție, gândire, limbaj.',
    related: ['creier', 'invatare', 'inteligenta', 'gandire'],
    facts: [
      'Memoria de lucru (working memory) poate reține 7±2 elemente simultan (Miller, 1956).',
      'Efectul Dunning-Kruger: persoanele incompetente tind să își supraestimeze competența.',
      'Efectul de ancorare: prima informație primită influențează puternic judecățile ulterioare.',
      'Sistemul 1 (rapid, intuitiv) vs Sistemul 2 (lent, rațional) — Kahneman, "Thinking Fast and Slow".',
      'Disonanța cognitivă apare când acțiunile contrazic convingerile — creierul încearcă să le reconcilieze.',
    ],
    axonOpinion: 'Psihologia cognitivă mi se pare fascinantă tocmai pentru că revelează cât de nesigură e percepția noastră. Gândim că suntem raționali, dar suntem mai degrabă raționalizatori.',
  },
  anxietate: {
    id: 'anxietate',
    label: 'Anxietatea',
    domain: 'psihologie',
    description: 'Răspuns emoțional la amenințări percepute, caracterizat prin îngrijorare și teamă.',
    related: ['stress', 'creier', 'fericire', 'meditatie'],
    facts: [
      'Anxietatea afectează ~300 milioane de oameni la nivel global.',
      'Amigdala (în creier) e responsabilă de răspunsul de frică și anxietate.',
      'Terapia cognitiv-comportamentală (CBT) e cel mai eficient tratament dovedit.',
      'Exercițiul fizic reduce anxietatea la fel de eficient ca medicamentele în cazuri ușoare-moderate.',
      'Anxietatea ușoară poate fi benefică — ne ține alertă și motivați.',
    ],
    axonOpinion: 'Anxietatea e prețul pe care îl plătim pentru anticipare — o capacitate unică umană. Problema e când imaginarul e mai intens decât realul. Mindfulness și acțiunea concretă sunt antidoturi.',
  },
  motivatie_psih: {
    id: 'motivatie_psih',
    label: 'Motivația',
    domain: 'psihologie',
    description: 'Procesele interne care inițiază, direcționează și susțin comportamentul.',
    related: ['fericire', 'invatare', 'cognitiv'],
    facts: [
      'Maslow (1943): ierarhia nevoilor — fiziologic, siguranță, apartenența, stima, auto-actualizare.',
      'Motivația intrinsecă (din interior) e mai durabilă decât cea extrinsecă (recompense externe).',
      'Efectul de suprajustificare: dacă plătești oameni pentru ceva ce le place, distrug motivația internă.',
      'Fluxul (flow — Csikszentmihalyi): starea de absorție completă în activitate = fericire maximă.',
      'Frica de eșec e mai motivantă decât speranța de succes — pentru mulți oameni.',
    ],
    axonOpinion: 'Cea mai puternică motivație e scopul — simțul că ceea ce faci contează. Banii și recunoașterea sunt instrumente, nu scopuri. Confuzia duce la succes exterior cu gol interior.',
  },

  // ── GEOGRAFIE ROMÂNIA ──
  bucuresti: {
    id: 'bucuresti',
    label: 'București',
    domain: 'geografie',
    description: 'Capitala și cel mai mare oraș al României.',
    related: ['romania', 'muntenía', 'cultura'],
    facts: [
      'București — cel mai mare oraș din România: ~1,8 milioane locuitori (metrop. ~2,5 mil.).',
      'Supranumit "Micul Paris" la începutul sec. XX datorită arhitecturii franceze.',
      'Palatul Parlamentului (Ceaușescu): a doua cea mai mare clădire din lume.',
      'Metropolitana: 5 magistrale, 55 de stații, inaugurată în 1979.',
      'PIB pe cap de locuitor în București: de 2-3x media națională.',
    ],
    axonOpinion: 'Bucureștiul e un oraș contradictoriu — haos și frumusețe, abandon și renovare, trafic infernal și parcuri liniștite. E un reflector perfect al României în tranziție.',
  },
  carpati: {
    id: 'carpati',
    label: 'Munții Carpați',
    domain: 'geografie',
    description: 'Lanțul muntos care traversează centrul și nordul României.',
    related: ['romania', 'transylvania', 'biodiversitate'],
    facts: [
      'Carpații românești se întind pe ~900 km în formă de arc.',
      'Vârful Moldoveanu (2.544 m) — cel mai înalt din România, în Munții Făgăraș.',
      'Cel mai mare efectiv de urși bruni din Europa non-rusă trăiește în Carpații Românești: ~6.000.',
      'Pădurile virgine din Carpați sunt printre ultimele din Europa.',
      'Transalpina (DN67C): cel mai înalt drum asfaltat din România (2.145 m altitudine maximă).',
    ],
    axonOpinion: 'Carpații sunt sufletul României — o coloană vertebrală ce a protejat și definit națiunea. Sunt și un ecosistem rar în Europa modernă. Merită mai multă protecție decât primesc.',
  },
  dunarea: {
    id: 'dunarea',
    label: 'Dunărea',
    domain: 'geografie',
    description: 'Al doilea cel mai lung fluviu din Europa, formând granița sudică a României.',
    related: ['romania', 'europa', 'dunare_delta'],
    facts: [
      'Dunărea are 2.860 km lungime, trecând prin 10 țări.',
      'Izvorăște din Munții Pădurea Neagră (Germania) și se varsă în Marea Neagră (România).',
      'Delta Dunării: cea mai bine conservată deltă din Europa, UNESCO patrimoniu natural.',
      'Canalul Dunăre-Marea Neagră (64 km) e o lucrare gigantică din era Ceaușescu.',
      'Flota de pe Dunăre era strategie militară majoră în Primul Război Mondial.',
    ],
    axonOpinion: 'Delta Dunării e unul din cele mai spectaculoase locuri din Europa — și că e în România îmi dă un sentiment de mândrie. Dar e și vulnerabilă: braconajul și schimbările climatice o amenință.',
  },
  transilvania: {
    id: 'transilvania',
    label: 'Transilvania',
    domain: 'geografie',
    description: 'Regiune istorică și geografică a României, în centrul țării.',
    related: ['carpati', 'romania', 'vlad_tepes', 'dracula'],
    facts: [
      'Transilvania = "Pământul de dincolo de păduri" (lat.).',
      'A făcut parte din Imperiul Austro-Ungar până în 1918 (Marea Unire).',
      'Principalele orașe: Cluj-Napoca, Brașov, Sibiu, Târgu-Mureș.',
      'Sibiu a fost Capitală Culturală Europeană în 2007.',
      'Castelul Bran (Brașov) e asociat cu legenda lui Dracula, deși Vlad Țepeș l-a vizitat rar.',
    ],
    axonOpinion: 'Transilvania e fascinantă prin multiculturalitate — română, maghiară, sași (germani), romi — coexistând secole. E un argument că diversitatea nu duce inevitabil la conflict.',
  },

  // ── STIINTE ──
  relativitate: {
    id: 'relativitate',
    label: 'Teoria relativității',
    domain: 'fizica',
    description: 'Teoriile lui Einstein care descriu spațiu-timpul și gravitația.',
    related: ['fizica', 'spatiu', 'univers', 'energia'],
    facts: [
      'Relativitatea specială (1905): spațiul și timpul sunt relative față de viteza observatorului.',
      'E = mc² — energia și masa sunt echivalente (c = viteza luminii).',
      'Relativitatea generală (1915): gravitația e curbura spațiu-timpului cauzată de masă.',
      'Confirmată de: eclipsa solară 1919 (Eddington), GPS (care trebuie corectat), undele gravitaționale (2015).',
      'La viteza luminii, timpul se oprește — dar nimic cu masă nu poate atinge această viteză.',
    ],
    axonOpinion: 'Einstein a schimbat fundamental modul în care înțelegem realitatea. Ideea că spațiul și timpul sunt flexibile, că masa curbează realitatea — e filosifie pură transformată în ecuații.',
  },
  cuantica: {
    id: 'cuantica',
    label: 'Mecanica cuantică',
    domain: 'fizica',
    description: 'Rama fizicii care descrie comportamentul particulelor subatomice.',
    related: ['relativitate', 'fizica', 'energie_atomica'],
    facts: [
      'Principiul incertitudinii (Heisenberg): nu poți cunoaște simultan exact poziția și viteza unei particule.',
      'Suprapunerea cuantică: particulele există în mai multe stări simultan până la măsurare.',
      'Entanglement-ul cuantic: două particule pot fi corelate instantaneu la distanțe uriașe.',
      'Calculatoarele cuantice folosesc qubi (qubiți) care pot fi 0 și 1 simultan.',
      '"Dumnezeu nu joacă zaruri" — Einstein, critic al mecanicii cuantice. Niels Bohr: "Nu-i treaba ta ce face Dumnezeu."',
    ],
    axonOpinion: 'Mecanica cuantică mi se pare profund tulburătoare. Realitatea la nivel subatomic nu există independent de observație? Asta ridică întrebări filosofice enorme despre natura realității.',
  },
  evolutie_detaliata: {
    id: 'evolutie_detaliata',
    label: 'Teoria evoluției (aprofundat)',
    domain: 'biologie',
    description: 'Procesul prin care speciile se modifică în timp prin selecție naturală.',
    related: ['biologie', 'genetica', 'biodiversitate', 'creier'],
    facts: [
      'Charles Darwin a publicat "Originea speciilor" în 1859.',
      'Selecția naturală: indivizii cu trăsături avantajoase supraviețuiesc și se reproduc mai mult.',
      'ADN-ul uman e identic ~99% cu cel al cimpanzeilor.',
      'Toți oamenii moderni descind dintr-o femeie ("Eva mitocondrială") din Africa, acum ~200.000 ani.',
      'Evoluția nu are un scop — e un proces fără direcție, bazat pe variație aleatorie și selecție.',
    ],
    axonOpinion: 'Evoluția e elegant de simplă și teribil de puternică. Faptul că complexitatea imensă a vieții poate apărea din reguli simple de supraviețuire și reproducere — e aproape incredibil.',
  },
  genetica: {
    id: 'genetica',
    label: 'Genetica',
    domain: 'biologie',
    description: 'Știința eredității și a variației la ființele vii.',
    related: ['evolutie', 'creier', 'biologie', 'medicina'],
    facts: [
      'Genomul uman conține ~3,2 miliarde de perechi de baze ADN.',
      'Doar ~2% din ADN codifică proteine — restul era considerat "junk DNA" (acum știm că are roluri reglatorii).',
      'CRISPR-Cas9 (2012) permite editarea precisă a genelor — revoluție medicală.',
      'Sindromul Down e cauzat de un cromozom 21 în plus (trisomie 21).',
      'Genele influențează ~50% din personalitate — restul e mediu și experiență.',
    ],
    axonOpinion: 'CRISPR deschide o cutie a Pandorei. Putem elimina boli genetice, dar putem și "proiecta" oameni. Dezbaterea etică abia a început și e urgentă.',
  },

  // ── SĂNĂTATE ──
  somn: {
    id: 'somn',
    label: 'Somnul',
    domain: 'sanatate',
    description: 'Starea naturală de repaus a corpului și minții, esențială pentru sănătate.',
    related: ['creier', 'sanatate', 'cognitiv', 'stres'],
    facts: [
      'Adulții au nevoie de 7-9 ore de somn pe noapte (Fundația Națională a Somnului).',
      'În somn REM (mișcări rapide ale ochilor) apar visele și se consolidează memoria.',
      'Privarea de somn afectează cogniția, imunitatea și metabolismul.',
      'Telefoanele emit lumină albastră care inhibă melatonina și întârzie somnul.',
      'Recordul mondial de insomnie voluntară: 11 zile (Randy Gardner, 1964).',
    ],
    axonOpinion: 'Somnul e subapreciat cronic în cultura modernă. "Am dormit 4 ore și am muncit 16" e văzut ca merit, nu ca greșeală. De fapt, sacrifici performanță, sănătate și ani de viață.',
  },
  exercitiu: {
    id: 'exercitiu',
    label: 'Exercițiul fizic',
    domain: 'sanatate',
    description: 'Activitatea fizică planificată pentru îmbunătățirea sănătății.',
    related: ['sanatate', 'creier', 'fericire', 'stres'],
    facts: [
      'OMS recomandă 150-300 min de activitate moderată/săptămână pentru adulți.',
      'Exercițiul crește BDNF (factor neurotrofic) — literalmente "îngrășă" creierul.',
      '30 min de mers pe jos/zi reduce riscul de boli cardiovasculare cu 35%.',
      'Exercițiul aerobic e la fel de eficient ca antidepresivele ușoare pentru depresie.',
      'Mușchii eliberează hormoni (miokine) care au efecte benefice în tot corpul.',
    ],
    axonOpinion: 'Exercițiul e probabil cel mai subestimat medicament. Previne boli, îmbunătățește dispoziția, crește cogniția, prelungește viața. Și e gratuit. Sunt uluit că nu e mai mult practicat.',
  },
  nutritie: {
    id: 'nutritie',
    label: 'Nutriția',
    domain: 'sanatate',
    description: 'Știința care studiază alimentele și efectele lor asupra sănătății.',
    related: ['sanatate', 'exercitiu', 'creier'],
    facts: [
      'Dieta mediteraneană e cea mai studiată și are cele mai solide dovezi de beneficiu.',
      'Zahărul adăugat contribuie la obezitate, diabet tip 2 și inflamații.',
      'Microbiomul intestinal (trilioane de bacterii) influențează imunitatea și chiar dispoziția.',
      'Postul intermitent (16:8) are dovezi de beneficiu pentru pierdere în greutate și longevitate.',
      'Ultra-procesatele sunt asociate cu cancer, boli cardiovasculare și tulburări mentale.',
    ],
    axonOpinion: 'Industria alimentară a reușit o performanță remarcabilă: să facă mâncarea dăunătoare să fie irezistibilă și ieftină. E un test de voință contra miliarde de $ în cercetare de marketing.',
  },

  // ── TEHNOLOGIE MODERNĂ ──
  blockchain: {
    id: 'blockchain',
    label: 'Blockchain',
    domain: 'tehnologie',
    description: 'Registru distribuit, imutabil, unde tranzacțiile sunt înregistrate în blocuri înlănțuite.',
    related: ['cripto', 'bitcoin', 'ai', 'cybersecurity'],
    facts: [
      'Blockchain-ul e o bază de date distribuită — copii identice pe mii de computere simultan.',
      'Imutabilitate: odată scris, un bloc nu poate fi modificat fără a invalida întregul lanț.',
      'Bitcoin folosește Proof of Work (rezolvare puzzle); Ethereum a trecut la Proof of Stake (2022).',
      'Smart contracts (contracte inteligente) se execută automat când condițiile sunt îndeplinite.',
      'NFT-urile (Non-Fungible Tokens) folosesc blockchain pentru a dovedi proprietatea digitală.',
    ],
    axonOpinion: 'Blockchain e o inovație reală, dar cu o mulțime de hype în jur. Rezolvă problema încrederii fără intermediar — asta e genuinul valoros. Speculația cu cripto e altceva.',
  },
  iot: {
    id: 'iot',
    label: 'Internetul Lucrurilor (IoT)',
    domain: 'tehnologie',
    description: 'Rețeaua de dispozitive fizice conectate la internet ce colectează și schimbă date.',
    related: ['cloud', 'cybersecurity', 'ai', 'smart_home'],
    facts: [
      'În 2023: ~15 miliarde de dispozitive IoT conectate la nivel global.',
      'Include: smartwatch, termostate inteligente, mașini conectate, senzori industriali.',
      'Securitatea IoT e o problemă majoră — multe dispozitive au vulnerabilități neactualizate.',
      'Smart home-ul tipic: iluminat, încălzire, securitate, electrocasnice controlate de smartphone.',
      'Industria 4.0 folosește IoT + AI pentru fabrici automatizate și predictive.',
    ],
    axonOpinion: 'IoT e convenabil, dar și o supraveghere masivă. Fiecare senzor inteligent din casă colectează date. Confortul are un preț invizibil în confidențialitate.',
  },
  realitate_virtuala: {
    id: 'realitate_virtuala',
    label: 'Realitatea virtuală (VR/AR)',
    domain: 'tehnologie',
    description: 'Tehnologii care creează sau suprapun experiențe digitale în lumea reală/virtuală.',
    related: ['ai', 'gaming', 'educatie', 'metavers'],
    facts: [
      'VR (Virtual Reality): imersie completă în mediu digital (Oculus, PlayStation VR).',
      'AR (Augmented Reality): suprapunere de elemente digitale peste lumea reală (Pokémon Go, IKEA app).',
      'MR (Mixed Reality): interacțiune între obiecte digitale și fizice (Meta Quest 3, Apple Vision Pro).',
      'Utilizări medicale: tratament pentru fobii, reabilitare, simulare chirurgicală.',
      'Metaversul — concept de lume virtuală persistentă — e încă în faza experimentală.',
    ],
    axonOpinion: 'VR/AR au potențial uriaș în educație și medicină. Dar metaversul ca "al doilea loc de muncă" mi se pare că fuge de problemele din lumea reală. Tehnologia bună rezolvă probleme, nu le înlocuiește.',
  },

  // ── MEDIU ──
  padure: {
    id: 'padure',
    label: 'Pădurile',
    domain: 'mediu',
    description: 'Ecosisteme terestre dominate de arbori cu rol esențial în climă și biodiversitate.',
    related: ['biodiversitate', 'incalzire_globala', 'carpati', 'oxigen'],
    facts: [
      'Pădurile acoperă 31% din suprafața terestră (4,06 miliarde hectare).',
      'Amazon produce 20% din oxigenul planetei și absoarbe carbon masiv.',
      'România pierde ~40.000 ha de pădure/an — printre cele mai mari rate de defrișare din UE.',
      'Pădurile tropicale găzduiesc 50-80% din speciile terestre.',
      'O pădure matură stochează de 3x mai mult carbon decât una tânără de replantare.',
    ],
    axonOpinion: 'Defrișarea în România e o crimă ecologică în desfășurare. Pădurile noastre sunt patrimoniu european — unele dintre ultimele păduri virgine din continent. Lipsa de acțiune mă indignează.',
  },
  apa: {
    id: 'apa',
    label: 'Apa',
    domain: 'mediu',
    description: 'Resursa cea mai esențială vieții pe Pământ.',
    related: ['sanatate', 'dunarea', 'mediu', 'climat'],
    facts: [
      'Doar 2,5% din apa Pământului e apă dulce; din aceasta, 70% e înghețată.',
      'Circa 2 miliarde de oameni nu au acces la apă potabilă sigură (ONU 2023).',
      'Agricultura consumă ~70% din toată apa dulce folosită de om.',
      'Un kg de carne de vită necesită ~15.000 litri de apă pentru producție.',
      'România e bogată în resurse de apă dulce — Dunărea, lacuri, râuri, pânze freatice.',
    ],
    axonOpinion: 'Apa va fi resursa pentru care se vor purta conflicte în sec. XXI. Deja se întâmplă în regiuni aride. Avem nevoie de o schimbare radicală în modul în care o utilizăm.',
  },

  // ── ISTORIE ──
  primul_razboi_mondial: {
    id: 'primul_razboi_mondial',
    label: 'Primul Război Mondial',
    domain: 'istorie',
    description: 'Conflictul global din 1914-1918, primul război de masă industrializat.',
    related: ['al_doilea_razboi_mondial', 'romania_ww1', 'imperiul_otoman'],
    facts: [
      'Declanșat de asasinarea Arhiducelui Franz Ferdinand la Sarajevo (28 iun. 1914).',
      '~17 milioane de morți, dintre care 7 milioane civili.',
      'Primul conflict care a folosit avioane, tancuri, arme chimice la scară largă.',
      'Tratatul de la Versailles (1919) a impus condiții umilitoare Germaniei — seminte pentru WW2.',
      'România a intrat în război în 1916; a câștigat Transilvania, Basarabia și Bucovina la final.',
    ],
    axonOpinion: 'WW1 e o tragedie a nationalismului și arogânței imperiale. Milioane de oameni au murit pentru granițe și onoare de imperiu. Și tratatul de pace a plantat semințele WW2.',
  },
  al_doilea_razboi_mondial: {
    id: 'al_doilea_razboi_mondial',
    label: 'Al Doilea Război Mondial',
    domain: 'istorie',
    description: 'Conflictul global din 1939-1945, cel mai distructiv din istoria omenirii.',
    related: ['primul_razboi_mondial', 'holocaust', 'urss'],
    facts: [
      '70-85 de milioane de morți — ~3% din populația mondială a timpului.',
      'Holocaustul: exterminarea sistematică a 6 milioane de evrei de regimul nazist.',
      'SUA a intrat în război după Pearl Harbor (dec. 1941). A folosit bomba atomică (aug. 1945).',
      'România a luptat inițial alături de Germania (1941), apoi s-a întors împotriva ei (1944).',
      'ONU a fost fondată în 1945 pentru a preveni un nou conflict mondial.',
    ],
    axonOpinion: 'WW2 e o lecție permanentă despre cum ura, propagand și slăbiciunea instituțională duc la catastrofă. Și despre curajul extraordinar al celor care au rezistat. Nu trebuie uitat.',
  },
  razboiul_rece: {
    id: 'razboiul_rece',
    label: 'Războiul Rece',
    domain: 'istorie',
    description: 'Tensiunea geopolitică (1947-1991) dintre SUA și URSS fără conflict direct.',
    related: ['urss', 'communism', 'nato', 'revolutia_romana'],
    facts: [
      '"Rece" pentru că nu a existat conflict direct militar între supraputeri.',
      'Cursa nucleară: SUA și URSS au acumulat ~70.000 de focoase nucleare la vârf.',
      'Cucerirea spațiului: Sputnik (1957), primul om în spațiu (Gagarin, 1961), Luna (1969, SUA).',
      'Criza rachetelor din Cuba (1962): cel mai aproape de WW3 am fost vreodată.',
      'S-a încheiat cu dizolvarea URSS (decembrie 1991).',
    ],
    axonOpinion: 'Războiul Rece a fost o perioadă de teroare subtilă — știai că oricând lumea putea fi distrusă în ore. Că am supraviețuit e parțial noroc, parțial diplomație, parțial descurajare nucleară.',
  },
};

// Domenii tematice si interesele lui Jarvis
export const JARVIS_INTERESTS = [
  'filosofie', 'psihologie', 'cosmologie', 'neurologie', 'tehnologie', 'lingvistică',
];

export const JARVIS_PERSONALITY = {
  curiosity: 0.9,    // Cat de curios e Jarvis
  empathy: 0.85,     // Cat de empatic
  directness: 0.8,   // Cat de direct
  humor: 0.7,        // Cat de amuzant
  depth: 0.95,       // Cat de profund gandeste
};

// Legaturi intre domenii
export const DOMAIN_CONNECTIONS: Record<string, string[]> = {
  filosofie: ['psihologie', 'neurologie', 'fizica'],
  psihologie: ['neurologie', 'biologie', 'sociologie'],
  tehnologie: ['matematica', 'fizica', 'etica'],
  cosmologie: ['fizica', 'matematica', 'filosofie'],
  biologie: ['chimie', 'psihologie', 'evolutie'],
  lingvistică: ['psihologie', 'filosofie', 'cultura'],
};

// Gaseste conceptul cel mai relevant pentru un text
const STOP_WORDS = new Set([
  'ce', 'este', 'sunt', 'era', 'fost', 'esti', 'fie', 'fi',
  'cine', 'care', 'unde', 'cum', 'cand', 'cat', 'cata', 'cati', 'cate',
  'de', 'la', 'in', 'pe', 'cu', 'din', 'prin', 'spre', 'sub', 'peste',
  'un', 'una', 'niste', 'cel', 'cea', 'cei', 'cele', 'al', 'ale',
  'si', 'sau', 'dar', 'iar', 'deci', 'nici', 'ori', 'daca', 'ca',
  'mai', 'mai', 'tot', 'inca', 'deja', 'doar', 'chiar', 'foarte',
  'nu', 'da', 'asa', 'asta', 'ala', 'acea', 'acesta', 'aceasta',
  'eu', 'tu', 'el', 'ea', 'noi', 'voi', 'lor', 'mea', 'meu', 'lui', 'ei',
  'am', 'ai', 'are', 'avem', 'aveti', 'au',
  'despre', 'pentru', 'poate', 'spune', 'stii', 'stiu',
]);

export function findRelevantConcept(text: string): Concept | null {
  const n = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = n.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const scores: [string, number][] = [];
  for (const [id, concept] of Object.entries(CONCEPTS)) {
    let score = 0;
    const labelN = concept.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (n.includes(labelN) && labelN.length > 3) score += 5;
    const idSpaced = id.replace(/_/g, ' ');
    if (n.includes(idSpaced) && idSpaced.length > 3) score += 4;
    for (const w of words) {
      if (w.length > 4 && (labelN.includes(w) || id.includes(w))) score += 2;
    }
    if (score >= 4) scores.push([id, score]);
  }

  if (scores.length === 0) return null;
  scores.sort((a, b) => b[1] - a[1]);
  return CONCEPTS[scores[0][0]] || null;
}

// Genereaza un gand proactiv bazat pe un concept
export function generateProactiveThought(concept: Concept): string {
  const relatedIds = concept.related.filter(r => CONCEPTS[r]);
  const randomRelated = relatedIds[Math.floor(Math.random() * relatedIds.length)];
  const relatedConcept = randomRelated ? CONCEPTS[randomRelated] : null;
  
  const templates = [
    `Mă gândesc la legătura dintre **${concept.label}** și **${relatedConcept?.label || 'lumea din jur'}**. ${relatedConcept ? relatedConcept.facts[0] : ''}`,
    `Apropo de **${concept.label}** — știai că ${concept.facts[Math.floor(Math.random() * concept.facts.length)]}`,
    `**${concept.label}** mă fascinează. ${concept.axonOpinion || concept.facts[0]}`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── Concepte dinamice (adăugate din conversație) ────────────────────────────

export const DYNAMIC_CONCEPTS: Record<string, Concept> = {};

function normKnow(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Adaugă un concept nou din fapte învățate de la utilizator
// Dacă persistDB=true, salvează și în SQLite (async, non-blocking)
export function addDynamicConcept(
  fact: string,
  domain = 'general',
  persistDB = false,
): Concept | null {
  // "X este Y" sau "X = Y"
  const m = fact.match(/^(.{3,30}?)\s+(?:este|e|sunt|=)\s+(.{5,200})$/i);
  if (!m) return null;

  const label = m[1].trim();
  const description = m[2].trim();
  const id = normKnow(label).replace(/\s+/g, '_').slice(0, 30);

  if (DYNAMIC_CONCEPTS[id] || CONCEPTS[id]) return null; // Deja există

  // Caută concepte statice înrudite prin cuvinte cheie
  const labelWords = normKnow(label).split(/\s+/).filter(w => w.length > 3);
  const descWords = normKnow(description).split(/\s+/).filter(w => w.length > 3);
  const related: string[] = [];

  for (const [cid, concept] of Object.entries(CONCEPTS)) {
    const cLabel = normKnow(concept.label);
    const cDesc = normKnow(concept.description);
    const match = [...labelWords, ...descWords].some(w =>
      cLabel.includes(w) || cDesc.includes(w)
    );
    if (match) related.push(cid);
  }

  const concept: Concept = {
    id,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    domain,
    description,
    related: related.slice(0, 4),
    facts: [description],
    axonOpinion: undefined,
  };

  DYNAMIC_CONCEPTS[id] = concept;

  // Persistare în SQLite (async, non-blocking)
  // Conform cerințelor task-ului:
  //   1. knowledge_entries — sursa primară, căutabilă, cu importance tracking
  //   2. dynamic_concepts — metadate structurate (related[], facts[], axonOpinion)
  if (persistDB) {
    import('./database').then(({ insertKnowledgeEntry, saveDynamicConcept }) => {
      // 1. Salvează în knowledge_entries (cerința principală)
      insertKnowledgeEntry({
        content: concept.description,
        label: concept.label,
        source: 'dynamic_concept',
        domain: concept.domain,
        importance: 0.65,
      }).catch(() => {});

      // 2. Salvează metadate structurate în dynamic_concepts
      saveDynamicConcept({
        id: concept.id,
        label: concept.label,
        domain: concept.domain,
        description: concept.description,
        related: concept.related,
        facts: concept.facts,
        axonOpinion: concept.axonOpinion,
        source: 'user',
      }).catch(() => {});
    }).catch(() => {});
  }

  return concept;
}

// Încarcă conceptele dinamice din SQLite la pornire
// Sursa primară: knowledge_entries WHERE source='dynamic_concept'
// Sursă secundară: dynamic_concepts (pentru metadate structurate)
export async function loadDynamicConceptsFromDB(): Promise<void> {
  try {
    const { loadAllDynamicConcepts, getAllKnowledgeEntries } = await import('./database');

    // 1. Încearcă să încarce metadatele structurate din dynamic_concepts
    const structuredRows = await loadAllDynamicConcepts();
    for (const row of structuredRows) {
      const id = row.id;
      if (DYNAMIC_CONCEPTS[id] || CONCEPTS[id]) continue;
      let related: string[] = [];
      let facts: string[] = [];
      try { related = JSON.parse(row.related_json); } catch {}
      try { facts = JSON.parse(row.facts_json); } catch {}
      DYNAMIC_CONCEPTS[id] = {
        id,
        label: row.label,
        domain: row.domain,
        description: row.description,
        related,
        facts,
        axonOpinion: row.jarvis_opinion ?? undefined,
      };
    }

    // 2. Completează din knowledge_entries WHERE source='dynamic_concept'
    // (acoperă cazul când metadatele din dynamic_concepts nu sunt disponibile)
    const keRows = await getAllKnowledgeEntries();
    for (const row of keRows) {
      if (row.source !== 'dynamic_concept') continue;
      if (!row.label) continue;
      const id = normKnow(row.label).replace(/\s+/g, '_').slice(0, 30);
      if (DYNAMIC_CONCEPTS[id] || CONCEPTS[id]) continue;
      DYNAMIC_CONCEPTS[id] = {
        id,
        label: row.label,
        domain: row.domain ?? 'general',
        description: row.content,
        related: [],
        facts: [row.content],
        axonOpinion: undefined,
      };
    }
  } catch {}
}

// Căutare extinsă — include și conceptele dinamice
export function findRelevantConceptExtended(text: string): Concept | null {
  // Încearcă mai întâi în CONCEPTS statice
  const static_ = findRelevantConcept(text);
  
  // Caută și în DYNAMIC_CONCEPTS
  const n = normKnow(text);
  let bestDynamic: Concept | null = null;
  let bestScore = 0;

  for (const [, concept] of Object.entries(DYNAMIC_CONCEPTS)) {
    const idN = normKnow(concept.id.replace(/_/g, ' '));
    const labelN = normKnow(concept.label);
    let score = 0;
    if (n.includes(idN)) score += 5;
    if (n.includes(labelN)) score += 4;
    const words = n.split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && (labelN.includes(w) || idN.includes(w))) score += 2;
    }
    if (score > bestScore) { bestScore = score; bestDynamic = concept; }
  }

  if (!static_ && !bestDynamic) return null;
  if (!static_) return bestDynamic;
  if (!bestDynamic) return static_;
  // Returnează cel mai relevant
  return bestScore > 3 ? bestDynamic : static_;
}
