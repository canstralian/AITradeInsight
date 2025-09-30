// Development Phases Framework Types
// Based on: 0-to-1 Development, Creative Exploration, Iterative Enhancement

export type DevelopmentPhase = 'greenfield' | 'creative-exploration' | 'brownfield';

export interface DevelopmentPhaseConfig {
  phase: DevelopmentPhase;
  name: string;
  description: string;
  keyActivities: string[];
  focus: string;
  experimentalGoals: ExperimentalGoal[];
}

export type ExperimentalGoal = 
  | 'technology-independence'
  | 'enterprise-constraints'
  | 'user-centric-development'
  | 'creative-iterative-processes';

export interface SpecificationRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'functional' | 'non-functional' | 'technical' | 'business';
  status: 'draft' | 'review' | 'approved' | 'implemented';
  dependencies?: string[];
  constraints?: EnterpriseConstraint[];
}

export interface EnterpriseConstraint {
  type: 'cloud-provider' | 'tech-stack' | 'security' | 'compliance' | 'performance';
  name: string;
  description: string;
  enforced: boolean;
  priority: 'mandatory' | 'preferred' | 'optional';
}

export interface TechnologyStack {
  id: string;
  name: string;
  description: string;
  frontend: TechStackComponent[];
  backend: TechStackComponent[];
  database: TechStackComponent[];
  infrastructure: TechStackComponent[];
  experimentalVariant?: boolean;
}

export interface TechStackComponent {
  name: string;
  version?: string;
  purpose: string;
  alternatives?: string[];
  constraints?: EnterpriseConstraint[];
}

export interface UserCohort {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  preferences: {
    developmentApproach: 'vibe-coding' | 'ai-native' | 'traditional' | 'hybrid';
    technologyPreference: string[];
    complexityTolerance: 'low' | 'medium' | 'high';
  };
}

export interface ImplementationPlan {
  id: string;
  phase: DevelopmentPhase;
  requirements: SpecificationRequirement[];
  technologyStack: TechnologyStack;
  targetCohorts: UserCohort[];
  timeline: ImplementationStep[];
  parallelVariants?: ImplementationPlan[];
}

export interface ImplementationStep {
  id: string;
  name: string;
  description: string;
  dependencies?: string[];
  estimatedEffort: number; // in hours
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  deliverables: string[];
}

export interface ModernizationTask {
  id: string;
  type: 'feature-addition' | 'legacy-upgrade' | 'process-adaptation' | 'architecture-evolution';
  description: string;
  currentState: string;
  targetState: string;
  riskLevel: 'low' | 'medium' | 'high';
  effort: number;
  benefits: string[];
}

// Phase-specific configurations
export const DEVELOPMENT_PHASES: Record<DevelopmentPhase, DevelopmentPhaseConfig> = {
  'greenfield': {
    phase: 'greenfield',
    name: '0-to-1 Development',
    description: 'Generate applications from scratch with high-level requirements',
    focus: 'Generate from scratch',
    keyActivities: [
      'Start with high-level requirements',
      'Generate specifications',
      'Plan implementation steps',
      'Build production-ready applications'
    ],
    experimentalGoals: ['technology-independence', 'enterprise-constraints']
  },
  'creative-exploration': {
    phase: 'creative-exploration',
    name: 'Creative Exploration',
    description: 'Explore diverse solutions through parallel implementations',
    focus: 'Parallel implementations',
    keyActivities: [
      'Explore diverse solutions',
      'Support multiple technology stacks & architectures',
      'Experiment with UX patterns'
    ],
    experimentalGoals: ['technology-independence', 'user-centric-development', 'creative-iterative-processes']
  },
  'brownfield': {
    phase: 'brownfield',
    name: 'Iterative Enhancement',
    description: 'Modernize and enhance existing systems iteratively',
    focus: 'Brownfield modernization',
    keyActivities: [
      'Add features iteratively',
      'Modernize legacy systems',
      'Adapt processes'
    ],
    experimentalGoals: ['enterprise-constraints', 'creative-iterative-processes']
  }
};

export const EXPERIMENTAL_GOALS: Record<ExperimentalGoal, { name: string; description: string }> = {
  'technology-independence': {
    name: 'Technology Independence',
    description: 'Create applications using diverse technology stacks, validating Spec-Driven Development as process-agnostic'
  },
  'enterprise-constraints': {
    name: 'Enterprise Constraints',
    description: 'Support mission-critical development with organizational constraints (cloud providers, tech stacks, compliance)'
  },
  'user-centric-development': {
    name: 'User-Centric Development',
    description: 'Build applications for different user cohorts and development preferences'
  },
  'creative-iterative-processes': {
    name: 'Creative & Iterative Processes',
    description: 'Enable parallel implementation exploration and robust iterative development workflows'
  }
};