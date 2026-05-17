# 📋 TASKS.md — Priorități active

> Actualizează după fiecare sesiune. Format: [P1/P2/P3] Task — Context

---

## 🔴 P1 — Urgent / Blocat

### [P1] Integrare ChatBubble + TypingIndicator + ChatHeader în ChatScreen
- **Blocat de:** ChatScreen.tsx existent netrimis lui Claude
- **Action:** Trimite `artifacts/jarvis/app/(tabs)/index.tsx` pentru integrare exactă
- **Componente gata:** ChatBubble.tsx, TypingIndicator.tsx, ChatHeader.tsx (generate, neintegrate)
- **Note:** Folosește `ChatScreen_INTEGRATION_EXAMPLE.tsx` ca referință, NU copiază direct

### [P1] Wave B Task 1 — BrainContext + recallWeighted + activeInference
- **Blocat de:** Necesită Flash 3 cu instrucțiuni corecte
- **Prompt key:** "PĂSTREAZĂ tot codul existent, doar ADAUGĂ"
- **Ce se adaugă:** recallWeighted() + activeInference() + thinking trace flag
- **Fișier:** `artifacts/jarvis/context/BrainContext.tsx` (commit `95da0aa`)

---

## 🟡 P2 — Important

### [P2] Wave B Task 2 — Auto-delegare proactivă + comenzi agent
- **Depinde de:** P1 (BrainContext stabil) 
- **Funcționalități:** auto-delegare la complexity 6+, comenzi chat: renumește/log/test agent
- **Fișier:** `artifacts/jarvis/context/BrainContext.tsx`

### [P2] Test end-to-end în Expo Go
- **Verifică:** chat răspunde, sub-agent creează în canvas, memorie folosită activ
- **Necesară:** după integrare UI + Wave B Task 1

---

## 🟢 P3 — Planificat

### [P3] expo-navigation-bar Android nav bar auto-hide
- **Status:** PENDING aprobare user (pachet nou)
- **Pachet:** `expo-navigation-bar`
- **Notă:** Nu instala fără aprobare explicită

### [P3] Migrare drag canvas: PanResponder → Gesture API + Reanimated
- **Bug fix:** BUG-001 drag lag
- **Risc:** modificare majoră code-studio.tsx

### [P3] Theme apply runtime fără restart
- **Bug fix:** BUG-004
- **Necesar:** Context dinamic pentru culori în loc de static import

### [P3] Voice IO complet
- **Pachete:** Whisper STT + expo-speech TTS
- **Status:** Design neconfirmat, pachete neaprobate

### [P3] Multi-modal images
- **Provider:** Groq vision
- **Status:** Exploratoriu

---

## ✅ Completate recent (Sesiunile 7-8)

- ✅ Memory Intelligence Engine (recallWeighted, autoLink, activeInference, markCore)
- ✅ ThinkingIndicator v6 + JarvisSplash v6 cinematic
- ✅ Sub-Agent Canvas Sync (syncToCanvas)
- ✅ Settings (Reduced Motion, Thinking Trace, Voice Mode)
- ✅ Theme Selector (4 teme)
- ✅ Onboarding 5-Step HUD
- ✅ SurveyBubble 'agent_created' type
- ✅ Multi-key rotation hibridă (3+3, 50req/429)
- ✅ API Keys UI cu Test individual per slot
- ✅ Rollback Wave B (BrainContext + subAgentManager stabili)
