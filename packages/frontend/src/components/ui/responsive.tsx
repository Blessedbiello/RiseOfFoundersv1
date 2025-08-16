'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Breakpoint configuration
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

type Breakpoint = keyof typeof breakpoints;

// Responsive Context
interface ResponsiveContextType {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  width: 0,
  height: 0,
  breakpoint: 'sm',
  isMobile: false,
  isTablet: false,
  isDesktop: false
});

// Hook to use responsive context
export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

// Hook for media queries
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Responsive Provider Component
interface ResponsiveProviderProps {
  children: ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getCurrentBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const breakpoint = getCurrentBreakpoint(dimensions.width);
  const isMobile = dimensions.width < breakpoints.md;
  const isTablet = dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg;
  const isDesktop = dimensions.width >= breakpoints.lg;

  return (
    <ResponsiveContext.Provider
      value={{
        width: dimensions.width,
        height: dimensions.height,
        breakpoint,
        isMobile,
        isTablet,
        isDesktop
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
};

// Responsive Visibility Components
interface ResponsiveVisibilityProps {
  children: ReactNode;
  className?: string;
}

export const ShowOnMobile: React.FC<ResponsiveVisibilityProps> = ({ children, className }) => (
  <div className={cn('block md:hidden', className)}>
    {children}
  </div>
);

export const ShowOnTablet: React.FC<ResponsiveVisibilityProps> = ({ children, className }) => (
  <div className={cn('hidden md:block lg:hidden', className)}>
    {children}
  </div>
);

export const ShowOnDesktop: React.FC<ResponsiveVisibilityProps> = ({ children, className }) => (
  <div className={cn('hidden lg:block', className)}>
    {children}
  </div>
);

export const HideOnMobile: React.FC<ResponsiveVisibilityProps> = ({ children, className }) => (
  <div className={cn('hidden md:block', className)}>
    {children}
  </div>
);

export const HideOnTablet: React.FC<ResponsiveVisibilityProps> = ({ children, className }) => (
  <div className={cn('block md:hidden lg:block', className)}>
    {children}
  </div>
);

export const HideOnDesktop: React.FC<ResponsiveVisibilityProps> = ({ children, className }) => (
  <div className={cn('block lg:hidden', className)}>
    {children}
  </div>
);

// Responsive Grid Component
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4
}) => {
  const gridClasses = [
    `grid`,
    `gap-${gap}`,
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};

// Responsive Container Component
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'lg',
  padding = { xs: 4, sm: 6, md: 8, lg: 12 }
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = [
    padding.xs && `px-${padding.xs}`,
    padding.sm && `sm:px-${padding.sm}`,
    padding.md && `md:px-${padding.md}`,
    padding.lg && `lg:px-${padding.lg}`,
    padding.xl && `xl:px-${padding.xl}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn('mx-auto', maxWidthClasses[maxWidth], paddingClasses, className)}>
      {children}
    </div>
  );
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: {
    xs?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    xl?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  };
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { xs: 'base', md: 'lg', lg: 'xl' }
}) => {
  const sizeClasses = [
    size.xs && `text-${size.xs}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
    size.xl && `xl:text-${size.xl}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(sizeClasses, className)}>
      {children}
    </div>
  );
};

// Responsive Image Component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
  sizes?: string;
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'video',
  sizes = '(min-width: 768px) 50vw, 100vw',
  priority = false
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      <img
        src={src}
        alt={alt}
        className="object-cover w-full h-full"
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizes}
      />
    </div>
  );
};

// Responsive Navigation Component
interface ResponsiveNavProps {
  children: ReactNode;
  mobileChildren?: ReactNode;
  className?: string;
}

export const ResponsiveNav: React.FC<ResponsiveNavProps> = ({
  children,
  mobileChildren,
  className
}) => (
  <nav className={cn('w-full', className)}>
    <ShowOnDesktop>
      {children}
    </ShowOnDesktop>
    <HideOnDesktop>
      {mobileChildren || children}
    </HideOnDesktop>
  </nav>
);

// Responsive Sidebar Component
interface ResponsiveSidebarProps {
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  className,
  isOpen = false,
  onClose
}) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}
        {/* Mobile Sidebar */}
        <div
          className={cn(
            'fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50',
            isOpen ? 'translate-x-0' : '-translate-x-full',
            className
          )}
        >
          {children}
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className={cn('w-80 flex-shrink-0', className)}>
      {children}
    </div>
  );
};

// Responsive Card Grid Component
interface ResponsiveCardGridProps {
  children: ReactNode;
  className?: string;
  minCardWidth?: number;
  gap?: number;
}

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  className,
  minCardWidth = 300,
  gap = 6
}) => {
  return (
    <div
      className={cn(`grid gap-${gap}`, className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

// Breakpoint-specific Component Renderer
interface BreakpointComponentProps {
  xs?: ReactNode;
  sm?: ReactNode;
  md?: ReactNode;
  lg?: ReactNode;
  xl?: ReactNode;
  '2xl'?: ReactNode;
  fallback?: ReactNode;
}

export const BreakpointComponent: React.FC<BreakpointComponentProps> = ({
  xs,
  sm,
  md,
  lg,
  xl,
  '2xl': xl2,
  fallback
}) => {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case '2xl':
      return <>{xl2 || xl || lg || md || sm || xs || fallback}</>;
    case 'xl':
      return <>{xl || lg || md || sm || xs || fallback}</>;
    case 'lg':
      return <>{lg || md || sm || xs || fallback}</>;
    case 'md':
      return <>{md || sm || xs || fallback}</>;
    case 'sm':
      return <>{sm || xs || fallback}</>;
    case 'xs':
    default:
      return <>{xs || fallback}</>;
  }
};