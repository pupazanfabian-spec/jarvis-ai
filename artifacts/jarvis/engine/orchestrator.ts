
import { Skill, getAllSkills, detectSkill } from './code-studio/skills';
import { SubAgent, getSubAgents, createSubAgent, callSubAgent, AgentResult } from './code-studio/subAgentManager';
import { hasValidKey } from './code-studio/keyManager';

export interface RouteResult {
  response: string;
  agentUsed: string | null;
  skillUsed: string;
  wasAutoCreated: boolean;
  success: boolean;
}

export class JarvisOrchestrator {
  
  async analyzeIntent(message: string): Promise<{
    skill: Skill;
    needsAgent: boolean;
    suggestedAgentName: string;
    complexity: 'simple' | 'medium' | 'complex';
  }> {
    const allSkills = await getAllSkills();
    const skill = detectSkill(message, allSkills);
    
    const wordCount = message.split(/\s+/).length;
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    
    // logic refinement: more sensitive
    if (wordCount > 5 || skill.category !== 'conversatie') {
        complexity = 'medium';
    }
    
    const complexKeywords = ['planifica', 'creeaza', 'scrie cod', 'cauta', 'workflow', 'organizeaza', 'analiza'];
    if (skill.tools.length > 0 || complexKeywords.some(k => message.toLowerCase().includes(k))) {
        complexity = 'complex';
    }

    return {
      skill,
      needsAgent: complexity !== 'simple',
      suggestedAgentName: `Expert ${skill.name}`,
      complexity
    };
  }

  async findBestAgent(skillId: string): Promise<SubAgent | null> {
    const agents = await getSubAgents();
    const activeAgents = (agents || []).filter(a => a.isActive);
    
    if (activeAgents.length === 0) return null;

    // 1. Try perfect skill match
    const withSkill = activeAgents.filter(a => a.skills.includes(skillId));
    if (withSkill.length > 0) return withSkill[0];

    // 2. Fallback: Return highest priority active agent
    return activeAgents[0]; 
  }

  async autoCreateAgent(skill: Skill): Promise<SubAgent> {
    const provider = await hasValidKey('groq') ? 'groq' : 'openrouter';
    return await createSubAgent({
      name: `Expert ${skill.name}`,
      description: `Agent creat automat pentru ${skill.name}`,
      agentProvider: provider,
      skills: [skill.id],
      systemPrompt: skill.systemPrompt,
      priority: 5,
      isActive: true
    });
  }

  async route(message: string): Promise<RouteResult> {
    try {
      const intent = await this.analyzeIntent(message);
      console.log(`[Orchestrator] Intent: ${intent.skill.name}, Complexity: ${intent.complexity}`);

      if (intent.complexity === 'simple' && intent.skill.id === 'conversatie') {
          return {
              response: '', 
              agentUsed: null,
              skillUsed: 'conversatie',
              wasAutoCreated: false,
              success: true
          };
      }

      let agent = await this.findBestAgent(intent.skill.id);
      let wasAutoCreated = false;

      if (!agent) {
          agent = await this.autoCreateAgent(intent.skill);
          wasAutoCreated = true;
      }

      const result: AgentResult = await callSubAgent(agent.id, message);

      return {
        response: result.response,
        agentUsed: agent.name,
        skillUsed: intent.skill.name,
        wasAutoCreated,
        success: result.success
      };
    } catch (e: any) {
        console.error('[Orchestrator] Route error:', e);
        return {
            response: `Eroare orchestrator: ${e.message}`,
            agentUsed: null,
            skillUsed: 'error',
            wasAutoCreated: false,
            success: false
        };
    }
  }
}

export const orchestrator = new JarvisOrchestrator();
