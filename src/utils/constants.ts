// NYTHC Mobile App Constants

// Brand Colors (Dark Mode First)
export const COLORS = {
  // Primary Norfolk State Colors
  primaryGold: '#D6C238',
  secondaryTeal: '#5C9F8A',

  // Dark Mode Base
  backgroundDark: '#000100',
  surfaceDark: '#1A1A1B',
  surfaceElevated: '#252526',

  // Text Colors (Dark Mode)
  textPrimary: '#FEFEFE',
  textSecondary: '#B8B8B8',
  textTertiary: '#878787',

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Accent Colors
  alumniBadge: '#D6C238',
  studentBadge: '#5C9F8A',
  liveIndicator: '#FF4444',
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  // Headers
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '600' },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '500' },

  // Body Text
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  meta: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

// Spacing Grid
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  cards: 12,
  buttons: 8,
  pills: 20,
  modals: 16,
} as const;

// Animation Durations
export const ANIMATION = {
  micro: 150,
  short: 250,
  medium: 350,
  long: 500,
} as const;

// Screen Dimensions
export const SCREEN = {
  minTouchTarget: 44,
  safeAreaBottom: 34,
  headerHeight: 56,
} as const;

// App Configuration
export const APP_CONFIG = {
  name: 'NYTHC',
  fullName: 'Not Your Typical Homecoming',
  university: 'Norfolk State University',
  version: '1.0.0',
  supportEmail: 'support@nythc.com',
  websiteUrl: 'https://nythc.com',
} as const;