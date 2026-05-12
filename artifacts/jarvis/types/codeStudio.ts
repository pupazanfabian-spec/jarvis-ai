
export type NodeType = 'Agent' | 'Skill' | 'Tool' | 'Output';

export interface NodeConfig {
  agentId?: string;
  skillId?: string;
  provider?: string;
  apiKey?: string;
  prompt?: string;
  engine?: string;
  maxResults?: number;
  destination?: string;
  [key: string]: any;
}

export interface Node {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  config: NodeConfig;
}

export interface Connection {
  fromId: string;
  toId: string;
}

export interface StudioWorkspace {
  nodes: Node[];
  connections: Connection[];
}

export interface SubAgent {
  id: string;
  name: string;
  description?: string;
  agentProvider: 'groq' | 'openrouter' | 'gemini' | 'openai';
  apiKey?: string;
  model?: string;
  skills: string[]; // Skill IDs
  tools: string[];
  systemPrompt: string;
  isActive: boolean;
  priority: number; // 1-10
}

export interface AgentLog {
  timestamp: number;
  agentId: string;
  agentName: string;
  message: string;
  response: string;
  responseTime: number;
  skillUsed?: string;
}
