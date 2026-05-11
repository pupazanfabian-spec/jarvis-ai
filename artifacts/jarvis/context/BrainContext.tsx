
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
import { loadMemory, saveMemory, addMemoryEntry, getRelevantMemories, formatMemoriesForPrompt, type MemoryStore, type MemoryCategory } from '@/engine/memory';
import { initMemoryFolder, writeMemoryEntry, searchMemory as searchMemoryFolder, migrateFromAsyncStorage as migrateMemoryFolder, getMemoryStats, listAllMemories, deleteMemoryByKeyword, clearAllMemory, saveConversation } from '@/engine/memoryFolder';
import { requestFolderAccess, getExternalFolders, scanAllFolders } from '@/engine/externalFolders';
import { autoDetectFacts, normalizeInput, detectIntentWithConfidence, loadLearnedPatterns, saveLearnedPatterns, extractPatternsFromState, type LearnedPatterns, isResponseVague } from '@/engine/brain';
import { useDevMode } from '@/context/DevModeContext';

interface BrainContextType {
  messages: Message[];
  isThinking: boolean;
  webSearching: boolean;
  wantsOnline: boolean;
  brainState: BrainState;
  dbReady: boolean;
  lastProvider: string;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  addDocument: (name: string, content: string) => Promise<void>;
  removeDocument: (id: string) => void;
  setWantsOnline: (val: boolean) => void;
}

const BrainContext = createContext<BrainContextType | null>(null);

// Keys AsyncStorage (folosite doar pentru migrare one-time)
const MESSAGES_KEY = '@jarvis_v3_messages';
const STATE_KEY = '@jarvis_v3_state';

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Salut! Sunt **Jarvis** — AI cu minte proprie, offline și online. 🧠\n\n**Ce pot face:**\n🤔 Răspund din 270+ subiecte din memorie\n📡 Caut pe internet în timp real (DuckDuckGo, Wikipedia, News)\n🔗 Deduc logic din ce îmi spui\n👤 Rețin persoanele și entitățile menționate\n💾 Memorie persistentă: îmi amintesc cine ești și ce preferi între sesiuni\n\n**Cum te cheamă?** Sau întreabă-mă orice.',
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
  const [wantsOnline, setWantsOnline] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [lastProvider, setLastProvider] = useState('Groq');
  const brainRef = useRef<BrainState>(createInitialBrainState());
  const isProcessing = useRef(false);
  const [brainState, setBrainState] = useState<BrainState>(brainRef.current);
  const memoryRef = useRef<MemoryStore>({ entries: [] });
  const loaded = useRef(false);
  const { generate: llmGenerate, status: llmStatus } = useLLM();
  const aiProvider = useAIProvider();
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

        // 7. Încarcă memoria JSON persistentă și pattern-urile învățate
        memoryRef.current = await loadMemory();
        const patterns = await loadLearnedPatterns();
        if (patterns) {
          brainRef.current.learnedPatterns = patterns;
        }

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
          const [asMsgs, asState, asPatterns] = await Promise.all([
            AsyncStorage.getItem(MESSAGES_KEY),
            AsyncStorage.getItem(STATE_KEY),
            loadLearnedPatterns(),
          ]);
          if (asPatterns) brainRef.current.learnedPatterns = asPatterns;
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
        saveConversation(Date.now().toString(), msgsSliced),
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
      let category: MemoryCategory = 'general';
      if (/vrea|îmi place|prefer|îmi place|vreau/i.test(fact)) category = 'preferinte';
      else if (/lucrez|numele|cheamă|stau|locuiesc|ani/i.test(fact)) category = 'fapte_utilizator';
      else if (/scop|obiectiv|țel|planific/i.test(fact)) category = 'obiective';

      const updated = addMemoryEntry(memoryRef.current, fact, 'brain', category);
      if (updated !== memoryRef.current) {
        memoryRef.current = updated;
        memChanged = true;
      }
    }
    if (state.userName) {
      const nameFact = `Utilizatorul se numește ${state.userName}`;
      const updated = addMemoryEntry(memoryRef.current, nameFact, 'user', 'fapte_utilizator', 0.9);
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

  const autoLearnFromCloud = useCallback(async (result: { text: string; provider: string }) => {
    await autoLearnFromWeb(result.text, result.provider, '');
  }, [autoLearnFromWeb]);

  const buildCloudCtx = useCallback((query?: string): string => {
    const state = brainRef.current;
    
    // Obținem amintirile relevante pentru query-ul curent
    const relevantMemories = getRelevantMemories(memoryRef.current, query || '', 15);
    const memoryContext = formatMemoriesForPrompt(relevantMemories);

    let patternsCtx = '';
    if (state.learnedPatterns) {
      patternsCtx = `\n### PATTERN-URI ÎNVĂȚATE:\n` +
        `- Topicuri preferate: ${state.learnedPatterns.topTopics.join(', ')}\n` +
        `- Stil preferat: ${state.learnedPatterns.preferredStyle}\n` +
        `- Interese: ${state.learnedPatterns.userInterests.join(', ')}\n`;
    }

    const ctx: JarvisContext = {
      userName: state.userName || undefined,
      preferredStyle: state.selfKnowledge.preferredStyle,
      topTopics: Object.entries(state.selfKnowledge.topicFrequency)
        .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t),
      learnedFacts: state.selfKnowledge.learnedFacts.slice(-10),
      inferenceRules: (state.inferenceEngine as any).rules.slice(-5).map((r: any) => r.if + ' -> ' + r.then),
      entities: state.entityTracker.entities.slice(-8).map(e => ({ value: e.value, relation: e.relation || '' })),
      recentTopics: state.lastTopics.slice(-5),
      conversationCount: state.conversationCount,
      customContext: memoryContext + patternsCtx, // Injectăm memoria și pattern-urile
    };
    return buildRichSystemPrompt(ctx);
  }, []);

  const _handleOfflineFallback = useCallback(async (
    text: string,
    history: ConversationTurn[],
    intent: string,
  ): Promise<string> => {
    let response = processMessage(text, brainRef.current, history);

    const isClassicFallback = response.startsWith('Nu am date') ||
      response.startsWith('Nu am găsit') ||
      response.startsWith('Subiect interesant') ||
      response.startsWith('Înțeleg ideea') ||
      response.startsWith('Nu am informații') ||
      response.startsWith('Subiectul') ||
      response.startsWith('Nu am suficiente') ||
      response.startsWith('JARVIS_CMD:auto');

    if (response.startsWith('JARVIS_CMD:auto')) {
      // Dacă am ajuns aici, Cloud AI a eșuat sau e oprit, deci ignorăm prefixul
      response = 'Nu am date suficiente despre acest subiect în memoria locală.';
    }

    // Fallback 1: LLM local (Phi-3 Mini) dacă e disponibil
    if (isClassicFallback && llmStatus === 'ready') {
      const state = brainRef.current;
      const llmResp = await llmGenerate(text, {
        userName: state.userName,
        creatorName: state.creatorId,
        learnedFacts: state.selfKnowledge.learnedFacts.slice(-20),
        history: history.slice(-20) as { role: 'user' | 'assistant'; content: string }[],
      });
      if (llmResp) return `🧠 ${llmResp}`;
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
      } catch { }
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
    return response;
  }, [dbReady, llmGenerate, llmStatus, wantsOnline, autoLearnFromWeb]);

  // ─── Sync lastProvider cu setările active ────────────────────────────
  useEffect(() => {
    if (aiProvider.settings.activeProvider !== 'none' && aiProvider.settings.activeProvider !== 'auto') {
      const p = aiProvider.settings.activeProvider;
      const pName = p.charAt(0).toUpperCase() + p.slice(1);
      setLastProvider(pName === 'Openrouter' ? 'OpenRouter' : (pName === 'Openai' ? 'ChatGPT' : pName));
    } else if (aiProvider.settings.activeProvider === 'auto') {
      setLastProvider('Auto');
    }
  }, [aiProvider.settings.activeProvider]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing.current) return;
    isProcessing.current = true;
    setIsThinking(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      await new Promise(r => setTimeout(r, 50));

      // Folosim varianta funcțională a setMessages pentru a asigura că avem istoricul corect
      let currentMessages: Message[] = [];
      setMessages(prev => { currentMessages = prev; return prev; });
      const history = currentMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));

      let response = '';

      // ─── Survey Handler: Căutare Online Forțată ────────────────────────────────
      if (text === 'Caută online despre asta') {
        const lastUserMsg = [...currentMessages].reverse().find(m => m.role === 'user' && m.content !== text);
        const searchQuery = lastUserMsg ? lastUserMsg.content : '';
        
        if (searchQuery) {
          setWebSearching(true);
          setLastProvider('Web Search');
          try {
            const onlineResult = await searchOnlineSynthesized(searchQuery);
            if (onlineResult.found) {
              response = synthesizeWebResponse(
                onlineResult.text, onlineResult.source, searchQuery,
                detectQuestionType(searchQuery), { userName: brainRef.current.userName ?? undefined },
              );
              autoLearnFromWeb(onlineResult.text, onlineResult.source, searchQuery);
            } else {
              response = `Nu am găsit informații noi online despre "${searchQuery}".`;
            }
          } catch {
            response = 'Nu am putut accesa internetul în acest moment.';
          } finally {
            setWebSearching(false);
          }
        }
      }

      // ─── Dev Mode Chain ────────────────────────────────────────────────────────
      if (!response && isDevMode) {
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
                  await addProjectStep(projectId, `Creare ${file.filename}`).catch(() => { });
                  await saveProjectFile(projectId, file.filename, file.language, file.code).catch(() => { });
                }
                refreshProject();
              }).catch(() => { });
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
            if (aiProvider.settings.activeProvider !== 'none') {
              try {
                const cloudResult = await aiProvider.generate(aiPrompt);
                if (cloudResult) {
                  const providerName = cloudResult.provider === 'gemini' ? '✨ Gemini Dev' : '🤖 ChatGPT Dev';
                  devResponse = `${providerName}:\n\n${cloudResult.text}`;
                  autoLearnFromWeb(cloudResult.text, cloudResult.provider, text);
                  setLastProvider(cloudResult.provider === 'gemini' ? 'Gemini' : 'ChatGPT');
                }
              } catch { }
            }

            // Fallback offline pentru 'generate' fără template și fără AI
            if (!devResponse && devIntent === 'generate') {
              devResponse = `🔧 **Jarvis Dev — Mod Offline**\n\nAm detectat o cerere de generare cod pentru: **"${text.slice(0, 80)}"**\n\nÎn prezent nu am un template exact pentru această cerere și nu e configurat niciun provider AI.\n\n**Opțiuni:**\n• Conectează **Gemini** sau **ChatGPT** din setări (iconița 🔑) pentru generare cod complet\n• Încearcă formulări mai specifice:\n  — "generează app todo"\n  — "creează calculator"\n  — "scrie un timer app"\n  — "fă un QR scanner"\n  — "quiz app în React Native"\n  — "fitness tracker"\n\n**Template-uri disponibile offline:** todo, calculator, chat, notițe, weather, auth, API, landing, screen capture, QR scanner, timer, quiz, fitness tracker`;
              setLastProvider('Local');
            }
          }

          if (devResponse) {
            response = devResponse;
          }
        }
      }
      // ─── End Dev Mode Chain ───────────────────────────────────────────────────

      if (!response) {
        // Auto-detect fapte din mesajul utilizatorului și salvează în memorie (non-blocking)
        const detectedFacts = autoDetectFacts(text);
        if (detectedFacts.length > 0) {
          let memUpdated = false;
          detectedFacts.forEach(f => {
            const updated = addMemoryEntry(memoryRef.current, f.fact, 'auto-detect', f.category);
            if (updated !== memoryRef.current) {
              memoryRef.current = updated;
              memUpdated = true;
            }
            writeMemoryEntry(f.fact, 'auto-detect', f.category as any).catch(() => { });
          });
          if (memUpdated) saveMemory(memoryRef.current).catch(() => {});
        }

        response = processMessage(text, brainRef.current, history);
        const intent = (brainRef.current as any).lastIntent || 'unknown';

        // ── Execuție Acțiuni Speciale (Memorie & Foldere) ─────────────────────────
        if (response.startsWith('JARVIS_MEM_ACTION:') || response.startsWith('JARVIS_FOLDER_ACTION:')) {
          const isMem = response.startsWith('JARVIS_MEM_ACTION:');
          const fullAction = response.slice(isMem ? 'JARVIS_MEM_ACTION:'.length : 'JARVIS_FOLDER_ACTION:'.length);
          const [action, payload] = fullAction.split('||');

          if (isMem) {
            if (action === 'salveaza') {
              await writeMemoryEntry(payload, 'user', 'manual' as any);
              response = `Am memorat: **"${payload}"** 💾`;
            } else if (action === 'citeste') {
              const stats = getMemoryStats();
              const items = listAllMemories();
              response = `🧠 **Memoria mea (${stats.total} însemnări):**\n\n` +
                (items.length > 0 ? items.map(m => `• ${m.fact}`).join('\n') : 'Nu am nicio însemnare memorată încă.');
            } else if (action === 'sterge_tot') {
              await clearAllMemory();
              response = 'Am șters întreaga memorie persistentă. 🧼';
            } else if (action === 'uita_specific') {
              const deletedCount = await deleteMemoryByKeyword(payload);
              response = deletedCount > 0
                ? `Am eliminat din memorie referințele la: **"${payload}"**. 🗑️`
                : `Nu am găsit nimic despre **"${payload}"** în memorie.`;
            }
          } else {
            if (action === 'acorda_acces') {
              const granted = await requestFolderAccess();
              response = granted ? 'Acces la foldere acordat cu succes! ✅' : 'Accesul la foldere a fost refuzat.';
            } else if (action === 'listeaza') {
              const folders = await getExternalFolders();
              response = folders.length > 0
                ? `📂 **Foldere accesibile:**\n\n${folders.map(f => `• ${f.name} (${f.uri})`).join('\n')}`
                : 'Nu am acces la niciun folder extern încă. Folosește "acordă acces" pentru a adăuga unul.';
            } else if (action === 'actualizeaza') {
              const count = await scanAllFolders();
              response = `Am scanat folderele și am găsit/actualizat **${count}** fișiere în memoria mea locală. 🔄`;
            }
          }
        }

        // ── Comandă imperativă → direct la Cloud AI ────────────────────────────────
        if (response.startsWith('JARVIS_CMD:')) {
          const parts = response.slice('JARVIS_CMD:'.length).split('||');
          const cmdLabel = parts[0] ?? 'comandă';
          const cmdOriginal = parts[1] ?? text;

          // Forțăm Groq dacă este cerut explicit
          const forceGroq = cmdLabel === 'groq' && aiProvider.settings.groqKey;

          if (aiProvider.settings.activeProvider !== 'none' || forceGroq) {
            try {
              const assistantId = (Date.now() + 1).toString();
              setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

              // Dacă forțăm Groq, folosim intent-ul pentru a semnaliza provider-ului
              const finalIntent = forceGroq ? 'cmd_groq_direct' : intent;

              const aiResult = await aiProvider.generateStream(cmdOriginal, (chunk) => {
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
              }, buildCloudCtx(text), (history as any).slice(-20), finalIntent);

              if (aiResult) {
                response = aiResult.text.trim();
                autoLearnFromCloud(aiResult).catch(() => {});
                
                const pName = aiResult.provider.charAt(0).toUpperCase() + aiResult.provider.slice(1);
                setLastProvider(pName === 'Openrouter' ? 'OpenRouter' : (pName === 'Openai' ? 'ChatGPT' : pName));
              } else {
                response = `⚠️ Provider AI nu răspunde. Verifică cheia API și conexiunea la internet.`;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: response } : m));
                setLastProvider('Eroare');
              }
            } catch (err) {
              response = `⚠️ Eroare la executarea comenzii "${cmdLabel}". Verifică conexiunea și cheia API.`;
              setLastProvider('Eroare');
            }
          } else {
            response = `Activează **Gemini** sau **ChatGPT** din meniul ⚙️ pentru a putea folosi comenzi AI avansate (${cmdLabel}).`;
            setLastProvider('Local');
          }
        }

        // ── Cloud AI PRIMAR: când e activ, răspunde el la ORICE întrebare ──────────
        else if (aiProvider.settings.activeProvider !== 'none') {
          let aiSuccess = false;
          try {
            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

            const aiResult = await aiProvider.generateStream(text, (chunk) => {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
            }, buildCloudCtx(text), (history as any).slice(-20), intent);

            if (aiResult?.text) {
              response = aiResult.text.trim();
              autoLearnFromCloud(aiResult).catch(() => {});
              aiSuccess = true;
              
              const pName = aiResult.provider.charAt(0).toUpperCase() + aiResult.provider.slice(1);
              setLastProvider(pName === 'Openrouter' ? 'OpenRouter' : (pName === 'Openai' ? 'ChatGPT' : pName));
            } else {
              // Eliminăm mesajul gol de asistent dacă provider-ul a eșuat
              setMessages(prev => prev.filter(m => m.id !== assistantId));
            }
          } catch (err) {
            if (__DEV__) console.warn('[BrainContext] Cloud AI failed:', err);
          }

          if (!aiSuccess) {
            // Dacă AI Cloud a eșuat, continuăm cu Fallback Offline (Local)
            if (__DEV__) console.log('[BrainContext] Cloud AI failed or returned empty, falling back to local...');
            response = await _handleOfflineFallback(text, (history as any), intent);
            setLastProvider('Local');
          }
        }

        // ── Fallback offline (când Cloud AI e dezactivat) ─────────────────────────
        else {
          response = await _handleOfflineFallback(text, (history as any), intent);
          setLastProvider('Local');
        }
      }

      setBrainState({ ...brainRef.current });

      // Persistează entitățile actualizate în SQLite (non-blocking)
      persistEntities(brainRef.current);

      const confidence = (brainRef.current as any).lastConfidence ?? 1.0;
      
      // Dacă am afișat deja mesajul asistentului prin streaming (Cloud AI), nu-l mai adăugăm
      // Altfel (offline/local/dev), îl adăugăm acum
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        let next = prev;
        
        // Dacă ultimul mesaj nu este asistent sau este gol (posibil de la streaming), 
        // ne asigurăm că avem un mesaj valid
        if (!lastMsg || lastMsg.role !== 'assistant' || (lastMsg.role === 'assistant' && lastMsg.content === '')) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            confidence,
          };
          if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === '') {
             next = [...prev.slice(0, -1), aiMsg];
          } else {
             next = [...prev, aiMsg];
          }
        } else if (lastMsg.role === 'assistant') {
          // Actualizăm doar confidence pentru mesajul de streaming existent
          next = prev.map(m => m.id === lastMsg.id ? { ...m, confidence } : m);
        }

        // Dacă răspunsul este vag sau are confidence scăzut, cerem permisiunea pentru un sondaj
        const needsClarification = isResponseVague(response, confidence);
        
        if (needsClarification && !response.includes('JARVIS_MEM_ACTION') && !response.includes('JARVIS_CMD')) {
          next.push({
            id: (Date.now() + 2).toString(),
            role: 'survey_permission',
            content: 'Cerere permisiune sondaj',
            timestamp: new Date(),
          });
        }
        persist(next, brainRef.current).catch(() => {});
        return next;
      });
    } catch (err) {
      if (__DEV__) console.warn('[BrainContext] sendMessage failed:', err);
    } finally {
      setIsThinking(false);
      isProcessing.current = false;
    }
  }, [persist, isThinking, webSearching, llmStatus, llmGenerate, aiProvider, autoLearnFromWeb, persistEntities, dbReady, isDevMode, refreshProject, wantsOnline, buildCloudCtx, autoLearnFromCloud, _handleOfflineFallback]);

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
      messages, isThinking, webSearching, wantsOnline, brainState, dbReady, lastProvider,
      sendMessage, clearConversation, addDocument, removeDocument, setWantsOnline,
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
