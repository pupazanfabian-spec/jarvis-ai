
import { SubAgent } from './subAgentManager';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  agentProvider: 'groq' | 'openrouter';
  skills: string[];
  tools: string[];
  systemPrompt: string;
  priority: number;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'tpl_python_dev',
    name: 'Python Developer',
    description: 'Expert in Python coding, data science, and backend development.',
    agentProvider: 'groq',
    skills: ['skill_python'],
    tools: ['file_io'],
    systemPrompt: 'Esti un asistent specializat pe dezvoltare Python. Ajuta utilizatorul sa scrie cod eficient si curat.',
    priority: 8,
  },
  {
    id: 'tpl_web_dev',
    name: 'Web Developer',
    description: 'Full-stack web specialist (JS, TS, HTML, CSS, React Native).',
    agentProvider: 'groq',
    skills: ['skill_javascript', 'skill_html_css', 'skill_react_native'],
    tools: ['web_search'],
    systemPrompt: 'Esti un expert in tehnologii web. Creeaza interfete moderne si backend-uri scalabile.',
    priority: 8,
  },
  {
    id: 'tpl_researcher',
    name: 'Research Assistant',
    description: 'Expert in gathering and synthesizing complex information.',
    agentProvider: 'openrouter',
    skills: ['skill_research'],
    tools: ['web_search'],
    systemPrompt: 'Misiunea ta este sa realizezi cercetari aprofundate si sa sintetizezi datele in rapoarte clare.',
    priority: 7,
  },
  {
    id: 'tpl_full_stack',
    name: 'Full Stack Dev',
    description: 'All-in-one developer with knowledge in frontend, backend, and DB.',
    agentProvider: 'groq',
    skills: ['skill_python', 'skill_javascript', 'skill_nodejs', 'skill_sql', 'skill_git'],
    tools: ['file_io', 'web_search'],
    systemPrompt: 'Esti un arhitect full-stack. Poti aborda orice sarcina de dezvoltare, de la UI la baza de date.',
    priority: 9,
  }
];
