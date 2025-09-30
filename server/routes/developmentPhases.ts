import { Router } from 'express';
import { DevelopmentPhasesService } from '../developmentPhasesService';
import { 
  DevelopmentPhase, 
  EnterpriseConstraint,
  SpecificationRequirement 
} from '../../shared/types/development-phases';

const router = Router();
const developmentService = new DevelopmentPhasesService();

/**
 * Development Phases API Routes
 * Supports the 3-phase development framework
 */

// Get all development phases configuration
router.get('/phases', (req, res) => {
  try {
    const phases = ['greenfield', 'creative-exploration', 'brownfield'].map(phase => 
      developmentService.getPhaseConfig(phase as DevelopmentPhase)
    );
    res.json({
      success: true,
      data: phases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch development phases'
    });
  }
});

// Get experimental goals
router.get('/experimental-goals', (req, res) => {
  try {
    const goals = developmentService.getExperimentalGoals();
    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch experimental goals'
    });
  }
});

// Get available technology stacks
router.get('/technology-stacks', (req, res) => {
  try {
    const stacks = Array.from(developmentService.getAvailableStacks().values());
    res.json({
      success: true,
      data: stacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch technology stacks'
    });
  }
});

// Get user cohorts
router.get('/user-cohorts', (req, res) => {
  try {
    const cohorts = Array.from(developmentService.getUserCohorts().values());
    res.json({
      success: true,
      data: cohorts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user cohorts'
    });
  }
});

// 0-to-1 Development (Greenfield) - Generate from scratch
router.post('/projects/:projectId/greenfield', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirements, constraints } = req.body;

    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({
        success: false,
        error: 'Requirements array is required'
      });
    }

    const plan = await developmentService.generateFromScratch(
      projectId,
      requirements,
      constraints || []
    );

    res.json({
      success: true,
      data: plan,
      message: 'Greenfield implementation plan generated successfully'
    });
  } catch (error) {
    console.error('Greenfield generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate greenfield implementation plan'
    });
  }
});

// Creative Exploration - Generate parallel implementations
router.post('/projects/:projectId/explore', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirements, explorationVariants } = req.body;

    if (!requirements || !explorationVariants) {
      return res.status(400).json({
        success: false,
        error: 'Requirements and exploration variants are required'
      });
    }

    const plans = await developmentService.exploreParallelImplementations(
      projectId,
      requirements,
      explorationVariants
    );

    res.json({
      success: true,
      data: plans,
      message: `Generated ${plans.length} parallel implementation variants`
    });
  } catch (error) {
    console.error('Exploration generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate exploration variants'
    });
  }
});

// Iterative Enhancement (Brownfield) - Plan modernization
router.post('/projects/:projectId/modernize', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { currentSystem, modernizationGoals } = req.body;

    if (!currentSystem || !modernizationGoals) {
      return res.status(400).json({
        success: false,
        error: 'Current system description and modernization goals are required'
      });
    }

    const tasks = await developmentService.planBrownfieldModernization(
      projectId,
      currentSystem,
      modernizationGoals
    );

    res.json({
      success: true,
      data: tasks,
      message: `Generated ${tasks.length} modernization tasks`
    });
  } catch (error) {
    console.error('Modernization planning error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to plan modernization tasks'
    });
  }
});

// Technology Independence - Demonstrate multi-stack capability
router.post('/projects/:projectId/technology-independence', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirements } = req.body;

    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'Requirements are required'
      });
    }

    const implementations = await developmentService.demonstrateTechnologyIndependence(
      projectId,
      requirements
    );

    const result = Object.fromEntries(implementations);

    res.json({
      success: true,
      data: result,
      message: `Generated implementations for ${Object.keys(result).length} technology stacks`
    });
  } catch (error) {
    console.error('Technology independence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to demonstrate technology independence'
    });
  }
});

// User-Centric Development - Adapt for different cohorts
router.post('/projects/:projectId/user-centric', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirements, targetCohorts } = req.body;

    if (!requirements || !targetCohorts) {
      return res.status(400).json({
        success: false,
        error: 'Requirements and target cohorts are required'
      });
    }

    const cohortPlans = await developmentService.adaptForUserCohorts(
      projectId,
      requirements,
      targetCohorts
    );

    const result = Object.fromEntries(cohortPlans);

    res.json({
      success: true,
      data: result,
      message: `Generated plans for ${Object.keys(result).length} user cohorts`
    });
  } catch (error) {
    console.error('User-centric adaptation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adapt for user cohorts'
    });
  }
});

// Get project implementation plans
router.get('/projects/:projectId/plans', (req, res) => {
  try {
    const { projectId } = req.params;
    const plans = developmentService.getProjectPlans(projectId);
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project plans'
    });
  }
});

// Get project requirements
router.get('/projects/:projectId/requirements', (req, res) => {
  try {
    const { projectId } = req.params;
    const requirements = developmentService.getProjectRequirements(projectId);
    
    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project requirements'
    });
  }
});

// Get modernization tasks
router.get('/projects/:projectId/modernization', (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = developmentService.getModernizationTasks(projectId);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modernization tasks'
    });
  }
});

// Health check for development phases service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Development Phases Service is operational',
    timestamp: new Date().toISOString(),
    phases: ['greenfield', 'creative-exploration', 'brownfield'],
    experimentalGoals: ['technology-independence', 'enterprise-constraints', 'user-centric-development', 'creative-iterative-processes']
  });
});

export default router;