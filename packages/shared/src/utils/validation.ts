export const isValidWalletAddress = (address: string): boolean => {
  try {
    // Basic Solana address validation (base58, 32-44 chars)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidGitHubUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'github.com';
  } catch {
    return false;
  }
};

export const isValidSolanaTransaction = (signature: string): boolean => {
  // Solana transaction signatures are base58 encoded and 87-88 characters long
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
  return base58Regex.test(signature);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateTeamName = (name: string): { isValid: boolean; error?: string } => {
  if (name.length < 3) {
    return { isValid: false, error: 'Team name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Team name must be less than 50 characters' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { isValid: false, error: 'Team name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { isValid: true };
};

export const validateDisplayName = (name: string): { isValid: boolean; error?: string } => {
  if (name.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }
  if (name.length > 30) {
    return { isValid: false, error: 'Display name must be less than 30 characters' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { isValid: false, error: 'Display name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validateEquitySplit = (splits: { userId: string; percentage: number }[]): { isValid: boolean; error?: string } => {
  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return { isValid: false, error: 'Equity splits must total 100%' };
  }
  
  for (const split of splits) {
    if (split.percentage <= 0 || split.percentage > 100) {
      return { isValid: false, error: 'Each equity split must be between 0% and 100%' };
    }
  }
  
  return { isValid: true };
};

export const validateMissionArtifact = (type: string, value: string): { isValid: boolean; error?: string } => {
  switch (type) {
    case 'github_pr':
    case 'github_repo':
      if (!isValidGitHubUrl(value)) {
        return { isValid: false, error: 'Invalid GitHub URL' };
      }
      break;
    case 'solana_tx':
      if (!isValidSolanaTransaction(value)) {
        return { isValid: false, error: 'Invalid Solana transaction signature' };
      }
      break;
    case 'url':
      if (!isValidUrl(value)) {
        return { isValid: false, error: 'Invalid URL' };
      }
      break;
    case 'text':
      if (value.trim().length < 10) {
        return { isValid: false, error: 'Text must be at least 10 characters' };
      }
      break;
    default:
      return { isValid: false, error: 'Unknown artifact type' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

export const validateFileUpload = (file: File, maxSizeMB: number = 10, allowedTypes: string[] = []): { isValid: boolean; error?: string } => {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
};