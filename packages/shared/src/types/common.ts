export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export type Status = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export type Difficulty = 'bronze' | 'silver' | 'gold' | 'boss';

export type NodeType = 'quiz' | 'code' | 'deploy' | 'content' | 'social' | 'boss' | 'sponsored';

export type SubmissionStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'needs_revision';

export type UserRole = 'player' | 'mentor' | 'moderator' | 'admin' | 'sponsor';

export type TeamRole = 'founder' | 'co_founder' | 'developer' | 'designer' | 'marketer' | 'advisor';

export interface Metadata {
  [key: string]: any;
}

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}