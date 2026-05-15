
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const baseColors = {
  text: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#555570',
  border: '#2A2A40',
  success: '#00E676',
  error: '#FF5252',
  warning: '#FFD740',
  surfaceElevated: '#1A1A28',
  surfaceHigh: '#22223A',
  userBubbleText: '#FFFFFF',
  aiBubbleText: '#F0F0FF',
  primaryLight: '#A5A0FF',
  glow: 'rgba(108, 99, 255, 0.3)',
};

export const THEMES = {
  cyan: {
    primary: '#6C63FF',
    accent: '#00D4FF',
    background: '#0A0A0F',
    surface: '#12121A',
    userBubble: '#6C63FF',
    aiBubble: '#1A1A28',
    ...baseColors,
  },
  amber: {
    primary: '#f59e0b',
    accent: '#dc2626',
    background: '#1a1814',
    surface: '#262420',
    userBubble: '#f59e0b',
    aiBubble: '#262420',
    ...baseColors,
  },
  matrix: {
    primary: '#00ff88',
    accent: '#10b981',
    background: '#050a05',
    surface: '#0d1a0d',
    userBubble: '#10b981',
    aiBubble: '#0d1a0d',
    ...baseColors,
  },
  mark42: {
    primary: '#dc2626',
    accent: '#f59e0b',
    background: '#1a0b0b',
    surface: '#2b1212',
    userBubble: '#dc2626',
    aiBubble: '#2b1212',
    ...baseColors,
  },
} as const;

export type ThemeName = keyof typeof THEMES;

const colors = THEMES.cyan; 

export const THEME_KEY = '@jarvis_theme';

export async function loadTheme(): Promise<ThemeName> {
  const saved = await AsyncStorage.getItem(THEME_KEY);
  return (saved as ThemeName) || 'cyan';
}

export async function saveTheme(name: ThemeName): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, name);
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>('cyan');
  useEffect(() => {
    loadTheme().then(setTheme);
  }, []);
  return { theme, colors: THEMES[theme] };
}

export default {
  light: {
    text: colors.text,
    background: '#ffffff',
    tint: colors.primary,
    tabIconDefault: colors.textMuted,
    tabIconSelected: colors.primary,
  },
  colors,
};
