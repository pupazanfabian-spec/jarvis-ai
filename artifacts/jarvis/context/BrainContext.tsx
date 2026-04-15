
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Message, BrainState, processMessage, processDocument,
  createInitialBrainState, archiveCurrentSession,
} from '@/engine/brain';
import { createMindState } from '@/engine/mind';
import { createSelfKnowledge, type CorrectionRecord } from '@/engine/learning';
import { createEntityTracker } from '@/engine/entities';
import { createInferenceEngine, extractRulesFromFact, addFact } from '@/engine/inference';
import { createTemporalMemory } from '@/engine/temporal';
import { createConstitutionState } from '@/engine/constitution';
import { useLLM } from '@/context/LLMContext';
import { searchOnline, isOnlineIntent, searchOnlineSynthesized, extractTopSentences } from '@/engine/webSearch';
import { detectQuestionType, synthesizeWebResponse, detectTopicCategory } from '@/engine/responseGenerator';
import { useAIProvider } from '@/context/AIProviderContext';
import { buildRichSystemPrompt, type JarvisContext, type ConversationTurn } from '@/engine/aiProviders';
import { semanticSimilarity } from '@/engine/semantic';
import { loadDynamicConceptsFromDB } from '@/engine/knowledge';
import type { EntityType } from '@/engine/entities';
import {
  getDB,
  autoPruneKnowledge,
  insertKnowledgeEntry,
  queryKnowledgeForAnswer,
  upsertEntity,
  loadAllEntities,
  saveBrainStateFull,
  loadBrainStateFull,
  saveMessagesFull,
  loadMessagesFull,
  markMigrationDone,
  isMigrationDone,
  type EntityData,
} from '@/engine/database';
import {
  detectDevIntent, generateDevExplanation, generateFromTemplate,
  buildAICodePrompt, formatCodeResponse, extractCodeSnippet,
} from '@/engine/codeGenerator';
import {
  getActiveProject, buildProjectContext, formatProjectSummary,
  createProject, addProjectStep, saveProjectFile,
} from '@/engine/projectMemory';
import { loadMemory, saveMemory, addMemoryEntry, getRelevantMemories, type MemoryStore } from '@/engine/memory';
import { initMemoryFolder, writeMemoryEntry, searchMemory as searchMemoryFolder, migrateFromAsyncStorage as migrateMemoryFolder, getMemoryStats, listAllMemories, deleteMemoryByKeyword, clearAllMemory } from '@/engine/memoryFolder';
import { requestFolderAccess, getExternalFolders, scanAllFolders } from '@/engine/externalFolders';
import { autoDetectFacts } from '@/engine/brain';
import { useDevMode } from '@/context/DevModeContext';

interface BrainContextType {
  messages: Message[];
  isThinking: boolean;
  webSearching: boolean;
  brainState: BrainState;
  dbReady: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  addDocument: (name: string, content: string) => Promise<void>;
  removeDocument: (id: string) => void;
}

const BrainContext = createContext<BrainContextType | null>(null);

// Keys AsyncStorage (folosite doar pentru migrare one-time)
const MESSAGES_KEY = '@jarvis_v3_messages';
const STATE_KEY = '@jarvis_v3_state';

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Salut! Sunt **Jarvis** — AI cu minte proprie, offline și online. 🧠\n\n**Ce pot face:**\n🤔 Răspund din 270+ subiecte din memorie\n📡 Caut pe internet când nu știu (Wikipedia, DuckDuckGo)\n🔗 Deduc logic din ce îmi spui\n👤 Rețin persoanele și entitățile menționate\n🕐 Știu ce am discutat azi, ieri, săptămâna trecută\n📄 Studiez fișierele pe care mi le trimiți\n💾 Nu uit nimic între sesiuni\n\n**Caută online:** spune "caută online [subiect]" sau întreabă orice — dacă nu știu din memorie, verific internetul automat.\n\nCum te cheamă? Sau întreabă-mă ceva — orice.',
  timestamp: new Date(),
};

// ─── Migrare stare din AsyncStorage ──────────────────────────────────────────

function migrateParsedState(parsed: BrainState): BrainState {
  parsed.learnedDocuments = (parsed.learnedDocuments || []).map(d => ({
    ...d,
    addedAt: new Date(d.addedAt),
  }));
  if (!parsed.mindState) parsed.mindState = createMindState();
  if (!parsed.selfKnowledge) parsed.selfKnowledge = createSelfKnowledge();
  if (parsed.creatorId === undefined) parsed.creatorId = null;
  if (parsed.isCreatorPresent === undefined) parsed.isCreatorPresent = false;
  if (!parsed.entityTracker) parsed.entityTracker = createEntityTracker();
  if (!parsed.inferenceEngine) parsed.inferenceEngine = createInferenceEngine();
  if (!parsed.temporalMemory) parsed.temporalMemory = createTemporalMemory();
  if (!parsed.constitutionState) parsed.constitutionState = createConstitutionState();
  if (!parsed.selfKnowledge.responseQualityMap) {
    parsed.selfKnowledge.responseQualityMap = {};
  }
  if (parsed.selfKnowledge.totalMessages === undefined) {
    parsed.selfKnowledge.totalMessages = 0;
  }
  parsed.selfKnowledge.corrections = (parsed.selfKnowledge.corrections || []).map((c) => {
    const record = c as CorrectionRecord & { wrong?: string; correct?: string };
    if ('wrong' in record && record.wrong) {
      return { wrongResponse: record.wrong, correction: record.correct ?? '', intent: 'unknown', at: Date.now() };
    }
    return c;
  });
  return parsed;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BrainProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isThinking, setIsThinking] = useState(false);
  const [webSearching, setWebSearching] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const brainRef = useRef<BrainState>(createInitialBrainState());
  const [brainState, setBrainState] = useState<BrainState>(brainRef.current);
  const memoryRef = useRef<MemoryStore>({ entries: [] });
  const loaded = useRef(false);
  const { generate: llmGenerate, status: llmStatus } = useLLM();
  const { generate: aiGenerate, settings: aiSettings } = useAIProvider();
  const { isDevMode, refreshProject } = useDevMode();

  // ─── Startup: DB init → migrare → concepte dinamice → entități ────────────
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    (async () => {
      try {
        // 1. Inițializează SQLite
        await getDB();
        setDbReady(true);

        // 2. Auto-pruning în background
        autoPruneKnowledge().catch(() => {});

        // 3. Încarcă conceptele dinamice salvate anterior din SQLite
        await loadDynamicConceptsFromDB();

        // 4. Verifică dacă migrarea din AsyncStorage a avut loc deja
        const migrationDone = await isMigrationDone();

        let stateJson: string | null = null;
        let msgsJson: string | null = null;

        if (!migrationDone) {
          // 4a. Prima rulare cu SQLite — migrează din AsyncStorage
          const [asMsgs, asState] = await Promise.all([
            AsyncStorage.getItem(MESSAGES_KEY),
            AsyncStorage.getItem(STATE_KEY),
          ]);

          stateJson = asState;
          msgsJson = asMsgs;

          // Salvează în SQLite
          if (asState) await saveBrainStateFull(asState);
          if (asMsgs) await saveMessagesFull(asMsgs);
          await markMigrationDone();
        } else {
          // 4b. Rulare normală — citește din SQLite
          [stateJson, msgsJson] = await Promise.all([
            loadBrainStateFull(),
            loadMessagesFull(),
          ]);
        }

        // 5. Parsează și aplică starea creierului
        if (stateJson) {
          try {
            const parsed = migrateParsedState(JSON.parse(stateJson) as BrainState);
            brainRef.current = parsed;
            setBrainState({ ...parsed });
          } catch {}
        }

        // 6. Parsează și aplică mesajele
        if (msgsJson) {
          try {
            const msgs = (JSON.parse(msgsJson) as Message[]).map(m => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }));
            if (msgs.length > 0) setMessages(msgs);
          } catch {}
        }

        // 7. Încarcă memoria JSON persistentă
        memoryRef.current = await loadMemory();

        // 8. Inițializează memoria pe fișiere (jarvis_memory/) + migrare one-time
        await initMemoryFolder();
        migrateMemoryFolder().catch(() => {});

        // 9. Sincronizează entitățile din SQLite → entityTracker (non-blocking)
        _syncEntitiesFromDB(brainRef.current);

      } catch (e) {
        // Fallback la AsyncStorage dacă SQLite nu funcționează
        if (__DEV__) console.warn('[Jarvis] SQLite init failed, falling back to AsyncStorage:', e);
        setDbReady(false);
        memoryRef.current = await loadMemory();
        try {
          const [asMsgs, asState] = await Promise.all([
            AsyncStorage.getItem(MESSAGES_KEY),
            AsyncStorage.getItem(STATE_KEY),
          ]);
          if (asState) {
            try {
              const parsed = migrateParsedState(JSON.parse(asState) as BrainState);
              brainRef.current = parsed;
              setBrainState({ ...parsed });
            } catch (parseErr) {
              if (__DEV__) console.warn('[Jarvis] AsyncStorage state parse failed:', parseErr);
            }
          }
          if (asMsgs) {
            try {
              const msgs = (JSON.parse(asMsgs) as Message[]).map(m => ({
                ...m, timestamp: new Date(m.timestamp),
              }));
              if (msgs.length > 0) setMessages(msgs);
            } catch (parseErr) {
              if (__DEV__) console.warn('[Jarvis] AsyncStorage messages parse failed:', parseErr);
            }
          }
        } catch (asErr) {
          if (__DEV__) console.warn('[Jarvis] AsyncStorage fallback failed:', asErr);
        }
      }
    })();
  }, []);

  // ─── Persistare ───────────────────────────────────────────────────────────

  const persist = useCallback(async (msgs: Message[], state: BrainState) => {
    const msgsSliced = msgs.slice(-100);
    const stateJson = JSON.stringify(state);
    const msgsJson = JSON.stringify(msgsSliced);
    try {
      await Promise.all([
        saveBrainStateFull(stateJson),
        saveMessagesFull(msgsJson),
      ]);
    } catch (sqlErr) {
      if (__DEV__) console.warn('[Jarvis] SQLite persist failed, trying AsyncStorage:', sqlErr);
      try {
        await Promise.all([
          AsyncStorage.setItem(MESSAGES_KEY, msgsJson),
          AsyncStorage.setItem(STATE_KEY, stateJson),
        ]);
      } catch (asErr) {
        if (__DEV__) console.warn('[Jarvis] AsyncStorage persist also failed:', asErr);
      }
    }

    let memChanged = false;
    for (const fact of state.selfKnowledge.learnedFacts) {
      const updated = addMemoryEntry(memoryRef.current, fact, 'brain');
      if (updated !== memoryRef.current) {
        memoryRef.current = updated;
        memChanged = true;
      }
    }
    if (state.userName) {
      const nameFact = `Utilizatorul se numește ${state.userName}`;
      const updated = addMemoryEntry(memoryRef.current, nameFact, 'user');
      if (updated !== memoryRef.current) {
        memoryRef.current = updated;
        memChanged = true;
      }
    }
    if (memChanged) await saveMemory(memoryRef.current);
  }, []);

  // ─── Sincronizare entități din EntityTracker → SQLite ─────────────────────

  const persistEntities = useCallback((state: BrainState) => {
    const tracker = state.entityTracker;
    if (!tracker || !Array.isArray(tracker.entities) || tracker.entities.length === 0) return;
    // Non-blocking — salvează fiecare entitate în SQLite (cheie = normalized name)
    Promise.all(
      tracker.entities.map(entity => {
        const data: Record<string, string | number | undefined> = {
          value: entity.value,
          firstSeen: entity.firstSeen,
          occurrences: entity.occurrences,
          context: entity.context,
          relation: entity.relation,
        };
        return upsertEntity(entity.normalized, entity.type, data).catch(() => {});
      })
    ).catch(() => {});
  }, []);

  // ─── Auto-learn din web: salvează rezultatele în knowledge_entries ─────────

  const autoLearnFromWeb = useCallback(async (
    resultText: string,
    provider: string,
    query: string,
  ) => {
    if (!dbReady) return;
    try {
      const domain = detectTopicCategory(query);
      const label = `${query.slice(0, 48)} [${provider.slice(0, 20)}]`.slice(0, 80);
      // Păstrăm sursa exactă: 'web', 'gemini', 'openai' etc.
      const canonicalSource = (['web', 'gemini', 'openai', 'groq', 'openrouter'] as string[]).includes(provider)
        ? provider
        : 'web';
      await insertKnowledgeEntry({
        content: resultText.slice(0, 800),
        label,
        source: canonicalSource,
        domain: domain || 'general',
        importance: 0.6,
      });
    } catch (err) {
      if (__DEV__) console.warn('[Jarvis] autoLearnFromWeb failed:', err);
    }
  }, [dbReady]);

  // ─── sendMessage ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    await new Promise(r => setTimeout(r, 50));

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    // ─── Dev Mode Chain ────────────────────────────────────────────────────────
    if (isDevMode) {
      const devIntent = detectDevIntent(text);

      if (devIntent !== 'none') {
        let devResponse = '';

        // 1. Încearcă offline: template sau explicație din devKnowledge
        if (devIntent === 'generate') {
          const templateResult = generateFromTemplate(text);
          if (templateResult) {
            devResponse = formatCodeResponse(templateResult);
            // Creează sau actualizează proiectul activ cu pașii generați (non-blocking)
            getActiveProject().then(async curProj => {
              let projectId: string;
              if (curProj) {
                projectId = curProj.id;
              } else {
                const projectName = templateResult.templateId
                  ? `App: ${templateResult.templateId}`
                  : text.slice(0, 60);
                const projectStack = templateResult.stack || 'react-native';
                const projectDesc = `Stack: ${projectStack}. Generat din: ${text.slice(0, 80)}`;
                const newProj = await createProject(projectName, projectStack, projectDesc);
                projectId = newProj.id;
              }
              for (const file of templateResult.files) {
                await addProjectStep(projectId, `Creare ${file.filename}`).catch(() => {});
                await saveProjectFile(projectId, file.filename, file.language, file.code).catch(() => {});
              }
              refreshProject();
            }).catch(() => {});
          }
        }

        if (!devResponse && (devIntent === 'explain' || devIntent === 'compare')) {
          const offlineExplanation = generateDevExplanation(text);
          if (offlineExplanation) {
            devResponse = offlineExplanation;
          }
        }

        // 2. Debug mode: extrage snippet din mesaj și trimite la AI Cloud
        if (devIntent === 'debug' || !devResponse) {
          const codeSnippet = extractCodeSnippet(text);
          const activeProj = await getActiveProject().catch(() => null);
          const projectContext = activeProj ? buildProjectContext(activeProj) : undefined;
          const projectSummary = activeProj ? formatProjectSummary(activeProj) : undefined;
          const enrichedText = projectSummary ? `${text}\n\n[Context proiect]\n${projectSummary}` : text;
          const aiPrompt = buildAICodePrompt(enrichedText, devIntent === 'debug' ? 'debug' : devIntent, projectContext, codeSnippet);

          // Încearcă AI Cloud
          if (aiSettings.activeProvider !== 'none') {
            try {
              const cloudResult = await aiGenerate(aiPrompt);
              if (cloudResult) {
                const providerName = cloudResult.provider === 'gemini' ? '✨ Gemini Dev' : '🤖 ChatGPT Dev';
                devResponse = `${providerName}:\n\n${cloudResult.text}`;
                autoLearnFromWeb(cloudResult.text, cloudResult.provider, text);
              }
            } catch {}
          }

          // Fallback offline pentru 'generate' fără template și fără AI
          if (!devResponse && devIntent === 'generate') {
            devResponse = `🔧 **Jarvis Dev — Mod Offline**\n\nAm detectat o cerere de generare cod pentru: **"${text.slice(0, 80)}"**\n\nÎn prezent nu am un template exact pentru această cerere și nu e configurat niciun provider AI.\n\n**Opțiuni:**\n• Conectează **Gemini** sau **ChatGPT** din setări (iconița 🔑) pentru generare cod complet\n• Încearcă formulări mai specifice:\n  — "generează app todo"\n  — "creează calculator"\n  — "scrie un timer app"\n  — "fă un QR scanner"\n  — "quiz app în React Native"\n  — "fitness tracker"\n\n**Template-uri disponibile offline:** todo, calculator, chat, notițe, weather, auth, API, landing, screen capture, QR scanner, timer, quiz, fitness tracker`;
          }
        }

        if (devResponse) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: devResponse,
            timestamp: new Date(),
          };
          setMessages(prev => {
            const next = [...prev, aiMsg];
            persist(next, brainRef.current);
            return next;
          });
          setIsThinking(false);
          return;
        }
      }
    }
    // ─── End Dev Mode Chain ───────────────────────────────────────────────────

    // Auto-detect fapte din mesajul utilizatorului și salvează în memoryFolder (non-blocking)
    const detectedFacts = autoDetectFacts(text);
    if (detectedFacts.length > 0) {
      Promise.all(detectedFacts.map(f =>
        writeMemoryEntry(f.fact, 'auto-detect', f.category).catch(() => {})
      )).catch(() => {});
    }

    let response = processMessage(text, brainRef.current, history);

    // Interceptează acțiunile pentru foldere externe
    if (response.startsWith('JARVIS_FOLDER_ACTION:')) {
      const action = response.slice('JARVIS_FOLDER_ACTION:'.length);
      try {
        if (action === 'acorda_acces') {
          const folder = await requestFolderAccess();
          if (folder) {
            response = `📂 Acces acordat la folderul **"${folder.name}"**!\n\nVoi scana automat fișierele text din acest folder și le voi memora.\n\nSpune "actualizează din foldere" pentru a re-scana oricând.`;
            scanAllFolders().catch(() => {});
          } else {
            response = 'Nu s-a acordat acces la niciun folder. Poți încerca din nou oricând.';
          }
        } else if (action === 'listeaza') {
          const folders = await getExternalFolders();
          if (folders.length === 0) {
            response = 'Nu am acces la niciun folder extern.\n\nSpune **"acordă acces la folder"** pentru a adăuga unul.';
          } else {
            const lines = folders.map((f, i) => `${i + 1}. **${f.name}** — ${f.fileCount ?? '?'} fișiere${f.lastScanned ? ` (scanat: ${new Date(f.lastScanned).toLocaleDateString('ro-RO')})` : ''}`);
            response = `📂 **Foldere cu acces:**\n\n${lines.join('\n')}`;
          }
        } else if (action === 'actualizeaza') {
          const folders = await getExternalFolders();
          if (folders.length === 0) {
            response = 'Nu am foldere de scanat. Spune **"acordă acces la folder"** pentru a adăuga unul.';
          } else {
            const results = await scanAllFolders();
            response = `🔄 Scanare completă!\n\n• **${results.totalFiles}** fișiere procesate din **${folders.length}** foldere\n• **${results.totalFacts}** informații noi adăugate în memorie`;
          }
        }
      } catch {
        response = '⚠️ Eroare la accesarea folderelor. Încearcă din nou.';
      }
    }

    // Interceptează acțiunile de memorie și folosește memoryFolder (canonic)
    if (response.startsWith('JARVIS_MEM_ACTION:')) {
      const parts = response.slice('JARVIS_MEM_ACTION:'.length).split('||');
      const action = parts[0];
      const param = parts[1] ?? '';
      try {
        if (action === 'salveaza') {
          await writeMemoryEntry(param, 'user', 'general');
          response = `Reținut: **"${param}"** ✅`;
        } else if (action === 'citeste') {
          const allMems = listAllMemories(100);
          if (allMems.length === 0) {
            response = 'Nu am notițe salvate. Spune "Reține că..." pentru a adăuga.';
          } else {
            const stats = getMemoryStats();
            const lines = allMems.map((m, i) => `${i + 1}. ${m.fact} *(${m.category})*`);
            response = `**Memorie (${stats.total} notițe):**\n\n${lines.join('\n')}`;
          }
        } else if (action === 'sterge_tot') {
          const count = await clearAllMemory();
          response = `Am șters ${count} notițe din memoria permanentă.`;
        } else if (action === 'uita_specific') {
          const removed = await deleteMemoryByKeyword(param);
          if (removed === 0) {
            response = `Nu am găsit nimic despre "${param}" în memorie.`;
          } else {
            response = `Am șters ${removed} notiță/notițe despre "${param}" ✅`;
          }
        }
      } catch {
        response = '⚠️ Eroare la accesarea memoriei. Încearcă din nou.';
      }
    }

    // Detectează dacă utilizatorul vrea explicit căutare online
    const wantsOnline = isOnlineIntent(text);

    // ── Helper: construieste system prompt bogat din starea creierului ──────────
    const buildCloudCtx = () => {
      const brain = brainRef.current;
      const rankedFacts = brain.selfKnowledge.learnedFacts
        .map(f => ({ f, score: semanticSimilarity(text, f) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(x => x.f);
      const memFacts = getRelevantMemories(memoryRef.current, text, 10);
      const folderFacts = searchMemoryFolder(text, 10);
      const combinedFacts = [...new Set([...rankedFacts, ...memFacts, ...folderFacts])].slice(0, 20);
      const ctx: JarvisContext = {
        userName: brain.userName ?? undefined,
        preferredStyle: brain.selfKnowledge.preferredStyle,
        topTopics: Object.entries(brain.selfKnowledge.topicFrequency)
          .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t),
        learnedFacts: combinedFacts,
        inferenceRules: brain.inferenceEngine.rules
          .filter(r => r.confidence > 0.7).slice(-5).map(r => r.subject + ' ' + r.predicate),
        entities: brain.entityTracker.entities
          .filter(e => e.relation !== 'eu').slice(-8)
          .map(e => ({ value: e.value, relation: e.relation ?? 'context' })),
        recentTopics: brain.lastTopics,
        conversationCount: brain.conversationCount,
      };
      return buildRichSystemPrompt(ctx);
    };

    const autoLearnFromCloud = (cloudResult: { text: string; provider: string }) => {
      autoLearnFromWeb(cloudResult.text, cloudResult.provider, text);
      const STRUCTURED_FACT = /\b(este|sunt|are|poate|reprezintă|înseamnă|conține|produce|provoacă|implică)\b/i;
      const brain = brainRef.current;
      let memoryChanged = false;
      cloudResult.text.split(/[.!\n]/).map(s => s.trim())
        .filter(s => s.length > 25 && s.length < 220 && STRUCTURED_FACT.test(s) && !brain.selfKnowledge.learnedFacts.includes(s))
        .slice(0, 3)
        .forEach(sent => {
          if (brain.selfKnowledge.learnedFacts.length < 200) brain.selfKnowledge.learnedFacts.push(sent);
          const bestRule = extractRulesFromFact(sent, 'deduced').find(r => r.confidence >= 0.75);
          if (bestRule) addFact(brain.inferenceEngine, sent, 'deduced');
          const updated = addMemoryEntry(memoryRef.current, sent, cloudResult.provider);
          if (updated !== memoryRef.current) {
            memoryRef.current = updated;
            memoryChanged = true;
          }
          writeMemoryEntry(sent, cloudResult.provider, 'fapt').catch(() => {});
        });
      if (memoryChanged) saveMemory(memoryRef.current);
    };

    // ── Comandă imperativă → direct la Cloud AI ────────────────────────────────
    if (response.startsWith('JARVIS_CMD:')) {
      const parts = response.slice('JARVIS_CMD:'.length).split('||');
      const cmdLabel = parts[0] ?? 'comandă';
      const cmdOriginal = parts[1] ?? text;

      if (aiSettings.activeProvider !== 'none') {
        try {
          const aiResult = await aiGenerate(cmdOriginal, buildCloudCtx(), history.slice(-20) as ConversationTurn[]);
          if (aiResult) {
            response = aiResult.text.trim();
            autoLearnFromCloud(aiResult);
          } else {
            response = `⚠️ Provider AI nu răspunde. Verifică cheia API și conexiunea la internet.`;
          }
        } catch {
          response = `⚠️ Eroare la executarea comenzii "${cmdLabel}". Verifică conexiunea și cheia API.`;
        }
      } else {
        response = `Activează **Gemini** sau **ChatGPT** din meniul ⚙️ pentru a putea folosi comenzi AI avansate (${cmdLabel}).`;
      }
    }

    // ── Cloud AI PRIMAR: când e activ, răspunde el la ORICE întrebare ──────────
    else if (aiSettings.activeProvider !== 'none') {
      try {
        const cloudResult = await aiGenerate(text, buildCloudCtx(), history.slice(-20) as ConversationTurn[]);
        if (cloudResult?.text) {
          response = cloudResult.text.trim();
          autoLearnFromCloud(cloudResult);
        }
        // Dacă Cloud AI eșuează → continuăm cu fallback-urile de mai jos
      } catch {
        // Cloud AI indisponibil temporar — continuăm cu fallback
      }
    }

    // ── Fallback offline (doar dacă Cloud AI e off sau a eșuat) ───────────────
    else {
      const isClassicFallback = response.startsWith('Nu am date') ||
        response.startsWith('Nu am găsit') ||
        response.startsWith('Subiect interesant') ||
        response.startsWith('Înțeleg ideea');

      // Fallback 1: LLM local (Phi-3 Mini) dacă e disponibil
      if (isClassicFallback && llmStatus === 'ready') {
        const state = brainRef.current;
        const llmResp = await llmGenerate(text, {
          userName: state.userName,
          creatorName: state.creatorId,
          learnedFacts: state.selfKnowledge.learnedFacts.slice(-20),
          history: history.slice(-20) as { role: 'user' | 'assistant'; content: string }[],
        });
        if (llmResp) response = `🧠 ${llmResp}`;
      }

      // Fallback 2: Cunoaștere acumulată anterior din DB
      let answeredFromDB = false;
      if (isClassicFallback && dbReady) {
        try {
          const dbAnswer = await queryKnowledgeForAnswer(text, 0.4);
          if (dbAnswer) {
            response = synthesizeWebResponse(
              dbAnswer.content, dbAnswer.source ?? 'Memorie locală', text,
              detectQuestionType(text), { userName: brainRef.current.userName ?? undefined },
            );
            answeredFromDB = true;
          }
        } catch {}
      }

      // Fallback 3: Căutare online (Wikipedia RO + EN + DuckDuckGo)
      const shouldSearchOnline = wantsOnline || (isClassicFallback && !answeredFromDB);
      if (shouldSearchOnline) {
        setWebSearching(true);
        try {
          const onlineResult = await searchOnlineSynthesized(text);
          if (onlineResult.found) {
            response = synthesizeWebResponse(
              onlineResult.text, onlineResult.source, text,
              detectQuestionType(text), { userName: brainRef.current.userName ?? undefined },
            );
            autoLearnFromWeb(onlineResult.text, onlineResult.source, text);
          }
        } catch {
          // Fără internet sau eroare — continuăm
        } finally {
          setWebSearching(false);
        }
      }
    }

    setBrainState({ ...brainRef.current });

    // Persistează entitățile actualizate în SQLite (non-blocking)
    persistEntities(brainRef.current);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const next = [...prev, aiMsg];
      persist(next, brainRef.current);
      return next;
    });

    setIsThinking(false);
  }, [persist, messages, llmStatus, llmGenerate, aiGenerate, aiSettings, autoLearnFromWeb, persistEntities, dbReady, isDevMode, refreshProject]);

  const addDocument = useCallback(async (name: string, content: string) => {
    setIsThinking(true);
    await new Promise(r => setTimeout(r, 50));

    const response = processDocument(name, content, brainRef.current);
    setBrainState({ ...brainRef.current });

    const aiMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const next = [...prev, aiMsg];
      persist(next, brainRef.current);
      return next;
    });
    setIsThinking(false);
  }, [persist]);

  const removeDocument = useCallback((id: string) => {
    brainRef.current.learnedDocuments = brainRef.current.learnedDocuments.filter(d => d.id !== id);
    setBrainState({ ...brainRef.current });
    saveBrainStateFull(JSON.stringify(brainRef.current)).catch(() => {
      AsyncStorage.setItem(STATE_KEY, JSON.stringify(brainRef.current));
    });
  }, []);

  const clearConversation = useCallback(() => {
    const msgCount = messages.filter(m => m.role === 'user').length;
    archiveCurrentSession(brainRef.current, msgCount);

    const reset: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Conversația resetată! Sunt Jarvis, gata de la zero.\n\nDocumentele, memoria, entitățile și cunoașterea mea sunt păstrate.',
      timestamp: new Date(),
    };
    setMessages([reset]);

    const prev = brainRef.current;
    brainRef.current = {
      ...createInitialBrainState(),
      learnedDocuments: prev.learnedDocuments,
      memory: prev.memory,
      userName: prev.userName,
      selfKnowledge: prev.selfKnowledge,
      creatorId: prev.creatorId,
      isCreatorPresent: prev.isCreatorPresent,
      entityTracker: prev.entityTracker,
      inferenceEngine: prev.inferenceEngine,
      temporalMemory: prev.temporalMemory,
      constitutionState: prev.constitutionState,
    };
    setBrainState({ ...brainRef.current });

    const stateJson = JSON.stringify(brainRef.current);
    const msgsJson = JSON.stringify([reset]);
    saveBrainStateFull(stateJson).catch(() => {
      AsyncStorage.setItem(STATE_KEY, stateJson);
    });
    saveMessagesFull(msgsJson).catch(() => {
      AsyncStorage.setItem(MESSAGES_KEY, msgsJson);
    });
  }, [messages]);

  return (
    <BrainContext.Provider value={{
      messages, isThinking, webSearching, brainState, dbReady,
      sendMessage, clearConversation, addDocument, removeDocument,
    }}>
      {children}
    </BrainContext.Provider>
  );
}

export function useBrain() {
  const ctx = useContext(BrainContext);
  if (!ctx) throw new Error('useBrain must be used within BrainProvider');
  return ctx;
}

// ─── Sincronizare entități din SQLite → EntityTracker (non-blocking) ──────────

async function _syncEntitiesFromDB(state: BrainState): Promise<void> {
  try {
    const rows = await loadAllEntities();
    if (rows.length === 0) return;
    if (!Array.isArray(state.entityTracker.entities)) {
      state.entityTracker.entities = [];
    }
    const existingNormalized = new Set(state.entityTracker.entities.map(e => e.normalized));
    for (const row of rows) {
      // Adaugă doar entitățile care nu există deja în tracker (evită duplicate)
      if (!existingNormalized.has(row.name)) {
        const VALID_ENTITY_TYPES: EntityType[] = ['person', 'place', 'number', 'concept', 'event'];
        const entityType: EntityType = VALID_ENTITY_TYPES.includes(row.type as EntityType)
          ? (row.type as EntityType)
          : 'concept';
        const edata: EntityData = row.data;
        state.entityTracker.entities.push({
          id: row.name,
          type: entityType,
          value: edata.value,
          normalized: row.name,
          firstSeen: edata.firstSeen,
          occurrences: edata.occurrences,
          context: edata.context,
          relation: edata.relation,
        });
        existingNormalized.add(row.name);
      }
    }
  } catch {}
}
