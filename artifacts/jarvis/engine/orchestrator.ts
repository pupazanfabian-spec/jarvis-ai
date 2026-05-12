
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
    const wordCount = message.trim().split(/\s+/).length;
    
    // Simple ONLY if greeting/short question AND conversation skill
    const isSimpleGreeting = wordCount <= 4 && skill.id === 'conversatie';
    
    // Complex if contains action words
    const complexKeywords = [
        'planifica', 'creeaza', 'creaza', 'scrie', 'cauta', 
        'cerceteaza', 'verifica', 'debug', 'script', 'cod', 'program',
        'research', 'analizeaza', 'explica in detaliu', 'implementeaza',
        'workflow', 'organizeaza', 'arhitectura'
    ];
    const hasComplexKeyword = complexKeywords.some(kw => 
      message.toLowerCase().includes(kw));
    
    let complexity: 'simple' | 'medium' | 'complex';
    if (isSimpleGreeting) {
      complexity = 'simple';
    } else if (hasComplexKeyword || skill.id !== 'conversatie') {
      complexity = hasComplexKeyword ? 'complex' : 'medium';
    } else {
      complexity = wordCount > 8 ? 'medium' : 'simple';
    }
    
    console.log(`[Orchestrator] Msg: "${message.substring(0,30)}..." Skill: ${skill.id} Complexity: ${complexity}`);
    
    return {
      skill,
      needsAgent: complexity !== 'simple',
      suggestedAgentName: `Expert ${skill.name}`,
      complexity
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
      
      if (intent.complexity === 'simple') {
        return {
          response: '',
          agentUsed: null,
          skillUsed: intent.skill.id,
          wasAutoCreated: false,
          success: true
        };
      }
      
      let agent = await this.findBestAgent(intent.skill.id);
      let wasAutoCreated = false;
      
      if (!agent) {
        console.log('[Orchestrator] No agent found, auto-creating...');
        agent = await this.autoCreateAgent(intent.skill);
        wasAutoCreated = true;
      }
      
      console.log(`[Orchestrator] Routing to agent: ${agent.name}`);
      const result = await callSubAgent(agent.id, message);
      
      if (!result.success || !result.response || result.response.trim().length === 0) {
        console.log('[Orchestrator] Agent failed or returned empty, fallback required');
        return {
          response: '',
          agentUsed: null,
          skillUsed: intent.skill.id,
          wasAutoCreated: false,
          success: false
        };
      }
      
      return {
        response: result.response,
        agentUsed: agent.name,
        skillUsed: intent.skill.name,
        wasAutoCreated,
        success: true
      };
    } catch(e: any) {
      console.error('[Orchestrator] route error:', e);
      return {
        response: '',
        agentUsed: null,
        skillUsed: 'error',
        wasAutoCreated: false,
        success: false
      };
    }
  }
}

export const orchestrator = new JarvisOrchestrator();
