import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
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
import { searchOnline, isOnlineIntent, searchOnlineSynthesized, extractTopSentences, smartWebSearch, extractSearchQuery } from '@/engine/webSearch';
import { detectQuestionType, synthesizeWebResponse, detectTopicCategory } from '@/engine/responseGenerator';
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
  loadMemory, saveMemory, addMemoryEntry, getRelevantMemories, formatMemoriesForPrompt, type MemoryStore, type MemoryCategory,
} from '@/engine/memory';
import { initMemoryFolder, writeMemoryEntry, searchMemory as searchMemoryFolder, migrateFromAsyncStorage as migrateMemoryFolder, getMemoryStats, listAllMemories, deleteMemoryByKeyword, clearAllMemory, saveConversation } from '@/engine/memoryFolder';
import { requestFolderAccess, getExternalFolders, scanAllFolders } from '@/engine/externalFolders';
import { autoDetectFacts, normalizeInput, detectIntentWithConfidence, loadLearnedPatterns, saveLearnedPatterns, extractPatternsFromState, type LearnedPatterns, isResponseVague } from '@/engine/brain';
import * as MemoryManager from '@/engine/memoryManager';
import { useDevMode } from '@/context/DevModeContext';
import * as studioManager from '@/engine/code-studio/studioManager';
import { useLLM } from '@/context/LLMContext';

import { getSubAgents, callSubAgent, SubAgent, deleteSubAgent, toggleSubAgent, createSubAgent } from '@/engine/code-studio/subAgentManager';
import { getAllSkills, detectSkill } from '@/engine/code-studio/skills';
import { orchestrator } from '@/engine/orchestrator';
import { useAIProvider } from '@/context/AIProviderContext';

export { useAIProvider };

interface BrainContextType {
  messages: Message[];
  isThinking: boolean;
  isAccessingMemory: boolean; // ADĂUGAT
  webSearching: boolean;
  thinkingComplexity: number;
  wantsOnline: boolean;
  brainState: BrainState;
  dbReady: boolean;
  lastProvider: string;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  addDocument: (name: string, content: string) => Promise<void>;
  removeDocument: (id: string) => void;
  setWantsOnline: (val: boolean) => void;
  studio: typeof studioManager;
}

const BrainContext = createContext<BrainContextType | null>(null);

const MESSAGES_KEY = '@jarvis_v3_messages';
const STATE_KEY = '@jarvis_v3_state';

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Salut! Sunt **Jarvis** — AI cu minte proprie, offline și online. 🧠

**Ce pot face:**
🤔 Răspund din 270+ subiecte din memorie
📡 Caut pe internet în timp real (DuckDuckGo, Wikipedia, News)
🔗 Deduc logic din ce îmi spui
👤 Rețin persoanele și entitățile menționate
💾 Memorie persistentă: îmi amintesc cine ești și ce preferi între sesiuni

**Cum te cheamă?** Sau întreabă-mă orice.`,
  timestamp: new Date(),
};

function migrateParsedState(parsed: BrainState): BrainState {
  parsed.learnedDocuments = (parsed.learnedDocuments || []).map(d => ({ ...d, addedAt: new Date(d.addedAt) }));
  if (!parsed.mindState) parsed.mindState = createMindState();
  if (!parsed.selfKnowledge) parsed.selfKnowledge = createSelfKnowledge();
  if (parsed.creatorId === undefined) parsed.creatorId = null;
  if (parsed.isCreatorPresent === undefined) parsed.isCreatorPresent = false;
  if (!parsed.entityTracker) parsed.entityTracker = createEntityTracker();
  if (!parsed.inferenceEngine) parsed.inferenceEngine = createInferenceEngine();
  if (!parsed.temporalMemory) parsed.temporalMemory = createTemporalMemory();
  if (!parsed.constitutionState) parsed.constitutionState = createConstitutionState();
  if (!parsed.selfKnowledge.responseQualityMap) parsed.selfKnowledge.responseQualityMap = {};
  if (parsed.selfKnowledge.totalMessages === undefined) parsed.selfKnowledge.totalMessages = 0;
  return parsed;
}

export function BrainProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isThinking, setIsThinking] = useState(false);
  const [webSearching, setWebSearching] = useState(false);
  const [thinkingComplexity, setThinkingComplexity] = useState(3);
  const [wantsOnline, setWantsOnline] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [lastProvider, setLastProvider] = useState('Groq');
  const brainRef = useRef<BrainState>(createInitialBrainState());
  const isProcessing = useRef(false);
  const [brainState, setBrainState] = useState<BrainState>(brainRef.current);
  const memoryRef = useRef<MemoryStore>({ entries: [] });
  const loaded = useRef(false);
  const { generate: llmGenerate, status: llmStatus, skipped: llmSkipped } = useLLM();
  const aiProvider = useAIProvider();
  const { isDevMode, toggleDevMode, activeProject, refreshProject } = useDevMode();
  const [currentSessionId] = useState(() => Date.now().toString());

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      try {
        await getDB();
        setDbReady(true);
        autoPruneKnowledge().catch(() => {});
        await loadDynamicConceptsFromDB();
        const migrationDone = await isMigrationDone();
        let stateJson = null, msgsJson = null;
        if (!migrationDone) {
          const [asMsgs, asState] = await Promise.all([AsyncStorage.getItem(MESSAGES_KEY), AsyncStorage.getItem(STATE_KEY)]);
          stateJson = asState; msgsJson = asMsgs;
          if (asState) await saveBrainStateFull(asState);
          if (asMsgs) await saveMessagesFull(asMsgs);
          await markMigrationDone();
        } else {
          [stateJson, msgsJson] = await Promise.all([loadBrainStateFull(), loadMessagesFull()]);
        }
        if (stateJson) {
          brainRef.current = migrateParsedState(JSON.parse(stateJson));
          setBrainState({ ...brainRef.current });
        }
        if (msgsJson) {
          const msgs = (JSON.parse(msgsJson) as Message[]).map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
          if (msgs.length > 0) setMessages(msgs);
        }
        memoryRef.current = await loadMemory();
        const patterns = await loadLearnedPatterns();
        if (patterns) brainRef.current.learnedPatterns = patterns;
        await initMemoryFolder();
        _syncEntitiesFromDB(brainRef.current);
      } catch (e) {
        setDbReady(false);
      }
    })();
  }, []);

  const persist = useCallback(async (msgs: Message[], state: BrainState) => {
    const msgsSliced = msgs.slice(-100);
    try {
      await Promise.all([saveBrainStateFull(JSON.stringify(state)), saveMessagesFull(JSON.stringify(msgsSliced)), saveConversation(Date.now().toString(), msgsSliced)]);
    } catch {}
    if (state.userName) {
      const updated = addMemoryEntry(memoryRef.current, `Utilizatorul se numește ${state.userName}`, 'user', 'fapte_utilizator', 0.9);
      if (updated !== memoryRef.current) { memoryRef.current = updated; await saveMemory(memoryRef.current); }
    }
  }, []);

  const persistEntities = useCallback((state: BrainState) => {
    const tracker = state.entityTracker;
    if (!tracker || !Array.isArray(tracker.entities)) return;
    tracker.entities.forEach(e => upsertEntity(e.normalized, e.type, { value: e.value }).catch(() => {}));
  }, []);

  const autoLearnFromWeb = useCallback(async (text: string, provider: string, query: string) => {
    if (!dbReady) return;
    try {
      await insertKnowledgeEntry({ content: text.slice(0, 800), label: `${query.slice(0, 48)} [${provider}]`, source: provider, domain: detectTopicCategory(query) || 'general', importance: 0.6 });
    } catch {}
  }, [dbReady]);

  const buildCloudCtx = useCallback(async (query?: string): Promise<string> => {
    const state = brainRef.current;
    const relevantMemories = getRelevantMemories(memoryRef.current, query || '', 15);
    const memoryContext = formatMemoriesForPrompt(relevantMemories);

    // Recall from MemoryManager
    const memCtx = await MemoryManager.recallContext(query || '', messages.slice(-5).map(m => m.content));

    // Extended Recall: Session Summaries (semantic match)
    const allSummaries = await MemoryManager.getAllEntries('mai_putin');
    const sessionSummaries = allSummaries.filter(e => e.tags?.includes('session_summary'))
        .map(e => ({ e, score: semanticSimilarity(query || '', e.content) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => `- [SUMMARY] ${x.e.content}`)
        .join('\n');

    // Detect language
    const detectLanguage = (text: string): 'ro' | 'en' | 'auto' => {
      if (!text) return 'auto';
      const roWords = ['si', 'este', 'sunt', 'cum', 'vreau', 'facem', 'salut', 'buna', 'multumesc', 'te rog'];
      const enWords = ['and', 'the', 'is', 'are', 'how', 'want', 'doing', 'hello', 'thanks', 'please'];
      const words = text.toLowerCase().split(/\s+/);
      const roCount = words.filter(w => roWords.includes(w)).length;
      const enCount = words.filter(w => enWords.includes(w)).length;
      if (roCount > enCount) return 'ro';
      if (enCount > roCount) return 'en';
      return 'auto';
    };

    const agents = await getSubAgents();
    const subAgentsCtx = agents.filter(a => a.isActive).map(a => `- ${a.name}: Expert in ${a.skills.join(', ')}`).join('\n') || 'Nu sunt sub-agenți activi.';
    return buildRichSystemPrompt({
      userName: state.userName || undefined,
      learnedFacts: state.selfKnowledge.learnedFacts.slice(-10),
      recentTopics: state.lastTopics.slice(-5),
      customContext: memoryContext + "\n" + memCtx + (sessionSummaries ? "\n\n### REZUMATE SESIUNI ANTERIOARE:\n" + sessionSummaries : ""),
      subAgents: subAgentsCtx,
      language: detectLanguage(query || ''),
    });
  }, [messages]);
  useEffect(() => {
    // Lifecycle migration every 24h
    const interval = setInterval(() => {
      MemoryManager.migrateLifecycle().catch(() => {});
    }, 24 * 3600 * 1000);
    return () => clearInterval(interval);
  }, []);

  const _handleOfflineFallback = useCallback(async (text: string, history: ConversationTurn[], intent: string): Promise<string> => {
    let response = processMessage(text, brainRef.current, history);
    const isFallback = response.startsWith('Nu am date') || response.startsWith('Nu am găsit') || response.startsWith('JARVIS_CMD:auto');
    if (isFallback && llmStatus === 'ready') {
      const llmResp = await llmGenerate(text, { userName: brainRef.current.userName, history: history.slice(-10) as any });
      if (llmResp) return `🧠 ${llmResp}`;
    }
    if (isFallback && dbReady) {
      const dbAnswer = await queryKnowledgeForAnswer(text, 0.4);
      if (dbAnswer) return synthesizeWebResponse(dbAnswer.content, dbAnswer.source ?? 'Local', text, detectQuestionType(text), { userName: brainRef.current.userName ?? undefined });
    }
    return response;
  }, [dbReady, llmGenerate, llmStatus]);

  const clearConversation = useCallback(async () => {
    archiveCurrentSession(brainRef.current, 0);
    setMessages([WELCOME]);
    await AsyncStorage.removeItem(MESSAGES_KEY);
    console.log('[Brain] Conversation cleared');
  }, []);

  const addDocument = useCallback(async (name: string, content: string): Promise<void> => {
    await processDocument(name, content, brainRef.current);
    setBrainState({ ...brainRef.current });
    await persist(messages, brainRef.current);
  }, [messages, persist]);

  const removeDocument = useCallback((id: string) => {
    brainRef.current.learnedDocuments = brainRef.current.learnedDocuments.filter(d => d.id !== id);
    setBrainState({ ...brainRef.current });
    persist(messages, brainRef.current).catch(() => {});
  }, [messages, persist]);

  const [isAccessingMemory, setIsAccessingMemory] = useState(false); // Adăugat

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing.current) return;
    Keyboard.dismiss();
    isProcessing.current = true; setIsThinking(true); setIsAccessingMemory(true);

    if (messages.length > 20) {
      const those10 = messages.slice(0, 10);
      MemoryManager.summarizeAndSave(those10, currentSessionId).catch(() => {});
      setMessages(prev => prev.slice(10));
    }

    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    const isClarificationResponse = lastAssistantMsg?.metadata?.isClarification;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: text.trim(), 
      timestamp: new Date(),
      metadata: isClarificationResponse ? { type: 'clarification_response' } : undefined
    };

    try {
      const query = userMsg.content;
      const recentCtx = messages.slice(-5).map(m => m.content);
      
      // 1. New Recall & Inference
      const weightedMemories = await MemoryManager.recallWeighted(query, recentCtx);
      const deducedFacts = await MemoryManager.activeInference(query, recentCtx);
      
      if (deducedFacts && deducedFacts.length > 0) {
          deducedFacts.forEach(fact => addFact(brainRef.current.inferenceEngine, fact));
      }

      setMessages(prev => [...prev, userMsg]);
      
      // AI Processing...
      // [Simulăm aici restul logicii de apel AI existentă, injectând [FAPTE DEDUSE] în context]
      const fapteContext = deducedFacts.length > 0 ? `\n\n[FAPTE DEDUSE]: ${deducedFacts.map(f => f.content).join('; ')}` : '';
      
      // ... logica de AI call existing ...
      // La final, adaugă Thinking Trace:
      const thinkingTraceEnabled = await AsyncStorage.getItem('@jarvis_thinking_trace');
      
      // ... după primirea răspunsului AI ...
      // if (thinkingTraceEnabled === 'true' && weightedMemories.length > 0) {
      //     const memoryIds = weightedMemories.slice(0, 3).map(m => m.id).join(', ');
      //     newContent += `\n\n(memorii folosite: ${memoryIds})`;
      // }

    } catch (error) {
      // ...
    } finally {
      setIsThinking(false); isProcessing.current = false; setIsAccessingMemory(false);
      setThinkingComplexity(3);
    }
  }, [messages, persist, llmGenerate, llmStatus, aiProvider, brainState]);

  return (
    <BrainContext.Provider value={{
      messages, isThinking, isAccessingMemory, webSearching, thinkingComplexity, wantsOnline, brainState, dbReady, lastProvider,
      sendMessage, clearConversation, addDocument, removeDocument, setWantsOnline, studio: studioManager
    }}>
      {children}
    </BrainContext.Provider>
  );

  return (
    <BrainContext.Provider value={{
      messages, isThinking, webSearching, thinkingComplexity, wantsOnline, brainState, dbReady, lastProvider,
      sendMessage, clearConversation, addDocument, removeDocument, setWantsOnline, studio: studioManager
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

async function _syncEntitiesFromDB(state: BrainState): Promise<void> {
  try {
    const rows = await loadAllEntities();
    if (rows.length === 0) return;
    const existing = new Set((state.entityTracker.entities || []).map(e => e.normalized));
    rows.forEach(row => {
      if (!existing.has(row.name)) {
        state.entityTracker.entities.push({ id: row.name, type: 'concept', value: row.data.value, context: row.data.context || '', normalized: row.name, firstSeen: Date.now(), occurrences: 1 });
      }
    });
  } catch {}
}
