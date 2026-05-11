
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';

const { colors } = Colors;

interface ThinkingIndicatorProps {
  webSearch?: boolean;
}

export default function ThinkingIndicator({ webSearch = false }: ThinkingIndicatorProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.2, duration: 500, useNativeDriver: true }),
          Animated.delay(400 - (delay % 400)),
        ])
      );
    };

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  const dots = [dot1, dot2, dot3];
  const label = webSearch ? '🔍 Caută online...' : '✨ Jarvis scrie...';

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{webSearch ? '🔍' : 'J'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.statusText}>{label}</Text>
        <View style={[styles.bubble, webSearch && styles.bubbleWeb]}>
          {dots.map((dot, i) => (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  opacity: dot,
                  transform: [{
                    scale: dot.interpolate({
                      inputRange: [0.2, 1],
                      outputRange: [0.7, 1.1],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  content: {
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    marginLeft: 4,
  },
  bubble: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
    justifyContent: 'center',
  },
  bubbleWeb: {
    borderColor: colors.accent + '33',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },
});
