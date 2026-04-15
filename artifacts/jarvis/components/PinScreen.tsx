
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const { colors } = Colors;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

interface Props {
  mode: 'unlock' | 'set' | 'confirm';
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  subtitle?: string;
}

export default function PinScreen({ mode, onSuccess, onCancel, subtitle }: Props) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;

  const shake = useCallback(() => {
    if (Platform.OS !== 'web') Vibration.vibrate(300);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const animateDot = useCallback((index: number) => {
    Animated.sequence([
      Animated.timing(dotAnims[index], { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.timing(dotAnims[index], { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [dotAnims]);

  const handleKey = useCallback((key: string) => {
    if (key === 'del') {
      setDigits(prev => prev.slice(0, -1));
      setError('');
      return;
    }
    if (key === '') return;
    if (digits.length >= 4) return;

    const newDigits = [...digits, key];
    animateDot(digits.length);
    setDigits(newDigits);

    if (newDigits.length === 4) {
      setTimeout(() => {
        onSuccess(newDigits.join(''));
        setDigits([]);
        setError('');
      }, 150);
    }
  }, [digits, onSuccess, animateDot]);

  const showError = useCallback((msg: string) => {
    setError(msg);
    shake();
    setTimeout(() => setDigits([]), 400);
  }, [shake]);

  const titles: Record<string, string> = {
    unlock: 'Introduceți PIN-ul',
    set: 'Setați PIN nou',
    confirm: 'Confirmați PIN-ul',
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoRing}>
            <Feather name="lock" size={28} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Jarvis</Text>
        </View>

        {/* Titlu */}
        <Text style={styles.title}>{titles[mode]}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {/* Dots indicator */}
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                digits.length > i && styles.dotFilled,
                { transform: [{ scale: dotAnims[i] }] },
              ]}
            />
          ))}
        </Animated.View>

        {/* Eroare */}
        {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorPlaceholder} />}

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ki) => (
                key === '' ? (
                  <View key={ki} style={styles.keyEmpty} />
                ) : key === 'del' ? (
                  <TouchableOpacity
                    key={ki}
                    style={styles.keyBtn}
                    onPress={() => handleKey('del')}
                    activeOpacity={0.7}
                  >
                    <Feather name="delete" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={ki}
                    style={styles.keyBtn}
                    onPress={() => handleKey(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keyText}>{key}</Text>
                  </TouchableOpacity>
                )
              ))}
            </View>
          ))}
        </View>

        {/* Cancel */}
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Anulează</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  appName: { fontSize: 22, fontFamily: 'Inter_700Bold', color: colors.text },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    height: 20,
    marginBottom: 8,
  },
  errorPlaceholder: { height: 28 },
  keypad: { width: '100%', maxWidth: 300, gap: 12 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  keyBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: { width: 76, height: 76 },
  keyText: {
    fontSize: 26,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  cancelBtn: { marginTop: 28, padding: 12 },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontFamily: 'Inter_500Medium' },
});
