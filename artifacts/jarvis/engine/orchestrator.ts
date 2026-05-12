
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
    
    // Logic to determine complexity
    const wordCount = message.split(' ').length;
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    
    if (wordCount > 15 || skill.category !== 'conversatie') {
        complexity = 'medium';
    }
    if (skill.tools.length > 0 || message.toLowerCase().includes('planifica') || message.toLowerCase().includes('workflow')) {
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
    const activeAgents = (agents || []).filter(a => a.isActive && a.skills.includes(skillId));
    
    if (activeAgents.length === 0) return null;
    
    // Sort by priority DESC, then lastUsed ASC (prefer least recently used for load balancing or most for context? 
    // Usually priority is best indicator)
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
      const intent = await analyzeIntentLocal(message);
      
      if (intent.complexity === 'simple' && intent.skill.id === 'conversatie') {
          return {
              response: '', // Let BrainContext handle normal flow
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

// Helper for local access in class
async function analyzeIntentLocal(message: string) {
    const o = new JarvisOrchestrator();
    return await o.analyzeIntent(message);
}

export const orchestrator = new JarvisOrchestrator();
