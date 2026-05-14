# 🤖 JARVIS MASTER - STATUS + CLAUDE RULES + GEMINI GHID
Actualizat: Sesiunea 6 — după FIX Memory Core UI & TASK P3 (UI & Lang)

---

# 📋 SECȚIUNEA 1: STATUS PROIECT

## 🏗️ TECH STACK
- React Native + Expo SDK 54, TypeScript, pnpm
- Expo Go (Android), Git Bash Windows
- Gemini CLI: max 4 simultan (2x Flash 3 Preview + 2x Flash 3.1 Lite Preview)
- NICIODATĂ același fișier în 2 instanțe simultan

## 🤖 AI PROVIDERS
- Groq llama-3.3-70b → primary
- OpenRouter mistral-7b → fallback auto la 429
- Agenții au provideri separați (nu global)
- Multi-key rotation HIBRIDĂ: 3 chei Groq + 3 chei OpenRouter
  - Cheia primară până la 50 requests SAU 429 → switch automat
  - markKeyFailed cooldown 15min
  - Round-robin pe sloturile rămase active

## ✅ IMPLEMENTAT

### UI & Language Polishing ✅ (Sesiunea 6)
- **Culori header ciclice:** Titlul "J.A.R.V.I.S" trece fluid între primary (#6C63FF) și accent (#00D4FF) la fiecare 8 secunde.
- **Autodetecție limbă:** Heuristică în BrainContext (RO/EN) + prompt dinamic în aiProviders. Jarvis răspunde acum natural în limba utilizatorului.

### Sub-Agent System ✅
- callSubAgent cu AbortController timeout 30s + fallback Groq↔OpenRouter
- Orchestrator complexity 1-8 in RouteResult
- 3 agenți default + seedDefaultAgents()
- 9 skills, provideri separați per agent
- Sandbox + Logs funcționale
- Comenzi chat: creează/șterge agent, adaugă skill, conectează, listează, resetează studio

### Multi-Key Rotation ✅
- UI Furnizor AI: 6 sloturi (3 Groq + 3 OpenRouter), buton "Test" INDIVIDUAL per slot
- keyManager.ts: testKey(provider, slotIndex), getWorkingKey (hibrid 50req/429), markKeyFailed (15min cooldown), incrementRequestCount
- aiProviders.ts: integrat getWorkingKey + retry pe 429 + markKeyFailed automat
- AsyncStorage: @jarvis_api_keys, @jarvis_key_index, @jarvis_request_count_groq, @jarvis_request_count_openrouter

### Sistem Memorie 5-Tier & BrainSphere UI ✅
- 5 subfoldere: reguli (500), sistem (1000), importanta (1000), mai_putin (2000), irelevanta (3000)
- AsyncStorage chei separate per categorie
- engine/memoryManager.ts: schema MemoryEntry uniform, auto-categorize, recall, migrate lifecycle, promote, checkContradiction, export/import
- UI BrainSphere.tsx (FIXED):
  - Lobii sunt vizibili (interpolare 3D reală pe X/Scale/Opacity)
  - Animații 100% nativeDriver (auto-rotație 30s, pulsare noduri orbitali)
  - Sfera apare corect în orice stare
- UI MemoryManager.tsx (FIXED):
  - CRUD complet: Tap pe nod -> Modal detalii -> Edit/Delete funcțional
  - Export/Import prin Share API și Alert prompt
  - Refresh button și Statistici integrate
- Auto-CRUD 100% AUTONOM în BrainContext.sendMessage:
  - Recall înainte de AI: TOATE reguli + Top 5 sistem + Top 10 importanta + Top 5 mai_putin + Top 3 irelevanta
  - Save după AI: addEntry autonom din user msg + AI response
- Auto-categorization keywords:
  - "regulă/vreau să/obligatoriu" + user_explicit → reguli
  - "eu sunt/eu pot" + jarvis_inferred → sistem
  - Fapte despre user → importanta
  - Detalii ocazionale → mai_putin
  - Web/inferred general → irelevanta
- Lifecycle migration (rulează la 24h):
  - importanta nefolosit 60+ zile → mai_putin
  - mai_putin nefolosit 90+ zile → irelevanta
  - irelevanta nefolosit 180+ zile → DELETE (arhivă pe disk)
  - reguli + sistem niciodată
- Promovare automată: 3+ accesări în 7 zile → urcă o categorie
- Contradiction detection (folosește engine/inference.ts existent)
- UI MemoryManager.tsx: 5 tab-uri + tab Statistici (compactare, migrare manuală)
- Comenzi chat: "ce stii despre X", "memorie reguli/sistem/...", "uita X", "promoveaza X la important", "memorie status", "exporta/importa memorie"

### ThinkingIndicator v5 Cinematic ✅ (Flash 3 #2)
- Bug FIXED: trail-ul alb care orbita invers — toate inelele acum CW
- 10+ straturi noi peste v4:
  1. HUD Math Diagrams (inel 320, text "0010 1101 1011" rotind lent)
  2. Holograme orbitale (4 cercuri 40x40 la raze 90/110/140/170)
  3. Glitch effect (flash 80ms + translateX 3px la fiecare 2.5s)
  4. 6 particule traseu pe rază 100, sincronizat cu inel exterior
  5. Scanning HUD ("SCANNING.../ANALYZING.../PROCESSING...")
  6. Code fragments { } ; / plutind
  7. Central crosshair (+) pulse "lock-on"
  8. Inel hexagonal 260x260 rotație 20s
  9. Energy ring pulse 0→1.3 scale + fade
  10. Status text dinamic ("COMPLEXITY", "ENERGY %")
- 8 culori complexity 1-8 cyan→roșu păstrate + accente HUD #00ffff alpha 0.4
- useNativeDriver:true tot, 0 erori TSC

### JarvisSplash v5 ✅
- Aceleași 10 straturi cinematice ca ThinkingIndicator
- Text "J.A.R.V.I.S" + "SYSTEM ONLINE"
- Status scrolling: INITIALIZING / CONNECTING NEURAL NET / READY
- Durată 3.5s + fade 500ms
- LA FIECARE deschidere

### JarvisIcon Tab ✅
- Dublu inel rotativ opus, pulse 1.35

### StudioIcon Tab ✅
- Ionicons "git-network-outline", inel rotativ, pulse 1.2

### Tab Bar Elevated ✅
- height: 72, paddingBottom: 16 în app/(tabs)/_layout.tsx
- ⚠️ Android nav bar auto-hide OMITTED — `expo-navigation-bar` nu e instalat (pachet nou necesar; user trebuie să decidă dacă acceptă)

### Keyboard Dismiss ✅
- Keyboard.dismiss() automat cand isThinking=true

### Canvas Sync Chat↔Studio ✅
- Agentul creat din chat apare în Canvas
- callSubAgent face API calls reale (Groq + OpenRouter fallback)

### Code Studio Canvas ✅
- PanResponder, noduri Agent/Skill/Tool/Output
- Conexiuni SVG bezier, zoom
- Wizard creare agent, Skill editor modal

## 🔄 BUGS ACTIVE
- Drag lag noduri canvas (PanResponder vechi, migrare la gesture-handler + Reanimated pending)

## ⏳ PLANIFICAT
- Android nav bar auto-hide (necesită aprobarea expo-navigation-bar)
- Migrare drag de la PanResponder la Gesture API + Reanimated worklets

## 🔑 ASYNCSTORAGE KEYS
- @code_studio_workspace
- @jarvis_subagents_v2
- @jarvis_skills_v2
- @jarvis_agent_logs_v2
- @jarvis_default_agents_seeded
- @jarvis_memory_v2_json (legacy)
- @jarvis_api_keys
- @jarvis_key_index
- @jarvis_request_count_groq (NEW)
- @jarvis_request_count_openrouter (NEW)
- @jarvis_memory_reguli (NEW)
- @jarvis_memory_sistem (NEW)
- @jarvis_memory_importanta (NEW)
- @jarvis_memory_mai_putin (NEW)
- @jarvis_memory_irelevanta (NEW)

## 📁 FIȘIERE PRINCIPALE
```
artifacts/jarvis/
├── app/
│   ├── _layout.tsx                       # Root (providers wrapping)
│   └── (tabs)/
│       ├── _layout.tsx                   # Tab bar (height 72, paddingBottom 16)
│       ├── index.tsx                     # Chat
│       └── code-studio.tsx               # Studio Canvas n8n
├── components/
│   ├── AIProviderModal.tsx               # 6 sloturi + Test per slot
│   ├── ChatBubble.tsx, SurveyBubble.tsx
│   ├── ThinkingIndicator.tsx             # v5 cinematic
│   ├── JarvisSplash.tsx                  # v5 cinematic
│   ├── MemoryManager.tsx                 # 5 tab-uri + statistici
│   ├── PinScreen.tsx, ModelSetupScreen.tsx
│   └── FloatingBubble.tsx, KnowledgeScreen.tsx, CodeSandboxScreen.tsx
├── context/
│   ├── BrainContext.tsx                  # Recall + auto-learn integrat
│   ├── AIProviderContext.tsx             # providerIcon, providerLabel, useAIProvider
│   ├── LLMContext.tsx, PinContext.tsx, DevModeContext.tsx
├── engine/
│   ├── brain.ts (v6.2), memory.ts, memoryFolder.ts
│   ├── memoryManager.ts (NEW)            # 5-tier system
│   ├── aiProviders.ts                    # callGroq/OpenRouter cu rotation
│   ├── webSearch.ts, responseGenerator.ts
│   ├── mind.ts, learning.ts, semantic.ts
│   ├── entities.ts, inference.ts, temporal.ts, constitution.ts
│   ├── codeGenerator.ts, knowledge.ts, projectMemory.ts
│   ├── orchestrator.ts
│   └── code-studio/
│       ├── keyManager.ts                 # testKey + getWorkingKey hibrid
│       ├── skills.ts, defaultAgents.ts
│       ├── subAgentManager.ts            # callSubAgent + fallback + log
│       └── studioManager.ts
├── constants/colors.ts
└── package.json (SDK 54, pnpm)
```

---

# 📏 SECȚIUNEA 2: CLAUDE RULES

## 💬 COMUNICARE
- Răspunsuri scurte, la subiect
- NU copiez mesaje mari înapoi
- NU trimit promptul din nou după confirmare
- NU editez fișier doar pentru redenumire (risipă tokeni)
- La cerință nouă → chestionar ÎNAINTE de prompt
- Când Aurel dă paste din Gemini → chestionar:
  "Continuăm task [model] SAU așteptăm [model] să termine?"

## 📋 CITIRE PASTE GEMINI
- Paste din Gemini conține: model folosit + quota used
- quota % used ≠ tokeni rămași (9% used = 91% rămas)
- Flash 3 Preview 80%+ task complex → ⚠️ EROARE LOGICĂ - împart în bucăți
- Flash 3 Preview 90%+ orice task → 🚨 EROARE CRITICĂ - schimb contul Google

### Pași schimbare cont:
```bash
rm -rf ~/.gemini/oauth_creds.json
cd ~/jarvis-ai
gemini --model gemini-3-flash-preview
```

## 🤖 MODELE GEMINI
- Flash 3 Preview = complex (logică nouă, multi-fișier, animații cinematice, sisteme noi)
- Flash 3.1 Lite Preview = simplu (verificări, UI simplu, 1-2 linii, importuri, config)
- Max 4 simultan: 2x Flash 3 Preview + 2x Flash 3.1 Lite Preview
- NICIODATĂ același fișier în 2 instanțe simultan (RISC CRASH)
- Verific suprapuneri de fișiere ÎNAINTE de a împărți task-urile

## 📝 PROMPTURI GEMINI
- Scurte, la subiect
- Fișier exact + intenție clară + scop fișier
- Reguli explicite pentru ce să NU facă
- Git la final: `cd ~/jarvis-ai ; git add -A ; git commit -m "..." ; git push`
- Git cu `;` NU `&&`
- Typecheck: `cd artifacts/jarvis ; node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit`
- Pentru fiecare prompt → scriu sub el modelul recomandat

## 🎨 CHESTIONAR UI (OBLIGATORIU)
- La orice cerere UI → minim 15 întrebări
- Folosesc AskUserQuestion tool (max 4 per call, rund multiple)
- Mereu: ce păstrăm + îmbunătățiri + sugestii artistice Claude

## 🔄 AUTO-SAVE LA 6 MESAJE
- La fiecare 6 mesaje → generez automat JARVIS_MASTER.md
- Un singur fișier complet self-contained
- Aurel deschide conversație nouă, trimite fișierul, continuă
- ⚠️ NU fac master update până nu trimite toate rezultatele Gemini din ciclul curent

## 🏗️ REGULI TEHNICE
- pnpm NU npm
- transformOrigin: [0,0,0] doar numere
- useNativeDriver: true pentru transform/opacity
- Culori animate pe Text/border → INTERZIS
- SafeAreaView din react-native-safe-area-context
- NU pachete noi fără aprobare
- NU expo-linear-gradient, NU expo-glass-effect, NU expo-symbols, NU llama.rn în Expo Go
- expo-sqlite există în package.json dar evităm dacă posibil (Expo Go limit)

## 🎯 DECIZII CONFIRMATE
- ThinkingIndicator → v5 cinematic fullscreen overlay HUD Iron Man
- Culoare → instant, complexity 1-8 cyan→roșu
- Sub-agent în chat → normal fără indicator
- Splash → la FIECARE deschidere, v5 cinematic identic ThinkingIndicator
- Jarvis → face singur + anunță după
- Provideri → separați per agent
- Canvas → sync live chat + editare manuală
- Keyboard → dismiss automat când isThinking=true
- Multi-key → 3 Groq + 3 OpenRouter, failover + round-robin HIBRID (50req sau 429)
- API Keys UI → buton Test individual per slot
- Memorie → 5-tier 100% autonomous, recall automat înainte de fiecare răspuns
- Memory UI → 5 tab-uri în chip "starea Jarvis" existent
- Android nav bar → auto-hide DOAR dacă user aprobă expo-navigation-bar

## 🚫 NICIODATĂ
- NU postez API keys
- NU două Gemini pe același fișier simultan
- NU npm / NU `&&` în git
- NU prompturi exagerat de lungi (împart pe task-uri)
- NU master update fără să primesc toate rezultatele Gemini

---

# 🚀 SECȚIUNEA 3: GEMINI CLI GHID

## Pornire rapidă
```bash
# Flash 3 Preview
cd ~/jarvis-ai
gemini --model gemini-3-flash-preview

# Flash 3.1 Lite Preview
cd ~/jarvis-ai/artifacts/jarvis
gemini --model gemini-3.1-flash-lite-preview
```

## Schimbare cont Google (quota 90%+)
```bash
rm -rf ~/.gemini/oauth_creds.json
cd ~/jarvis-ai
gemini --model gemini-3-flash-preview
```

## Shortcuts esențiale
| Comandă | Acțiune |
|---------|---------|
| /compress | Comprimă contextul (economie tokeni!) |
| /stats | Quota used |
| /copy | Copiază ultimul output |
| Shift+Tab | Cycle modes: default → auto-edit → plan |
| Ctrl+C | Oprire task |

## @ și ! comenzi
```bash
@artifacts/jarvis/context/BrainContext.tsx
!{node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit}
!{git log --oneline -5}
```

## Template prompt standard
```
Citeste ce am spus si vino cu un plan apoi executa.
@artifacts/jarvis/[fisier]
[descriere scurta task]
La final: cd ~/jarvis-ai ; git add -A ; git commit -m "..." ; git push
```

## Comenzi rapide Git Bash
```bash
# TSC verificare
cd ~/jarvis-ai/artifacts/jarvis ; node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit

# Reset fișier
cd ~/jarvis-ai ; git checkout -- artifacts/jarvis/app/\(tabs\)/code-studio.tsx

# Git log
cd ~/jarvis-ai ; git log --oneline -5

# Pornire Expo Go
cd ~/jarvis-ai/artifacts/jarvis ; npx expo start --clear
```

## GEMINI.md - context persistent
Creează `~/jarvis-ai/GEMINI.md`:
```
Stack: React Native + Expo SDK 54, TypeScript, pnpm, Expo Go Android
Reguli: useNativeDriver:true, culori fixe, transformOrigin:[0,0,0], NU pachete noi
Git: comenzi cu ; NU &&
Final: cd ~/jarvis-ai ; git add -A ; git commit -m "..." ; git push
Verificare: cd artifacts/jarvis ; node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit
```

---

# 📊 SESIUNEA 5 — REZUMAT COMPLETE

**4 task-uri majore implementate cu succes prin lucru paralel pe 4 sesiuni Gemini:**

1. ✅ Sistem Memorie 5-Tier autonomous (Flash 3 #1) — 7% used
2. ✅ ThinkingIndicator + JarvisSplash v5 Cinematic (Flash 3 #2) — 7% used
3. ✅ API Keys multi-slot + hybrid rotation (Lite #1) — 4% used
4. ✅ Tab Bar Elevated (Lite #2) — 4% used; Android nav bar OMITTED (pachet)

**Total commits ciclu actual:** ~6-8 (estimat)
**Erori TSC finale:** 0

**Următorul pas:** test în Expo Go pe telefon.
