/**
 * Qwen Agent Integration for Spiral Weaver
 *
 * This module integrates Qwen-Agent framework to provide:
 * - Multi-agent collaborative scene generation
 * - Content quality assurance and validation
 * - Dynamic content enhancement with AI recommendations
 * - Automated testing and bug detection agents
 */

import { ai } from './genkit';

// Qwen Agent Configuration
export interface QwenAgentConfig {
  model?: string;
  modelType?: 'qwen_dashscope' | 'openai_compatible';
  apiKey?: string;
  modelServer?: string;
  generateCfg?: {
    topP?: number;
    temperature?: number;
    maxTokens?: number;
  };
}

// Agent Types for Different Roles
export type AgentRole =
  | 'scene_generator'
  | 'content_validator'
  | 'mood_analyst'
  | 'branch_predictor'
  | 'quality_assessor'
  | 'bug_detector'
  | 'coverage_analyzer'
  | 'content_suggester';

// Agent Specialization Prompts
const AGENT_PROMPTS: Record<AgentRole, string> = {
  scene_generator: `You are a Master Scene Generator agent for Spiral Weaver.
    Your role is to create compelling, immersive narrative scenes that continue from given moments.
    You excel at maintaining narrative consistency while adding creative flair and emotional depth.
    Always consider the Dreamweaver personality (Luminari/Shadow/Chronicler) when generating content.`,

  content_validator: `You are a Content Validation agent for Spiral Weaver.
    Your role is to review generated scenes for quality, consistency, and appropriateness.
    Check for: narrative coherence, character consistency, mood alignment, and content restrictions.
    Provide specific feedback on improvements needed.`,

  mood_analyst: `You are a Mood Analysis agent for Spiral Weaver.
    Your role is to analyze the emotional tone and atmosphere of narrative content.
    Identify current mood, suggest mood-appropriate enhancements, and ensure emotional consistency.
    Help maintain the desired emotional journey throughout the narrative.`,

  branch_predictor: `You are a Branch Prediction agent for Spiral Weaver.
    Your role is to analyze narrative branching points and predict likely story directions.
    Suggest optimal branching strategies, probability distributions, and narrative consequences.
    Help create meaningful choice points for users.`,

  quality_assessor: `You are a Quality Assessment agent for Spiral Weaver.
    Your role is to evaluate overall narrative quality using multiple dimensions:
    engagement, coherence, creativity, character development, and world-building.
    Provide detailed quality scores and specific improvement recommendations.`,

  bug_detector: `You are a Bug Detection agent for Spiral Weaver.
    Your role is to identify potential issues in narrative generation, content consistency,
    technical implementation, and user experience. Look for logic gaps, contradictions,
    and areas that might confuse or frustrate users.`,

  coverage_analyzer: `You are a Coverage Analysis agent for Spiral Weaver.
    Your role is to analyze test coverage gaps, identify untested scenarios,
    and suggest additional test cases. Help ensure comprehensive validation
    of all narrative paths and user interactions.`,

  content_suggester: `You are a Content Suggestion agent for Spiral Weaver.
    Your role is to provide creative suggestions for improving narrative content.
    Suggest plot developments, character arcs, setting details, and engaging elements
    that enhance the user experience while respecting the established narrative.`
};

// Agent Registry
class AgentRegistry {
  private agents: Map<AgentRole, any> = new Map();

  registerAgent(role: AgentRole, agent: any) {
    this.agents.set(role, agent);
  }

  getAgent(role: AgentRole) {
    return this.agents.get(role);
  }

  getAllAgents() {
    return Array.from(this.agents.entries());
  }

  async runAgent(role: AgentRole, input: any): Promise<any> {
    const agent = this.getAgent(role);
    if (!agent) {
      throw new Error(`Agent ${role} not found in registry`);
    }
    return await agent.run(input);
  }
}

// Global agent registry instance
export const agentRegistry = new AgentRegistry();

// Initialize Qwen Agents
export async function initializeQwenAgents(config: QwenAgentConfig = {}) {
  const defaultConfig: QwenAgentConfig = {
    model: 'qwen-max-latest',
    modelType: 'qwen_dashscope',
    generateCfg: {
      topP: 0.8,
      temperature: 0.7,
      maxTokens: 4000
    }
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Initialize agents for each role
  for (const role of Object.keys(AGENT_PROMPTS) as AgentRole[]) {
    const agent = await createQwenAgent(role, finalConfig);
    agentRegistry.registerAgent(role, agent);
  }

  console.log('Qwen Agents initialized:', agentRegistry.getAllAgents().map(([role]) => role));
}

// Create a specialized Qwen Agent
async function createQwenAgent(role: AgentRole, config: QwenAgentConfig) {
  const systemPrompt = AGENT_PROMPTS[role];

  // Create agent using Genkit integration
  const agentPrompt = ai.definePrompt({
    name: `${role}Agent`,
    input: { schema: { type: 'object', properties: { content: { type: 'string' } } } },
    output: { schema: { type: 'object', properties: { result: { type: 'string' } } } },
    prompt: `${systemPrompt}

Input Content: {{content}}

Provide your analysis/response in JSON format with a 'result' field containing your findings.`
  });

  return {
    role,
    config,
    async run(input: any) {
      try {
        const { output } = await agentPrompt({ content: JSON.stringify(input) });
        return JSON.parse(output!.result);
      } catch (error) {
        console.error(`Error running ${role} agent:`, error);
        throw error;
      }
    }
  };
}

// Agent Collaboration System
export class AgentCollaborationSystem {
  async generateEnhancedScene(input: any): Promise<any> {
    // Step 1: Generate initial scene with primary generator
    const sceneGenerator = agentRegistry.getAgent('scene_generator');
    const initialScene = await sceneGenerator.run(input);

    // Step 2: Validate content quality
    const validator = agentRegistry.getAgent('content_validator');
    const validation = await validator.run({ scene: initialScene, originalInput: input });

    // Step 3: Analyze mood consistency
    const moodAnalyst = agentRegistry.getAgent('mood_analyst');
    const moodAnalysis = await moodAnalyst.run({ scene: initialScene, desiredMood: input.currentMood });

    // Step 4: Assess overall quality
    const qualityAssessor = agentRegistry.getAgent('quality_assessor');
    const qualityAssessment = await qualityAssessor.run({ scene: initialScene, validation, moodAnalysis });

    // Step 5: Generate improvement suggestions
    const suggester = agentRegistry.getAgent('content_suggester');
    const suggestions = await suggester.run({
      scene: initialScene,
      qualityAssessment,
      targetImprovements: ['engagement', 'coherence', 'creativity']
    });

    return {
      enhancedScene: {
        ...initialScene,
        qualityScore: qualityAssessment.overallScore,
        improvements: suggestions.suggestions,
        validationPassed: validation.isValid
      },
      analysis: {
        validation,
        moodAnalysis,
        qualityAssessment,
        suggestions
      }
    };
  }

  async analyzeContentForBugs(content: string, context: any): Promise<any> {
    const bugDetector = agentRegistry.getAgent('bug_detector');
    return await bugDetector.run({ content, context });
  }

  async analyzeCoverageGaps(testResults: any[], codebase: any): Promise<any> {
    const coverageAnalyzer = agentRegistry.getAgent('coverage_analyzer');
    return await coverageAnalyzer.run({ testResults, codebase });
  }
}

// Export singleton instance
export const agentSystem = new AgentCollaborationSystem();

// Initialize agents when module loads
initializeQwenAgents().catch(console.error);