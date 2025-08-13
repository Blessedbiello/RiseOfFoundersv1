export const THEME_COLORS = {
  // Primary brand colors
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Accent colors
  ACCENT: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Success/completion color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning/caution colors
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error/danger colors
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral grays
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const DIFFICULTY_COLORS = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  boss: '#8b0000',
} as const;

export const SKILL_COLORS = {
  technical: '#3b82f6',
  business: '#10b981',
  marketing: '#f59e0b',
  community: '#8b5cf6',
  design: '#ec4899',
  product: '#06b6d4',
} as const;

export const STATUS_COLORS = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
  failed: '#ef4444',
  cancelled: '#6b7280',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

export const ANIMATION_EASINGS = {
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  '2XL': '3rem',
  '3XL': '4rem',
  '4XL': '6rem',
} as const;

export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: '0.75rem',
    SM: '0.875rem',
    BASE: '1rem',
    LG: '1.125rem',
    XL: '1.25rem',
    '2XL': '1.5rem',
    '3XL': '1.875rem',
    '4XL': '2.25rem',
    '5XL': '3rem',
    '6XL': '3.75rem',
  },
  FONT_WEIGHTS: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
  },
  LINE_HEIGHTS: {
    TIGHT: 1.25,
    SNUG: 1.375,
    NORMAL: 1.5,
    RELAXED: 1.625,
    LOOSE: 2,
  },
} as const;

export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',
  MD: '0.375rem',
  LG: '0.5rem',
  XL: '0.75rem',
  '2XL': '1rem',
  '3XL': '1.5rem',
  FULL: '9999px',
} as const;

export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2XL': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

export const GAME_UI_CONSTANTS = {
  MAP_ZOOM_LEVELS: {
    MIN: 0.5,
    MAX: 3,
    DEFAULT: 1,
    STEP: 0.1,
  },
  
  NODE_SIZES: {
    SMALL: 40,
    MEDIUM: 60,
    LARGE: 80,
    BOSS: 100,
  },
  
  NOTIFICATION_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    INFO: 4000,
    WARNING: 4000,
  },
  
  LOADING_STATES: {
    SKELETON_ANIMATION: 'pulse',
    SPINNER_SIZE: 24,
    PROGRESS_HEIGHT: 8,
  },
} as const;