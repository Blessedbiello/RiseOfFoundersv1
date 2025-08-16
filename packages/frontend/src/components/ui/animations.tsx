'use client';

import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

// Animation Variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const slideInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const slideInFromLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const slideInFromRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export const bounceInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100
    }
  }
};

export const rotateInVariants: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { opacity: 1, rotate: 0 }
};

export const flipInVariants: Variants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: { opacity: 1, rotateY: 0 }
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Transition Presets
export const easeTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1]
};

export const springTransition: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300
};

export const bounceTransition: Transition = {
  type: 'spring',
  damping: 10,
  stiffness: 100
};

export const slowTransition: Transition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1]
};

// Animation Components
interface AnimatedContainerProps {
  children: ReactNode;
  variants?: Variants;
  transition?: Transition;
  className?: string;
  delay?: number;
  viewport?: { once?: boolean; margin?: string };
}

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ children, variants = fadeInVariants, transition = easeTransition, className, delay = 0, viewport = { once: true } }, ref) => (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      transition={{ ...transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
);
AnimatedContainer.displayName = 'AnimatedContainer';

export const FadeIn: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={fadeInVariants} {...props} />
);

export const SlideIn: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={slideInVariants} {...props} />
);

export const SlideInFromLeft: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={slideInFromLeftVariants} {...props} />
);

export const SlideInFromRight: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={slideInFromRightVariants} {...props} />
);

export const ScaleIn: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={scaleInVariants} {...props} />
);

export const BounceIn: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={bounceInVariants} transition={bounceTransition} {...props} />
);

export const RotateIn: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={rotateInVariants} {...props} />
);

export const FlipIn: React.FC<AnimatedContainerProps> = (props) => (
  <AnimatedContainer variants={flipInVariants} {...props} />
);

// Stagger Animation Container
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  viewport?: { once?: boolean; margin?: string };
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  viewport = { once: true }
}) => (
  <motion.div
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    initial="hidden"
    whileInView="visible"
    viewport={viewport}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<AnimatedContainerProps> = (props) => (
  <motion.div
    variants={staggerItemVariants}
    transition={easeTransition}
    className={props.className}
  >
    {props.children}
  </motion.div>
);

// Interactive Animation Components
interface HoverAnimationProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  rotate?: number;
  y?: number;
}

export const HoverScale: React.FC<HoverAnimationProps> = ({
  children,
  className,
  scale = 1.05
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: scale * 0.95 }}
    transition={springTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export const HoverLift: React.FC<HoverAnimationProps> = ({
  children,
  className,
  y = -5
}) => (
  <motion.div
    whileHover={{ y }}
    transition={springTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export const HoverRotate: React.FC<HoverAnimationProps> = ({
  children,
  className,
  rotate = 5
}) => (
  <motion.div
    whileHover={{ rotate }}
    transition={springTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// Page Transition Wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={easeTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// Modal/Dialog Animation Wrapper
export const ModalTransition: React.FC<PageTransitionProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={springTransition}
    className={className}
  >
    {children}
  </motion.div>
);

// Progress Animation
interface ProgressBarProps {
  progress: number;
  className?: string;
  duration?: number;
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  duration = 1
}) => (
  <div className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
    <motion.div
      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration, ease: 'easeOut' }}
    />
  </div>
);

// Number Counter Animation
interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  from,
  to,
  duration = 1,
  className
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ textContent: from }}
        animate={{ textContent: to }}
        transition={{ duration, ease: 'easeOut' }}
        onUpdate={(latest) => {
          if (typeof latest.textContent === 'number') {
            return Math.round(latest.textContent);
          }
        }}
      />
    </motion.span>
  );
};

// Loading Spinner Components
export const LoadingSpinner: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export const PulseLoader: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    className={`w-6 h-6 bg-blue-500 rounded-full ${className}`}
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
  />
);

export const DotsLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: index * 0.2,
          ease: 'easeInOut'
        }}
      />
    ))}
  </div>
);

// Reveal Animation for Text
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className, delay = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ staggerChildren: 0.05, delayChildren: delay }}
  >
    {text.split('').map((char, index) => (
      <motion.span
        key={index}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        transition={{ duration: 0.3 }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </motion.div>
);

// Floating Action Button with Animation
interface FloatingButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  className,
  onClick
}) => (
  <motion.button
    className={`fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg ${className}`}
    whileHover={{ scale: 1.1, boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)' }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={springTransition}
    onClick={onClick}
  >
    {children}
  </motion.button>
);

// Card Stack Animation
interface CardStackProps {
  cards: ReactNode[];
  className?: string;
}

export const CardStack: React.FC<CardStackProps> = ({ cards, className }) => (
  <div className={`relative ${className}`}>
    {cards.map((card, index) => (
      <motion.div
        key={index}
        className="absolute inset-0"
        initial={{ scale: 1 - index * 0.05, y: index * 10 }}
        whileHover={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ zIndex: cards.length - index }}
      >
        {card}
      </motion.div>
    ))}
  </div>
);

// Export AnimatePresence for external use
export { AnimatePresence, motion };