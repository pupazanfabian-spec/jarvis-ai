import { norm, extractKeywords } from './semantic';

export const DICTIONAR: Record<string, string> = {
  // ── ȘTIINȚĂ & NATURĂ ──
  fotosinteza: 'Fotosinteza = procesul prin care plantele convertesc lumina solară, apa și CO₂ în glucoză și oxigen. Ecuație: 6CO₂ + 6H₂O + lumină → C₆H₁₂O₆ + 6O₂. Are loc în cloroplaste.',
  osmoza: 'Osmoza = trecerea unui solvent printr-o membrană semipermeabilă dinspre soluția diluată spre cea concentrată, până la echilibru de presiune osmotică.',
  metabolism: 'Metabolism = totalitatea reacțiilor chimice din organism. Catabolism (descompunere, eliberare energie) + Anabolism (sinteză, consum energie). Viteza depinde de greutate, vârstă, activitate.',
  celula: 'Celula = unitatea de bază a vieții. Procariotă (bacterii, fără nucleu) sau Eucariotă (cu nucleu). Descoperită de Hooke (1665). Corpul uman are ~37 trilioane de celule.',
  adn: 'ADN = molecula ereditară cu structura dublă helix (Watson & Crick, 1953). Baze azotate: adenina (A), timina (T), guanina (G), citozina (C). Codul vieții.',
  arn: 'ARN = implicat în sinteza proteinelor. Tipuri: mARN (mesager) — transportă codul; rARN (ribozomal) — face sinteza; tARN (transfer) — aduce aminoacizii.',
  gravitatie: 'Gravitația = forța de atracție dintre orice mase. g ≈ 9,81 m/s² la suprafața Pământului. Newton: F=Gm₁m₂/r². Einstein: gravitația = curbura spațiu-timpului.',
  electromagnetism: 'Electromagnetism = unificarea forțelor electrice și magnetice. Maxwell (1865) — 4 ecuații. Lumina = undă electromagnetică. Baza televizoarelor, radioului, Wi-Fi.',
  termodinamica: 'Termodinamica — 4 legi: 0-echilibru termic; 1-energia se conservă; 2-entropia crește; 3-la zero absolut (-273,15°C) entropia tinde spre minimum.',
  chimie: 'Chimia = știința structurii și transformărilor substanțelor. Ramuri: organică (carbon), anorganică, fizică, analitică, biochimie. Tabelul periodic: 118 elemente.',
  fizica: 'Fizica = știința proprietăților fundamentale ale materiei și energiei. Ramuri: mecanică, termodinamică, optică, electromagnetism, mecanică cuantică, relativitate.',
  biologie: 'Biologia = știința vieții. Studiază structura, funcțiile, evoluția și distribuția organismelor. Ramuri: botanică, zoologie, genetică, ecologie, microbiologie.',
  matematica: 'Matematica = știința structurilor abstracte. Ramuri: aritmetică, algebră, geometrie, analiză matematică, statistică, probabilități, logică matematică.',
  algoritm: 'Algoritmul = secvență finită de instrucțiuni pentru rezolvarea unei probleme. Proprietăți: finitudine, claritate, input/output. Baza tuturor programelor.',
  programare: 'Programarea = scrierea instrucțiunilor executate de calculatoare. Paradigme: imperativă, OOP, funcțională, declarativă. Limbaje: Python, JavaScript, Java, C++, Rust.',
  calculator: 'Calculatorul = mașină electronică ce procesează date. Componente: CPU (procesare), RAM (memorie rapidă), SSD/HDD (stocare), GPU (grafică), placă de bază.',
  internet: 'Internetul = rețea globală de calculatoare bazată pe TCP/IP. A evoluat din ARPANET (1969). ~5 miliarde utilizatori azi. Funcționează prin pachete de date.',
  inflatie: 'Inflația = creșterea generalizată a prețurilor și scăderea puterii de cumpărare. Măsurată prin IPC. Cauzată de: cerere > ofertă, tipar monetar, costuri de producție.',
  pib: 'PIB = Produsul Intern Brut — valoarea totală a bunurilor și serviciilor produse într-o țară într-un an. Principal indicator economic. PIB/locuitor = nivel de trai.',
  democratie: 'Democrația = sistem de guvernare în care puterea aparține poporului. Principii: separarea puterilor, libertăți individuale, alegeri libere, stat de drept.',
  ecosistem: 'Ecosistemul = comunitate de organisme + mediu abiotic (apă, sol, aer). Ciclurile: al carbonului, azotului, apei. Exemple: pădure, lac, recif de corali, deșert.',
  clima: 'Clima = condițiile meteorologice medii ale unei regiuni pe ≥30 ani. Tipuri: tropicală, temperată, polară, aridă. Schimbările climatice: creșterea temperaturii cu ~1,1°C din 1880.',
  muzica: 'Muzica = organizarea sunetelor în timp. Activează simultan toate regiunile creierului. Frisoane muzicale (chills) = dopamină. ~60 bpm → sincronizează undele cerebrale alfa.',
  arhitectura: 'Arhitectura = arta și știința proiectării clădirilor. Stiluri: doric, ionic, romanic, gotic, renascentist, baroc, neoclasic, modernist, contemporan, brutalista.',
  constiinta: 'Conștiința = starea de conștientizare a sinelui și mediului. "Problema dificilă" (Chalmers): de ce există experiența subiectivă? Teorii: IIT (Tononi), Global Workspace.',
  inteligenta: 'Inteligența = capacitatea de a înțelege, raționa, rezolva probleme și te adapta. Gardner (1983): 8 forme — lingvistică, logică, spațială, muzicală, corporal-kinestezică, interpersonală, intrapersonală, naturalistă.',
  evolutie: 'Evoluția = schimbarea frecvenței trăsăturilor ereditare. Darwin (1859): selecție naturală. Oamenii și cimpanzeii: 98,7% ADN comun. Ochiul a evoluat independent de 40+ ori.',
  univers: 'Universul = totalitatea spațiului, timpului, materiei și energiei. Vârstă: ~13,8 miliarde ani. Diametru observabil: ~93 miliarde ani-lumină. Materia obișnuită = 5%, materie neagră 27%, energie neagră 68%.',
  timp: 'Timpul = dimensiunea în care evenimentele se succed. Einstein: relativ — curge mai lent lângă mase mari și la viteze mari. La viteza luminii, s-ar opri complet.',
  etica: 'Etica = filosofia valorilor morale. Utilitarism (Mill): maximizarea fericirii totale. Deontologie (Kant): obligații absolute. Etica virtuții (Aristotel): cultivarea caracterului.',
  fericire: 'Fericirea = starea de bunăstare și satisfacție față de viață. Harvard Study (80 ani): relațiile de calitate sunt cel mai bun predictor. Adaptare hedonică: revenim la nivelul bazal.',
  limbaj: 'Limbajul = sistemul structurat de comunicare. ~7.000 limbi vorbite, una moare la 2 săptămâni. Chomsky: gramatică universală înnăscută. 70% din comunicare e nonverbală.',
  creativitate: 'Creativitatea = generarea de idei noi prin recombinarea conceptelor existente. Flow (Csikszentmihalyi) = starea optimă. Incubarea e reală: creierul lucrează inconștient.',
  memorie: 'Memoria = stocarea, consolidarea și recuperarea informațiilor. Lucru: ~7±2 elemente (Miller). Pe termen lung: practic nelimitată. Amintirile se reconstruiesc la fiecare acces — se pot distorsiona.',
  spatiu: 'Spațiul cosmic = extensia infinită. Proxima Centauri: 4,24 ani-lumină. Lumina Soarelui ajunge în 8 min. Găurile negre: gravitație atât de mare că nici lumina nu scapă.',
  energie: 'Energia = capacitatea de a efectua lucru mecanic. Forme: cinetică, potențială, termică, luminoasă, chimică, nucleară. Conservarea energiei: nu se creează, nu se distruge, se transformă.',
  atom: 'Atomul = cea mai mică unitate a unui element. Nucleu (protoni+neutroni) + electroni în orbite. Dimensiune: ~0,1nm. Dacă atomul ar fi o minge de fotbal, nucleul ar fi un bob de nisip.',
  cuantic: 'Mecanica cuantică = fizica la scara atomică. Superpoziție (particula e în mai multe stări simultan), entanglement (particule conectate instantaneu), principiul incertitudinii (Heisenberg).',
  relativitate: 'Relativitatea: specială (1905) — E=mc², nimic nu depășește viteza luminii; generală (1915) — gravitația = curbura spațiu-timpului. Confirmată prin GPS (ceasurile de pe sateliți curg diferit).',
  entropia: 'Entropia = măsura dezordinii unui sistem. Legea 2 termodinamicii: entropia unui sistem închis crește mereu. Explicată de ce cafeaua se răcește și nu se încălzește singură.',
  inteligenta_artificiala: 'AI = sisteme care simulează inteligența umană. Machine Learning: învățare din date. Deep Learning: rețele neuronale stratificate. ChatGPT: 175 miliarde parametri (GPT-3). AI depășește oamenii la șah, Go, radiologie.',
  blockchain: 'Blockchain = registru distribuit, imuabil, criptografic. Fiecare bloc conține date + hash-ul blocului precedent. Stă la baza Bitcoin (2009), Ethereum, NFT-urilor.',
  dna: 'ADN = molecula ereditară. Codul genetic: 4 litere (A,T,G,C), 3 miliarde perechi de baze la om. Dacă ai derula tot ADN-ul din corpul tău, ar ajunge de la Pământ la Pluton de 17 ori.',

  // ── SĂNĂTATE & MEDICINĂ ──
  cancer: 'Cancerul = creștere necontrolată a celulelor. 100+ tipuri. Cauze: mutații genetice, factori de mediu, stil de viață. Tratamente: chirurgie, chimioterapie, radioterapie, imunoterapie.',
  diabet: 'Diabetul = incapacitatea de a regla glicemia. Tip 1: autoimun — pancreasul nu produce insulină. Tip 2: rezistență la insulină — legat de stilul de viață. Afectează 537 mil. oameni global.',
  hipertensiune: 'Hipertensiunea arterială = presiunea sângelui > 130/80 mmHg. "Ucigașul tăcut" — fără simptome clare. Cauze: stres, alimentație, sedentarism, genetic. Riscuri: infarct, AVC.',
  covid: 'COVID-19 = boală cauzată de SARS-CoV-2. Simptome: febră, tuse, oboseală, pierderea mirosului/gustului. Pandemia 2020-2022: ~7 milioane decese oficiale. Vaccinurile ARNm — primă utilizare la scară largă.',
  gripa: 'Gripa = infecție virală (virusul Influenza). Simptome: febră >38°C, dureri musculare, oboseală intensă, tuse. Sezonul: octombrie-martie. Vaccinul gripal se actualizează anual.',
  antibiotic: 'Antibioticele = medicamente care combat bacteriile. Primul: penicilina (Fleming, 1928). NU funcționează pe virusuri! Rezistența la antibiotice = criză globală de sănătate.',
  vaccin: 'Vaccinurile = substanțe care stimulează sistemul imunitar să recunoască agenți patogeni. Elimină boli precum variola (eradicată 1980), reduc drastic poliomielita, rujeola.',
  somn: 'Somnul = stare fiziologică esențială. Adult: 7-9 ore/noapte. Fazele REM (visare, consolidare memorie) și non-REM (odihnă fizică, reparare celulară). Lipsa somnului = sistem imunitar slăbit, probleme cognitive.',
  nutritie: 'Nutriția = știința alimentației și a impactului asupra sănătății. Macronutrienți: carbohidrați (4 kcal/g), proteine (4 kcal/g), grăsimi (9 kcal/g). Micronutrienți: vitamine, minerale.',
  sport: 'Exercițiile fizice: aerobice (inimă, rezistență) + anaerobice (forță, musculatură). OMS recomandă 150 min/săptămână activitate moderată. Beneficii: cardiovasculare, cognitiv, psihologic.',
  sistem_imunitar: 'Sistemul imunitar = apărarea corpului. Înnăscut (rapid, nespecific) + dobândit (lent, specific, cu memorie). Limfocite T și B, anticorpi, citokine.',
  sange: 'Sângele = lichid vital ce transportă O₂, CO₂, nutrienți, hormoni. Componente: eritrocite (globule roșii), leucocite (albe), trombocite, plasmă. Grupe: A, B, AB, O (± Rh).',
  plamani: 'Plămânii = organele respirației. Suprafața totală alveolară: ~70m². Inspirație: diafragma coboară → aer intră. Exspirație: invers. Un adult respiră ~20.000 ori/zi.',
  ficat: 'Ficatul = cel mai mare organ intern (~1,5kg). Funcții: detoxifiere, producere bilă, metabolizare glucoză, sinteză proteine, depozitare vitamine. Se poate regenera!',
  rinichi: 'Rinichii = 2 organe care filtrează sângele. Produc ~1,5L urină/zi. Reglează tensiunea, echilibrul electrolitic, pH-ul sângelui. Fiecare rinichi: ~1 milion de nefroni.',
  coloana: 'Coloana vertebrală = 33-34 vertebre: cervicale (7), toracice (12), lombare (5), sacrale (5), coccigiene (4). Protejează măduva spinării. Discopatia = comprimarea discurilor.',
  muschi: 'Mușchii = ~600 în corpul uman. Tipuri: scheletici (voluntari), cardiaci (inimă), netezi (organe). Cel mai puternic: maserul (maxilar). Cel mai mare: gluteus maximus.',
  anxietate: 'Anxietatea = îngrijorare excesivă față de situații viitoare. Tulburare anxioasă generalizată, atacuri de panică, fobie socială. Tratament: terapie cognitiv-comportamentală + uneori medicație.',
  depresie: 'Depresia = tulburare a dispoziției cu tristețe persistentă, pierderea interesului, oboseală. A 2-a cauză de dizabilitate globală. Tratament: psihoterapie, antidepresive, exerciții fizice.',
  stres: 'Stresul = răspunsul corpului la amenințări percepute. Cortizol + adrenalina. Cronic: imunitate slabă, boli cardiovasculare, tulburări digestive. Acut: poate fi util (eustres).',

  // ── PSIHOLOGIE & MINDSET ──
  procrastinare: 'Procrastinarea = amânarea sarcinilor. Nu e lene — e dificultate în reglarea emoțională față de sarcinile neplăcute. Soluție: tehnica Pomodoro, "2 minute rule", reducerea fricii de eșec.',
  mindset: 'Mindset-ul fix (Dweck): abilitățile sunt fixe. Mindset de creștere: abilitățile se pot dezvolta. Mindset-ul de creștere e corelat cu reziliența, succesul academic și profesional.',
  obiceiuri: 'Obiceiurile = bucle neurologice: declanșator → rutină → recompensă (Duhigg). Formarea durează 18-254 zile (nu 21 cum se spune). Cheia: identitate, nu motivație.',
  productivitate: 'Productivitatea ≠ a fi ocupat. Principiul Pareto: 20% din efort produce 80% din rezultate. Tehnici: time-blocking, Pomodoro (25min muncă + 5min pauză), GTD (Getting Things Done).',
  comunicare: 'Comunicarea eficientă: 55% nonverbal (limbaj corporal), 38% paraverbal (ton, ritm), 7% verbal (cuvinte) — regula lui Mehrabian. Ascultarea activă > vorbitul.',
  empatie: 'Empatia = capacitatea de a înțelege și împărtăși emoțiile altora. Cognitivă (înțeleg ce simți) vs Afectivă (simt ce simți). Corelată cu succesul în relații și leadership.',
  inteligenta_emotionala: 'Inteligența emoțională (EQ) = conștientizare de sine, autoreglare, motivație, empatie, abilități sociale. Goleman (1995): EQ e mai predictiv al succesului decât IQ-ul.',
  locus_control: 'Locus de control intern: cred că eu controlez ce mi se întâmplă. Extern: soarta, alții decid. Internul e corelat cu succesul, sănătatea mentală și reziliența.',
  trauma: 'Trauma = răspunsul psihologic la un eveniment copleșitor. PTSD: flashback-uri, hipervigilență, evitare. Trauma se stochează în corp (Bessel van der Kolk). Terapia EMDR e eficientă.',
  rezilienta: 'Reziliența = capacitatea de a te recupera după adversitate. Nu înseamnă că nu te afectează — înseamnă că revii și crești. Se poate antrena: conexiuni sociale, sens, autoeficare.',
  relatii: 'Relațiile sănătoase: comunicare deschisă, limite sănătoase, respect, sprijin reciproc. Gottman: 4 "cavaleri ai apocalipsei" — critică, dispreț, defensivitate, stonewalling.',
  motivatie: 'Motivația: extrinsecă (recompense externe) vs intrinsecă (interes interior). Teoria autodeterminării (Deci&Ryan): nevoi de autonomie, competență, conexiune. Motivația extrinsecă poate înlocui pe cea intrinsecă.',

  // ── GEOGRAFIE & LUME ──
  europa: 'Europa = al doilea cel mai mic continent. 50 de țări, 746 milioane locuitori. Cel mai înalt vârf: Mont Blanc (4.808m). Uniunea Europeană: 27 state membre, 448 milioane cetățeni.',
  asia: 'Asia = cel mai mare continent. 44,5 milioane km², 4,7 miliarde oameni (60% din populația Pământului). 48 de țări. Conține Himalaya (Everest: 8.849m) și Marea Moartă (−430m).',
  africa: 'Africa = al doilea cel mai mare continent. 54 de țări, 1,4 miliarde oameni. Sahara = cel mai mare deșert cald (9,2 mil km²). Nil = cel mai lung fluviu (6.650km).',
  america: 'Americile = continentele din emisfera vestică. Nord (9 țări): SUA, Canada, Mexic. Sud (12 țări): Brazilia, Argentina, Columbia. Amazonia = cel mai mare pădure tropicală.',
  oceania: 'Oceania = regiune Pacific. Include Australia, Noua Zeelandă, Melanezia, Micronezia, Polinezia. Australia = 7,7 mil km², dar mai populată decât alte continente e... mai deloc.',
  oceanele: 'Oceanele acoperă 71% din Pământ. Pacific (cel mai mare, 165 mil km²), Atlantic, Indian, Arctic, Antarctic (cele 5). Cel mai adânc punct: Groapa Marianelor (11.034m).',
  muntii: 'Cei mai înalți munți: Everest (8.849m, Himalaya), K2 (8.611m), Kangchenjunga (8.586m). Cei mai lungi: Anzi (7.000km, America de Sud). Carpații (România): Moldoveanu 2.544m.',
  rauri: 'Cele mai lungi râuri: Nil (6.650km, Africa), Amazon (6.400km, America de Sud — cel mai mare ca volum), Yangtze (6.300km, China). Dunărea (2.860km) traversează 10 state europene.',
  capital: 'Capitale importante: Paris (Franța), Berlin (Germania), Madrid (Spania), Roma (Italia), Londra (UK), Beijing (China), Tokyo (Japonia), Washington D.C. (SUA), Moscova (Rusia).',
  romania: 'România = stat în Europa de Sud-Est. 238.397 km², ~19 milioane locuitor. Capitala: București. Membră UE din 2007, NATO din 2004. Regiuni: Muntenia, Transilvania, Moldova, Dobrogea, Oltenia, Banat.',
  bucuresti: 'București = capitala României. ~2,2 milioane locuitori (3 mil. cu zona metropolitană). Fondat oficial 1459. Cele mai mari atracții: Palatul Parlamentului (al 2-lea cel mai mare clădire administrativă din lume), Centrul Vechi, Herăstrău.',
  transilvania: 'Transilvania = regiune istorică a României, inima Arcului Carpatic. Orașe: Cluj-Napoca, Brașov, Sibiu, Timișoara. Zona Dracula (Castelul Bran). Diversitate etnică: români, maghiari, germani (sași).',
  dunarea: 'Dunărea = al doilea cel mai lung fluviu european (2.860km). Izvorăște din Pădurea Neagră (Germania). Delta Dunării (România) = UNESCO, o dintre cele mai mari delte din lume.',
  carpati: 'Carpații = lanț muntos în Europa Centrală și de Est (~1.500km). Vârful Moldoveanu (2.544m) = cel mai înalt din România. Acoperă ~35% din suprafața României.',

  // ── ISTORIE ──
  primul_razboi: 'Primul Război Mondial (1914-1918): declanșat de asasinarea Arhiducelui Franz Ferdinand. 4 ani, ~20 milioane morți. Implicat: Antanta (Franța, UK, Rusia) vs Puterile Centrale (Germania, Austria). România: 1916-1918.',
  al_doilea_razboi: 'Al Doilea Război Mondial (1939-1945): cel mai devastator conflict. 70-85 milioane morți. Holocaust: 6 milioane evrei exterminați. D-Day: 6 iunie 1944. Bombele atomice: Hiroshima, Nagasaki (august 1945).',
  razboiul_rece: 'Războiul Rece (1947-1991): SUA vs URSS — fără conflict direct. Cursa înarmării nucleare, spațiale. Cortina de Fier. Căderea Zidului Berlinului (1989). Dizolvarea URSS (1991).',
  imperiul_roman: 'Imperiul Roman (27 î.Hr.–476 d.Hr.): cel mai influent imperiu din istoria Occidentului. La apogeu: 5 milioane km². Limbă: latină (baza limbilor romanice). Legile, infrastructura, arhitectura — influențe până azi.',
  grecia_antica: 'Grecia Antică (sec. 8-4 î.Hr.): leagănul democrației, filosofiei (Socrate, Platon, Aristotel), matematicii (Euclid, Pitagora), teatrului. Atena & Sparta — rivalitate definitorie.',
  renastere: 'Renașterea (sec. 14-17): redeșteptare culturală în Europa. Da Vinci, Michelangelo, Rafael. Gutenberg (tiparul, 1440). Copernicus (heliocentrism). Trecerea de la Evul Mediu la modernitate.',
  revolutia_industriala: 'Revoluția Industrială (1760-1840, UK): mașina cu abur (Watt), fabricile, urbanizarea. Schimbare radicală: de la societate agrară la industrială. Baza lumii moderne.',
  revolutia_romana: 'Revoluția Română (1989): singura revoluție violentă din blocul socialist. 17-25 decembrie. ~1.100 morți. Căderea lui Ceaușescu. Primul stat ex-comunist care și-a executat conducătorul.',
  imperiul_otoman: 'Imperiul Otoman (1299-1922): unul din cele mai longevive imperii. La apogeu: 5,2 milioane km². Capitala: Constantinopol (Istanbul). Căderea: Primul Război Mondial și revoluția lui Atatürk.',

  // ── PERSONALITĂȚI ROMÂNE ──
  eminescu: 'Mihai Eminescu (1850-1889) = cel mai mare poet român. "Luceafărul", "Scrisori", "Odă (în metru antic)". Jurnalist la Curierul de Iași. A murit la 39 ani. Simbolul cultural al României.',
  caragiale: 'Ion Luca Caragiale (1852-1912) = dramaturgul național al României. Opere: "O scrisoare pierdută", "O noapte furtunoasă", "Năpasta". Portrete atemporale ale societății românești.',
  brancusi: 'Constantin Brâncuși (1876-1957) = sculptor revoluționar, părintele sculpturii moderne. "Coloana Infinitului" (Târgu-Jiu), "Sărutului", "Pasărea în spațiu". A trăit la Paris.',
  ceausescu: 'Nicolae Ceaușescu (1918-1989) = liderul comunist al României (1965-1989). Regim totalitar, cultul personalității, sistematizarea satelor. Executat la 25 decembrie 1989 cu soția Elena.',
  vlad_tepes: 'Vlad Țepeș (1431-1476/1477) = domnitor al Munteniei. Celebru pentru pedepsele cu țepuire aplicate dușmanilor. Inspirația pentru Dracula (Bram Stoker, 1897). Erou național în România.',
  stefan_cel_mare: 'Ștefan cel Mare (1433-1504) = domnitorul Moldovei 47 ani. 36 de victorii în 47 de bătălii. A construit 44 de mănăstiri și biserici. UNESCO l-a declarat "tezaur al umanității".',
  mihai_viteazul: 'Mihai Viteazul (1558-1601) = primul unificator al celor trei principate românești (1600). Domn al Munteniei, Transilvaniei și Moldovei simultan. Ucis la Câmpia Turzii.',

  // ── ECONOMIE & FINANȚE ──
  bursa: 'Bursa de valori = piață unde se tranzacționează acțiuni, obligațiuni, mărfuri. NYSE (New York): cea mai mare din lume. Indicatori: Dow Jones, S&P 500, NASDAQ. "Bear market" = scădere >20%, "Bull market" = creștere.',
  actiuni: 'Acțiunile = titluri de proprietate parțială în companii. Dividende = profituri distribuite. Câștig de capital = diferența de preț. Riscul e mai mare ca la obligațiuni, dar randamentul pe termen lung e superior.',
  investitii: 'Investițiile: regulă de bază — diversifică. ETF-urile (fonduri index) bat 90% din managerii activi pe termen lung. Dobânda compusă = "a 8-a minune a lumii" (Einstein). Investești devreme, investești constant.',
  cripto: 'Criptomonedele = monede digitale bazate pe blockchain. Bitcoin (2009, Satoshi Nakamoto): prima și cea mai valoroasă. Ethereum: platforma pentru smart contracts. Extreme de volatile — nu investiți ce nu vă permiteți să pierdeți.',
  bitcoin: 'Bitcoin = prima criptomonedă (2009). Creator anonim: Satoshi Nakamoto. Limitat la 21 milioane de monede. Proof of Work (minerit). Tranzacții ireversibile pe blockchain. Volatilitate extremă.',
  antreprenoriat: 'Antreprenoriatul = crearea și gestionarea afacerilor. SRL (Societate cu Răspundere Limitată) = forma comună în România. Startup = afacere scalabilă în faza inițială. 90% din startup-uri eșuează în 5 ani.',
  marketing: 'Marketingul = procesul de creare a valorii și comunicare cu clienții. 4P: Produs, Preț, Plasament, Promovare. Marketing digital: SEO, Social Media, Email, Ads. Content marketing > advertising clasic în 2024.',
  leadership: 'Leadershipul = influențarea altora spre un scop comun. Stiluri: autocratic, democratic, laissez-faire, transformațional. Liderii buni ascultă mai mult decât vorbesc.',

  // ── TEHNOLOGIE MODERNĂ ──
  cloud: 'Cloud computing = servicii IT la cerere prin internet. Modele: IaaS (infrastructură), PaaS (platformă), SaaS (software). Furnizori: AWS, Google Cloud, Azure. 94% din companii folosesc cloud.',
  cybersecurity: 'Cybersecurity = protejarea sistemelor digitale. Amenințări: phishing, ransomware, DDoS, SQL injection. Principii: confidențialitate, integritate, disponibilitate (CIA triad). Parola puternică = 12+ caractere, mix de caractere.',
  machine_learning: 'Machine Learning = AI care învață din date fără programare explicită. Supervizat (date etichetate), nesupervizat (găsire pattern-uri), reinforcement (recompense/penalizări). Baza Netflix, Spotify, recunoaștere facială.',
  python: 'Python = limbaj de programare simplu, versatil. Folosit pentru AI/ML (TensorFlow, PyTorch), web (Django, Flask), automatizare, știință de date. Al 3-lea cel mai popular limbaj (IEEE 2023).',
  javascript: 'JavaScript = limbajul web-ului. Rulează în browsere și pe server (Node.js). React, Angular, Vue = framework-uri front-end. Cel mai popular limbaj de programare (Stack Overflow, 10 ani la rând).',
  smartphone: 'Smartphone-ul = calculator de buzunar. iOS (Apple) vs Android (Google) = 99% din piață. Primul iPhone: 2007. Astăzi: >6,8 miliarde utilizatori de smartphone în lume.',
  retele_sociale: 'Rețelele sociale: Facebook (3 miliarde utilizatori), YouTube (2,5 miliarde), Instagram (2 miliarde), TikTok (1,5 miliarde), LinkedIn (1 miliard). Pot provoca dependență prin dopamină.',
  baterie: 'Bateriile Li-ion (litiu-ion) = standard pentru electronice. Inventate de Goodenough (Nobel 2019). Degradare în timp (cicluri de încărcare). Sfat: nu lăsa la 0% sau 100% constant.',
  solar: 'Energia solară = conversie a luminii solare în electricitate (celule fotovoltaice) sau căldură. Cost scăzut de 90% în 10 ani. Acoperă tot mai mult din mixul energetic global.',
  nuclear: 'Energia nucleară = fisiune (spargerea atomilor grei, ex. uraniu) sau fuziune (unirea atomilor ușori). Fisiunea: fără emisii CO₂, dar deșeuri radioactive. Fuziunea = viitorul energetic (ITER).',

  // ── FILOZOFIE & GÂNDIRE ──
  filosofie: 'Filosofia = "iubirea înțelepciunii" (gr.). Ramuri: ontologie (ce există?), epistemologie (ce cunoaștem?), etică (ce e bine?), logică (cum raționăm?), estetică (ce e frumos?). Fondatori: Socrate, Platon, Aristotel.',
  stoicism: 'Stoicismul = filozofie greacă (Epictetus, Marcus Aurelius, Seneca). Principiu: controlezi reacțiile, nu evenimentele. Dichotomia controlului: concentrează-te pe ce poți influența. Extrem de relevantă azi.',
  existentialism: 'Existențialismul (Sartre, Camus, Kierkegaard): existența precede esența — nu avem o natură prestabilită, ne creăm singuri sensul. Libertatea e radicală și înspăimântătoare.',
  budism: 'Budismul = tradiție spirituală fondată de Siddhartha Gautama (~500 î.Hr.). 4 Adevăruri Nobile: suferința există, vine din atașament, poate fi depășită, Calea de Mijloc. ~500 milioane adepți.',
  crestinism: 'Creștinismul = religie bazată pe viața și învățăturile lui Iisus Hristos. ~2,4 miliarde adepți (cea mai numeroasă). Ramuri: Catolicism, Protestantism, Ortodoxism. Biblia = cartea cea mai tradusă.',
  islam: 'Islamul = religie monoteistă fondată de Mohamed (~610 d.Hr.). ~1,9 miliarde adepți. 5 Piloni: shahada, rugăciune (5/zi), zakat (milostenie), post (Ramadan), hajj (pelerinaj). Coran = cartea sfântă.',
  logica: 'Logica = știința raționamentului corect. Deductivă (de la general la particular) vs Inductivă (de la particular la general). Silogism (Aristotel): dacă premisele sunt adevărate și forma e validă → concluzia e adevărată.',
  epistemologie: 'Epistemologia = ramura filosofiei care studiază cunoașterea. Ce putem ști? Cum știm că știm? Empirism (Locke, Hume): cunoașterea vine din experiență. Raționalism (Descartes, Leibniz): din rațiune.',

  // ── SPORT ──
  fotbal: 'Fotbalul = cel mai popular sport din lume. ~4 miliarde fani. FIFA = forumul de conducere. Campionatul Mondial: la 4 ani. Recorduri: Ronaldo & Messi — 800+ goluri fiecare. România: "Generația de Aur" (Hagi, Mutu, Popescu).',
  tenis: 'Tenisul = sport individual sau dublu, pe terenuri variate. Grand Slam-uri: Australian Open, Roland Garros (zgură), Wimbledon (iarbă), US Open. Djokovic: 24 titluri Grand Slam (record).',
  olimpiada: 'Jocurile Olimpice = competiție sportivă internațională la 4 ani. Vara (Paris 2024) și Iarna (Milano-Cortina 2026). Motto: "Citius, Altius, Fortius" (Mai repede, mai sus, mai puternic). Prima ediție modernă: Atena 1896.',
  gimnastica: 'Gimnastica = sport al eleganței și forței. România, istoric superputere mondială: Nadia Comăneci (primul 10 perfect la Montreal 1976), Daniela Silivaș, Lavinia Miloșovici.',
  nadia: 'Nadia Comăneci (n. 1961) = prima gimnastă care a obținut nota 10 perfectă la Jocurile Olimpice (Montreal, 1976). La 14 ani. A câștigat 3 medalii de aur la Montreal. Simbol al României.',

  // ── CULTURA & MEDIA ──
  cinema: 'Cinematografia: Hollywood (SUA) domină global. Oscar = cea mai prestigioasă distincție (din 1929). Filmele de box-office: Avatar, Avengers, Titanic. Cannes, Berlin, Veneția = festivaluri europene de top.',
  teatru: 'Teatrul = arta reprezentației live. Origini în Grecia Antică (Dionysus). Shakespeare: 37 de piese, cele mai jucate din lume. Teatrul românesc: Bulandra, Național, Odeon. TNB (București) = unul din cele mai mari din Europa.',
  literatura_romana: 'Literatura română: Eminescu (poetul național), Caragiale (satiră socială), Sadoveanu (epic rural), Călinescu ("Enigma Otiliei"), Rebreanu ("Ion"), Eliade (proză fantastică), Cioran (filosofie pesimistă).',
  cultura_pop: 'Cultura pop = cultura dominantă a maselor. Include muzică pop, film, TV, jocuri video, social media. K-pop (Coreea de Sud) = fenomen global. TikTok a redefinit industria muzicală.',

  // ── EDUCATIE & INVATARE ──
  invatare_eficienta: 'Cum înveți eficient: Active recall (testare activă) > citire pasivă. Spaced repetition (repetiție eșalonată) pe Anki. Tehnica Feynman: explică conceptul simplu. Somnul consolidează memoria. Pomodoro: 25+5 min.',
  bacalaureat: 'Bacalaureatul în România: examen de absolvire a liceului. Probe: Limbă și Literatură Română (scris + oral), Matematică sau Istorie (la profil), o probă la alegere. Media 6 = promovat.',
  universitate: 'Universitate = instituție de învățământ superior. În România: de stat (buget + taxă) și private. Admitere: note/concurs. Cicluri: Licență (3-6 ani), Master (1-2 ani), Doctorat (3+ ani).',

  // ── MEDIU & CLIMAT ──
  incalzire_globala: 'Încălzirea globală = creșterea temperaturii medii a Pământului. Cauza principală: emisii de CO₂ (arderea combustibililor fosili). +1,1°C față de 1880. Consecințe: topirea ghețarilor, evenimente extreme, creșterea nivelului mării.',
  energie_regenerabila: 'Energia regenerabilă: solară (fotovoltaică + termică), eoliană (turbine), hidro, geotermală, biomasă. Cost în scădere dramatică. Obiectiv UE: 42,5% regenerabil până în 2030.',
  deseuri: 'Gestionarea deșeurilor: reducere → reutilizare → reciclare → recuperare → eliminare (ierarhia). România reciclează ~14% (sub media UE de 48%). Plasticul din ocean: 8 milioane tone/an.',
  biodiversitate: 'Biodiversitatea = varietatea vieții pe Pământ. ~8,7 milioane specii estimate, catalogate 1,2 milioane. Rata actuală de extincție: de 100-1000x mai mare decât normal. Al 6-lea val de extincție în masă.',

  // ── ASTRONOMIE ──
  sistemul_solar: 'Sistemul Solar = Soarele + 8 planete (Mercur, Venus, Pământ, Marte, Jupiter, Saturn, Uranus, Neptun). Soarele = 99,86% din masa sistemului. Centura Kuiper, norul Oort — la margine.',
  soarele: 'Soarele = steaua noastră. Diametru: 1,4 milioane km (109x Pământul). Temperatura suprafeței: 5.778K. Trăiește de 4,6 miliarde ani, mai are ~5 miliarde. Sursa: fuziune nucleară (H→He).',
  luna: 'Luna = singurul satelit natural al Pământului. Distanță: 384.400 km. Influențează mareele. Apollo 11: primul om pe Lună (21 iulie 1969, Neil Armstrong). Se depărtează cu ~3,8cm/an.',
  stele: 'Stelele = sfere uriașe de plasmă ce emit lumina prin fuziune nucleară. Clasificare spectral: O, B, A, F, G (Soarele), K, M. Gigante roșii, pitice albe, stele de neutroni, găuri negre — stadii finale.',
  gauri_negre: 'Găurile negre = regiuni cu gravitație atât de intensă că nici lumina nu poate scăpa. Formate din stele masive prăbușite. Prima fotografie: 2019 (M87). Singularitatea: punctul infinit de dens din centru.',

  // ── ALIMENTAȚIE ──
  alimentatie_sanatoasa: 'Alimentație sănătoasă: varietate, moderație, echilibru. Piramida alimentară: baza = fructe, legume, cereale integrale; mijloc = proteine slabe, lactate; vârf = zahăr, grăsimi. 5 porții fructe+legume/zi = standard OMS.',
  hidratare: 'Hidratarea: corpul e 60% apă. Adulți: 2-3L/zi (variază după activitate, climă). Deshidratarea ușoară (1-2%) afectează concentrarea și dispoziția. Cafea și ceai contează la aport (contrar mitului).',
  cafea: 'Cafeaua = a doua cea mai consumată băutură din lume (după apă). Cafeina blochează adenozina (somnolența). 400mg cafeină/zi = sigur (OMS, ~4 cești). Beneficii: atenție, performanță cognitivă, protecție Alzheimer.',
  alcool: 'Alcoolul etilic = deprimant al SNC. "Nu există doză sigură de alcool" (OMS 2023). Dependență: alcoolismul. Efecte: ficat, creier, sistem cardiovascular, sistem imunitar. Metabolism: 1 unitate/oră în medie.',

  // ── LIMBĂ ROMÂNĂ ──
  limba_romana: 'Limba română = limbă romanică (latină populară + elemente dacice, slave, greacă, turcă). ~28 milioane vorbitori. Alfabetul: 31 litere (5 specifice: ă, â, î, ș, ț). Dialecte: dacoromân, aromân, meglenoromân, istroromân.',
  gramatica: 'Gramatica română: 3 genuri (masculin, feminin, neutru). 5 cazuri (nominativ, acuzativ, genitiv, dativ, vocativ). Articolul hotărât se atașează la sfârșit: "om" → "omul". Verbele: 4 conjugări.',
};

export function searchDictionary(text: string): string | null {
  const n = norm(text);

  // Pattern explicit de întrebare
  const explicitMatch = n.match(
    /(?:ce (?:este|inseamna|e|sunt)|definitia|defineste|explica(?:-mi)?|spune-mi despre|ce stii despre|ce reprezinta|spune-mi ce este|vorbeste-mi despre|povesteste-mi despre|ce poti spune despre|info despre|informatii despre)\s+(.+)/
  );

  let subject = '';
  if (explicitMatch) {
    subject = explicitMatch[1].trim()
      .replace(/^(un|o|al|a|lui|ei|cel|cea|despre)\s+/i, '')
      .replace(/\?$/, '').trim();
  }

  const searchIn = subject || n;
  const searchKws = extractKeywords(searchIn, 4);

  let bestKey = '';
  let bestScore = 0;

  for (const [key] of Object.entries(DICTIONAR)) {
    const kn = key.replace(/_/g, ' ');
    let score = 0;

    // Match exact
    if (searchIn === kn || searchIn === key) { score = 100; }
    // Conține key exact
    else if (searchIn.includes(kn) || searchIn.includes(key)) { score = 80; }
    // Key conține searchIn
    else if (kn.includes(searchIn)) { score = 60; }
    else {
      // Match pe cuvinte cheie
      const keyWords = kn.split(/\s+/);
      for (const kw of keyWords) {
        if (kw.length < 3) continue;
        for (const sw of searchKws) {
          if (sw === kw) score += 15;
          else if (sw.length > 4 && kw.length > 4) {
            // Prefix match (stem românesc)
            const prefLen = Math.min(5, sw.length, kw.length);
            if (sw.slice(0, prefLen) === kw.slice(0, prefLen)) score += 8;
          }
        }
      }
      // Bonus pentru match în searchIn
      if (searchIn.includes(kn.split(/\s+/)[0])) score += 5;
    }

    if (score > bestScore) { bestScore = score; bestKey = key; }
  }

  const minScore = explicitMatch ? 8 : 60;
  if (bestKey && bestScore >= minScore) {
    const def = DICTIONAR[bestKey];
    const rawLabel = subject || bestKey.replace(/_/g, ' ');
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
    return `**${label}**\n\n${def}`;
  }
  return null;
}

export function findDictEntryByKeywords(text: string): { key: string; def: string; score: number } | null {
  const n = norm(text);
  const words = n.split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return null;

  let bestKey = '';
  let bestScore = 0;

  for (const [key] of Object.entries(DICTIONAR)) {
    const kn = key.replace(/_/g, ' ');
    let score = 0;
    if (n === kn) { score = 100; }
    else if (n.includes(kn)) { score = 50; }
    else if (kn.includes(n)) { score = 40; }
    else {
      const keyWords = kn.split(/\s+/);
      for (const kw of keyWords) {
        if (kw.length > 3) {
          for (const w of words) {
            if (w === kw) score += 10;
            else if (w.length > 4 && (w.startsWith(kw.slice(0, 5)) || kw.startsWith(w.slice(0, 5)))) score += 5;
          }
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }

  return bestScore >= 5 ? { key: bestKey, def: DICTIONAR[bestKey], score: bestScore } : null;
}
