
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callActiveProvider } from '@/engine/aiProviders';
import { getKeyForProvider } from './keyManager';
import { getSkillById } from './skills';

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

export async function getSubAgents(): Promise<SubAgent[]> {
  try {
    const saved = await AsyncStorage.getItem(SUB_AGENTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function createSubAgent(config: Partial<SubAgent>): Promise<SubAgent> {
  const agents = await getSubAgents();
  const newAgent: SubAgent = {
    id: config.id || Math.random().toString(36).substr(2, 9),
    name: config.name || 'New Sub-Agent',
    agentProvider: config.agentProvider || 'groq',
    apiKey: config.apiKey,
    model: config.model,
    skills: config.skills || [],
    tools: config.tools || [],
    systemPrompt: config.systemPrompt || '',
    isActive: config.isActive !== undefined ? config.isActive : true,
  };
  
  const updated = [...agents, newAgent];
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
  return newAgent;
}

export async function deleteSubAgent(id: string) {
  const agents = await getSubAgents();
  const updated = agents.filter(a => a.id !== id);
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
}

export async function callSubAgent(agentId: string, message: string): Promise<string> {
  const agents = await getSubAgents();
  const agent = agents.find(a => a.id === agentId);
  if (!agent) throw new Error('Agent not found');

  // Build system prompt from skills
  let fullSystemPrompt = agent.systemPrompt;
  agent.skills.forEach(skillId => {
    const skill = getSkillById(skillId);
    if (skill) {
      fullSystemPrompt += `\n\nExpertise in ${skill.name}:\n${skill.systemPrompt}`;
    }
  });

  // Get API key
  const apiKey = agent.apiKey || await getKeyForProvider(agent.agentProvider);
  
  // Prepare settings for callActiveProvider
  // We need to simulate the AIProviderSettings interface
  const mockSettings: any = {
    activeProvider: agent.agentProvider,
    [`${agent.agentProvider}Key`]: apiKey,
  };

  try {
    const result = await callActiveProvider(message, mockSettings, fullSystemPrompt);
    return result ? result.text : 'No response from sub-agent';
  } catch (e) {
    console.error(`Error calling sub-agent ${agent.name}:`, e);
    throw e;
  }
}

export async function toggleSubAgent(id: string, isActive: boolean) {
  const agents = await getSubAgents();
  const updated = agents.map(a => a.id === id ? { ...a, isActive } : a);
  await AsyncStorage.setItem(SUB_AGENTS_STORAGE_KEY, JSON.stringify(updated));
}
