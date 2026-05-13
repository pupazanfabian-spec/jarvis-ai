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
import { useDevMode } from '@/context/DevModeContext';
import * as studioManager from '@/engine/code-studio/studioManager';
import { useLLM } from '@/context/LLMContext';

// ... (existing code, keep existing imports)
import { getSubAgents, callSubAgent, SubAgent, deleteSubAgent, toggleSubAgent, createSubAgent } from '@/engine/code-studio/subAgentManager';
import { getAllSkills, detectSkill } from '@/engine/code-studio/skills';
import { orchestrator } from '@/engine/orchestrator';
import { useAIProvider } from '@/context/AIProviderContext';

export { useAIProvider };

interface BrainContextType {
  messages: Message[];
  isThinking: boolean;
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
    const agents = await getSubAgents();
    const subAgentsCtx = agents.filter(a => a.isActive).map(a => `- ${a.name}: Expert in ${a.skills.join(', ')}`).join('\n') || 'Nu sunt sub-agenți activi.';
    return buildRichSystemPrompt({
      userName: state.userName || undefined,
      learnedFacts: state.selfKnowledge.learnedFacts.slice(-10),
      recentTopics: state.lastTopics.slice(-5),
      customContext: memoryContext,
      subAgents: subAgentsCtx,
    });
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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing.current) return;
    isProcessing.current = true; setIsThinking(true);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      await new Promise(r => setTimeout(r, 50));
      let response = '';
      const lowerText = text.toLowerCase();
      const normalizedText = lowerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 1. Comenzi Sub-Agenți (listeaza, creeaza, sterge, activeaza/dezactiveaza)
      const cleanText = normalizedText.trim();
      
      if (cleanText === 'listeaza agenti' || cleanText === 'ce agenti ai') {
          setThinkingComplexity(1);
          const agents = await getSubAgents();
          response = agents.length === 0 ? "Nu ai sub-agenți creați. 🤖" : "🤖 **Sub-Agenții tăi:**\n\n" + 
              agents.map(a => `• **${a.name}** [${a.agentProvider.toUpperCase()}] — ${a.isActive ? '✅ Activ' : '❌ Inactiv'} (Skill: ${a.skills.join(', ')})`).join('\n');
      } else if (cleanText.includes('creeaza agent') || cleanText.includes('creaza agent')) {
          setThinkingComplexity(1);
          // Format: creeaza agent [nume] cu skill [skillId] pe [groq|openrouter]
          const match = text.match(/(?:creeaza|creaza)\s+agent\s+(.+?)(?:\s+cu\s+skill\s+(.+?))?(?:\s+pe\s+(groq|openrouter))?$/i);
          if (match) {
              const name = match[1].trim();
              const skillId = match[2]?.trim() || 'conversatie';
              const provider = (match[3]?.toLowerCase() === 'openrouter' ? 'openrouter' : 'groq') as 'groq' | 'openrouter';
              
              const allSkills = await getAllSkills();
              const targetSkill = allSkills.find(s => s.id === skillId || s.name.toLowerCase() === skillId.toLowerCase()) || allSkills[0];
              
              try {
                  const agent = await createSubAgent({
                      name,
                      skills: [targetSkill.id],
                      agentProvider: provider,
                      isActive: true,
                      systemPrompt: targetSkill.systemPrompt
                  });
                  
                  // Sync with Studio workspace
                  await studioManager.addNode('Agent', agent.name, { agentId: agent.id, provider: agent.agentProvider });
                  
                  response = `✅ Agentul **${agent.name}** a fost creat cu succes!\n🎯 Skill: **${targetSkill.name}**\n🚀 Provider: **${provider.toUpperCase()}**`;
              } catch (e: any) { response = `❌ Eroare la crearea agentului: ${e.message}`; }
          }
      } else if (cleanText.startsWith('sterge agent ')) {
          setThinkingComplexity(1);
          const name = text.replace(/sterge agent /i, '').trim();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
          if (agent) {
              await deleteSubAgent(agent.id);
              
              // Sync with Studio workspace: remove the node if it exists
              try {
                  const ws = await studioManager.getWorkspace();
                  const node = ws.nodes.find(n => n.config?.agentId === agent.id);
                  if (node) await studioManager.deleteNode(node.id);
              } catch (e) { console.warn('[Brain] Failed to remove node from workspace:', e); }

              response = `🗑️ Agentul **${agent.name}** a fost șters.`;
          } else response = `❌ Nu am găsit agentul **${name}**.`;
      } else if (cleanText.startsWith('activeaza agent ')) {
          setThinkingComplexity(1);
          const name = text.replace(/activeaza agent /i, '').trim();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
          if (agent) {
              await toggleSubAgent(agent.id, true);
              response = `✅ Agentul **${agent.name}** a fost activat.`;
          } else response = `❌ Nu am găsit agentul **${name}**.`;
      } else if (cleanText.startsWith('dezactiveaza agent ')) {
          setThinkingComplexity(1);
          const name = text.replace(/dezactiveaza agent /i, '').trim();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
          if (agent) {
              await toggleSubAgent(agent.id, false);
              response = `⏸️ Agentul **${agent.name}** a fost dezactivat.`;
          } else response = `❌ Nu am găsit agentul **${name}**.`;
      }

      if (response) {
          const m: Message = { id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date() };
          const nextMsgs = [...messages, userMsg, m];
          setMessages(nextMsgs); 
          persist(nextMsgs, brainRef.current);
          setIsThinking(false); isProcessing.current = false; return;
      }

      // 2. Auto-delegare către Sub-Agenți (Detecție Skill -> Apel Agent Activ)
      const allSkills = await getAllSkills();
      const matchedSkill = detectSkill(text, allSkills);
      if (matchedSkill && matchedSkill.id !== 'conversatie') {
          const agents = await getSubAgents();
          const activeAgent = agents.find(a => a.isActive && a.skills.includes(matchedSkill.id));
          
          if (activeAgent) {
              // Analyze intent for complexity score even here
              const localIntent = await orchestrator.analyzeIntent(text);
              setThinkingComplexity(localIntent.complexityScore || 5);

              const result = await callSubAgent(activeAgent.id, text);
              if (result.success) {
                  const finalMsg: Message = { 
                      id: Date.now().toString(), 
                      role: 'assistant', 
                      content: `[Agent: ${activeAgent.name}] ${result.response}`, 
                      timestamp: new Date() 
                  };
                  const nextMsgs = [...messages, userMsg, finalMsg];
                  setMessages(nextMsgs); 
                  persist(nextMsgs, brainRef.current);
                  setLastProvider(activeAgent.name);
                  setIsThinking(false); isProcessing.current = false; return;
              }
          }
      }

      // 3. Orchestrator Routing
      const intent = await orchestrator.analyzeIntent(text);
      setThinkingComplexity(intent.complexityScore || 3);
      console.log(`[Brain] Intent complexity score: ${intent.complexityScore}, skill: ${intent.skill.id}`);
      
      if (intent.complexity !== 'simple') {
          const result = await orchestrator.route(text);
          console.log(`[Brain] Orchestrator result success: ${result.success}, agent: ${result.agentUsed}, response length: ${result.response?.length}`);
          
          if (result.success && result.response && result.response.trim().length > 0) {
              let content = result.response;
              if (result.wasAutoCreated) {
                  content = `💡 *Am creat automat agentul **${result.agentUsed}**.*

${content}`;
              }
              const agentBadge = result.agentUsed ? `🤖 **[${result.agentUsed}]**

` : '';
              const finalMsg: Message = { 
                  id: Date.now().toString(), 
                  role: 'assistant', 
                  content: agentBadge + content, 
                  timestamp: new Date() 
              };
              const nextMsgs = [...messages, userMsg, finalMsg];
              setMessages(nextMsgs); 
              persist(nextMsgs, brainRef.current);
              setLastProvider(result.agentUsed || 'Agent');
              setIsThinking(false);
              isProcessing.current = false; 
              return;
          }
          // If agent failed or returned empty, fall back to normal flow
          console.log('[Brain] Agent failed or empty, falling back to normal flow');
      }

      // 3. Normal Flow (Groq/OpenRouter fallback)
      setThinkingComplexity(2);
      const currentHistory = [...messages, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content }));
      if (aiProvider.settings.activeProvider !== 'none') {
          const cloudCtx = await buildCloudCtx(text);
          const assistantId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);
          const aiResult = await aiProvider.generateStream(text, (chunk) => {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
          }, cloudCtx, currentHistory as any, 'general');
          if (aiResult) {
              autoLearnFromWeb(aiResult.text, aiResult.provider, text);
              setLastProvider(aiResult.provider.toUpperCase());
              // Final persist for streaming
              setMessages(prev => { persist(prev, brainRef.current); return prev; });
          }
      } else {
          response = await _handleOfflineFallback(text, currentHistory as any, 'general');
          const m: Message = { id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date() };
          const nextMsgs = [...messages, userMsg, m];
          setMessages(nextMsgs);
          persist(nextMsgs, brainRef.current);
          setLastProvider('Local');
      }

      setBrainState({ ...brainRef.current });
      persistEntities(brainRef.current);
      persist(messages, brainRef.current);
    } catch (error) {
      console.error('[Jarvis] sendMessage error:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      const fallbackMsg: Message = { id: Date.now().toString(), role: 'assistant', content: `A apărut o eroare neașteptată: ${errMsg}`, timestamp: new Date() };
      setMessages(prev => [...prev, fallbackMsg]);
      persist([...messages, userMsg, fallbackMsg], brainRef.current);
    } finally {
      setIsThinking(false); isProcessing.current = false;
      setThinkingComplexity(3);
    }
  }, [messages, aiProvider, buildCloudCtx, autoLearnFromWeb, _handleOfflineFallback, persist, persistEntities, setMessages, setIsThinking, isProcessing, setLastProvider, setBrainState, setThinkingComplexity]);

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
