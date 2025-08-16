'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { honeycombApi } from '../../services/honeycomb';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { User, Github, Wallet, Camera, ArrowRight, Crown, Sword } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface Kingdom {
  id: string;
  name: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  boss: string;
  challenge: string;
}

const kingdoms: Kingdom[] = [
  {
    id: 'silicon-valley',
    name: 'Silicon Valley',
    title: 'The Code Citadel',
    description: 'Where algorithms become empires. Master the art of scalable technology.',
    color: 'from-blue-600 to-cyan-600',
    icon: '💻',
    boss: 'The Ghost of Jobs Past',
    challenge: 'Build an MVP that changes everything'
  },
  {
    id: 'crypto-valley',
    name: 'Crypto Valley', 
    title: 'The Decentralized Frontier',
    description: 'Where code is law. Master blockchain and prove decentralization is freedom.',
    color: 'from-purple-600 to-pink-600',
    icon: '⛓️',
    boss: 'The Gas Fee Dragon',
    challenge: 'Create protocols that serve the people'
  },
  {
    id: 'business-strategy',
    name: 'Business Strategy',
    title: 'The Boardroom Colosseum', 
    description: 'Where vision meets execution. Navigate politics without losing your soul.',
    color: 'from-green-600 to-emerald-600',
    icon: '📈',
    boss: 'The VC Overlord',
    challenge: 'Raise capital without selling your vision'
  },
  {
    id: 'product-olympus',
    name: 'Product Olympus',
    title: 'The User Paradise',
    description: 'Where creators craft experiences that change lives. Build intuitive perfection.',
    color: 'from-orange-600 to-red-600', 
    icon: '🎨',
    boss: 'The Scale Demon',
    challenge: 'Create products users can\'t live without'
  },
  {
    id: 'marketing-multiverse',
    name: 'Marketing Multiverse',
    title: 'The Attention Wars',
    description: 'Where stories become movements. Turn customers into crusaders.',
    color: 'from-yellow-600 to-orange-600',
    icon: '🚀',
    boss: 'The Algorithm Alchemist', 
    challenge: 'Cut through noise with authentic storytelling'
  }
];

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profilePicture: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupProps {
  onComplete: () => void;
  isRequired?: boolean;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  onComplete,
  isRequired = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKingdom, setSelectedKingdom] = useState<Kingdom | null>(null);
  const { user, updateProfile, linkGitHubAccount } = useAuth();
  
  const [step, setStep] = useState<'profile' | 'kingdom' | 'honeycomb'>(() => {
    // Persist step state in sessionStorage to survive re-renders
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem('profileSetupStep');
      return (savedStep as 'profile' | 'kingdom' | 'honeycomb') || 'profile';
    }
    return 'profile';
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: '',
      profilePicture: user?.profilePicture || '',
    },
  });

  const profilePictureUrl = watch('profilePicture');

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    
    try {
      // Map form data to backend format
      const profileData = {
        name: data.name, // This maps to displayName in the backend
        bio: data.bio,
        profilePicture: data.profilePicture,
      };
      
      console.log('Submitting profile data:', profileData);
      console.log('Current step before update:', step);
      
      const success = await updateProfile(profileData);
      console.log('Profile update result:', success);
      
      if (success) {
        console.log('Success! Moving to kingdom step');
        console.log('Setting step to kingdom...');
        setStep('kingdom');
        // Persist step change to sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('profileSetupStep', 'kingdom');
        }
        console.log('Step set, current step should now be kingdom');
        toast.success('Profile updated successfully!');
      } else {
        console.log('Profile update failed - success was:', success);
        toast.error('Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update error: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKingdomSelect = async (kingdom: Kingdom) => {
    setSelectedKingdom(kingdom);
    setIsSubmitting(true);
    
    try {
      // Update profile with selected kingdom
      const success = await updateProfile({ selectedKingdom: kingdom.id });
      
      if (success) {
        setStep('honeycomb');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('profileSetupStep', 'honeycomb');
        }
        toast.success(`Welcome to ${kingdom.name}! Your journey begins...`);
      } else {
        toast.error('Failed to save kingdom selection');
      }
    } catch (error) {
      console.error('Kingdom selection error:', error);
      toast.error('Failed to save kingdom selection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHoneycombSetup = async () => {
    console.log('Honeycomb setup - user:', user);
    console.log('Honeycomb setup - user.walletAddress:', user?.walletAddress);
    
    if (!user) {
      toast.error('User not available');
      return;
    }
    
    if (!user.walletAddress) {
      toast.error('Wallet address not found in user profile');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create Honeycomb profile with user's updated information
      await honeycombApi.createProfile({
        name: user.name || user.displayName || 'Anonymous Founder',
        bio: user.bio || '',
        profilePicture: user.profilePicture || user.avatarUrl || '',
        walletAddress: user.walletAddress,
      });
      
      // Clear the saved step since we're completing the flow
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('profileSetupStep');
      }
      
      toast.success('Honeycomb profile created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Honeycomb setup error:', error);
      toast.error(error?.response?.data?.message || 'Failed to create Honeycomb profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGitHubLink = async () => {
    console.log('GitHub link - user:', user);
    
    setIsSubmitting(true);
    
    try {
      const success = await linkGitHubAccount();
      if (success) {
        toast.success('GitHub account linked successfully!');
      }
    } catch (error) {
      console.error('GitHub link error:', error);
      toast.error('Failed to link GitHub account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="text-gray-600 mt-2">
          Tell us about yourself to get started on your founder journey
        </p>
      </div>

      <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter your full name"
              className={cn(errors.name && 'border-red-500')}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell us about your background, interests, or what you're building..."
              rows={4}
              className={cn(errors.bio && 'border-red-500')}
            />
            {errors.bio && (
              <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="profilePicture">Profile Picture URL</Label>
            <div className="flex gap-3">
              <Input
                id="profilePicture"
                {...register('profilePicture')}
                placeholder="https://example.com/your-photo.jpg"
                className={cn(errors.profilePicture && 'border-red-500')}
              />
              {profilePictureUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={profilePictureUrl}
                    alt="Profile preview"
                    className="w-10 h-10 rounded-full object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            {errors.profilePicture && (
              <p className="text-sm text-red-600 mt-1">{errors.profilePicture.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {!isRequired && (
            <Button
              type="button"
              variant="outline"
              onClick={onComplete}
              className="flex-1"
            >
              Skip for now
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderKingdomStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Crown className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Kingdom</h2>
        <p className="text-gray-600 mt-2">
          Select the realm where you wish to begin your founder journey
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="text-center mb-4">
          <Sword className="w-8 h-8 mx-auto text-purple-600 mb-2" />
          <h3 className="font-bold text-purple-900">The Prophecy Awaits</h3>
          <p className="text-sm text-purple-800">
            Each kingdom offers unique challenges and rewards. Choose wisely, for your path will shape your destiny.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {kingdoms.map((kingdom) => (
          <button
            key={kingdom.id}
            onClick={() => handleKingdomSelect(kingdom)}
            disabled={isSubmitting}
            className={cn(
              "text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105",
              "bg-gradient-to-r border-gray-200 hover:border-purple-400",
              selectedKingdom?.id === kingdom.id && "border-purple-500 bg-purple-50",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${kingdom.color} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                {kingdom.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg">{kingdom.name}</h3>
                <p className="text-sm text-purple-600 font-medium mb-2">{kingdom.title}</p>
                <p className="text-sm text-gray-600 mb-3">{kingdom.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="text-red-600 font-medium">
                    👹 Boss: {kingdom.boss}
                  </div>
                  <div className="text-green-600 font-medium">
                    ⚡ Challenge: {kingdom.challenge}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => {
            setStep('profile');
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('profileSetupStep', 'profile');
            }
          }}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={() => handleKingdomSelect(kingdoms[0])}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 border-yellow-400 text-yellow-600 hover:bg-yellow-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
              Choosing...
            </div>
          ) : (
            "👑 Conquer All Kingdoms"
          )}
        </Button>
      </div>
    </div>
  );

  const renderHoneycombStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🍯</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Setup Honeycomb Profile</h2>
        <p className="text-gray-600 mt-2">
          Create your on-chain gaming profile to track achievements and earn rewards
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">✅ Honeycomb Profile Ready!</h3>
        <p className="text-sm text-green-800 mb-2">
          Your blockchain profile was created when you connected your wallet.
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• On-chain achievement tracking</li>
          <li>• Cross-platform progress portability</li>
          <li>• Exclusive rewards and badges</li>
          <li>• Verifiable skill progression</li>
        </ul>
      </div>

      {!user?.githubUsername && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Github className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Connect GitHub (Optional)</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Link your GitHub account to verify code-related achievements
          </p>
          <Button
            onClick={handleGitHubLink}
            variant="outline"
            size="sm"
            disabled={isSubmitting}
          >
            <Github className="w-4 h-4 mr-2" />
            Connect GitHub
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => {
            setStep('kingdom');
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('profileSetupStep', 'kingdom');
            }
          }}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            // Clear the saved step since we're completing the flow
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('profileSetupStep');
            }
            toast.success('Profile setup completed!');
            onComplete();
          }}
          disabled={isSubmitting}
          className="flex-1"
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );

  console.log('ProfileSetup render - current step:', step);
  
  return (
    <div className="max-w-md mx-auto">
      {step === 'profile' && renderProfileStep()}
      {step === 'kingdom' && renderKingdomStep()}
      {step === 'honeycomb' && renderHoneycombStep()}
    </div>
  );
};