import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Rocket, 
  RefreshCw, 
  Target, 
  Users, 
  Layers, 
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface DevelopmentPhase {
  phase: string;
  name: string;
  description: string;
  keyActivities: string[];
  focus: string;
  experimentalGoals: string[];
}

interface TechnologyStack {
  id: string;
  name: string;
  description: string;
  frontend: Array<{ name: string; purpose: string }>;
  backend: Array<{ name: string; purpose: string }>;
  database: Array<{ name: string; purpose: string }>;
}

interface UserCohort {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  preferences: {
    developmentApproach: string;
    technologyPreference: string[];
    complexityTolerance: string;
  };
}

export function DevelopmentPhasesDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhase, setSelectedPhase] = useState<string>('greenfield');

  // Fetch development phases
  const { data: phases } = useQuery({
    queryKey: ['development-phases'],
    queryFn: async () => {
      const response = await fetch('/api/development-phases/phases');
      const result = await response.json();
      return result.data as DevelopmentPhase[];
    }
  });

  // Fetch experimental goals
  const { data: experimentalGoals } = useQuery({
    queryKey: ['experimental-goals'],
    queryFn: async () => {
      const response = await fetch('/api/development-phases/experimental-goals');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch technology stacks
  const { data: technologyStacks } = useQuery({
    queryKey: ['technology-stacks'],
    queryFn: async () => {
      const response = await fetch('/api/development-phases/technology-stacks');
      const result = await response.json();
      return result.data as TechnologyStack[];
    }
  });

  // Fetch user cohorts
  const { data: userCohorts } = useQuery({
    queryKey: ['user-cohorts'],
    queryFn: async () => {
      const response = await fetch('/api/development-phases/user-cohorts');
      const result = await response.json();
      return result.data as UserCohort[];
    }
  });

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'greenfield':
        return <Rocket className="h-5 w-5" />;
      case 'creative-exploration':
        return <Lightbulb className="h-5 w-5" />;
      case 'brownfield':
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Development Phases Framework</h1>
          <p className="text-lg text-muted-foreground">
            Implementing Spec-Driven Development across multiple phases and technology stacks
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="cohorts">User Cohorts</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Development Phases</CardTitle>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{phases?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active development methodologies
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Technology Stacks</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{technologyStacks?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Supported tech stacks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Cohorts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userCohorts?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Targeted user groups
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experimental Goals</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {experimentalGoals ? Object.keys(experimentalGoals).length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Research objectives
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Experimental Goals Overview */}
            {experimentalGoals && (
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Experimental Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(experimentalGoals).map(([key, goal]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value="phases" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {phases?.map((phase) => (
                <Card 
                  key={phase.phase} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedPhase === phase.phase ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPhase(phase.phase)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getPhaseIcon(phase.phase)}
                      {phase.name}
                    </CardTitle>
                    <Badge variant="outline">{phase.focus}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {phase.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Key Activities:</h4>
                        <ul className="space-y-1">
                          {phase.keyActivities.map((activity, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Experimental Goals:</h4>
                        <div className="flex flex-wrap gap-1">
                          {phase.experimentalGoals.map((goal) => (
                            <Badge key={goal} variant="secondary" className="text-xs">
                              {goal.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="technology" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {technologyStacks?.map((stack) => (
                <Card key={stack.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      {stack.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {stack.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Frontend:</h4>
                        <div className="flex flex-wrap gap-2">
                          {stack.frontend.map((tech, index) => (
                            <Badge key={index} variant="outline">
                              {tech.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Backend:</h4>
                        <div className="flex flex-wrap gap-2">
                          {stack.backend.map((tech, index) => (
                            <Badge key={index} variant="outline">
                              {tech.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Database:</h4>
                        <div className="flex flex-wrap gap-2">
                          {stack.database.map((tech, index) => (
                            <Badge key={index} variant="outline">
                              {tech.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {userCohorts?.map((cohort) => (
                <Card key={cohort.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {cohort.name}
                    </CardTitle>
                    <Badge 
                      className={getComplexityColor(cohort.preferences.complexityTolerance)}
                      variant="secondary"
                    >
                      {cohort.preferences.complexityTolerance} complexity
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {cohort.description}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Characteristics:</h4>
                        <ul className="space-y-1">
                          {cohort.characteristics.map((char, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Development Approach:</h4>
                        <Badge variant="outline">
                          {cohort.preferences.developmentApproach}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Tech Preferences:</h4>
                        <div className="flex flex-wrap gap-1">
                          {cohort.preferences.technologyPreference.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🧪 Research & Experimentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Technology Independence
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Validate that Spec-Driven Development works across multiple technology stacks and frameworks.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Multi-stack application generation
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Framework-agnostic specifications
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          Cross-platform compatibility testing
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User-Centric Development
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Build applications optimized for different user cohorts and development preferences.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Cohort-specific adaptations
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          UX pattern variations
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-3 w-3 text-blue-500" />
                          Preference-driven workflows
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Enterprise Constraints
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Support mission-critical development with organizational constraints and compliance requirements.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Cloud provider constraints
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Tech stack limitations
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          Compliance validation
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Creative & Iterative Processes
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enable parallel implementation exploration and robust iterative development workflows.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Parallel implementation variants
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3 w-3 text-yellow-500" />
                          Iterative enhancement workflows
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-3 w-3 text-blue-500" />
                          Modernization task planning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}