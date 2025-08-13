import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatXP(xp: number): string {
  return formatNumber(xp) + ' XP';
}

export function formatWalletAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getSkillColor(skill: string): string {
  const colors: Record<string, string> = {
    technical: 'text-blue-500',
    business: 'text-green-500',
    marketing: 'text-yellow-500',
    community: 'text-purple-500',
    design: 'text-pink-500',
    product: 'text-cyan-500',
  };
  return colors[skill] || 'text-gray-500';
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    bronze: 'text-orange-500',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    boss: 'text-red-500',
  };
  return colors[difficulty.toLowerCase()] || 'text-gray-500';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-500',
    in_progress: 'text-blue-500',
    completed: 'text-green-500',
    failed: 'text-red-500',
    cancelled: 'text-gray-500',
  };
  return colors[status] || 'text-gray-500';
}

export function calculateProgress(current: number, max: number): number {
  return Math.min((current / max) * 100, 100);
}

export function calculateLevel(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  // Simple leveling formula: 100 XP for level 1, then exponential growth
  let level = 1;
  let totalXPForLevel = 0;
  let xpForNextLevel = 100;
  
  while (totalXPForLevel + xpForNextLevel <= xp) {
    totalXPForLevel += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1));
  }
  
  const currentLevelXP = xp - totalXPForLevel;
  const progress = (currentLevelXP / xpForNextLevel) * 100;
  
  return {
    level,
    currentLevelXP,
    nextLevelXP: xpForNextLevel,
    progress,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateAvatarUrl(seed: string): string {
  // Generate deterministic avatar URL based on seed (wallet address, etc.)
  return `https://avatars.dicebear.com/api/identicon/${seed}.svg`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.prepend(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    } finally {
      textArea.remove();
    }
  }
}

export function validateEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SOLANA_NETWORK',
    'NEXT_PUBLIC_HONEYCOMB_PROJECT_ID',
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
  }
  
  return missing.length === 0;
}

export function isClient() {
  return typeof window !== 'undefined';
}

export function isServer() {
  return typeof window === 'undefined';
}

export function getBaseUrl() {
  if (isServer()) {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  return '';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}