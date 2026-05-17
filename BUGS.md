# 🐛 BUGS.md — Tracking bug-uri

---

## 🔴 BUG-URI ACTIVE (nerezolvate)

### BUG-001: Drag lag noduri canvas
- **Fișier:** `artifacts/jarvis/app/(tabs)/code-studio.tsx`
- **Descriere:** PanResponder vechi cauzează lag la drag pe noduri canvas
- **Impact:** UX degradat în Code Studio
- **Cauză:** PanResponder nu folosește Reanimated worklets
- **Fix planificat:** Migrare la Gesture API + Reanimated worklets
- **Status:** ⏳ Planificat, fără dată

### BUG-002: Wave B Task 1 — BrainContext integrare ruptă
- **Fișier:** `artifacts/jarvis/context/BrainContext.tsx`
- **Descriere:** Integrarea recallWeighted + activeInference + thinking trace a rupt logica existentă
- **Impact:** Chat AI call logic + comenzi sub-agent + ambiguity detection pierdute
- **Cauză:** Flash 3 a suprascris logica existentă în loc să adauge
- **Fix:** Refacere cu instrucțiuni explicite "PĂSTREAZĂ tot codul existent, doar ADAUGĂ"
- **Status:** ⏳ Prioritate înaltă — Wave B refacere sesiunea viitoare

### BUG-003: Wave B Task 2 — auto-delegare proactivă neimplementată
- **Fișier:** `artifacts/jarvis/context/BrainContext.tsx`
- **Descriere:** auto-delegare proactivă + comenzi management agent (renumește/log/test) nu există
- **Impact:** Funcționalitate lipsă
- **Status:** ⏳ Planificat după BUG-002

### BUG-004: Theme apply necesită restart aplicație
- **Fișier:** `artifacts/jarvis/constants/colors.ts`, `components/ThemeSelector.tsx`
- **Descriere:** Schimbarea temei nu se aplică runtime, necesită restart complet Expo Go
- **Impact:** UX suboptimal
- **Fix planificat:** Context dinamic pentru culori
- **Status:** ⏳ În WISHLIST

---

## ✅ BUG-URI REZOLVATE

### BUG-R01: ThinkingIndicator trail alb orbita invers
- **Rezolvat:** Sesiunea 7 (Wave A Task 2)
- **Fix:** Toate inelele setate CW (clockwise) explicit
- **Commit:** inclus în Wave A

### BUG-R02: BrainSphere lobii invizibili
- **Rezolvat:** Sesiunea 7
- **Fix:** Interpolare 3D reală pe X/Scale/Opacity, animații 100% nativeDriver

### BUG-R03: MemoryManager CRUD nefuncțional
- **Rezolvat:** Sesiunea 7
- **Fix:** Modal detalii complet, Edit/Delete funcțional cu AsyncStorage sync

### BUG-R04: SurveyBubble handleNo/handleYes șterse accidental
- **Rezolvat:** Sesiunea 8 (final)
- **Fix:** Re-adăugate manual după Wave B partial

### BUG-R05: BrainContext + subAgentManager rupt de Wave B
- **Rezolvat:** Sesiunea 8 (rollback)
- **Fix:** `git checkout -- artifacts/jarvis/context/BrainContext.tsx` la commit `95da0aa`
- **Fix:** `git checkout -- artifacts/jarvis/engine/code-studio/subAgentManager.ts` la commit `406b47f`
- **Notă:** syncToCanvas păstrat din Wave A la rollback subAgentManager
