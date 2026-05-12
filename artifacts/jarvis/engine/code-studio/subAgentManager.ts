
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKeyForProvider } from './keyManager';
import { getSkillById } from './skills';

const SUB_AGENTS_STORAGE_KEY = '@jarvis_subagents_v2';
const AGENT_LOGS_STORAGE_KEY = '@jarvis_agent_logs_v2';

export interface SubAgent {
  id: string;
  name: string;
  description: string;
  agentProvider: 'groq' | 'openrouter';
  apiKey: string;
  skills: string[];        // array de skill id-uri
  tools: string[];         // 'webSearch' | 'memory' | 'codeRunner'
  systemPrompt: string;
  priority: number;        // 1-10
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
    // Sort by priority (descending)
    return (agents || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  } catch {
    return [];
  }
}

export async function createSubAgent(config: Partial<SubAgent>): Promise<SubAgent> {
  const agents = await getSubAgents();
  const newAgent: SubAgent = {
    id: config.id || Math.random().toString(36).substr(2, 9),
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
    stats: {
      totalCalls: 0,
      successCalls: 0,
      avgResponseTime: 0
    }
  };
  
  const updated = [...agents.filter(a => a.id !== newAgent.id), newAgent];
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
  return newAgent;
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

export async function callSubAgent(agentId: string, message: string): Promise<AgentResult> {
  const startTime = Date.now();
  const agents = await getSubAgents();
  const agent = agents.find(a => a.id === agentId);
  if (!agent) {
      return {
          agentId, agentName: 'Unknown', skill: '', response: 'Agent negăsit.',
          durationMs: 0, success: false
      };
  }

  // Build specialized prompt
  let specializedPrompt = agent.systemPrompt;
  let usedSkill = 'General';
  
  if (agent.skills && agent.skills.length > 0) {
      const skills = await Promise.all(agent.skills.map(sid => getSkillById(sid)));
      const prompts = skills.filter(s => !!s).map(s => s!.systemPrompt);
      if (prompts.length > 0) {
          specializedPrompt = `${agent.systemPrompt}\n\n### SKILLS ACTIVATE:\n${prompts.join('\n\n')}`;
          usedSkill = skills.filter(s => !!s).map(s => s!.name).join(', ');
      }
  }

  // Get API key
  const apiKey = (agent.apiKey && agent.apiKey.trim()) 
    ? agent.apiKey.trim()
    : await getKeyForProvider(agent.agentProvider);

  if (!apiKey) {
      console.error(`[Agent] No API key for ${agent.agentProvider}`);
      return {
          agentId: agent.id, agentName: agent.name, skill: usedSkill,
          response: `Eroare: Cheia API lipsește pentru ${agent.agentProvider}.`,
          durationMs: 0, success: false
      };
  }
  
  console.log(`[Agent] Calling ${agent.name} via ${agent.agentProvider} (${agent.apiKey ? 'custom' : 'global'} key)`);

  let url = '';
  let model = '';
  const headers: any = { 'Content-Type': 'application/json' };

  if (agent.agentProvider === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    model = 'llama-3.3-70b-versatile';
  } else {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://jarvis-ai.app';
    headers['X-Title'] = 'Jarvis AI';
    model = 'mistralai/mistral-7b-instruct:free';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: specializedPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
        const errorMsg = data.error?.message || `API Error ${response.status}`;
        throw new Error(errorMsg);
    }

    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText || resultText.trim().length === 0) {
        throw new Error('Răspuns gol de la API.');
    }

    // Update agent stats and last used
    const newStats = {
        totalCalls: (agent.stats.totalCalls || 0) + 1,
        successCalls: (agent.stats.successCalls || 0) + 1,
        avgResponseTime: Math.round(((agent.stats.avgResponseTime || 0) * (agent.stats.totalCalls || 0) + duration) / ((agent.stats.totalCalls || 0) + 1))
    };
    
    await updateSubAgent(agent.id, { lastUsed: Date.now(), stats: newStats });

    // Save log
    await saveAgentLog({
      agentId: agent.id, agentName: agent.name, timestamp: Date.now(),
      input: message, output: resultText, skill: usedSkill,
      durationMs: duration, success: true
    });

    return {
      agentId: agent.id, agentName: agent.name, skill: usedSkill,
      response: resultText, durationMs: duration, success: true
    };

  } catch (e: any) {
    const duration = Date.now() - startTime;
    console.error(`[Agent] ${agent.name} failed:`, e.message);
    await saveAgentLog({
        agentId: agent.id, agentName: agent.name, timestamp: Date.now(),
        input: message, output: '', skill: usedSkill,
        durationMs: duration, success: false, error: e.message
      });
      
      return {
        agentId: agent.id, agentName: agent.name, skill: usedSkill,
        response: `Eroare agent: ${e.message}`,
        durationMs: duration, success: false
      };
  }
}
