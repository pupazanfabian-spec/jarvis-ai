import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKeyForProvider, getWorkingKey, markKeyFailed } from './keyManager';
import { getSkillById } from './skills';
const SUB_AGENTS_STORAGE_KEY = '@jarvis_subagents_v2';
const AGENT_LOGS_STORAGE_KEY = '@jarvis_agent_logs_v2';
const generateId = () => Math.random().toString(36).substr(2, 9);

export interface SubAgent {
  id: string;
  name: string;
  description: string;
  agentProvider: 'groq' | 'openrouter';
  apiKey: string;
  skills: string[];
  tools: string[];
  systemPrompt: string;
  priority: number;
  isActive: boolean;
  createdAt: number;
  lastUsed: number;
  stats: {
    totalCalls: number;
    successCalls: number;
    avgResponseTime: number;
  };
}

export interface AgentLog {
  agentId: string;
  agentName: string;
  timestamp: number;
  input: string;
  output: string;
  skill: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  skill: string;
  response: string;
  durationMs: number;
  success: boolean;
}

// ─── CRUD OPERATIONS ─────────────────────────────────────────────────────────

export async function getSubAgents(): Promise<SubAgent[]> {
  try {
    const saved = await AsyncStorage.getItem(SUB_AGENTS_STORAGE_KEY);
    const agents: SubAgent[] = saved ? JSON.parse(saved) : [];
    return (agents || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  } catch {
    return [];
  }
}

export async function createSubAgent(config: Partial<SubAgent>): Promise<SubAgent> {
  const agents = await getSubAgents();
  const newAgent: SubAgent = {
    id: config.id || generateId(),
    name: config.name || 'New Sub-Agent',
    description: config.description || '',
    agentProvider: config.agentProvider || 'groq',
    apiKey: config.apiKey || '',
    skills: config.skills || [],
    tools: config.tools || [],
    systemPrompt: config.systemPrompt || '',
    priority: config.priority || 5,
    isActive: config.isActive !== undefined ? config.isActive : true,
    createdAt: Date.now(),
    lastUsed: 0,
    stats: { totalCalls: 0, successCalls: 0, avgResponseTime: 0 }
  };
  
  const updated = [...agents.filter(a => a.id !== newAgent.id), newAgent];
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));

  const workspaceRaw = await AsyncStorage.getItem('@code_studio_workspace');
  const workspace = workspaceRaw ? JSON.parse(workspaceRaw) : { nodes: [], connections: [] };
  
  const newNode = {
      id: newAgent.id,
      type: 'Agent',
      title: newAgent.name,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      config: { agentId: newAgent.id }
  };

  workspace.nodes.push(newNode);
  await AsyncStorage.setItem('@code_studio_workspace', JSON.stringify(workspace));

  return newAgent;
}

export async function refreshWorkspace(): Promise<{nodes: any[], connections: any[]}> {
    const ws = await AsyncStorage.getItem('@code_studio_workspace');
    return ws ? JSON.parse(ws) : { nodes: [], connections: [] };
}

export async function updateSubAgent(id: string, updates: Partial<SubAgent>): Promise<SubAgent> {
    const agents = await getSubAgents();
    const agent = agents.find(a => a.id === id);
    if (!agent) throw new Error('Agent not found');
    
    const updatedAgent = { ...agent, ...updates };
    const updatedList = agents.map(a => a.id === id ? updatedAgent : a);
    await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedAgent;
}

export async function deleteSubAgent(id: string): Promise<void> {
  const agents = await getSubAgents();
  const updated = agents.filter(a => a.id !== id);
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
}

export async function toggleSubAgent(id: string, isActive: boolean): Promise<void> {
  await updateSubAgent(id, { isActive });
}

export async function updateAgentPriority(id: string, priority: number): Promise<void> {
  await updateSubAgent(id, { priority: Math.max(1, Math.min(10, priority)) });
}

// ─── EXECUTION ENGINE ────────────────────────────────────────────────────────

async function saveAgentLog(log: AgentLog) {
  try {
    const saved = await AsyncStorage.getItem(AGENT_LOGS_STORAGE_KEY);
    let logs: AgentLog[] = saved ? JSON.parse(saved) : [];
    logs.unshift(log);
    if (logs.length > 200) logs = logs.slice(0, 200);
    await AsyncStorage.setItem(AGENT_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save agent log', e);
  }
}

export async function getAgentLogs(agentId?: string): Promise<AgentLog[]> {
  try {
    const saved = await AsyncStorage.getItem(AGENT_LOGS_STORAGE_KEY);
    const logs: AgentLog[] = saved ? JSON.parse(saved) : [];
    if (agentId) return logs.filter(l => l.agentId === agentId);
    return logs;
  } catch {
    return [];
  }
}

export async function clearAgentLogs(): Promise<void> {
    await AsyncStorage.removeItem(AGENT_LOGS_STORAGE_KEY);
}

import { callGroq, callOpenRouter } from '../aiProviders';

export async function callSubAgent(agentId: string, message: string, systemContext?: string): Promise<AgentResult> {
  const startTime = Date.now();
  const agents = await getSubAgents();
  const agent = agents.find(a => a.id === agentId);
  
  if (!agent) {
    return {
      agentId,
      agentName: 'Unknown',
      skill: '',
      response: 'Agentul nu a fost găsit în baza de date.',
      durationMs: 0,
      success: false
    };
  }

  // Construire prompt specializat: systemPrompt agent + skill prompts
  let specializedPrompt = agent.systemPrompt || 'Ești un asistent util.';
  let usedSkill = 'General';
  
  if (agent.skills && agent.skills.length > 0) {
    const skills = await Promise.all(agent.skills.map(sid => getSkillById(sid)));
    const activeSkills = skills.filter(s => !!s);
    const prompts = activeSkills.map(s => s!.systemPrompt);
    if (prompts.length > 0) {
      specializedPrompt = `${agent.systemPrompt}\n\n### SKILLS ACTIVATE:\n${prompts.join('\n\n')}`;
      usedSkill = activeSkills.map(s => s!.name).join(', ');
    }
  }

  if (systemContext) {
      specializedPrompt = `${systemContext}\n\n${specializedPrompt}`;
  }

  const primaryProvider = agent.agentProvider;
  const secondaryProvider = primaryProvider === 'groq' ? 'openrouter' : 'groq';

  const executeCall = async (provider: 'groq' | 'openrouter', retry = true): Promise<{ text: string | null, key: string | null }> => {
    const key = await getWorkingKey(provider);
    if (!key) return { text: null, key: null };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let result: string | null = null;
      if (provider === 'groq') {
        result = await callGroq(message, key, specializedPrompt);
      } else {
        result = await callOpenRouter(message, key, specializedPrompt);
      }
      
      clearTimeout(timeoutId);
      return { text: result, key };
    } catch (e: any) {
      if (e.response?.status === 429 || e.message?.includes('429')) {
          await markKeyFailed(provider, key);
          if (retry) return executeCall(provider, false);
      }
      console.warn(`[SubAgent] Provider ${provider} eșuat:`, e);
      return { text: null, key };
    }
  };

  let { text: responseText } = await executeCall(primaryProvider);
  if (!responseText) {
    let fallback = await executeCall(secondaryProvider);
    responseText = fallback.text;
  }

  const duration = Date.now() - startTime;
  const success = !!responseText && responseText.trim().length > 0;

  if (success) {
    const currentStats = agent.stats || { totalCalls: 0, successCalls: 0, avgResponseTime: 0 };
    const newStats = {
      totalCalls: currentStats.totalCalls + 1,
      successCalls: currentStats.successCalls + 1,
      avgResponseTime: Math.round((currentStats.avgResponseTime * currentStats.totalCalls + duration) / (currentStats.totalCalls + 1))
    };
    await updateSubAgent(agent.id, { lastUsed: Date.now(), stats: newStats });
  } else {
    const currentStats = agent.stats || { totalCalls: 0, successCalls: 0, avgResponseTime: 0 };
    await updateSubAgent(agent.id, {
      lastUsed: Date.now(),
      stats: { ...currentStats, totalCalls: currentStats.totalCalls + 1 }
    });
  }

  const finalResponse: string = responseText ?? `Eroare: Ambii provideri AI (${primaryProvider}, ${secondaryProvider}) au eșuat sau timeout.`;

  await saveAgentLog({
    agentId: agent.id,
    agentName: agent.name,
    timestamp: Date.now(),
    input: message,
    output: finalResponse,
    skill: usedSkill,
    durationMs: duration,
    success,
    error: success ? undefined : 'AI Provider failure or timeout'
  });

  return {
    agentId: agent.id,
    agentName: agent.name,
    skill: usedSkill,
    response: finalResponse,
    durationMs: duration,
    success
  };
}
