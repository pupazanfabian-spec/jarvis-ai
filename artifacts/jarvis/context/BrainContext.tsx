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

import { getSubAgents, callSubAgent, SubAgent, deleteSubAgent, toggleSubAgent, createSubAgent, updateSubAgent, getAgentLogs } from '@/engine/code-studio/subAgentManager';
import { getAllSkills, detectSkill } from '@/engine/code-studio/skills';
import { orchestrator } from '@/engine/orchestrator';
import { useAIProvider } from '@/context/AIProviderContext';

export { useAIProvider };

interface BrainContextType {
  messages: Message[];
  isThinking: boolean;
  webSearching: boolean;
  isAccessingMemory: boolean; // ADĂUGAT
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
  const [isAccessingMemory, setIsAccessingMemory] = useState(false); // ADĂUGAT
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

  const buildCloudCtx = useCallback(async (query?: string, memoryContextOverride?: string): Promise<string> => {
    const state = brainRef.current;
    const relevantMemories = getRelevantMemories(memoryRef.current, query || '', 15);
    const memoryContext = memoryContextOverride || formatMemoriesForPrompt(relevantMemories);

    // Recall from MemoryManager
    const memCtx = !memoryContextOverride ? await MemoryManager.recallContext(query || '', messages.slice(-5).map(m => m.content)) : '';

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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing.current) return;
    Keyboard.dismiss();
    isProcessing.current = true; setIsThinking(true); setIsAccessingMemory(true); // ADĂUGAT

    // Thinking trace config
    const thinkingTraceEnabled = (await AsyncStorage.getItem('@jarvis_thinking_trace')) === 'true'; // ADĂUGAT

    // AUTO-SUMMARIZE: Dacă sunt > 20 mesaje, rezumăm primele 10 și le tăiem
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
      await new Promise(r => setTimeout(r, 50));
      let response = '';
      const lowerText = text.toLowerCase();
      const normalizedText = lowerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // AMBIGUITY DETECTION
      const ambiguityPatterns = ["ajută-mă", "fă-l să meargă", "nu știu", "ce să fac", "spune-mi ceva", "explică"];
      const words = text.trim().split(/\s+/);
      const isShort = words.length < 4;
      const hasAmbiguityPattern = ambiguityPatterns.some(p => normalizedText.includes(p));

      if (isShort && hasAmbiguityPattern && !isClarificationResponse) {
          const clarification = "Pentru a te ajuta corect, am nevoie de detalii. Despre ce mai exact? [Sugestii: cod / informație / o problemă tehnică / altceva]";
          const m: Message = { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: clarification, 
            timestamp: new Date(),
            metadata: { isClarification: true } 
          };
          const nextMsgs = [...messages, userMsg, m];
          setMessages(nextMsgs);
          persist(nextMsgs, brainRef.current);
          setIsThinking(false); setIsAccessingMemory(false); isProcessing.current = false; return;
      }

      setMessages(prev => [...prev, userMsg]);

      // 0. Weighted Recall + Active Inference (ADĂUGAT)
      let weightedMemories: any[] = [];
      let deducedFacts: any[] = [];
      let memoryContextString = '';

      try {
        const recentCtx = messages.slice(-5).map(m => m.content);
        weightedMemories = await (MemoryManager as any).recallWeighted?.(text.trim(), recentCtx).catch(() => []);
        deducedFacts = await (MemoryManager as any).activeInference?.(text.trim(), recentCtx).catch(() => []);

        if (weightedMemories.length > 0 || deducedFacts.length > 0) {
          memoryContextString = "";
          if (weightedMemories.length > 0) {
            memoryContextString += "### [REGULI ȘI CONTEXT RELEVANT]\n" + 
              weightedMemories.slice(0, 10).map((m: any) => `- ${m.content}`).join('\n') + "\n\n";
          }
          if (deducedFacts.length > 0) {
            memoryContextString += "### [FAPTE DEDUSE DIN CONTEXT]\n" + 
              deducedFacts.map((f: any) => `- ${f.content}`).join('\n') + "\n\n";
          }
        }
      } catch (e) {
        console.warn('[Brain] Weighted recall/inference failed:', e);
      }

      const cleanText = text.trim().toLowerCase();

      // E) COMENZI MANAGEMENT AGENT (parser nou înainte de flow normal)
      const renameMatch = text.match(/redenume[șs]te agentul (.+?) la (.+?)$/i);
      const skillModMatch = text.match(/modific[ăa] skill agentului (.+?) la (.+?)$/i);
      const logMatch = text.match(/log agent (.+?)$/i);
      const testMatch = text.match(/test agent (.+?) cu ['"](.+?)['"]$/i);

      if (renameMatch) {
          setThinkingComplexity(1);
          const oldName = renameMatch[1].trim();
          const newName = renameMatch[2].trim();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === oldName.toLowerCase());
          if (agent) {
              await updateSubAgent(agent.id, { name: newName });
              response = `✓ Agent redenumit din **${oldName}** în **${newName}**.`;
          } else response = `❌ Nu am găsit agentul **${oldName}**.`;
      } else if (skillModMatch) {
          setThinkingComplexity(1);
          const name = skillModMatch[1].trim();
          const skillsRaw = skillModMatch[2].trim().replace(/[\[\]]/g, '');
          const skillIds = skillsRaw.split(/,\s*/).map(s => s.trim());
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
          if (agent) {
              await updateSubAgent(agent.id, { skills: skillIds });
              response = `✓ Skills actualizate pentru **${agent.name}**: ${skillIds.join(', ')}.`;
          } else response = `❌ Nu am găsit agentul **${name}**.`;
      } else if (logMatch) {
          setThinkingComplexity(1);
          const name = logMatch[1].trim();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
          if (agent) {
              const logs = await getAgentLogs(agent.id);
              const last5 = logs.slice(-5).map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] Input: ${l.input.slice(0, 30)}... | Output: ${l.output.slice(0, 30)}...`).join('\n');
              response = `📋 **Log-uri pentru ${agent.name}:**\n\n${last5 || 'Niciun log găsit.'}`;
          } else response = `❌ Nu am găsit agentul **${name}**.`;
      } else if (testMatch) {
          setThinkingComplexity(1);
          const name = testMatch[1].trim();
          const msg = testMatch[2].trim();
          const agents = await getSubAgents();
          const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
          if (agent) {
              const start = Date.now();
              const result = await callSubAgent(agent.id, msg);
              const duration = Date.now() - start;
              response = `Răspuns (${duration}ms): ${result.response}`;
          } else response = `❌ Nu am găsit agentul **${name}**.`;
      } else if (cleanText === 'listeaza agenti' || cleanText === 'ce agenti ai') {
          setThinkingComplexity(1);
          const agents = await getSubAgents();
          if (agents.length === 0) {
              response = "Nu ai sub-agenți creați. 🤖";
          } else {
              const agentList = agents.map(a => 
                  `• **${a.name}** [${a.agentProvider.toUpperCase()}] — ${a.isActive ? '✅ Activ' : '❌ Inactiv'}\n  🎯 Skills: ${a.skills.join(', ')}`
              ).join('\n\n');
              response = `🤖 **Sub-Agenții tăi:**\n\n${agentList}`;
          }
      } else if (/(creeaz[ăa]|creează|adaug[ăa]) (un )?agent (nou )?(.+?)( cu (skill|skill-uri) (.+?))?( pe (groq|openrouter))?$/i.test(text)) {
          setThinkingComplexity(1);
          const match = text.match(/(?:creeaz[ăa]|creează|adaug[ăa])\s+(?:un\s+)?(?:agent\s+)?(?:nou\s+)?(.+?)(?:\s+cu\s+(?:skill|skill-uri)\s+(.+?))?(?:\s+pe\s+(groq|openrouter))?$/i);
          if (match) {
              const name = match[1].trim();
              const skillsRaw = match[2]?.trim() || 'conversatie';
              const provider = (match[3]?.toLowerCase() === 'openrouter' ? 'openrouter' : 'groq') as 'groq' | 'openrouter';
              
              const skillIds = skillsRaw.split(/,\s*/).map(s => s.trim());
              const allSkills = await getAllSkills();
              
              const resolvedSkills = skillIds.map(id => {
                  return allSkills.find(s => s.id === id || s.name.toLowerCase() === id.toLowerCase()) || allSkills[0];
              });
              
              try {
                  const agent = await createSubAgent({
                      name,
                      skills: resolvedSkills.map(s => s.id),
                      agentProvider: provider,
                      isActive: true,
                      systemPrompt: resolvedSkills.map(s => s.systemPrompt).join('\n\n')
                  });
                  
                  // Sync with Studio workspace
                  await studioManager.addNode('Agent', agent.name, { agentId: agent.id, provider: agent.agentProvider });
                  
                  const agentMsg: Message = {
                      id: Date.now().toString(),
                      role: 'agent_created',
                      content: `✓ Am creat agentul **${agent.name}**.`,
                      timestamp: new Date(),
                      proposalData: {
                          name: agent.name,
                          skills: resolvedSkills.map(s => s.name),
                          reason: 'Creat la cerere explicită',
                          complexity: 1,
                          agentId: agent.id
                      } as any
                  };
                  const nextMsgs = [...messages, userMsg, agentMsg];
                  setMessages(nextMsgs);
                  persist(nextMsgs, brainRef.current);
                  setIsThinking(false); setIsAccessingMemory(false); isProcessing.current = false;
                  return;
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
      } else if (
          cleanText === 'reseteaza studio' || cleanText === 'curata studio' || cleanText === 'reset studio' ||
          cleanText === 'reseteaza canvas' || cleanText === 'curata canvas' || cleanText === 'reset canvas'
      ) {
          setThinkingComplexity(1);
          try {
              await studioManager.clearWorkspace();
              response = `🧹 Canvas-ul Code Studio a fost resetat. Toate nodurile și conexiunile au fost șterse.`;
          } catch (e: any) {
              response = `❌ Eroare la resetarea studioului: ${e.message}`;
          }
      } else if (
          cleanText.includes('adauga in canvas') || cleanText.includes('adauga in dashboard') || 
          cleanText.includes('fa asta in studio') || cleanText.includes('adauga nod')
      ) {
          setThinkingComplexity(1);
          let name = text.replace(/adauga in canvas/i, '')
                         .replace(/adauga in dashboard/i, '')
                         .replace(/fa asta in studio/i, '')
                         .replace(/adauga nod/i, '')
                         .trim();
          if (!name) name = "Nod Nou";
          try {
              await studioManager.addNode('Agent', name);
              response = `✅ Am adăugat nodul "**${name}**" în canvas-ul Studio.`;
          } catch (e: any) { response = `❌ Eroare la adăugarea în canvas: ${e.message}`; }
      } else if (
          (cleanText.includes('sterge') || cleanText.includes('elimina')) && 
          (cleanText.includes('din canvas') || cleanText.includes('din studio') || cleanText.includes('din dashboard'))
      ) {
          setThinkingComplexity(1);
          let name = text.replace(/sterge/i, '')
                         .replace(/elimina/i, '')
                         .replace(/din canvas/i, '')
                         .replace(/din studio/i, '')
                         .replace(/din dashboard/i, '')
                         .trim();
          if (!name) {
              response = "Ce anume vrei să șterg din canvas? Specifică numele nodului.";
          } else {
              try {
                  const ws = await studioManager.getWorkspace();
                  const node = ws.nodes.find(n => n.title.toLowerCase() === name.toLowerCase());
                  if (node) {
                      await studioManager.deleteNode(node.id);
                      response = `🗑️ Am șters nodul "**${node.title}**" din canvas.`;
                  } else {
                      response = `❌ Nu am găsit niciun nod cu numele "**${name}**" în canvas.`;
                  }
              } catch (e: any) { response = `❌ Eroare la ștergerea din canvas: ${e.message}`; }
          }
      } else if (cleanText.startsWith('uită ') || cleanText.startsWith('uita ')) {
          setThinkingComplexity(1);
          const keyword = text.replace(/uită |uita /i, '').trim();
          if (keyword) {
              const count = await MemoryManager.deleteByKeyword(keyword);
              response = count > 0 ? `🗑️ Am uitat ${count} amintiri legate de "**${keyword}**".` : `🔍 Nu am găsit nicio amintire care să conțină "**${keyword}**".`;
          } else {
              response = "Ce anume vrei să uit? Scrie `uită [cuvânt cheie]`.";
          }
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
              // Analyze intent for complexity score
              const localIntent = await orchestrator.analyzeIntent(text);
              const complexity = localIntent.complexityScore || 5;
              setThinkingComplexity(complexity);

              if (complexity > 4) { // ADĂUGAT: condiție complexitate
                  const result = await callSubAgent(activeAgent.id, text.trim());
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
                      setIsThinking(false); setIsAccessingMemory(false); isProcessing.current = false; 
                      return;
                  }
              }
          }
      }

      // 3. Orchestrator Routing
      const intent = await orchestrator.analyzeIntent(text);
      setThinkingComplexity(intent.complexityScore || 3);
      console.log(`[Brain] Intent complexity score: ${intent.complexityScore}, skill: ${intent.skill.id}`);
      
      if (intent.complexity !== 'simple') {
          // Colectăm memoria activă pentru orchestrator
          const [reguli, sistem, importanta, mai_putin] = await Promise.all([
              MemoryManager.getAllEntries('reguli'),
              MemoryManager.getAllEntries('sistem'),
              MemoryManager.getAllEntries('importanta'),
              MemoryManager.getAllEntries('mai_putin')
          ]);

          const memoryContext = {
              reguli: reguli || [],
              sistem: [...(sistem || [])].sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0)).slice(0, 10),
              importanta: [...(importanta || [])].sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0)).slice(0, 15),
              mai_putin: (mai_putin || []).slice(0, 5),
              conversationHistory: [...messages, userMsg].slice(-20).map(m => ({ role: m.role, content: m.content }))
          };

          const result = await orchestrator.routeMessage(text, memoryContext);
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
          
          // Dacă orchestratorul nu a găsit/creat un agent, dar complexitatea e mare, propunem crearea unuia
          const proposal = await orchestrator.proposeAgentCreation(text, intent.complexityScore);
          if (proposal) {
              const proposalMsg: Message = {
                  id: Date.now().toString(),
                  role: 'agent_proposal',
                  content: `Am detectat o sarcină complexă (${intent.complexityScore}/8) în domeniul ${intent.skill.name}. Vrei să creez un agent specialist?`,
                  timestamp: new Date(),
                  proposalData: proposal
              };
              const nextMsgs = [...messages, userMsg, proposalMsg];
              setMessages(nextMsgs);
              persist(nextMsgs, brainRef.current);
              setIsThinking(false);
              isProcessing.current = false;
              return;
          }

          // If agent failed or returned empty, fall back to normal flow
          console.log('[Brain] Agent failed or empty, falling back to normal flow');
      }

      // 3. Normal Flow (Groq/OpenRouter fallback)
      setThinkingComplexity(2);
      const historyLimit = userMsg.metadata?.type === 'clarification_response' ? 20 : 10;
      const currentHistory = [...messages, userMsg].slice(-historyLimit).map(m => ({ role: m.role, content: m.content }));
      
      // AI Classifier for Memory
      const memoryClassifier = async (t: string) => {
          if (llmStatus !== 'ready') return null;
          const prompt = `Ești un modul de clasificare a memoriei. Analizează textul și decide dacă este o regulă personală ('reguli'), un fapt despre utilizator ('importanta') sau nimic relevant ('null').
Text: "${t}"
Răspunde DOAR cu 'reguli', 'importanta' sau 'null'.`;
          try {
              const res = await llmGenerate(prompt, { maxTokens: 10 });
              const cat = res?.trim().toLowerCase().replace(/['"`\.]/g, '');
              if (cat === 'reguli' || cat === 'importanta') return cat as any;
          } catch (e) {}
          return null;
      };

      // Auto-learn from user message before AI call
      if (text.length > 10 && text.length < 500 && !text.includes('?')) {
        MemoryManager.addEntry(text, 'user_explicit', {}, memoryClassifier).catch(() => {});
      }

      if (aiProvider.settings.activeProvider !== 'none') {
          const cloudCtx = await buildCloudCtx(text, memoryContextString);
          const assistantId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);
          let fullAIContent = '';
          const aiResult = await aiProvider.generateStream(text, (chunk) => {
              fullAIContent += chunk;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m));
          }, cloudCtx, currentHistory as any, 'general');
          
          if (aiResult) {
              autoLearnFromWeb(aiResult.text, aiResult.provider, text);
              setLastProvider(aiResult.provider.toUpperCase());
              
              // Thinking trace
              if (thinkingTraceEnabled && weightedMemories.length > 0) {
                  const trace = '\n\n_(memorii: ' + weightedMemories.slice(0,3).map((m: any) => m.content.slice(0,30)+'…').join(' | ') + ')_';
                  setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + trace } : m));
              }

              // Final persist for streaming
              setMessages(prev => { persist(prev, brainRef.current); return prev; });
          }
      } else {
          response = await _handleOfflineFallback(text, currentHistory as any, 'general');
          
          // Thinking trace
          if (thinkingTraceEnabled && weightedMemories.length > 0) {
              response += '\n\n_(memorii: ' + weightedMemories.slice(0,3).map((m: any) => m.content.slice(0,30)+'…').join(' | ') + ')_';
          }

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
      setIsThinking(false); setIsAccessingMemory(false); isProcessing.current = false;
      setThinkingComplexity(3);
    }
  }, [messages, aiProvider, buildCloudCtx, autoLearnFromWeb, _handleOfflineFallback, persist, persistEntities, setMessages, setIsThinking, isProcessing, setLastProvider, setBrainState, setThinkingComplexity]);

  return (
    <BrainContext.Provider value={{
      messages, isThinking, webSearching, isAccessingMemory, thinkingComplexity, wantsOnline, brainState, dbReady, lastProvider,
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
