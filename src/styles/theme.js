// Premium theme for Asset Finance Register
// Deep navy + gold accent palette

export const colors = {
  // Primary - Deep Navy
  primary: '#0F1B2D',
  primaryLight: '#1A2942',
  primaryMed: '#243B5C',
  primarySoft: '#2E4A6E',

  // Accent - Gold
  accent: '#C9A84C',
  accentLight: '#D4B766',
  accentSoft: '#E8D9A0',
  accentBg: 'rgba(201, 168, 76, 0.08)',

  // Surfaces
  background: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceHover: '#FAFBFC',
  surfaceElevated: '#FFFFFF',

  // Text
  textPrimary: '#0F1B2D',
  textSecondary: '#5A6578',
  textMuted: '#8B95A5',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.7)',

  // Borders
  border: '#E8ECF1',
  borderLight: '#F0F2F5',
  borderDark: '#D1D8E0',

  // Status
  success: '#16A34A',
  successLight: '#DCFCE7',
  successBorder: '#86EFAC',
  successText: '#166534',

  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorBorder: '#FCA5A5',
  errorText: '#991B1B',

  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningBorder: '#FCD34D',
  warningText: '#92400E',

  info: '#2563EB',
  infoLight: '#DBEAFE',
  infoBorder: '#93C5FD',

  // Special
  settled: '#8B95A5',
  settledBg: '#F0F2F5',
  variable: '#D97706',
  variableBg: '#FEF3C7',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #0F1B2D 0%, #1A2942 100%)',
  primarySoft: 'linear-gradient(135deg, #1A2942 0%, #2E4A6E 100%)',
  accent: 'linear-gradient(135deg, #C9A84C 0%, #D4B766 100%)',
  accentSubtle: 'linear-gradient(135deg, #D4B766 0%, #E8D9A0 100%)',
  surface: 'linear-gradient(135deg, #F4F5F7 0%, #EBEDF1 50%, #F4F5F7 100%)',
  success: 'linear-gradient(135deg, #16A34A, #22C55E)',
  error: 'linear-gradient(135deg, #DC2626, #EF4444)',
  purple: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
  gold: 'linear-gradient(135deg, #C9A84C, #E8D9A0)',
};

export const fonts = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  size: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    '2xl': '22px',
    '3xl': '28px',
    '4xl': '36px',
  },
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const shadows = {
  sm: '0 1px 2px rgba(15, 27, 45, 0.04)',
  md: '0 2px 8px rgba(15, 27, 45, 0.06)',
  lg: '0 4px 16px rgba(15, 27, 45, 0.08)',
  xl: '0 8px 32px rgba(15, 27, 45, 0.12)',
  accent: '0 4px 14px rgba(201, 168, 76, 0.25)',
  card: '0 1px 3px rgba(15, 27, 45, 0.04), 0 1px 2px rgba(15, 27, 45, 0.02)',
  cardHover: '0 8px 24px rgba(15, 27, 45, 0.1)',
};

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '999px',
};
