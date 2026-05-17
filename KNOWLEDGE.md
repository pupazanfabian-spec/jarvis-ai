# 📚 KNOWLEDGE.md — Lecții acumulate
> Format: ✅ funcționează | ❌ NU funcționează | ⚠️ atenție | 📝 de reținut

---

## 🎨 Animații React Native

✅ `useNativeDriver: true` OBLIGATORIU pentru transform/opacity — altfel lag pe Android
✅ `transformOrigin: [0, 0, 0]` DOAR cu numere — string-uri cauzează crash
❌ Culori animate pe Text/View border — NU funcționează cu useNativeDriver
❌ `expo-linear-gradient` în Expo Go — pachet incompatibil
⚠️ Inelele ThinkingIndicator trebuie TOATE CW (clockwise) — dacă trail-ul orbita invers = bug rotație
📝 Glitch effect: flash 80ms + translateX 3px la 2.5s interval

## 📦 Pachete & Dependențe

✅ `pnpm` — package manager oficial al proiectului (NU npm, NU yarn)
❌ `expo-glass-effect`, `expo-symbols`, `llama.rn` — incompatibile Expo Go
❌ `expo-navigation-bar` — nu instalat, necesită aprobare user înainte de orice impl Android nav bar
⚠️ `expo-sqlite` există în package.json dar evitare dacă posibil (Expo Go limit)
📝 SafeAreaView → MEREU din `react-native-safe-area-context`, NU din `react-native`

## 🤖 Gemini CLI

✅ Flash 3 Preview = task complex (logică nouă, multi-fișier, animații, sisteme)
✅ Flash 3.1 Lite Preview = task simplu (verificări, UI simplu, 1-2 linii, config)
✅ `/compress` la 80%+ quota — economie semnificativă tokeni
❌ Două Gemini pe același fișier simultan — RISC CRASH guaranteed
⚠️ quota 9% used ≠ 91% rămas (citește /stats pentru valori exacte)
⚠️ Flash 3 Preview 90%+ → schimbă contul Google (`rm -rf ~/.gemini/oauth_creds.json`)
📝 Schimbare cont: `rm -rf ~/.gemini/oauth_creds.json && cd ~/jarvis-ai && gemini --model gemini-3-flash-preview`

## 🧠 BrainContext / Memory

✅ Wave A Task 1 completă: recallWeighted + autoLink + activeInference + markCore în memoryManager.ts
❌ Wave B Task 1 (integrare BrainContext) — ruptă în Sesiunea 8, necesită rollback la `95da0aa`
⚠️ La modificarea BrainContext → MEREU "PĂSTREAZĂ tot codul existent, doar ADAUGĂ" în prompt Flash 3
📝 Recall order: TOATE reguli + Top 5 sistem + Top 10 importanta + Top 5 mai_putin + Top 3 irelevanta
📝 recallWeighted score = similarity × importance × (1/age) × log(accessCount+2)

## 🔧 Git & Comenzi

✅ Git comenzi cu `;` — `cd ~/jarvis-ai ; git add -A ; git commit -m "..." ; git push`
❌ `&&` în git comenzi pe Windows Git Bash — poate cauza oprire prematură
✅ TSC verificare: `cd artifacts/jarvis ; node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit`
✅ Reset fișier: `cd ~/jarvis-ai ; git checkout -- artifacts/jarvis/[path]`
📝 La Wave B ruptă → `git log --oneline -5` + `git checkout -- [fisier]` la commit-ul stabil

## 🏗️ Arhitectură & Patternuri

✅ Wave Batching: Wave A = paralel fără conflicte | Wave B = după ce A termină
✅ Master update automat la fiecare rezultat Gemini primit
❌ Master update fără să primești TOATE rezultatele din ciclu curent
⚠️ Verifică suprapuneri de fișiere ÎNAINTE de a împărți task-urile pe Gemini
📝 Sub-agent callSubAgent: AbortController timeout 30s + fallback Groq↔OpenRouter
📝 Multi-key rotation: 3 Groq + 3 OpenRouter, 50req per cheie sau 429 → switch + cooldown 15min

## 🎯 UI / UX

✅ Tab Bar height: 72, paddingBottom: 16 (Android safe area)
✅ Keyboard.dismiss() automat când isThinking=true
✅ SurveyBubble tipuri: standard + 'agent_created' cu butoane Studio + Testează
📝 Chestionar UI obligatoriu la ORICE cerere UI nouă (minim 15 întrebări, AskUserQuestion tool)
📝 ThinkingIndicator → v6 cinematic fullscreen overlay, complexity 1-8 cyan→roșu

## 🔑 AsyncStorage Keys (complete)

📝 `@code_studio_workspace`, `@jarvis_subagents_v2`, `@jarvis_skills_v2`, `@jarvis_agent_logs_v2`
📝 `@jarvis_default_agents_seeded`, `@jarvis_api_keys`, `@jarvis_key_index`
📝 `@jarvis_request_count_groq`, `@jarvis_request_count_openrouter`
📝 `@jarvis_memory_reguli/sistem/importanta/mai_putin/irelevanta`
📝 `@jarvis_reduced_motion`, `@jarvis_thinking_trace`, `@jarvis_voice_mode`
📝 `@jarvis_theme`, `@jarvis_onboarded`, `@jarvis_category_cache`
