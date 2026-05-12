
import AsyncStorage from '@react-native-async-storage/async-storage';

const WORKSPACE_KEY = '@code_studio_workspace';

export interface Node {
  id: string;
  type: 'Agent' | 'Skill' | 'Tool' | 'Output';
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

export const getWorkspace = async (): Promise<Workspace> => {
  try {
    const saved = await AsyncStorage.getItem(WORKSPACE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to get workspace', e);
  }
  return { nodes: [], connections: [] };
};

export const saveWorkspace = async (workspace: Workspace) => {
  try {
    await AsyncStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  } catch (e) {
    console.error('Failed to save workspace', e);
  }
};

export const addNode = async (type: Node['type'], title: string, config: any = {}) => {
  const workspace = await getWorkspace();
  
  // Auto-config logic
  const finalConfig = { ...config };
  let finalTitle = title;

  if (type === 'Skill') {
    if (title.toLowerCase().includes('python')) {
      finalConfig.prompt = "Esti expert Python. Scrii cod curat, cu type hints, docstrings, respectand PEP 8. Te axezi pe eficienta si lizibilitate.";
      finalTitle = "Python Coding";
    } else if (title.toLowerCase().includes('javascript') || title.toLowerCase().includes('js') || title.toLowerCase().includes('ts')) {
      finalConfig.prompt = "Esti expert JS/TS. Folosesti ES6+, async/await, si design patterns moderne. Scrii cod modular si testabil.";
      finalTitle = "JS/TS Expert";
    } else if (title.toLowerCase().includes('react native')) {
      finalConfig.prompt = "Esti expert React Native + Expo. Folosesti hooks, TypeScript, si optimizezi performanta componentelor mobile.";
      finalTitle = "React Native UI";
    } else if (title.toLowerCase().includes('data analysis')) {
      finalConfig.prompt = "Analizezi date complexe, creezi vizualizari relevante si extragi insights actionabile din seturile de date.";
      finalTitle = "Data Analyst";
    } else if (title.toLowerCase().includes('web research')) {
      finalConfig.prompt = "Cauti informatii online folosind surse multiple, verifici veridicitatea datelor si sintetizezi un raport clar.";
      finalTitle = "Researcher";
    }
  }

  if (type === 'Tool' && title.toLowerCase().includes('web')) {
    finalConfig.engine = 'DuckDuckGo';
    finalConfig.maxResults = 5;
  }

  if (type === 'Output') {
    finalConfig.destination = 'Chat Display';
  }

  const newNode: Node = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    title: finalTitle,
    x: 100 + workspace.nodes.length * 50,
    y: 100 + (workspace.nodes.length % 5) * 60,
    config: finalConfig,
  };

  workspace.nodes.push(newNode);
  await saveWorkspace(workspace);
  return newNode;
};

export const updateNode = async (id: string, updates: Partial<Node>) => {
  const workspace = await getWorkspace();
  workspace.nodes = workspace.nodes.map(n => n.id === id ? { ...n, ...updates } : n);
  await saveWorkspace(workspace);
};

export const runWorkflow = async () => {
  // Aceasta functie va fi apelata de Jarvis pentru a declansa executia
  // In UI, aceasta va reincarca probabil starea sau va notifica BrainContext
  console.log('Workflow execution triggered by Jarvis');
  return { success: true, message: 'Workflow-ul a fost pornit.' };
};
