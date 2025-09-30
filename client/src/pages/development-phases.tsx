import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DevelopmentPhasesDashboard } from '@/components/development/DevelopmentPhasesDashboard';
import { ProjectWizard } from '@/components/development/ProjectWizard';
import { 
  Plus, 
  Rocket, 
  Lightbulb, 
  RefreshCw, 
  Target,
  Code2,
  Layers,
  Users,
  GitBranch
} from 'lucide-react';

export function DevelopmentPhasesPage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [createdProject, setCreatedProject] = useState<any>(null);

  const handleProjectCreated = (project: any) => {
    setCreatedProject(project);
    setActiveView('dashboard');
  };

  if (activeView === 'wizard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto py-6">
          <Button
            onClick={() => setActiveView('dashboard')}
            variant="outline"
            className="mb-6"
          >
            ← Back to Dashboard
          </Button>
          <ProjectWizard onProjectCreated={handleProjectCreated} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto py-6">
        {/* Header with CTA */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Development Phases Framework</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Implement Spec-Driven Development across multiple phases, technology stacks, and user cohorts. 
              Research and validate technology-independent development methodologies.
            </p>
          </div>
          <Button
            onClick={() => setActiveView('wizard')}
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Project
          </Button>
        </div>

        {/* Success notification */}
        {createdProject && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <Target className="h-5 w-5" />
                <span className="font-medium">Project created successfully!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your project "{createdProject.data?.id || 'New Project'}" has been created and is ready for development.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Feature highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Rocket className="h-8 w-8 mx-auto text-blue-500" />
              <CardTitle className="text-lg">0-to-1 Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate applications from scratch with high-level requirements and specifications
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Lightbulb className="h-8 w-8 mx-auto text-yellow-500" />
              <CardTitle className="text-lg">Creative Exploration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore diverse solutions through parallel implementations and technology variants
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <RefreshCw className="h-8 w-8 mx-auto text-green-500" />
              <CardTitle className="text-lg">Iterative Enhancement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Modernize legacy systems and enhance existing applications iteratively
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-8 w-8 mx-auto text-purple-500" />
              <CardTitle className="text-lg">Experimental Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Validate technology independence and support enterprise constraints
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Research objectives */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              🌟 Research & Experimentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Technology Independence
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create applications using diverse technology stacks to validate that Spec-Driven Development 
                  is a process not tied to specific technologies, programming languages, or frameworks.
                </p>
                <div className="space-y-1 text-xs">
                  <div>✓ React + Node.js + PostgreSQL</div>
                  <div>✓ Vue + Python + MongoDB</div>
                  <div>✓ Angular + .NET + SQL Server</div>
                  <div>✓ Framework-agnostic specifications</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User-Centric Development
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Build applications for different user cohorts and preferences, supporting various 
                  development approaches from vibe-coding to AI-native development.
                </p>
                <div className="space-y-1 text-xs">
                  <div>✓ Vibe Coders (minimal setup)</div>
                  <div>✓ AI-Native Developers</div>
                  <div>✓ Enterprise Developers</div>
                  <div>✓ Preference-driven workflows</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Enterprise Constraints
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Demonstrate mission-critical application development with organizational constraints 
                  including cloud providers, tech stacks, and compliance requirements.
                </p>
                <div className="space-y-1 text-xs">
                  <div>✓ Cloud provider limitations</div>
                  <div>✓ Technology stack constraints</div>
                  <div>✓ Security & compliance</div>
                  <div>✓ Design system integration</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Creative & Iterative Processes
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Validate parallel implementation exploration and provide robust iterative 
                  feature development workflows for upgrades and modernization.
                </p>
                <div className="space-y-1 text-xs">
                  <div>✓ Parallel implementation variants</div>
                  <div>✓ Iterative enhancement workflows</div>
                  <div>✓ Modernization task planning</div>
                  <div>✓ UX pattern experimentation</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main dashboard */}
        <DevelopmentPhasesDashboard />
      </div>
    </div>
  );
}