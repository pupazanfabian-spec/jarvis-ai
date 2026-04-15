import Colors from "@/constants/colors";

const { colors } = Colors;

export function useColors() {
  return {
    background: colors.background,
    foreground: colors.text,
    card: colors.surface,
    cardForeground: colors.text,
    primary: colors.primary,
    primaryForeground: colors.userBubbleText,
    secondary: colors.surfaceElevated,
    secondaryForeground: colors.text,
    muted: colors.surfaceHigh,
    mutedForeground: colors.textSecondary,
    accent: colors.accent,
    accentForeground: colors.text,
    destructive: colors.error,
    destructiveForeground: '#FFFFFF',
    border: colors.border,
    input: colors.border,
    text: colors.text,
    tint: colors.primary,
    radius: 8,
  };
}
