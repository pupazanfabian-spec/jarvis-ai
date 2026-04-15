
const colors = {
  primary: '#6C63FF',
  primaryDark: '#5A52E0',
  primaryLight: '#8B84FF',
  accent: '#00D4FF',
  accentDark: '#00A8CC',
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A28',
  surfaceHigh: '#22223A',
  text: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#555570',
  userBubble: '#6C63FF',
  userBubbleText: '#FFFFFF',
  aiBubble: '#1A1A28',
  aiBubbleText: '#F0F0FF',
  border: '#2A2A40',
  success: '#00E676',
  error: '#FF5252',
  warning: '#FFD740',
  glow: 'rgba(108, 99, 255, 0.15)',
  glowStrong: 'rgba(108, 99, 255, 0.3)',
  glowAccent: 'rgba(0, 212, 255, 0.1)',
};

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  colors,
};
