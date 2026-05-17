# 🔥 HOT.md — Context instant sesiune curentă
> Citește ÎNAINTE de orice alt fișier. ~500 cuvinte max. Suprascrie la fiecare wrap-up.

---

## 🎯 Focus curent
Sesiunea 9 — integrare UI nouă (ChatBubble + TypingIndicator + ChatHeader) în ChatScreen existent + Wave B Task 1 (BrainContext cu recallWeighted + activeInference).

## 🚨 Stare critică
- **Wave B Task 1 RUPT** — BrainContext.tsx a fost roll-back la commit `95da0aa`. Integrarea recallWeighted + activeInference din memoryManager.ts TREBUIE refăcută cu Flash 3, instrucțiuni: "PĂSTREAZĂ tot codul existent, doar ADAUGĂ".
- **Wave B Task 2 RUPT** — auto-delegare proactivă + comenzi management agent în BrainContext nerealizate.
- **0 erori TSC** după rollback ✅

## 📋 Next Actions (ordine prioritate)
1. **[IMEDIAT]** Trimite ChatScreen.tsx existent lui Claude pentru integrare exactă componente noi (ChatBubble/TypingIndicator/ChatHeader)
2. **[IMPORTANT]** Wave B Task 1 — Flash 3: recallWeighted + activeInference în BrainContext
3. **[IMPORTANT]** Wave B Task 2 — Flash 3: auto-delegare proactivă + comenzi agent
4. **[PLUS]** Test end-to-end în Expo Go după integrare
5. **[PENDING USER APROBARE]** expo-navigation-bar Android nav bar auto-hide

## 🔄 Ultimele operații (Sesiunea 8)
- ✅ Wave A completă: Memory Intelligence Engine, ThinkingIndicator v6, Canvas Sync, Settings, Theme Selector, Onboarding 5-Step
- ✅ SurveyBubble tip 'agent_created' cu butoane Studio + Testează
- ✅ Rollback BrainContext + subAgentManager (Wave B era ruptă)
- ✅ Pushed origin/main, 0 erori TSC
- 🆕 Componentele UI noi generate de Claude (sesiunea curentă): ChatBubble.tsx, TypingIndicator.tsx, ChatHeader.tsx

## 📁 Fișiere active (atenție la modificare)
- `artifacts/jarvis/context/BrainContext.tsx` — commit `95da0aa`, stabil, Wave B urmează
- `artifacts/jarvis/engine/memoryManager.ts` — 5-tier implementat, recallWeighted adăugat în Wave A
- `artifacts/jarvis/components/ThinkingIndicator.tsx` — v6 cinematic, stabil
- `artifacts/jarvis/app/(tabs)/index.tsx` — ChatScreen, necesită integrare componente noi
- `artifacts/jarvis/components/ChatBubble.tsx` — GENERAT, nu integrat încă
- `artifacts/jarvis/components/TypingIndicator.tsx` — GENERAT, nu integrat încă  
- `artifacts/jarvis/components/ChatHeader.tsx` — GENERAT, nu integrat încă

## ⚠️ Reguli critice de reținut
- `pnpm` NU npm
- Git comenzi cu `;` NU `&&`
- Max 4 Gemini simultan, NICIODATĂ același fișier în 2 instanțe
- Flash 3 = task complex | Lite = task simplu/1-2 linii
- Wave B pe BrainContext → Flash 3 cu "PĂSTREAZĂ tot, doar ADAUGĂ"
- NU pachete noi fără aprobare user
