import type { Config } from 'tailwindcss';
import { THEME_COLORS, BREAKPOINTS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '@rise-of-founders/shared';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: THEME_COLORS.PRIMARY,
        accent: THEME_COLORS.ACCENT,
        warning: THEME_COLORS.WARNING,
        error: THEME_COLORS.ERROR,
        gray: THEME_COLORS.GRAY,
        // Game-specific colors
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        gold: '#ffd700',
        boss: '#8b0000',
        // Skill colors
        technical: '#3b82f6',
        business: '#10b981',
        marketing: '#f59e0b',
        community: '#8b5cf6',
        design: '#ec4899',
        product: '#06b6d4',
      },
      screens: {
        sm: `${BREAKPOINTS.SM}px`,
        md: `${BREAKPOINTS.MD}px`,
        lg: `${BREAKPOINTS.LG}px`,
        xl: `${BREAKPOINTS.XL}px`,
        '2xl': `${BREAKPOINTS['2XL']}px`,
      },
      spacing: {
        xs: SPACING.XS,
        sm: SPACING.SM,
        md: SPACING.MD,
        lg: SPACING.LG,
        xl: SPACING.XL,
        '2xl': SPACING['2XL'],
        '3xl': SPACING['3XL'],
        '4xl': SPACING['4XL'],
      },
      fontSize: {
        xs: [TYPOGRAPHY.FONT_SIZES.XS, { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL }],
        sm: [TYPOGRAPHY.FONT_SIZES.SM, { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL }],
        base: [TYPOGRAPHY.FONT_SIZES.BASE, { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL }],
        lg: [TYPOGRAPHY.FONT_SIZES.LG, { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL }],
        xl: [TYPOGRAPHY.FONT_SIZES.XL, { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT }],
        '2xl': [TYPOGRAPHY.FONT_SIZES['2XL'], { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT }],
        '3xl': [TYPOGRAPHY.FONT_SIZES['3XL'], { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT }],
        '4xl': [TYPOGRAPHY.FONT_SIZES['4XL'], { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT }],
        '5xl': [TYPOGRAPHY.FONT_SIZES['5XL'], { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT }],
        '6xl': [TYPOGRAPHY.FONT_SIZES['6XL'], { lineHeight: TYPOGRAPHY.LINE_HEIGHTS.TIGHT }],
      },
      fontWeight: {
        light: TYPOGRAPHY.FONT_WEIGHTS.LIGHT.toString(),
        normal: TYPOGRAPHY.FONT_WEIGHTS.NORMAL.toString(),
        medium: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM.toString(),
        semibold: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD.toString(),
        bold: TYPOGRAPHY.FONT_WEIGHTS.BOLD.toString(),
        extrabold: TYPOGRAPHY.FONT_WEIGHTS.EXTRABOLD.toString(),
      },
      borderRadius: {
        none: BORDER_RADIUS.NONE,
        sm: BORDER_RADIUS.SM,
        md: BORDER_RADIUS.MD,
        lg: BORDER_RADIUS.LG,
        xl: BORDER_RADIUS.XL,
        '2xl': BORDER_RADIUS['2XL'],
        '3xl': BORDER_RADIUS['3XL'],
        full: BORDER_RADIUS.FULL,
      },
      boxShadow: {
        sm: SHADOWS.SM,
        md: SHADOWS.MD,
        lg: SHADOWS.LG,
        xl: SHADOWS.XL,
        '2xl': SHADOWS['2XL'],
        inner: SHADOWS.INNER,
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-subtle': 'bounce 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'neon-glow': 'linear-gradient(45deg, #ff006e, #8338ec, #3a86ff)',
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for game-specific utilities
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-glow': {
          textShadow: '0 0 10px currentColor',
        },
        '.text-glow-strong': {
          textShadow: '0 0 20px currentColor, 0 0 30px currentColor',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.neon-border': {
          border: '2px solid currentColor',
          boxShadow: '0 0 10px currentColor',
        },
        '.hover-lift': {
          transition: 'transform 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;