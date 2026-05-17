# JARVIS AI — Context Proiect

## Stack
React Native + Expo SDK 54, TypeScript, pnpm, Expo Go Android

## Reguli STRICTE
- useNativeDriver: true pentru transform/opacity
- transformOrigin: [0,0,0] doar numere
- NU culori animate pe Text/border
- SafeAreaView din react-native-safe-area-context
- pnpm NU npm
- git cu ; NU &&
- NU pachete noi fără aprobare

## Pachete INTERZISE în Expo Go
- expo-linear-gradient
- expo-glass-effect
- expo-symbols
- llama.rn

## Verificare obligatorie
cd artifacts/jarvis ; node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit

## Git
cd ~/jarvis-ai ; git add -A ; git commit -m "..." ; git push

## Modele Gemini
- Flash 3 Preview → complex (logică nouă, multi-fișier)
- Flash 3.1 Lite Preview → simplu (verificări, UI simplu)

## Vault Knowledge Base
Path: C:/Users/AUREL/JARVIS_VAULT
1. Citește HOT.md primul
2. Dacă nu e suficient → INDEX.md
3. Apoi fișierul relevant din CONTEXT/ UI/ SISTEM/ ENGINE/
4. NU citi tot vault-ul

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
