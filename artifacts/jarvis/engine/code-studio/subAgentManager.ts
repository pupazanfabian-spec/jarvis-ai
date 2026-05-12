
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKeyForProvider } from './keyManager';
import { getSkillById, getSkillPrompt } from './skills';

const SUB_AGENTS_STORAGE_KEY = '@jarvis_sub_agents';

export interface SubAgent {
  id: string;
  name: string;
  agentProvider: 'groq' | 'openrouter' | 'gemini' | 'openai';
  apiKey?: string;
  model?: string;
  skills: string[]; // Skill IDs
  tools: string[];
  systemPrompt: string;
  isActive: boolean;
}

// In-memory cache for performance
let cachedAgents: SubAgent[] | null = null;

export async function getSubAgents(): Promise<SubAgent[]> {
  if (cachedAgents) return cachedAgents;
  try {
    const saved = await AsyncStorage.getItem(SUB_AGENTS_STORAGE_KEY);
    cachedAgents = saved ? JSON.parse(saved) : [];
    return cachedAgents || [];
  } catch {
    return [];
  }
}

export async function getSubAgentById(id: string): Promise<SubAgent | undefined> {
  const agents = await getSubAgents();
  return agents.find(a => a.id === id);
}

export async function createSubAgent(config: Partial<SubAgent>): Promise<SubAgent> {
  const agents = await getSubAgents();
  const newAgent: SubAgent = {
    id: config.id || Math.random().toString(36).substr(2, 9),
    name: config.name || 'New Sub-Agent',
    agentProvider: config.agentProvider || 'groq',
    apiKey: config.apiKey,
    model: config.model || (config.agentProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'meta-llama/llama-3.3-70b-instruct:free'),
    skills: config.skills || [],
    tools: config.tools || [],
    systemPrompt: config.systemPrompt || '',
    isActive: config.isActive !== undefined ? config.isActive : true,
  };
  
  const updated = [...agents, newAgent];
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
  cachedAgents = updated;
  return newAgent;
}

export async function deleteSubAgent(id: string) {
  const agents = await getSubAgents();
  const updated = agents.filter(a => a.id !== id);
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
  cachedAgents = updated;
}

export async function toggleSubAgent(id: string, isActive: boolean) {
  const agents = await getSubAgents();
  const updated = agents.map(a => a.id === id ? { ...a, isActive } : a);
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
  cachedAgents = updated;
}

/**
 * Calls a sub-agent with real API fetch.
 * Implements retries and timeout.
 */
export async function callSubAgent(agentId: string, message: string): Promise<string> {
  const agent = await getSubAgentById(agentId);
  if (!agent) throw new Error('Agent not found');

  // Build system prompt from skills
  const skillPrompts = agent.skills.map(s => getSkillPrompt(s)).join('\n\n');
  const fullSystemPrompt = (agent.systemPrompt || 'Esti un asistent AI specializat.') + '\n\n' + skillPrompts;

  // Get API key
  const apiKey = agent.apiKey || await getKeyForProvider(agent.agentProvider);
  if (!apiKey) throw new Error(`API key missing for ${agent.agentProvider}`);
  
  const provider = agent.agentProvider;
  let url = '';
  let headers: any = { 'Content-Type': 'application/json' };

  if (provider === 'groq') {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://jarvis-ai.app';
    headers['X-Title'] = 'Jarvis AI';
  } else {
    // Fallback to OpenRouter base for others if key exists
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const model = agent.model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'meta-llama/llama-3.3-70b-instruct:free');

  const body = {
    model: model,
    messages: [
      { role: 'system', content: fullSystemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  const fetchWithRetry = async (retries = 1): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (!response.ok && retries > 0) {
        console.log(`[SubAgent] ${provider} failed with ${response.status}. Retrying...`);
        return fetchWithRetry(retries - 1);
      }
      return response;
    } catch (err: any) {
      clearTimeout(timeout);
      if (retries > 0) {
        console.log(`[SubAgent] ${provider} error: ${err.message}. Retrying...`);
        return fetchWithRetry(retries - 1);
      }
      throw err;
    }
  };

  try {
    const response = await fetchWithRetry();
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `API Error ${response.status}`);
    }

    return data.choices[0]?.message?.content || 'Nu am primit un răspuns valid de la sub-agent.';
  } catch (e: any) {
    console.error(`[SubAgent] Error calling ${agent.name}:`, e);
    throw e;
  }
}
