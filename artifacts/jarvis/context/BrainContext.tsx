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
import { searchOnline, isOnlineIntent, searchOnlineSynthesized, extractTopSentences, smartWebSearch, extractSearchQuery } from '@/engine/webSearch';
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

import * as studioManager from '@/engine/code-studio/studioManager';
import { getSubAgents, callSubAgent, SubAgent } from '@/engine/code-studio/subAgentManager';
import { orchestrator } from '@/engine/orchestrator';

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
  studio: typeof studioManager;
}

const BrainContext = createContext<BrainContextType | null>(null);

const MESSAGES_KEY = '@jarvis_v3_messages';
const STATE_KEY = '@jarvis_v3_state';

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Salut! Sunt **Jarvis** — AI cu minte proprie, offline și online. 🧠\n\n**Ce pot face:**\n🤔 Răspund din 270+ subiecte din memorie\n📡 Caut pe internet în timp real (DuckDuckGo, Wikipedia, News)\n🔗 Deduc logic din ce îmi spui\n👤 Rețin persoanele și entitățile menționate\n💾 Memorie persistentă: îmi amintesc cine ești și ce preferi între sesiuni\n\n**Cum te cheamă?** Sau întreabă-mă orice.',
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

  const clearConversation = useCallback(() => {
    setMessages([WELCOME]);
    isProcessing.current = false;
    setIsThinking(false);
    persist([WELCOME], brainRef.current);
  }, [persist]);

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
    brainRef.current.learnedDocuments = (brainRef.current.learnedDocuments || []).filter(d => d.id !== id);
    setBrainState({ ...brainRef.current });
    persist(messages, brainRef.current);
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

      // 1. Studio Special Commands
      const canvasKey = '@code_studio_workspace';
      if (normalizedText.includes('listeaza agent') || normalizedText.includes('ce agenti ai')) {
          const agents = await getSubAgents();
          response = agents.length === 0 ? "Nu ai sub-agenți activi." : "🤖 **Sub-Agenții tăi:**\n\n" + agents.map(a => `• **${a.name}** [${a.agentProvider.toUpperCase()}] — ${a.isActive ? '✅' : '❌'}`).join('\n');
      } else if (normalizedText.includes('adauga agent') || normalizedText.includes('creeaza agent')) {
          const nameMatch = text.match(/(?:adauga|creeaza) agent (.+)/i);
          const agentName = nameMatch?.[1]?.trim() || 'Agent Nou';
          try {
            const { createSubAgent } = await import('@/engine/code-studio/subAgentManager');
            const { detectSkill, getAllSkills } = await import('@/engine/code-studio/skills');
            const skills = await getAllSkills();
            const detSkill = detectSkill(text, skills);
            const agent = await createSubAgent({
              name: agentName, skills: [detSkill.id], agentProvider: 'groq', isActive: true, priority: 5, systemPrompt: detSkill.systemPrompt,
            });
            const saved = await AsyncStorage.getItem(canvasKey);
            const workspace = saved ? JSON.parse(saved) : { nodes: [], connections: [] };
            workspace.nodes.push({
              id: agent.id, type: 'Agent', title: agent.name, x: 100 + (workspace.nodes.length % 3) * 200, y: 150 + Math.floor(workspace.nodes.length / 3) * 150, config: { agentId: agent.id }
            });
            await AsyncStorage.setItem(canvasKey, JSON.stringify(workspace));
            response = `Am creat agentul **${agent.name}** cu skill-ul **${detSkill.name}** și l-am adăugat pe canvas. 🤖✅`;
          } catch(e: any) { response = `Eroare la crearea agentului: ${e.message}`; }
      } else if (normalizedText.includes('adauga skill') || normalizedText.includes('creeaza skill')) {
          const nameMatch = text.match(/(?:adauga|creeaza) skill (.+)/i);
          const skillName = nameMatch?.[1]?.trim() || 'Skill Nou';
          try {
            const { getAllSkills } = await import('@/engine/code-studio/skills');
            const skills = await getAllSkills();
            const found = skills.find(s => s.name.toLowerCase().includes(skillName.toLowerCase()));
            if (found) {
                const saved = await AsyncStorage.getItem(canvasKey);
                const workspace = saved ? JSON.parse(saved) : { nodes: [], connections: [] };
                workspace.nodes.push({
                  id: `node-${Date.now()}`, type: 'Skill', title: found.name, x: 150, y: 150, config: { skillId: found.id }
                });
                await AsyncStorage.setItem(canvasKey, JSON.stringify(workspace));
                response = `Am adăugat skill-ul **${found.name}** pe canvas. ⚙️✅`;
            } else { response = `Nu am găsit skill-ul **${skillName}** în baza mea de date.`; }
          } catch(e: any) { response = `Eroare: ${e.message}`; }
      } else if (normalizedText.includes('conecteaza') && normalizedText.includes('cu')) {
          const m = text.match(/conecteaza (.+) cu (.+)/i);
          if (m) {
              const fromName = m[1].trim().toLowerCase(), toName = m[2].trim().toLowerCase();
              const saved = await AsyncStorage.getItem(canvasKey);
              if (saved) {
                  const ws = JSON.parse(saved);
                  const fNode = ws.nodes.find((n: any) => n.title.toLowerCase().includes(fromName));
                  const tNode = ws.nodes.find((n: any) => n.title.toLowerCase().includes(toName));
                  if (fNode && tNode) {
                      ws.connections.push({ fromId: fNode.id, toId: tNode.id });
                      await AsyncStorage.setItem(canvasKey, JSON.stringify(ws));
                      response = `Am conectat **${fNode.title}** ➡️ **${tNode.title}**. 🔗✅`;
                  } else { response = "Nu am găsit nodurile pe canvas pentru a face conexiunea."; }
              }
          }
      } else if (normalizedText.startsWith('sterge agent')) {
          const name = text.replace(/sterge agent /i, '').trim().toLowerCase();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name);
          if (agent) { 
              await deleteSubAgent(agent.id); 
              const saved = await AsyncStorage.getItem(canvasKey);
              if (saved) {
                  const ws = JSON.parse(saved);
                  ws.nodes = ws.nodes.filter((n: any) => n.id !== agent.id && n.config?.agentId !== agent.id);
                  ws.connections = ws.connections.filter((c: any) => c.fromId !== agent.id && c.toId !== agent.id);
                  await AsyncStorage.setItem(canvasKey, JSON.stringify(ws));
              }
              response = `Agentul **${agent.name}** a fost șters. 🗑️`; 
          }
          else response = `Nu am găsit agentul **${name}**.`;
      } else if (normalizedText.includes('reseteaza studio') || normalizedText.includes('reset studio')) {
          await AsyncStorage.multiRemove(['@code_studio_workspace', '@jarvis_subagents_v2', '@jarvis_agent_logs_v2']);
          response = "✅ Code Studio a fost resetat complet. 🧼";
      } else if (normalizedText.includes('afiseaza canvas') || normalizedText.includes('ce e pe canvas')) {
          const saved = await AsyncStorage.getItem(canvasKey);
          if (saved) {
              const ws = JSON.parse(saved);
              const names = (ws.nodes || []).map((n: any) => `${n.type}: ${n.title}`).join('\n• ');
              response = names ? `📊 **Elemente pe canvas:**\n• ${names}` : "Canvas-ul este gol.";
          } else { response = "Canvas-ul este gol."; }
      }

      if (response) {
          const m: Message = { id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date() };
          const nextMsgs = [...messages, userMsg, m];
          setMessages(nextMsgs); 
          persist(nextMsgs, brainRef.current);
          setIsThinking(false); isProcessing.current = false; return;
      }

      // 2. Orchestrator Routing
      const intent = await orchestrator.analyzeIntent(text);
      if (intent.complexity !== 'simple') {
          const result = await orchestrator.route(text);
          if (result.success) {
              const prefix = result.agentUsed ? `[Agent: ${result.agentUsed}] ` : '';
              const content = (result.wasAutoCreated ? `💡 *Am creat automat agentul ${result.agentUsed} pentru această sarcină.*\n\n` : '') + result.response;
              const m: Message = { id: Date.now().toString(), role: 'assistant', content: prefix + content, timestamp: new Date() };
              const nextMsgs = [...messages, userMsg, m];
              setMessages(nextMsgs); 
              persist(nextMsgs, brainRef.current);
              setIsThinking(false); isProcessing.current = false; return;
          }
      }

      // 3. Normal Flow
      const currentHistory = [...messages, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content }));
      if (aiProvider.settings.activeProvider !== 'none') {
          const cloudCtx = await buildCloudCtx(text);
          const assistantId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);
          const aiResult = await aiProvider.generateStream(text, (chunk) => {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
          }, cloudCtx, currentHistory, 'general');
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
    } finally {
      setIsThinking(false); isProcessing.current = false;
    }
  }, [messages, aiProvider, buildCloudCtx, autoLearnFromWeb, _handleOfflineFallback, persist, persistEntities]);

  return (
    <BrainContext.Provider value={{
      messages, isThinking, webSearching, wantsOnline, brainState, dbReady, lastProvider,
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
        state.entityTracker.entities.push({ id: row.name, type: 'concept', value: row.data.value, normalized: row.name, firstSeen: Date.now(), occurrences: 1 });
      }
    });
  } catch {}
}
