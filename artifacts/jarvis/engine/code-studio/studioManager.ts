
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEY = '@code_studio_workspace';

export type NodeType = 'Agent' | 'Skill' | 'Tool' | 'Output';

export interface Node {
  id: string;
  type: NodeType;
  title: string;
  x: number;
  y: number;
  config: any;
}

export interface Connection {
  fromId: string;
  toId: string;
}

export interface Workspace {
  nodes: Node[];
  connections: Connection[];
}

export async function getWorkspace(): Promise<Workspace> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to get workspace', e);
  }
  return { nodes: [], connections: [] };
}

export async function saveWorkspace(workspace: Workspace) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch (e) {
    console.error('Failed to save workspace', e);
  }
}

export async function addNode(type: NodeType, title: string, config: any = {}): Promise<Node> {
  const workspace = await getWorkspace();
  
  const newNode: Node = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    title: title || `${type} Node`,
    x: 100 + workspace.nodes.length * 30,
    y: 100 + (workspace.nodes.length % 5) * 80,
    config,
  };

  workspace.nodes.push(newNode);
  await saveWorkspace(workspace);
  return newNode;
}

export async function updateNode(id: string, config: any): Promise<void> {
  const workspace = await getWorkspace();
  workspace.nodes = workspace.nodes.map(n => n.id === id ? { ...n, config: { ...n.config, ...config } } : n);
  await saveWorkspace(workspace);
}

export async function deleteNode(id: string): Promise<void> {
  const workspace = await getWorkspace();
  workspace.nodes = workspace.nodes.filter(n => n.id !== id);
  workspace.connections = workspace.connections.filter(c => c.fromId !== id && c.toId !== id);
  await saveWorkspace(workspace);
}

export async function runWorkflow(): Promise<void> {
  const workspace = await getWorkspace();
  if (workspace.connections.length === 0) {
    console.log('No connections to run.');
    return;
  }
  
  // Simple topological sort / sequence runner simulation
  console.log('Running workflow sequence...');
  // In a real scenario, we would parse connections and execute node logic
  Alert.alert('Studio Manager', 'Fluxul de lucru a fost procesat de Jarvis.');
}
