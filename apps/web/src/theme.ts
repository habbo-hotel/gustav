const colors = {
  l1Bg: '#f0ece6',
  l2Sidebar: '#1a2640',
  l2Surface: '#ffffff',
  l3Hover: '#e8e4de',
  l4Active: '#e0dcd4',
  l5Border: '#d4cec6',
  l6Elevated: '#ffffff',

  primary: '#121f3d',
  primaryDark: '#0a1530',
  primaryLight: '#e6eaf2',

  teal: '#3a7a8a',
  tealLight: '#e8f2f4',
  warm: '#c97a4a',
  warmLight: '#f8ede6',
  success: '#4a7a5a',
  successLight: '#eaf2ec',
  warning: '#a88a4a',
  warningLight: '#f8f2e6',
  danger: '#a85a5a',
  dangerLight: '#f5ecec',

  sidebarText: '#8a94a8',
  sidebarActive: '#1a2a4a',
  sidebarActiveText: '#ffffff',

  text: '#1a1a22',
  textSecondary: '#5a5650',
  textMuted: '#8a8680',

  darkBg: '#0a0e18',
  darkSurface: '#10142a',
  darkCard: '#161c30',
  darkBorder: '#222a40',
  darkHover: '#1c2438',
  darkText: '#e0e2e8',
  darkTextSecondary: '#9a9ca8',
  darkSidebar: '#080c18',
} as const;

const spacing = {
  xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem',
} as const;

const font = {
  family: "'Nunito', sans-serif",
  weight: { normal: 400, medium: 500, bold: 700, black: 800, extraBlack: 900 },
} as const;

const radius = {
  sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px',
} as const;

const shadow = {
  card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)',
  cardHover: '0 2px 8px rgba(0,0,0,0.06)',
  modal: '0 8px 24px rgba(0,0,0,0.1)',
  button: '0 1px 2px rgba(26,58,106,0.2)',
} as const;

export const theme = {colors, spacing, font, radius, shadow};
export type Theme = typeof theme;
