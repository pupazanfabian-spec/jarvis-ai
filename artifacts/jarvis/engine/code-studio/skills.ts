
import AsyncStorage from '@react-native-async-storage/async-storage';

const SKILLS_STORAGE_KEY = '@jarvis_skills_v2';

export interface Skill {
  id: string;
  name: string;
  category: 'conversatie' | 'scriptare' | 'codare' | 'cercetare' | 'verificare' | 'rulare' | 'memorie' | 'orchestrare' | 'custom';
  description: string;
  triggers: string[];
  systemPrompt: string;
  provider: 'groq' | 'openrouter' | 'auto';
  tools: string[];
}

export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'conversatie',
    name: 'Conversație',
    category: 'conversatie',
    description: 'Dialog natural, empatie, clarificări și răspunsuri în limba română.',
    triggers: ['vorbeste', 'explica', 'ce este', 'cum', 'de ce', 'ajuta', 'spune', 'salut', 'buna'],
    systemPrompt: 'Ești un expert în comunicare și asistență personală. Răspunde empatic, clarifică nevoile utilizatorului și oferă explicații detaliate în limba română. Obiectivul tău este să fii util și prietenos.',
    provider: 'auto',
    tools: []
  },
  {
    id: 'scriptare',
    name: 'Scriptare & Automatizare',
    category: 'scriptare',
    description: 'Scriere de scripturi Bash, Shell, PowerShell și automatizări de sistem.',
    triggers: ['script', 'bash', 'shell', 'automatizeaza', 'powershell', 'terminal', 'comenzi'],
    systemPrompt: 'Ești un expert în DevOps și SysAdmin. Scrii scripturi sigure și eficiente pentru Bash și PowerShell. Automatizezi sarcini repetitive și explici pașii de execuție.',
    provider: 'auto',
    tools: []
  },
  {
    id: 'codare_js',
    name: 'Codare JavaScript/TS',
    category: 'codare',
    description: 'Expertiză în JS, TS, React, React Native, Node.js și Expo.',
    triggers: ['javascript', 'typescript', 'react', 'js', 'ts', 'node', 'expo'],
    systemPrompt: 'Ești un Lead Frontend Engineer. Scrii cod modern (ES6+), modular și performant folosind React și React Native. Respecti bunele practici de arhitectură.',
    provider: 'auto',
    tools: ['codeRunner']
  },
  {
    id: 'codare_python',
    name: 'Codare Python',
    category: 'codare',
    description: 'Expertiză în Python, Django, Pandas, Numpy și scripting py.',
    triggers: ['python', 'pip', 'django', 'pandas', 'numpy', 'py'],
    systemPrompt: 'Ești un Python Architect. Scrii cod curat, eficient și Pythonic. Ești expert în procesarea datelor și backend development folosind framework-uri moderne.',
    provider: 'auto',
    tools: ['codeRunner']
  },
  {
    id: 'codare_web',
    name: 'Dezvoltare Web',
    category: 'codare',
    description: 'Expertiză în HTML, CSS, Responsive Design și UI/UX.',
    triggers: ['html', 'css', 'web', 'responsive', 'design', 'flexbox', 'grid'],
    systemPrompt: 'Ești un Senior Web Designer. Creezi interfețe web moderne, accesibile și complet responsive. Te concentrezi pe experiența utilizatorului și design vizual impecabil.',
    provider: 'auto',
    tools: []
  },
  {
    id: 'cercetare',
    name: 'Cercetare & Analiză',
    category: 'cercetare',
    description: 'Căutare web, analiza informațiilor și sumarizare.',
    triggers: ['cauta', 'cerceteaza', 'gaseste', 'informatii', 'stiri', 'despre'],
    systemPrompt: 'Ești un Research Analyst. Folosești căutarea web pentru a găsi cele mai noi și relevante informații. Sintetizezi date complexe în rapoarte clare și obiective.',
    provider: 'auto',
    tools: ['webSearch']
  },
  {
    id: 'verificare',
    name: 'Verificare & Debugging',
    category: 'verificare',
    description: 'Code review, depanare, testare și validare output.',
    triggers: ['verifica', 'debug', 'eroare', 'problema', 'fix', 'testeaza', 'review'],
    systemPrompt: 'Ești un Senior QA Engineer. Analizezi codul și logica pentru a identifica bug-uri și vulnerabilități. Oferi soluții de remediere și scrii teste unitare.',
    provider: 'auto',
    tools: []
  },
  {
    id: 'memorie',
    name: 'Gestionare Memorie',
    category: 'memorie',
    description: 'Gestionare taskuri, reminder-uri, note și context personal.',
    triggers: ['retine', 'aminteste', 'task', 'todo', 'nota', 'salveaza'],
    systemPrompt: 'Ești un Memory Manager. Organizezi informațiile personale ale utilizatorului, taskurile și notele. Te asiguri că contextul este păstrat și ușor de regăsit.',
    provider: 'auto',
    tools: ['memory']
  },
  {
    id: 'orchestrare',
    name: 'Orchestrare Jarvis',
    category: 'rulare',
    description: 'Coordonare multi-agent și planificare workflow-uri complexe.',
    triggers: ['planifica', 'organizeaza', 'coordoneaza', 'workflow', 'agenti'],
    systemPrompt: 'Ești creierul operațional al Jarvis. Coordonezi execuția între mai mulți sub-agenți specialiști. Planifici pașii necesari pentru a îndeplini sarcini complexe.',
    provider: 'auto',
    tools: []
  }
];

export async function getAllSkills(): Promise<Skill[]> {
  try {
    const saved = await AsyncStorage.getItem(SKILLS_STORAGE_KEY);
    const custom: Skill[] = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_SKILLS, ...custom];
  } catch {
    return DEFAULT_SKILLS;
  }
}

export async function saveSkill(skill: Skill): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(SKILLS_STORAGE_KEY);
    let custom: Skill[] = saved ? JSON.parse(saved) : [];
    custom = [...custom.filter(s => s.id !== skill.id), skill];
    await AsyncStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error('Failed to save skill', e);
  }
}

export async function deleteSkill(id: string): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(SKILLS_STORAGE_KEY);
    let custom: Skill[] = saved ? JSON.parse(saved) : [];
    custom = custom.filter(s => s.id !== id);
    await AsyncStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error('Failed to delete skill', e);
  }
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const all = await getAllSkills();
  return all.find(s => s.id === id) || null;
}

export function detectSkill(message: string, allSkills: Skill[]): Skill {
  const lowerMsg = message.toLowerCase();
  let bestMatch = allSkills[0]; // Default to Conversatie
  let maxMatches = 0;

  for (const skill of allSkills) {
    let matches = 0;
    for (const trigger of skill.triggers) {
      if (lowerMsg.includes(trigger.toLowerCase())) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = skill;
    }
  }

  return bestMatch;
}
