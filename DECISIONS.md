# 🏛️ DECISIONS.md — Decizii arhitecturale

> Format: [DATA] DECIZIE — Rațional — Alternativă respinsă

---

## AI & Providers

**[S3] Multi-provider fallback: Groq → OpenRouter**
- Rațional: Groq llama-3.3-70b primară (viteză), OpenRouter mistral-7b fallback pe 429
- Alternativă respinsă: single provider (risc downtime), OpenAI (cost)

**[S5] Multi-key rotation HIBRIDĂ (50req + 429)**
- Rațional: 3 chei Groq + 3 OpenRouter, switch la 50 requests SAU 429, cooldown 15min
- Alternativă respinsă: round-robin pur (ignora rate limits reale), single key per provider

**[S4] Provideri SEPARAȚI per sub-agent**
- Rațional: fiecare agent poate folosi provider optim pentru skill-ul lui, fără conflict global
- Alternativă respinsă: provider global partajat (bottleneck + quota shared)

---

## Memorie

**[S5] Sistem memorie 5-tier în loc de flat storage**
- Rațional: reguli (500) → sistem (1000) → importanta (1000) → mai_putin (2000) → irelevanta (3000) cu lifecycle automat
- Alternativă respinsă: flat AsyncStorage JSON (nu scalează, fără prioritizare)

**[S7] recallWeighted cu score compus**
- Formula: `score = similarity × importance × (1/age) × log(accessCount+2)`
- Rațional: recall mai relevant decât FIFO sau BM25 simplu
- Alternativă respinsă: recall pur cronologic, recall pur by similarity

**[S7] Auto-categorization prin keywords**
- "regulă/vreau să/obligatoriu" → reguli | "eu sunt/pot" → sistem | fapte → importanta
- Rațional: zero friction pentru user, Jarvis decide categoria
- Alternativă respinsă: user alege categoria manual

---

## UI / Animations

**[S4] ThinkingIndicator → fullscreen overlay HUD cinematic (v5+)**
- Rațional: branding Iron Man, experience imersiv, diferențiere față de alte chatbots
- Alternativă respinsă: spinner simplu, typing dots

**[S5] JarvisSplash la FIECARE deschidere**
- Rațional: branding consistent, user știe că app-ul se inițializează
- Alternativă respinsă: splash doar la prima deschidere

**[S6] Tab Bar height 72 + paddingBottom 16**
- Rațional: spațiu confortabil pe Android, evită suprapunere nav bar
- Alternativă respinsă: height default (prea mic pe telefoane mari)

---

## Dev Workflow

**[S1] pnpm în loc de npm**
- Rațional: workspace support nativ, link-uri simbolice, viteză install
- Alternativă respinsă: npm (incompatibil cu workspace setup existent)

**[S5] Wave Batching pentru task-uri paralele**
- Rațional: 4 Gemini simultan maximizează throughput, Wave A → Wave B evită conflicte
- Alternativă respinsă: task-uri secvențiale (lent), toate paralel (conflict fișiere)

**[S6] Gemini CLI în loc de API direct**
- Rațional: context mai mare, /compress disponibil, interactiv pentru clarificări
- Alternativă respinsă: API calls directe (fără /compress, fără interactivitate)

**[S7] Git rollback în loc de patch manual**
- Rațional: safe, reproductibil, evită introducerea de noi bug-uri la fix
- Lecție: Wave B ruptă → rollback instant la commit stabil identificat

---

## Arhitectură

**[S3] BrainContext ca singur punct de intrare AI**
- Rațional: toată logica de recall, save, routing, comenzi centralizată
- Alternativă respinsă: logică distribuită în componente (greu de mentinut)

**[S4] Sub-agent system cu AbortController timeout 30s**
- Rațional: previne freeze la timeout provider, fallback automat
- Alternativă respinsă: timeout sistem (prea lent), fără timeout (freeze)

**[S7] Canvas sync via AsyncStorage (@code_studio_workspace)**
- Rațional: Expo Go nu permite WebSocket local stabil, AsyncStorage simplu și fiabil
- Alternativă respinsă: WebSocket real-time (instabil Expo Go), SQLite (overhead)
