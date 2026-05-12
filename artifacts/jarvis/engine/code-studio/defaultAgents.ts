
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSubAgent, getSubAgents } from './subAgentManager';

const DEFAULT_AGENTS_SEEDED_KEY = '@jarvis_default_agents_seeded';

export async function seedDefaultAgents() {
  try {
    const isSeeded = await AsyncStorage.getItem(DEFAULT_AGENTS_SEEDED_KEY);
    if (isSeeded === 'true') return;

    const existing = await getSubAgents();
    if (existing.length > 0) {
        await AsyncStorage.setItem(DEFAULT_AGENTS_SEEDED_KEY, 'true');
        return;
    }

    // Agent 1 - Cercetător
    await createSubAgent({
      name: "Cercetător",
      description: "Agent specializat în cercetare și găsirea de informații pe web.",
      agentProvider: 'groq',
      skills: ['cercetare'],
      tools: ['webSearch'],
      priority: 8,
      systemPrompt: "Ești un agent specializat în cercetare. Misiunea ta este să găsești informații precise, actuale și să le sintetizezi într-un format ușor de înțeles."
    });

    // Agent 2 - Programator
    await createSubAgent({
      name: "Programator",
      description: "Agent specializat în scrierea și verificarea codului.",
      agentProvider: 'groq',
      skills: ['codare_js', 'codare_python', 'verificare'],
      tools: ['codeRunner'],
      priority: 7,
      systemPrompt: "Ești un agent specializat în dezvoltare software. Scrii cod curat, eficient și respecți standardele din industrie."
    });

    // Agent 3 - Asistent Personal
    await createSubAgent({
      name: "Asistent Personal",
      description: "Asistent care ține minte preferințele utilizatorului și gestionează task-uri.",
      agentProvider: 'openrouter',
      skills: ['conversatie', 'memorie'],
      tools: ['memory'],
      priority: 6,
      systemPrompt: "Ești un asistent personal proactiv. Reții detalii importante despre utilizator și îl ajuți să-și organizeze ziua și sarcinile."
    });

    await AsyncStorage.setItem(DEFAULT_AGENTS_SEEDED_KEY, 'true');
    console.log('[Studio] Default agents seeded successfully.');
  } catch (e) {
    console.error('[Studio] Failed to seed default agents', e);
  }
}
