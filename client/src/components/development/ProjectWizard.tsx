import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Rocket, 
  Lightbulb, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface ProjectWizardStep {
  id: string;
  title: string;
  description: string;
}

interface EnterpriseConstraint {
  type: string;
  name: string;
  description: string;
  enforced: boolean;
  priority: string;
}

interface ProjectData {
  name: string;
  description: string;
  phase: string;
  requirements: string[];
  constraints: EnterpriseConstraint[];
  technologyPreferences: string[];
  targetCohorts: string[];
  explorationOptions?: {
    technologyVariants: string[];
    uxPatterns: string[];
    architecturalApproaches: string[];
  };
  modernizationOptions?: {
    currentTechnologies: string[];
    architecture: string;
    goals: string[];
  };
}

const wizardSteps: ProjectWizardStep[] = [
  {
    id: 'basics',
    title: 'Project Basics',
    description: 'Define your project name, description, and development phase'
  },
  {
    id: 'requirements',
    title: 'Requirements & Constraints',
    description: 'Specify high-level requirements and enterprise constraints'
  },
  {
    id: 'technology',
    title: 'Technology & Users',
    description: 'Select technology preferences and target user cohorts'
  },
  {
    id: 'phase-specific',
    title: 'Phase Configuration',
    description: 'Configure options specific to your chosen development phase'
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your configuration and create the project'
  }
];

export function ProjectWizard({ onProjectCreated }: { onProjectCreated?: (project: any) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    phase: 'greenfield',
    requirements: [''],
    constraints: [],
    technologyPreferences: [],
    targetCohorts: []
  });

  // Fetch available options
  const { data: technologyStacks } = useQuery({
    queryKey: ['technology-stacks'],
    queryFn: async () => {
      const response = await fetch('/api/development-phases/technology-stacks');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: userCohorts } = useQuery({
    queryKey: ['user-cohorts'],
    queryFn: async () => {
      const response = await fetch('/api/development-phases/user-cohorts');
      const result = await response.json();
      return result.data;
    }
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectData) => {
      const endpoint = getProjectEndpoint(data.phase);
      const payload = buildPayload(data);
      
      const response = await fetch(`/api/development-phases/projects/${data.name}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      onProjectCreated?.(result);
    }
  });

  const getProjectEndpoint = (phase: string) => {
    switch (phase) {
      case 'greenfield':
        return 'greenfield';
      case 'creative-exploration':
        return 'explore';
      case 'brownfield':
        return 'modernize';
      default:
        return 'greenfield';
    }
  };

  const buildPayload = (data: ProjectData) => {
    switch (data.phase) {
      case 'greenfield':
        return {
          requirements: data.requirements.filter(r => r.trim()),
          constraints: data.constraints
        };
      case 'creative-exploration':
        return {
          requirements: data.requirements.filter(r => r.trim()).map(req => ({
            id: `req-${Date.now()}-${Math.random()}`,
            title: req,
            description: req,
            priority: 'high',
            category: 'functional',
            status: 'draft'
          })),
          explorationVariants: data.explorationOptions || {
            technologyVariants: data.technologyPreferences,
            uxPatterns: ['mobile-first', 'desktop-first', 'responsive'],
            architecturalApproaches: ['microservices', 'monolith', 'serverless']
          }
        };
      case 'brownfield':
        return {
          currentSystem: data.modernizationOptions || {
            technologies: ['legacy-system'],
            architecture: 'monolith',
            constraints: data.constraints
          },
          modernizationGoals: data.modernizationOptions?.goals || ['modernize-ui', 'improve-performance']
        };
      default:
        return { requirements: data.requirements };
    }
  };

  const addRequirement = () => {
    setProjectData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setProjectData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setProjectData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addConstraint = () => {
    setProjectData(prev => ({
      ...prev,
      constraints: [...prev.constraints, {
        type: 'tech-stack',
        name: '',
        description: '',
        enforced: true,
        priority: 'preferred'
      }]
    }));
  };

  const updateConstraint = (index: number, field: string, value: any) => {
    setProjectData(prev => ({
      ...prev,
      constraints: prev.constraints.map((constraint, i) => 
        i === index ? { ...constraint, [field]: value } : constraint
      )
    }));
  };

  const removeConstraint = (index: number) => {
    setProjectData(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return projectData.name.trim() && projectData.description.trim() && projectData.phase;
      case 1:
        return projectData.requirements.some(req => req.trim());
      case 2:
        return true; // Optional step
      case 3:
        return true; // Phase-specific validation handled separately
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'greenfield':
        return <Rocket className="h-5 w-5" />;
      case 'creative-exploration':
        return <Lightbulb className="h-5 w-5" />;
      case 'brownfield':
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <Rocket className="h-5 w-5" />;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project goals and vision"
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <Label>Development Phase</Label>
              <RadioGroup
                value={projectData.phase}
                onValueChange={(value) => setProjectData(prev => ({ ...prev, phase: value }))}
              >
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="greenfield" id="greenfield" />
                    <div className="flex-1">
                      <Label htmlFor="greenfield" className="flex items-center gap-2 font-medium">
                        <Rocket className="h-4 w-4" />
                        0-to-1 Development (Greenfield)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Generate applications from scratch with high-level requirements
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="creative-exploration" id="creative-exploration" />
                    <div className="flex-1">
                      <Label htmlFor="creative-exploration" className="flex items-center gap-2 font-medium">
                        <Lightbulb className="h-4 w-4" />
                        Creative Exploration
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Explore diverse solutions through parallel implementations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="brownfield" id="brownfield" />
                    <div className="flex-1">
                      <Label htmlFor="brownfield" className="flex items-center gap-2 font-medium">
                        <RefreshCw className="h-4 w-4" />
                        Iterative Enhancement (Brownfield)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Modernize and enhance existing systems iteratively
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>High-Level Requirements</Label>
                <Button onClick={addRequirement} variant="outline" size="sm">
                  Add Requirement
                </Button>
              </div>
              
              {projectData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Enter a high-level requirement"
                    className="flex-1"
                  />
                  {projectData.requirements.length > 1 && (
                    <Button
                      onClick={() => removeRequirement(index)}
                      variant="outline"
                      size="icon"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enterprise Constraints (Optional)</Label>
                <Button onClick={addConstraint} variant="outline" size="sm">
                  Add Constraint
                </Button>
              </div>

              {projectData.constraints.map((constraint, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Constraint Type</Label>
                      <Select
                        value={constraint.type}
                        onValueChange={(value) => updateConstraint(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cloud-provider">Cloud Provider</SelectItem>
                          <SelectItem value="tech-stack">Technology Stack</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={constraint.priority}
                        onValueChange={(value) => updateConstraint(index, 'priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mandatory">Mandatory</SelectItem>
                          <SelectItem value="preferred">Preferred</SelectItem>
                          <SelectItem value="optional">Optional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Name</Label>
                      <Input
                        value={constraint.name}
                        onChange={(e) => updateConstraint(index, 'name', e.target.value)}
                        placeholder="e.g., AWS Only, React Required"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={constraint.description}
                        onChange={(e) => updateConstraint(index, 'description', e.target.value)}
                        placeholder="Describe the constraint and its implications"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2 col-span-2">
                      <Checkbox
                        checked={constraint.enforced}
                        onCheckedChange={(checked) => updateConstraint(index, 'enforced', checked)}
                      />
                      <Label>Strictly enforced</Label>
                      <Button
                        onClick={() => removeConstraint(index)}
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Technology Preferences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {technologyStacks?.map((stack: any) => (
                  <div
                    key={stack.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      projectData.technologyPreferences.includes(stack.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setProjectData(prev => ({
                        ...prev,
                        technologyPreferences: prev.technologyPreferences.includes(stack.id)
                          ? prev.technologyPreferences.filter(id => id !== stack.id)
                          : [...prev.technologyPreferences, stack.id]
                      }));
                    }}
                  >
                    <h4 className="font-medium text-sm">{stack.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stack.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Target User Cohorts</Label>
              <div className="grid gap-3">
                {userCohorts?.map((cohort: any) => (
                  <div
                    key={cohort.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      projectData.targetCohorts.includes(cohort.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setProjectData(prev => ({
                        ...prev,
                        targetCohorts: prev.targetCohorts.includes(cohort.id)
                          ? prev.targetCohorts.filter(id => id !== cohort.id)
                          : [...prev.targetCohorts, cohort.id]
                      }));
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{cohort.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cohort.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {cohort.preferences.developmentApproach}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {cohort.preferences.complexityTolerance} complexity
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        // Phase-specific configuration
        if (projectData.phase === 'creative-exploration') {
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Creative Exploration Options</h3>
                <p className="text-muted-foreground mb-6">
                  Configure how you want to explore different implementation approaches.
                </p>
              </div>

              <div className="space-y-4">
                <Label>UX Patterns to Explore</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['mobile-first', 'desktop-first', 'responsive', 'progressive-web-app', 'native-mobile'].map((pattern) => (
                    <div
                      key={pattern}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        projectData.explorationOptions?.uxPatterns.includes(pattern)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setProjectData(prev => ({
                          ...prev,
                          explorationOptions: {
                            ...prev.explorationOptions,
                            uxPatterns: prev.explorationOptions?.uxPatterns.includes(pattern)
                              ? prev.explorationOptions.uxPatterns.filter(p => p !== pattern)
                              : [...(prev.explorationOptions?.uxPatterns || []), pattern],
                            technologyVariants: prev.technologyPreferences,
                            architecturalApproaches: prev.explorationOptions?.architecturalApproaches || []
                          }
                        }));
                      }}
                    >
                      <span className="text-sm font-medium">{pattern.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Architectural Approaches</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['microservices', 'monolith', 'serverless', 'jamstack', 'event-driven'].map((approach) => (
                    <div
                      key={approach}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        projectData.explorationOptions?.architecturalApproaches.includes(approach)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setProjectData(prev => ({
                          ...prev,
                          explorationOptions: {
                            ...prev.explorationOptions,
                            architecturalApproaches: prev.explorationOptions?.architecturalApproaches.includes(approach)
                              ? prev.explorationOptions.architecturalApproaches.filter(a => a !== approach)
                              : [...(prev.explorationOptions?.architecturalApproaches || []), approach],
                            technologyVariants: prev.technologyPreferences,
                            uxPatterns: prev.explorationOptions?.uxPatterns || []
                          }
                        }));
                      }}
                    >
                      <span className="text-sm font-medium">{approach}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        } else if (projectData.phase === 'brownfield') {
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Modernization Configuration</h3>
                <p className="text-muted-foreground mb-6">
                  Describe your current system and modernization goals.
                </p>
              </div>

              <div className="space-y-4">
                <Label>Current Technologies</Label>
                <Textarea
                  value={projectData.modernizationOptions?.currentTechnologies.join(', ') || ''}
                  onChange={(e) => setProjectData(prev => ({
                    ...prev,
                    modernizationOptions: {
                      ...prev.modernizationOptions,
                      currentTechnologies: e.target.value.split(',').map(t => t.trim()),
                      architecture: prev.modernizationOptions?.architecture || 'monolith',
                      goals: prev.modernizationOptions?.goals || []
                    }
                  }))}
                  placeholder="List current technologies (comma-separated)"
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <Label>Current Architecture</Label>
                <Select
                  value={projectData.modernizationOptions?.architecture || 'monolith'}
                  onValueChange={(value) => setProjectData(prev => ({
                    ...prev,
                    modernizationOptions: {
                      ...prev.modernizationOptions,
                      architecture: value,
                      currentTechnologies: prev.modernizationOptions?.currentTechnologies || [],
                      goals: prev.modernizationOptions?.goals || []
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monolith">Monolithic</SelectItem>
                    <SelectItem value="microservices">Microservices</SelectItem>
                    <SelectItem value="soa">Service-Oriented Architecture</SelectItem>
                    <SelectItem value="serverless">Serverless</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Modernization Goals</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'improve-performance',
                    'enhance-security',
                    'modernize-ui',
                    'cloud-migration',
                    'api-modernization',
                    'database-upgrade',
                    'mobile-support',
                    'scalability-improvement'
                  ].map((goal) => (
                    <div
                      key={goal}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        projectData.modernizationOptions?.goals.includes(goal)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setProjectData(prev => ({
                          ...prev,
                          modernizationOptions: {
                            ...prev.modernizationOptions,
                            goals: prev.modernizationOptions?.goals.includes(goal)
                              ? prev.modernizationOptions.goals.filter(g => g !== goal)
                              : [...(prev.modernizationOptions?.goals || []), goal],
                            currentTechnologies: prev.modernizationOptions?.currentTechnologies || [],
                            architecture: prev.modernizationOptions?.architecture || 'monolith'
                          }
                        }));
                      }}
                    >
                      <span className="text-sm font-medium">{goal.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Greenfield Configuration Complete</h3>
              <p className="text-muted-foreground">
                Your 0-to-1 development project is ready to be created with the specified requirements and constraints.
              </p>
            </div>
          );
        }

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Project Configuration</h3>
              <p className="text-muted-foreground mb-6">
                Please review your project configuration before creating it.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPhaseIcon(projectData.phase)}
                  {projectData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{projectData.description}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Development Phase</Label>
                  <Badge variant="outline" className="ml-2">
                    {projectData.phase.replace('-', ' ')}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium">Requirements ({projectData.requirements.filter(r => r.trim()).length})</Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {projectData.requirements.filter(r => r.trim()).map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {projectData.constraints.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Enterprise Constraints ({projectData.constraints.length})</Label>
                    <div className="mt-2 space-y-2">
                      {projectData.constraints.map((constraint, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          <span>{constraint.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {constraint.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projectData.technologyPreferences.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Technology Preferences</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projectData.technologyPreferences.map((techId) => {
                        const stack = technologyStacks?.find((s: any) => s.id === techId);
                        return stack ? (
                          <Badge key={techId} variant="outline" className="text-xs">
                            {stack.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {projectData.targetCohorts.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Target User Cohorts</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {projectData.targetCohorts.map((cohortId) => {
                        const cohort = userCohorts?.find((c: any) => c.id === cohortId);
                        return cohort ? (
                          <Badge key={cohortId} variant="secondary" className="text-xs">
                            {cohort.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {createProjectMutation.error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Error creating project</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {createProjectMutation.error.message}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-muted-foreground">
          Use the Development Phases Framework to create your next application
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {wizardSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              {index < wizardSteps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{wizardSteps[currentStep].title}</h2>
          <p className="text-muted-foreground text-sm">
            {wizardSteps[currentStep].description}
          </p>
        </div>
      </div>

      {/* Step content */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < wizardSteps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => createProjectMutation.mutate(projectData)}
            disabled={!canProceed() || createProjectMutation.isPending}
          >
            {createProjectMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}