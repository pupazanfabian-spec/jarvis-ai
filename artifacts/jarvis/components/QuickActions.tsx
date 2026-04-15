
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Colors from '@/constants/colors';

const { colors } = Colors;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const QUICK_ACTIONS = [
  { label: 'Ce poți face?', icon: '💡' },
  { label: 'Spune-mi o glumă', icon: '😄' },
  { label: 'Motivează-mă', icon: '💪' },
  { label: 'Ce este fotosinteza?', icon: '🌱' },
  { label: 'Ce este ADN-ul?', icon: '🔬' },
  { label: 'Explică inteligența artificială', icon: '🤖' },
  { label: 'Cel mai mare ocean din lume?', icon: '🌊' },
  { label: 'Cum funcționează creierul?', icon: '🧠' },
  { label: '1 EUR în RON?', icon: '💶' },
  { label: 'Capital Franța?', icon: '🗼' },
  { label: 'Ce este cuantica?', icon: '⚛️' },
  { label: 'Recomandă-mi un film', icon: '🎬' },
];

const DEV_QUICK_ACTIONS = [
  { label: 'Generează o aplicație todo React Native', icon: '📱' },
  { label: 'Cum funcționează useEffect?', icon: '⚛️' },
  { label: 'React Native vs Flutter vs Ionic', icon: '⚡' },
  { label: 'Ce este async/await în TypeScript?', icon: '🔄' },
  { label: 'Generează o aplicație de calculator', icon: '🧮' },
  { label: 'Explică-mi hooks-urile React', icon: '🪝' },
  { label: 'SQL vs NoSQL - diferențe', icon: '🗄️' },
  { label: 'Generează un sistem de autentificare', icon: '🔐' },
  { label: 'Ce este closure în JavaScript?', icon: '📦' },
  { label: 'Generează o aplicație weather', icon: '🌤️' },
];

interface Props {
  onPress: (text: string) => void;
  devMode?: boolean;
  visible?: boolean;
}

export default function QuickActions({ onPress, devMode = false, visible = true }: Props) {
  const actions = devMode ? DEV_QUICK_ACTIONS : QUICK_ACTIONS;
  const [mounted, setMounted] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 30)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 100, friction: 15, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 30, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        devMode && styles.devWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.chip, devMode && styles.devChip]}
            onPress={() => onPress(action.label)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={[styles.label, devMode && styles.devLabel]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  devWrapper: {
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
    borderTopColor: 'rgba(0, 212, 255, 0.2)',
  },
  container: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  devChip: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  icon: {
    fontSize: 13,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  devLabel: {
    color: '#00D4FF',
    fontSize: 12,
  },
});
