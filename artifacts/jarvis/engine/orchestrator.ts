
import { Skill, getAllSkills, detectSkill } from './code-studio/skills';
import { SubAgent, getSubAgents, createSubAgent, callSubAgent, AgentResult } from './code-studio/subAgentManager';
import { hasValidKey } from './code-studio/keyManager';
import * as studioManager from './code-studio/studioManager';

export interface RouteResult {
  response: string;
  agentUsed: string | null;
  skillUsed: string;
  wasAutoCreated: boolean;
  success: boolean;
  complexityScore: number; // 1-8
}

export interface MemoryContext {
  reguli: any[];
  sistem: any[];
  importanta: any[];
  mai_putin: any[];
  conversationHistory: { role: string; content: string }[];
}

export class JarvisOrchestrator {
  
  async analyzeIntent(message: string): Promise<{
    skill: Skill;
    needsAgent: boolean;
    suggestedAgentName: string;
    complexity: 'simple' | 'medium' | 'complex';
    complexityScore: number;
  }> {
    const allSkills = await getAllSkills();
    const skill = detectSkill(message, allSkills);
    const words = message.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    // Scorul de bază bazat pe reguli:
    // 1 = salut/da/nu (sub 3 cuvinte, conversatie)
    // 2 = intrebare simpla (3-6 cuvinte, conversatie)
    // 3 = intrebare normala (conversatie, orice lungime)
    // 4 = task simplu (codare/cercetare, sub 10 cuvinte)
    // 5 = task mediu (codare/cercetare, 10-20 cuvinte)
    // 6 = task complex (multi-skill sau tools active)
    // 7 = task foarte complex (workflow, planifica, coordoneaza)
    // 8 = orchestrare multi-agent (mai multi agenti implicati)

    let score = 3;
    const isConversation = skill.id === 'conversatie';

    if (isConversation) {
        if (wordCount < 3) score = 1;
        else if (wordCount <= 6) score = 2;
        else score = 3;
    } else {
        if (wordCount < 10) score = 4;
        else if (wordCount <= 20) score = 5;
        else score = 6;
    }

    const complexKeywords = [
        'planifica', 'workflow', 'coordoneaza', 'organizeaza', 'arhitectura',
        'orchestreaza', 'pas cu pas', 'etapa'
    ];
    const hasComplexKeywords = complexKeywords.some(kw => message.toLowerCase().includes(kw));
    
    if (hasComplexKeywords) score = 7;
    
    // 8 if specifically asking for multiple agents or very heavy task
    if (message.toLowerCase().includes('agenti') || message.toLowerCase().includes('echipa')) {
        score = 8;
    }

    let complexity: 'simple' | 'medium' | 'complex';
    if (score <= 2) complexity = 'simple';
    else if (score <= 5) complexity = 'medium';
    else complexity = 'complex';
    
    console.log(`[Orchestrator] Msg: "${message.substring(0,30)}..." Skill: ${skill.id} Complexity: ${complexity} Score: ${score}`);
    
    return {
      skill,
      needsAgent: complexity !== 'simple',
      suggestedAgentName: `Expert ${skill.name}`,
      complexity,
      complexityScore: score
    };
  }

  async proposeAgentCreation(message: string, complexityScore: number): Promise<{
    name: string;
    skills: string[];
    reason: string;
    complexity: number;
  } | null> {
    if (complexityScore < 5) return null;

    const allSkills = await getAllSkills();
    const skill = detectSkill(message, allSkills);
    
    // Verifică dacă există deja un agent cu acest skill
    const agents = await getSubAgents();
    const exists = agents.some(a => (a.skills || []).includes(skill.id));
    
    if (exists) return null;

    return {
      name: `Expert ${skill.name}`,
      skills: [skill.id],
      reason: `Task-ul curent (complexitate ${complexityScore}/8) necesită un specialist în ${skill.name} pentru o execuție optimă.`,
      complexity: complexityScore
    };
  }

  async findBestAgent(skillId: string): Promise<SubAgent | null> {
    try {
      const agents = await getSubAgents();
      const active = (agents || []).filter(a => a.isActive);
      if (active.length === 0) return null;
      
      // 1. Perfect skill match
      const withExactSkill = active.filter(a => 
        (a.skills || []).includes(skillId));
      if (withExactSkill.length > 0) {
        return withExactSkill.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
      }
      
      // 2. Fallback: best available active agent
      console.log(`[Orchestrator] No agent for skill ${skillId}, using best available`);
      return active.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
    } catch(e) {
      console.error('[Orchestrator] findBestAgent error:', e);
      return null;
    }
  }

  async autoCreateAgent(skill: Skill): Promise<SubAgent> {
    const provider = await hasValidKey('groq') ? 'groq' : 'openrouter';
    const agent = await createSubAgent({
      name: `Expert ${skill.name}`,
      description: `Agent creat automat pentru ${skill.name}`,
      agentProvider: provider,
      skills: [skill.id],
      systemPrompt: skill.systemPrompt,
      priority: 5,
      isActive: true
    });
    
    // Sync with Studio workspace
    try {
      await studioManager.addNode('Agent', agent.name, { agentId: agent.id, provider: agent.agentProvider });
    } catch (e) {
      console.warn('[Orchestrator] Failed to sync auto-created agent to workspace:', e);
    }
    
    return agent;
  }

  async routeMessage(message: string, memoryContext?: MemoryContext): Promise<RouteResult> {
    try {
      const intent = await this.analyzeIntent(message);
      
      if (intent.complexity === 'simple') {
        return {
          response: '',
          agentUsed: null,
          skillUsed: intent.skill.id,
          wasAutoCreated: false,
          success: true,
          complexityScore: intent.complexityScore
        };
      }
      
      let agent = await this.findBestAgent(intent.skill.id);
      let wasAutoCreated = false;
      
      if (!agent) {
        console.log('[Orchestrator] No agent found, auto-creating...');
        agent = await this.autoCreateAgent(intent.skill);
        wasAutoCreated = true;
      }

      // Formatare memorie pentru prompt
      let systemContext = '';
      if (memoryContext) {
          const { reguli, sistem, importanta, mai_putin, conversationHistory } = memoryContext;
          const formatEntry = (e: any) => `• ${e.content} (accesat: ${e.accessCount || 0} ori)`;
          
          const lines: string[] = ['MEMORIE ACTIVĂ JARVIS:'];
          
          // Adăugăm categoriile în ordine
          if (reguli && reguli.length > 0) {
              lines.push('[REGULI]');
              reguli.forEach(e => lines.push(formatEntry(e)));
          }
          if (importanta && importanta.length > 0) {
              lines.push('[FAPTE IMPORTANTE]');
              importanta.forEach(e => lines.push(formatEntry(e)));
          }
          if (sistem && sistem.length > 0) {
              lines.push('[SISTEM]');
              sistem.forEach(e => lines.push(formatEntry(e)));
          }
          if (mai_putin && mai_putin.length > 0) {
              lines.push('[DETALII]');
              mai_putin.forEach(e => lines.push(formatEntry(e)));
          }
          
          lines.push('\nISTORIC RECENT:');
          if (conversationHistory) {
              conversationHistory.forEach(m => lines.push(`${m.role.toUpperCase()}: ${m.content}`));
          }

          systemContext = lines.join('\n');
          
          // Max 2000 tokens (~8000 caractere). Trunchiem de la 'mai_putin' în jos dacă depășește.
          if (systemContext.length > 8000) {
              // Dacă e prea mare, încercăm să reconstruim fără 'mai_putin'
              const shorterLines: string[] = ['MEMORIE ACTIVĂ JARVIS:'];
              if (reguli && reguli.length > 0) { shorterLines.push('[REGULI]'); reguli.forEach(e => shorterLines.push(formatEntry(e))); }
              if (importanta && importanta.length > 0) { shorterLines.push('[FAPTE IMPORTANTE]'); importanta.forEach(e => shorterLines.push(formatEntry(e))); }
              if (sistem && sistem.length > 0) { shorterLines.push('[SISTEM]'); sistem.forEach(e => shorterLines.push(formatEntry(e))); }
              
              shorterLines.push('\nISTORIC RECENT:');
              if (conversationHistory) {
                  conversationHistory.forEach(m => shorterLines.push(`${m.role.toUpperCase()}: ${m.content}`));
              }
              
              systemContext = shorterLines.join('\n');
              
              // Dacă tot e prea mare, tăiem brutal la 8000
              if (systemContext.length > 8000) {
                  systemContext = systemContext.substring(0, 8000) + '\n... [Context trunchiat]';
              }
          }
      }
      
      console.log(`[Orchestrator] Routing to agent: ${agent.name}`);
      const result = await callSubAgent(agent.id, message, systemContext);
      
      if (!result.success || !result.response || result.response.trim().length === 0) {
        console.log('[Orchestrator] Agent failed or returned empty, fallback required');
        return {
          response: '',
          agentUsed: null,
          skillUsed: intent.skill.id,
          wasAutoCreated: false,
          success: false,
          complexityScore: intent.complexityScore
        };
      }
      
      return {
        response: result.response,
        agentUsed: agent.name,
        skillUsed: intent.skill.name,
        wasAutoCreated,
        success: true,
        complexityScore: intent.complexityScore
      };
    } catch(e: any) {
      console.error('[Orchestrator] routeMessage error:', e);
      return {
        response: '',
        agentUsed: null,
        skillUsed: 'error',
        wasAutoCreated: false,
        success: false,
        complexityScore: 3
      };
    }
  }

  async route(message: string, memoryContext?: MemoryContext): Promise<RouteResult> {
      return this.routeMessage(message, memoryContext);
  }
}

export const orchestrator = new JarvisOrchestrator();
