'use client';

import { useState, useCallback } from 'react';
import { MapNodeData } from '../game/GameMap';
import { useAuth } from '../../hooks/useAuth';
import { useMissions } from '../../hooks/useMissions';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Upload, 
  Github, 
  Globe, 
  Wallet,
  AlertTriangle,
  Clock,
  Target,
  Trophy
} from 'lucide-react';
import { ArtifactUpload } from './ArtifactUpload';
import { GitHubVerifier } from './GitHubVerifier';
import { SolanaVerifier } from './SolanaVerifier';
import { URLVerifier } from './URLVerifier';
import toast from 'react-hot-toast';

export interface MissionStep {
  id: string;
  title: string;
  description: string;
  type: 'instructions' | 'upload' | 'github' | 'solana' | 'url' | 'reflection';
  required: boolean;
  artifactType?: 'github_repo' | 'github_pr' | 'solana_tx' | 'url' | 'file' | 'text';
  instructions?: string;
  validationRules?: {
    github?: {
      requiresRepo?: boolean;
      requiresPR?: boolean;
      minCommits?: number;
    };
    solana?: {
      programId?: string;
      minAmount?: number;
      requiredMethods?: string[];
    };
    url?: {
      domains?: string[];
      requiresHttps?: boolean;
    };
  };
}

interface MissionWorkflowProps {
  mission: MapNodeData;
  onComplete: (artifacts: any[], reflection: string) => void;
  onCancel: () => void;
}

// Mission step definitions
const getMissionSteps = (missionId: string): MissionStep[] => {
  const stepLibrary: Record<string, MissionStep[]> = {
    'first-commit': [
      {
        id: 'setup',
        title: 'Setup Your Development Environment',
        description: 'Install Git and create a GitHub account if you haven\'t already.',
        type: 'instructions',
        required: true,
        instructions: `
**Prerequisites:**
1. Install Git on your computer
2. Create a GitHub account
3. Set up Git with your username and email

**Commands to run:**
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`
        `
      },
      {
        id: 'create-repo',
        title: 'Create Your Repository',
        description: 'Create a new repository on GitHub for your first project.',
        type: 'github',
        required: true,
        artifactType: 'github_repo',
        instructions: 'Create a new repository called "my-first-project" with a README file.',
        validationRules: {
          github: {
            requiresRepo: true,
            minCommits: 1
          }
        }
      },
      {
        id: 'first-commit',
        title: 'Make Your First Commit',
        description: 'Add a new file and make your first commit to the repository.',
        type: 'github',
        required: true,
        artifactType: 'github_repo',
        instructions: `
**Steps:**
1. Clone your repository locally
2. Create a new file (e.g., hello.txt)
3. Add some content to the file
4. Stage and commit your changes
5. Push to GitHub

**Commands:**
\`\`\`bash
git clone <your-repo-url>
cd my-first-project
echo "Hello, World!" > hello.txt
git add hello.txt
git commit -m "Add hello.txt file"
git push origin main
\`\`\`
        `,
        validationRules: {
          github: {
            requiresRepo: true,
            minCommits: 2
          }
        }
      },
      {
        id: 'reflection',
        title: 'Reflection',
        description: 'Share what you learned from this mission.',
        type: 'reflection',
        required: true,
        instructions: 'Write a brief reflection on what you learned about Git and version control.'
      }
    ],
    'idea-validation': [
      {
        id: 'problem-definition',
        title: 'Define the Problem',
        description: 'Clearly articulate the problem your startup idea solves.',
        type: 'instructions',
        required: true,
        instructions: `
**Define Your Problem:**
1. What specific problem does your idea solve?
2. Who experiences this problem?
3. How significant is this problem?
4. What are current solutions and their limitations?

Take time to write this down clearly before proceeding.
        `
      },
      {
        id: 'survey-creation',
        title: 'Create Validation Survey',
        description: 'Create a survey to validate your idea with potential customers.',
        type: 'url',
        required: true,
        artifactType: 'url',
        instructions: `
**Create a survey using Google Forms, Typeform, or similar:**
1. Create 5-10 questions about the problem and your solution
2. Include demographic questions
3. Ask about willingness to pay
4. Share the survey link here

**Sample Questions:**
- How often do you experience [problem]?
- How do you currently solve [problem]?
- Would you pay for a solution to [problem]?
        `,
        validationRules: {
          url: {
            domains: ['forms.google.com', 'typeform.com', 'surveymonkey.com'],
            requiresHttps: true
          }
        }
      },
      {
        id: 'interviews',
        title: 'Customer Interviews',
        description: 'Conduct interviews with potential customers.',
        type: 'upload',
        required: true,
        artifactType: 'file',
        instructions: `
**Conduct 5 Customer Interviews:**
1. Find 5 people who experience your problem
2. Interview them for 10-15 minutes each
3. Ask about their current solutions and pain points
4. Record key insights from each interview
5. Upload a summary document with your findings
        `
      },
      {
        id: 'analysis',
        title: 'Validation Analysis',
        description: 'Analyze your survey and interview results.',
        type: 'upload',
        required: true,
        artifactType: 'file',
        instructions: `
**Create an analysis document that includes:**
1. Survey response summary
2. Key insights from interviews
3. Market size estimation
4. Validation conclusion (proceed/pivot/stop)
5. Next steps based on findings

Upload your analysis as a PDF or document.
        `
      },
      {
        id: 'reflection',
        title: 'Reflection',
        description: 'Reflect on what you learned about idea validation.',
        type: 'reflection',
        required: true,
        instructions: 'What was the most surprising thing you learned during validation?'
      }
    ]
  };

  return stepLibrary[missionId] || [];
};

export const MissionWorkflow: React.FC<MissionWorkflowProps> = ({
  mission,
  onComplete,
  onCancel
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [artifacts, setArtifacts] = useState<Record<string, any>>({});
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { startMission, submitMission, isLoading: missionLoading } = useMissions();
  const steps = getMissionSteps(mission.id);
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const canProceed = completedSteps.has(currentStep.id) || !currentStep.required;

  const handleStepComplete = useCallback((stepId: string, artifactData?: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    
    if (artifactData) {
      setArtifacts(prev => ({
        ...prev,
        [stepId]: artifactData
      }));
    }

    toast.success('Step completed!');
  }, []);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSubmitMission = useCallback(async () => {
    if (!reflection.trim() && steps.some(step => step.type === 'reflection')) {
      toast.error('Please complete your reflection before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Collect all artifacts
      const allArtifacts = Object.values(artifacts);
      
      // Submit to backend and Honeycomb
      const result = await submitMission(mission.id, allArtifacts, reflection);
      
      if (result) {
        await onComplete(allArtifacts, reflection);
        toast.success('Mission completed successfully!');
      }
    } catch (error) {
      console.error('Mission submission error:', error);
      toast.error('Failed to submit mission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [artifacts, reflection, steps, mission.id, submitMission, onComplete]);

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'instructions':
        return (
          <div className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-300">
                {currentStep.instructions}
              </div>
            </div>
            
            <Button
              onClick={() => handleStepComplete(currentStep.id)}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        );

      case 'github':
        return (
          <GitHubVerifier
            step={currentStep}
            onVerified={(data) => handleStepComplete(currentStep.id, data)}
            isCompleted={completedSteps.has(currentStep.id)}
          />
        );

      case 'solana':
        return (
          <SolanaVerifier
            step={currentStep}
            onVerified={(data) => handleStepComplete(currentStep.id, data)}
            isCompleted={completedSteps.has(currentStep.id)}
          />
        );

      case 'url':
        return (
          <URLVerifier
            step={currentStep}
            onVerified={(data) => handleStepComplete(currentStep.id, data)}
            isCompleted={completedSteps.has(currentStep.id)}
          />
        );

      case 'upload':
        return (
          <ArtifactUpload
            step={currentStep}
            onUploaded={(data) => handleStepComplete(currentStep.id, data)}
            isCompleted={completedSteps.has(currentStep.id)}
          />
        );

      case 'reflection':
        return (
          <div className="space-y-4">
            <div className="text-gray-300">
              {currentStep.instructions}
            </div>
            
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Share your thoughts, learnings, and insights..."
              rows={6}
              className="w-full"
            />
            
            <Button
              onClick={() => {
                if (reflection.trim()) {
                  handleStepComplete(currentStep.id, { reflection });
                } else {
                  toast.error('Please write your reflection before proceeding.');
                }
              }}
              disabled={!reflection.trim()}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Reflection
            </Button>
          </div>
        );

      default:
        return <div className="text-gray-400">Step type not implemented</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{mission.name}</h1>
              <p className="text-gray-400">Complete all steps to earn rewards</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="text-gray-400">Progress</div>
                <div className="text-white font-medium">
                  {completedSteps.size} / {steps.length} Steps
                </div>
              </div>
              
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="text-2xl">
                  {Math.round((completedSteps.size / steps.length) * 100)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b border-white/10 bg-gray-800/30">
          <div className="flex items-center gap-4 overflow-x-auto">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                  index === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : completedSteps.has(step.id)
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                <div className="text-xs font-medium">{index + 1}</div>
                <span className="text-sm">{step.title}</span>
                {completedSteps.has(step.id) && (
                  <CheckCircle className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">{currentStep?.title}</h2>
                {currentStep?.required && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                    Required
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mb-4">{currentStep?.description}</p>
              
              {completedSteps.has(currentStep?.id || '') && (
                <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
                  <CheckCircle className="w-4 h-4" />
                  <span>Step completed</span>
                </div>
              )}
            </div>

            {renderStepContent()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-white/10 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onCancel}>
                Cancel Mission
              </Button>
              
              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitMission}
                  disabled={completedSteps.size < steps.filter(s => s.required).length || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Complete Mission
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};