/**
 * Motion Design Utilities for Framer Motion
 *
 * Based on Motion Design principles:
 * - Every animation needs a job. If it has no job, don't animate.
 * - Enter/Exit → ease-out (fast start, calm landing)
 * - Layout/Morph → ease-in-out (natural acceleration/deceleration)
 * - Time/Progress → linear
 * - Hover/Focus → ease (subtle, elegant)
 * - Keyboard/High-frequency → no animation
 */

import type { Transition, Variants } from 'framer-motion'

// ============================================
// EASING CURVES (as arrays for Framer Motion)
// ============================================

export const easing = {
  // Ease-out family - Enter/Exit, User-Triggered
  outQuad: [0.25, 0.46, 0.45, 0.94] as const,
  outCubic: [0.215, 0.61, 0.355, 1] as const,
  outQuart: [0.165, 0.84, 0.44, 1] as const,      // DEFAULT for most UI
  outQuint: [0.23, 1, 0.32, 1] as const,
  outExpo: [0.19, 1, 0.22, 1] as const,
  outCirc: [0.075, 0.82, 0.165, 1] as const,

  // Ease-in-out family - Reposition/Morph/Layout
  inOutQuad: [0.455, 0.03, 0.515, 0.955] as const,
  inOutCubic: [0.645, 0.045, 0.355, 1] as const,   // DEFAULT for layout
  inOutQuart: [0.77, 0, 0.175, 1] as const,
  inOutQuint: [0.86, 0, 0.07, 1] as const,
  inOutExpo: [1, 0, 0, 1] as const,

  // Ease-in family - Rarely used (exit permanently, anticipation)
  inQuad: [0.55, 0.085, 0.68, 0.53] as const,
  inCubic: [0.55, 0.055, 0.675, 0.19] as const,
  inQuart: [0.895, 0.03, 0.685, 0.22] as const,
} as const

// ============================================
// DURATION TOKENS (in seconds for Framer Motion)
// ============================================

export const duration = {
  micro: 0.12,      // 120ms - button press, instant feedback
  fast: 0.18,       // 180ms - dropdowns, popovers
  normal: 0.24,     // 240ms - modals, sheets
  slow: 0.3,        // 300ms - large surfaces (use sparingly)
  slower: 0.5,      // 500ms - illustrative only
  illustrative: 0.8, // 800ms - marketing, onboarding
} as const

// ============================================
// SPRING CONFIGURATIONS
// ============================================

export const spring = {
  // Snappy - navigation, quick responses
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.8,
  },

  // Gentle - modals, larger elements
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },

  // Bouncy - ONLY for drag gestures, not tap-to-open
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
    mass: 1,
  },

  // No bounce - default for most interactions
  noBounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 1,
  },
} as const

// ============================================
// SCALE TOKENS
// Never animate from scale(0) - reads as synthetic
// ============================================

export const scale = {
  // Small elements (buttons, chips)
  buttonHover: 1.02,
  buttonTap: 0.98,
  buttonStart: 0.97,

  // Medium elements (dropdowns, popovers)
  dropdownStart: 0.96,

  // Large elements (modals, sheets)
  modalStart: 0.95,

  // Cards
  cardHover: 1.02,
  cardTap: 0.985,

  // Image zoom on hover
  imageHover: 1.03,
} as const

// ============================================
// PRE-BUILT TRANSITIONS
// ============================================

export const transition = {
  // Button press - micro fast
  buttonPress: {
    duration: duration.micro,
    ease: easing.outQuart,
  } as Transition,

  // Button hover
  buttonHover: {
    scale: { type: 'spring', stiffness: 400, damping: 25 },
    backgroundColor: { duration: duration.fast },
    boxShadow: { duration: duration.fast },
  } as Transition,

  // Dropdown/popover enter
  dropdown: {
    duration: duration.fast,
    ease: easing.outQuart,
  } as Transition,

  // Modal enter
  modal: {
    duration: duration.normal,
    ease: easing.outQuart,
  } as Transition,

  // Modal exit (faster than enter)
  modalExit: {
    duration: duration.micro,
    ease: easing.outCubic,
  } as Transition,

  // Layout/morph changes
  layout: {
    duration: duration.normal,
    ease: easing.inOutCubic,
  } as Transition,

  // Card entry with stagger
  cardEntry: {
    duration: 0.35,
    ease: easing.outQuart,
  } as Transition,

  // Card hover
  cardHover: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  } as Transition,

  // Page transition enter
  pageEnter: {
    duration: duration.normal,
    ease: easing.outQuart,
  } as Transition,

  // Page transition exit
  pageExit: {
    duration: duration.micro,
    ease: easing.outCubic,
  } as Transition,

  // Stagger children
  stagger: (staggerDelay = 0.05) => ({
    staggerChildren: staggerDelay,
    delayChildren: 0.1,
  }),
} as const

// ============================================
// PRE-BUILT VARIANTS
// ============================================

export const variants = {
  // Fade in from below (default enter)
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  } as Variants,

  // Fade in from above
  fadeDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  } as Variants,

  // Scale in (for modals, dropdowns)
  scaleIn: {
    initial: { opacity: 0, scale: scale.dropdownStart },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: scale.dropdownStart },
  } as Variants,

  // Modal scale (larger elements)
  modalScale: {
    initial: { opacity: 0, scale: scale.modalStart },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: scale.modalStart },
  } as Variants,

  // Stagger container
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  // Stagger item (use with staggerContainer)
  staggerItem: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  } as Variants,

  // Page transition
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
  } as Variants,

  // Hero content (slightly slower, more dramatic)
  heroContent: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
  } as Variants,

  // Mobile menu
  mobileMenu: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  } as Variants,

  // Menu item (for stagger)
  menuItem: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  } as Variants,
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get stagger delay with max cap to prevent long waits
 */
export const getStaggerDelay = (index: number, baseDelay = 0.05, maxDelay = 0.3): number => {
  return Math.min(index * baseDelay, maxDelay)
}

/**
 * Create card entry transition with proper stagger
 */
export const cardEntryTransition = (index: number): Transition => ({
  duration: 0.35,
  delay: getStaggerDelay(index, 0.06, 0.24),
  ease: easing.outQuart,
})

/**
 * Check if user prefers reduced motion
 * Note: Prefer using the usePrefersReducedMotion hook in components
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get transition that respects reduced motion
 */
export const getAccessibleTransition = (normalTransition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0 }
  }
  return normalTransition
}
