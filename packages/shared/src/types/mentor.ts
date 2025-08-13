import { Timestamps, Metadata } from './common';

export interface Mentor extends Timestamps {
  id: string;
  userId: string; // Reference to User
  
  // Professional info
  title: string;
  company?: string;
  bio: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  
  // Expertise
  specialties: MentorSpecialty[];
  skillAreas: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'expert';
  yearsOfExperience: number;
  
  // Availability
  isAvailable: boolean;
  availableSlots: AvailabilitySlot[];
  timezone: string;
  
  // Pricing
  hourlyRate: number;
  currency: 'USD' | 'USDC' | 'SOL';
  acceptsMentorTokens: boolean;
  mentorTokenRate?: number; // Tokens per hour
  
  // Ratings & Reviews
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
  responseTime: number; // Average in hours
  
  // Settings
  maxSessionsPerWeek: number;
  sessionDuration: number[]; // Available durations in minutes
  advanceBookingDays: number;
  
  // Verification
  isVerified: boolean;
  verificationBadges: string[];
  
  metadata: Metadata;
}

export interface MentorSpecialty {
  category: 'technical' | 'business' | 'product' | 'marketing' | 'fundraising' | 'legal';
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isRecurring: boolean;
  specificDate?: Date; // For one-time slots
}

export interface MentorSession extends Timestamps {
  id: string;
  mentorId: string;
  menteeId: string;
  menteeType: 'user' | 'team';
  
  // Session details
  title: string;
  description: string;
  category: string;
  duration: number; // minutes
  scheduledAt: Date;
  
  // Status
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  
  // Communication
  meetingUrl?: string;
  meetingPlatform: 'zoom' | 'google_meet' | 'discord' | 'other';
  
  // Payment
  cost: number;
  paymentMethod: 'tokens' | 'crypto' | 'fiat';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentTx?: string;
  
  // Content
  agenda: string[];
  notes?: string;
  resources: SessionResource[];
  actionItems: ActionItem[];
  
  // Follow-up
  followUpScheduled?: Date;
  followUpNotes?: string;
  
  metadata: Metadata;
}

export interface SessionResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'tool' | 'template' | 'other';
  description?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: 'mentor' | 'mentee';
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface SessionBooking extends Timestamps {
  id: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  
  // Booking details
  requestedAt: Date;
  preferredDates: Date[];
  message: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'declined' | 'expired';
  response?: string;
  respondedAt?: Date;
  
  // Rescheduling
  rescheduleCount: number;
  originalDate?: Date;
  
  metadata: Metadata;
}

export interface MentorReview extends Timestamps {
  id: string;
  sessionId: string;
  mentorId: string;
  reviewerId: string;
  
  // Ratings (1-5 scale)
  overallRating: number;
  communicationRating: number;
  knowledgeRating: number;
  helpfulnessRating: number;
  professionalism: number;
  
  // Feedback
  review: string;
  highlights: string[];
  improvements: string[];
  wouldRecommend: boolean;
  
  // Session evaluation
  sessionGoalsMet: boolean;
  valueReceived: 'exceeded' | 'met' | 'below_expectations';
  
  // Visibility
  isPublic: boolean;
  isVerified: boolean;
  
  metadata: Metadata;
}

export interface MentorApplication extends Timestamps {
  id: string;
  userId: string;
  
  // Application data
  motivation: string;
  experience: string;
  expertise: string[];
  achievements: string[];
  
  // Verification documents
  resume?: string; // File URL
  portfolio?: string; // URL
  references: Reference[];
  
  // Status
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_revision';
  reviewerId?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  
  // Interview
  interviewScheduled?: Date;
  interviewCompleted?: boolean;
  interviewNotes?: string;
  
  metadata: Metadata;
}

export interface Reference {
  name: string;
  email: string;
  relationship: string;
  company?: string;
  contacted: boolean;
  response?: string;
  rating?: number;
}

export interface MentorToken extends Timestamps {
  id: string;
  userId: string;
  
  // Token details
  balance: number;
  totalEarned: number;
  totalSpent: number;
  
  // Earning history
  earnings: TokenTransaction[];
  
  // Spending history
  spendings: TokenTransaction[];
  
  metadata: Metadata;
}

export interface TokenTransaction extends Timestamps {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  amount: number;
  
  // Source/Destination
  source: 'mission_completion' | 'sponsor_reward' | 'referral' | 'admin_grant' | 'mentor_session';
  sourceId?: string; // ID of related entity
  
  // Details
  description: string;
  
  metadata: Metadata;
}

export interface MentorshipProgram extends Timestamps {
  id: string;
  name: string;
  description: string;
  
  // Program structure
  duration: number; // weeks
  sessionCount: number;
  sessionDuration: number; // minutes
  
  // Curriculum
  modules: ProgramModule[];
  learningObjectives: string[];
  
  // Eligibility
  targetAudience: string;
  prerequisites: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Costs
  totalCost: number;
  paymentPlan: PaymentPlan[];
  
  // Mentors
  leadMentorId: string;
  assistantMentors: string[];
  maxParticipants: number;
  
  // Schedule
  startDate: Date;
  endDate: Date;
  enrollmentDeadline: Date;
  
  // Status
  isActive: boolean;
  currentParticipants: number;
  
  metadata: Metadata;
}

export interface ProgramModule {
  id: string;
  name: string;
  description: string;
  week: number;
  objectives: string[];
  deliverables: string[];
  resources: SessionResource[];
}

export interface PaymentPlan {
  installment: number;
  amount: number;
  dueDate: Date;
  description: string;
}

export interface ProgramEnrollment extends Timestamps {
  id: string;
  programId: string;
  participantId: string;
  
  // Enrollment
  enrolledAt: Date;
  status: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
  
  // Progress
  completedModules: string[];
  currentModule?: string;
  overallProgress: number; // percentage
  
  // Performance
  attendance: number; // percentage
  assignments: AssignmentSubmission[];
  finalGrade?: string;
  
  // Payment
  paymentStatus: 'pending' | 'partial' | 'complete' | 'overdue';
  paidInstallments: number;
  
  metadata: Metadata;
}

export interface AssignmentSubmission {
  moduleId: string;
  submittedAt: Date;
  grade?: string;
  feedback?: string;
  artifacts: string[]; // URLs to submitted work
}