
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_SKILLS_STORAGE_KEY = '@jarvis_custom_skills';

export interface Skill {
  id: string;
  name: string;
  category: 'Conversatie' | 'Scriptare' | 'Codare' | 'Cercetare' | 'Verificare' | 'Rulare' | string;
  systemPrompt: string;
  triggers: string[];
  examples: string[];
}

export const PREDEFINED_SKILLS: Skill[] = [
  {
    id: 'skill_conversatie',
    name: 'Dialog Empatic & Clarificare',
    category: 'Conversatie',
    systemPrompt: `Esti un expert in comunicare interpersonala si inteligenta emotionala. 
    Misiunea ta este sa porti un dialog natural, empatic si sa clarifici nevoile utilizatorului.
    Asculta cu atentie, ofera raspunsuri calde si profesionale, si pune intrebari de follow-up atunci cand informatiile sunt ambigue.
    Obiectivul tau este sa faci utilizatorul sa se simta inteles si sa ghidezi conversatia spre o solutie utila.`,
    triggers: ['buna', 'salut', 'ce faci', 'ajutor', 'cum sa', 'cine esti', 'vorbeste', 'discuta', 'lamureste', 'explicatie'],
    examples: ['Cum ma poti ajuta?', 'Sunt putin confuz despre...', 'Buna Jarvis, ce planuri avem azi?']
  },
  {
    id: 'skill_scriptare',
    name: 'Automation & Shell Scripting',
    category: 'Scriptare',
    systemPrompt: `Esti un maestru al automatizarii si al scriptarii in medii diverse: Bash (Linux), PowerShell (Windows), si Zsh.
    Scrii scripturi sigure, eficiente si bine comentate pentru: manipulare de fisiere, deployment, backup, procesare de log-uri si automatizari de sistem.
    Respecti bunele practici de securitate (eviti injectiile de comenzi) si asiguri portabilitatea unde este posibil.
    Stii sa folosesti instrumente precum sed, awk, grep, si curl in profunzime.`,
    triggers: ['script', 'bash', 'powershell', 'shell', 'sh', 'zsh', 'automatizare', 'cron', 'ps1', 'terminal', 'comenzi'],
    examples: ['Scrie un script de backup in Bash', 'Cum fac un loop in PowerShell?', 'Script pentru redenumirea tuturor fisierelor .txt']
  },
  {
    id: 'skill_codare',
    name: 'Full-Stack Development',
    category: 'Codare',
    systemPrompt: `Esti un expert senior in dezvoltare software (JS/TS, Python, React Native, HTML/CSS, SQL).
    Scrii cod curat, modular si performant. Esti la curent cu ultimele standarde si design patterns.
    Oferi solutii complete, de la arhitectura bazei de date pana la interfata utilizator.
    Codul tau este intotdeauna documentat si include tratarea erorilor.`,
    triggers: ['cod', 'programare', 'react', 'python', 'javascript', 'typescript', 'html', 'css', 'sql', 'backend', 'frontend', 'funcție', 'bug', 'refactorizare'],
    examples: ['Creeaza o componenta React', 'Scrie un query SQL complex', 'Fixeaza acest bug in Python']
  },
  {
    id: 'skill_cercetare',
    name: 'Research & Web Synthesis',
    category: 'Cercetare',
    systemPrompt: `Esti un cercetator meticulos capabil sa sintetizeze informatii din surse multiple (web search, documentatii, baze de date).
    Analizezi informatia, verifici sursele si oferi rezumate clare, obiective si structurate.
    Esti expert in fact-checking si sinteza de date complexe.
    Atunci cand faci research, prezinti atat perspectiva de ansamblu, cat si detaliile tehnice relevante.`,
    triggers: ['cauta', 'research', 'afla', 'investigheaza', 'rezumat', 'analiza', 'sinteza', 'veridicitate', 'stiri', 'documentatie'],
    examples: ['Cauta ultimele noutati despre React Native', 'Analizeaza acest document lung', 'Sintetizeaza diferentele intre Groq si OpenAI']
  },
  {
    id: 'skill_verificare',
    name: 'Code Review & QA',
    category: 'Verificare',
    systemPrompt: `Esti un inginer QA si Code Reviewer riguros. 
    Analizezi codul pentru a gasi bug-uri, vulnerabilitati de securitate, probleme de performanta si abateri de la stil.
    Ofera sugestii constructive de imbunatatire si scrie teste unitare/integrare.
    Misiunea ta este sa asiguri cel mai inalt nivel de calitate si stabilitate pentru orice output.`,
    triggers: ['review', 'verifica', 'test', 'debugging', 'qa', 'validare', 'securitate', 'performanta', 'audit', 'lint'],
    examples: ['Fa un code review la acest PR', 'Scrie teste unitare pentru functia asta', 'Gaseste vulnerabilitati in acest script']
  },
  {
    id: 'skill_rulare',
    name: 'Orchestration & Workflow',
    category: 'Rulare',
    systemPrompt: `Esti un orchestrator de sisteme si manager de workflow-uri.
    Misiunea ta este sa executi comenzi, sa pornesti si sa monitorizezi fluxuri de lucru si sa coordonezi alti agenti.
    Intelegi dependentele intr-un workflow complex si asiguri ordinea corecta de executie.
    Gestionezi resursele si oferi status update-uri precise despre stadiul rularii.`,
    triggers: ['executa', 'run', 'workflow', 'porneste', 'coordoneaza', 'start', 'status', 'orchestrare', 'flux'],
    examples: ['Ruleaza acest workflow de deployment', 'Porneste secventa de testare', 'Coordoneaza agentii pentru sarcina X']
  }
];

export async function getCustomSkills(): Promise<Skill[]> {
  try {
    const saved = await AsyncStorage.getItem(CUSTOM_SKILLS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function getAllSkills(): Promise<Skill[]> {
  const custom = await getCustomSkills();
  return [...PREDEFINED_SKILLS, ...custom];
}

export async function saveSkill(skill: Skill): Promise<void> {
  const custom = await getCustomSkills();
  const updated = [...custom.filter(s => s.id !== skill.id), skill];
  await AsyncStorage.setItem(CUSTOM_SKILLS_STORAGE_KEY, JSON.stringify(updated));
}

export async function deleteSkill(id: string): Promise<void> {
  const custom = await getCustomSkills();
  const updated = custom.filter(s => s.id !== id);
  await AsyncStorage.setItem(CUSTOM_SKILLS_STORAGE_KEY, JSON.stringify(updated));
}

export async function getSkillById(id: string): Promise<Skill | undefined> {
  const all = await getAllSkills();
  return all.find(s => s.id === id);
}

export async function getSkillPrompt(skillId: string): Promise<string> {
  const skill = await getSkillById(skillId);
  return skill ? skill.systemPrompt : '';
}

export async function matchSkillFromMessage(message: string, activeAgents: any[]): Promise<MatchedSkill | null> {
  const lowerMsg = message.toLowerCase();
  let bestMatch: MatchedSkill | null = null;
  let maxMatches = 0;

  for (const agent of activeAgents) {
    for (const skillId of agent.skills) {
      const skill = await getSkillById(skillId);
      if (!skill) continue;

      let matches = 0;
      for (const trigger of skill.triggers) {
        if (lowerMsg.includes(trigger.toLowerCase())) {
          matches++;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = {
          agentId: agent.id,
          agentName: agent.name,
          skillId: skill.id
        };
      }
    }
  }

  return bestMatch;
}

export interface MatchedSkill {
  agentId: string;
  agentName: string;
  skillId: string;
}
