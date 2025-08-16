'use client';

import { useState, useCallback } from 'react';
import { TeamFormData } from './TeamCreation';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { 
  FileText, 
  Wand2, 
  Download, 
  CheckCircle, 
  Loader2,
  AlertTriangle,
  Edit3,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamAgreementGeneratorProps {
  formData: TeamFormData;
  onAgreementGenerated: (agreement: string) => void;
  generatedAgreement: string;
}

export const TeamAgreementGenerator: React.FC<TeamAgreementGeneratorProps> = ({
  formData,
  onAgreementGenerated,
  generatedAgreement
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAgreement, setEditedAgreement] = useState('');
  const [previewMode, setPreviewMode] = useState<'raw' | 'formatted'>('formatted');

  // Generate AI-powered legal agreement
  const generateAgreement = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation with realistic legal content
      // In production, this would call an AI service like OpenAI
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const agreement = generateLegalAgreementTemplate(formData);
      onAgreementGenerated(agreement);
      toast.success('Legal agreement generated successfully!');
    } catch (error) {
      toast.error('Failed to generate agreement');
    } finally {
      setIsGenerating(false);
    }
  }, [formData, onAgreementGenerated]);

  const handleEditSave = useCallback(() => {
    onAgreementGenerated(editedAgreement);
    setIsEditing(false);
    toast.success('Agreement updated successfully!');
  }, [editedAgreement, onAgreementGenerated]);

  const handleEditCancel = useCallback(() => {
    setEditedAgreement('');
    setIsEditing(false);
  }, []);

  const downloadAgreement = useCallback(() => {
    const blob = new Blob([generatedAgreement], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name.replace(/\s+/g, '_')}_Founding_Agreement.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Agreement downloaded!');
  }, [generatedAgreement, formData.name]);

  const formatAgreementForDisplay = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('# ')) {
        return (
          <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3 first:mt-0">
            {paragraph.replace('# ', '')}
          </h2>
        );
      } else if (paragraph.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-blue-400 mt-4 mb-2">
            {paragraph.replace('## ', '')}
          </h3>
        );
      } else if (paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={index} className="list-disc list-inside space-y-1 text-gray-300 mb-4">
            {items.map((item, i) => (
              <li key={i}>{item.replace('- ', '')}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={index} className="text-gray-300 mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      }
    });
  };

  if (!generatedAgreement && !isGenerating) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <FileText className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white">AI Legal Agreement</h2>
          <p className="text-gray-400 mt-2">Generate a customized founding agreement</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Wand2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">AI-Powered Legal Framework</h3>
              <p className="text-gray-300 text-sm mb-4">
                Our AI will generate a comprehensive founding agreement based on your team structure, 
                including equity distribution, decision-making processes, vesting schedules, and governance rules.
              </p>
              
              <div className="text-sm text-gray-400 space-y-1">
                <div>• Equity allocation: <span className="text-white capitalize">{formData.equityDistribution.replace('_', ' ')}</span></div>
                <div>• Team size: <span className="text-white">{formData.size} members</span></div>
                <div>• Decision making: <span className="text-white capitalize">{formData.decisionMaking.replace('_', ' ')}</span></div>
                <div>• Vesting period: <span className="text-white capitalize">{formData.vestingPeriod.replace('_', ' ')}</span></div>
                <div>• Commitment: <span className="text-white capitalize">{formData.commitmentLevel.replace('_', ' ')}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Important Legal Notice</span>
          </div>
          <p className="text-sm text-gray-300">
            This AI-generated agreement is for educational purposes and initial planning. 
            Always consult with qualified legal counsel before executing any legal documents.
          </p>
        </div>

        <Button
          onClick={generateAgreement}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isGenerating}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Generate AI Agreement
        </Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <Loader2 className="w-12 h-12 animate-spin text-green-500" />
            <FileText className="w-6 h-6 absolute top-3 left-3 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Generating Agreement</h2>
          <p className="text-gray-400 mt-2">AI is crafting your custom legal framework...</p>
        </div>

        <div className="space-y-3">
          {[
            'Analyzing team structure and requirements...',
            'Generating equity distribution clauses...',
            'Creating governance and decision-making rules...',
            'Drafting vesting and commitment terms...',
            'Finalizing legal language and formatting...'
          ].map((step, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Founding Agreement Generated
          </h2>
          <p className="text-gray-400 mt-1">Review and customize your legal framework</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(previewMode === 'raw' ? 'formatted' : 'raw')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode === 'raw' ? 'Formatted' : 'Raw'} View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditedAgreement(generatedAgreement);
              setIsEditing(true);
            }}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadAgreement}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedAgreement}
            onChange={(e) => setEditedAgreement(e.target.value)}
            rows={20}
            className="font-mono text-sm"
            placeholder="Edit your agreement..."
          />
          
          <div className="flex gap-2">
            <Button onClick={handleEditSave} className="bg-green-600 hover:bg-green-700">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-6 max-h-96 overflow-y-auto border">
          {previewMode === 'formatted' ? (
            <div className="space-y-4">
              {formatAgreementForDisplay(generatedAgreement)}
            </div>
          ) : (
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {generatedAgreement}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

// AI Agreement Template Generator
function generateLegalAgreementTemplate(formData: TeamFormData): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `# ${formData.name} - Founding Team Agreement

**Date:** ${currentDate}
**Team Name:** ${formData.name}
**Primary Focus:** ${formData.focus.charAt(0).toUpperCase() + formData.focus.slice(1)}

## 1. Team Vision and Mission

**Vision Statement:**
${formData.vision}

**Description:**
${formData.description}

## 2. Team Structure and Roles

**Team Size:** ${formData.size} founding members
**Commitment Level:** ${formData.commitmentLevel.replace('_', ' ').toUpperCase()}
**Primary Focus Area:** ${formData.focus.charAt(0).toUpperCase() + formData.focus.slice(1)}

Each founding member commits to dedicating the agreed-upon time and effort toward achieving the team's vision and objectives.

## 3. Equity Distribution

**Distribution Method:** ${formData.equityDistribution.replace('_', ' ').toUpperCase()}

${formData.equityDistribution === 'equal' 
  ? `All founding members will receive equal equity stakes in the venture, with each member receiving ${Math.floor(100 / formData.size)}% of the founding equity pool.`
  : formData.equityDistribution === 'merit'
  ? 'Equity will be distributed based on individual contributions, skills, and responsibilities as determined by team consensus.'
  : formData.equityDistribution === 'investment'
  ? 'Equity distribution will reflect initial financial contributions and ongoing investment commitments.'
  : 'Equity distribution will be determined through custom arrangements as agreed upon by all founding members.'
}

## 4. Vesting Schedule

**Vesting Period:** ${formData.vestingPeriod.replace('_', ' ').toUpperCase()}

${formData.vestingPeriod === '4_years'
  ? 'Standard 4-year vesting schedule with 1-year cliff. 25% of equity vests after the first year, with monthly vesting thereafter.'
  : formData.vestingPeriod === '2_years'
  ? '2-year vesting schedule with 6-month cliff. 25% of equity vests after 6 months, with quarterly vesting thereafter.'
  : formData.vestingPeriod === '1_year'
  ? '1-year cliff vesting. All equity vests after one full year of contribution.'
  : 'Custom vesting terms to be determined by team agreement and legal counsel.'
}

## 5. Decision Making and Governance

**Governance Structure:** ${formData.decisionMaking.replace('_', ' ').toUpperCase()}

${formData.decisionMaking === 'democratic'
  ? 'Major decisions require majority vote from all founding members. Each founding member has equal voting power regardless of equity stake.'
  : formData.decisionMaking === 'founder_led'
  ? 'The founding leader maintains primary decision-making authority, with input and consultation from other team members.'
  : formData.decisionMaking === 'consensus'
  ? 'All major decisions require unanimous consent from all founding members. Consensus-building processes will be used to resolve disagreements.'
  : 'Decision-making authority is delegated based on areas of expertise and responsibility as agreed upon by the team.'
}

## 6. Responsibilities and Commitments

All founding members agree to:

- Maintain confidentiality regarding team business and proprietary information
- Act in the best interest of the team and venture at all times
- Contribute their skills, knowledge, and expertise toward team objectives
- Participate actively in team meetings and strategic planning sessions
- Respect intellectual property rights and contribute IP to the team venture

## 7. Intellectual Property

All intellectual property created by team members in the course of working on the venture shall be owned by the team entity. This includes:

- Software code and technical implementations
- Business plans and strategic documents
- Marketing materials and brand assets
- Research and development outcomes
- Any inventions or innovations related to the venture

## 8. Conflict Resolution

In the event of disagreements or conflicts:

1. First, attempt direct communication and resolution between involved parties
2. If unresolved, bring the matter to the full founding team for discussion
3. Consider mediation through a neutral third party if needed
4. As a last resort, follow dissolution procedures outlined in this agreement

## 9. Team Member Departure

If a founding member chooses to leave or is removed from the team:

- Unvested equity is forfeited according to the vesting schedule
- Vested equity may be subject to buyback provisions at fair market value
- Confidentiality and non-compete obligations continue post-departure
- Intellectual property remains with the team entity

## 10. Amendment and Modifications

This agreement may only be modified with written consent from all founding members. Any changes must be documented and signed by all parties.

## 11. Legal Compliance and Disclaimers

**IMPORTANT NOTICE:** This agreement is generated for educational and planning purposes. It does not constitute legal advice and should not be used as a substitute for professional legal counsel. Before executing any founding agreement:

- Consult with qualified legal professionals
- Ensure compliance with local business laws and regulations
- Consider state-specific requirements for business formation
- Review tax implications of equity arrangements
- Obtain proper legal documentation for business entity formation

---

**Generated by Rise of Founders AI Legal Assistant**
**Generation Date:** ${currentDate}
**Team Configuration:** ${formData.size} members, ${formData.focus} focus, ${formData.equityDistribution} equity

*This document serves as a starting point for founding team discussions and should be reviewed and modified with legal counsel before execution.*`;
}