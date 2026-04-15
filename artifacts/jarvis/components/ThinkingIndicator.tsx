
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
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (webSearch) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }

    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    };

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [webSearch]);

  const dots = [dot1, dot2, dot3];
  const dotColor = webSearch ? colors.accent : colors.primary;
  const avatarBg = webSearch ? colors.accent : colors.primary;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.avatar, { backgroundColor: avatarBg, transform: webSearch ? [{ scale: pulse }] : [] }]}>
        <Text style={styles.avatarText}>{webSearch ? '📡' : 'A'}</Text>
      </Animated.View>

      <View style={[styles.bubble, webSearch && styles.bubbleWeb]}>
        {webSearch ? (
          <Text style={[styles.webLabel, { color: colors.accent }]}>Caut pe internet...</Text>
        ) : (
          dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: dotColor,
                  opacity: dot,
                  transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
                },
              ]}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  bubble: {
    flexDirection: 'row',
    backgroundColor: colors.aiBubble,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 5,
  },
  bubbleWeb: {
    borderColor: colors.accent + '44',
    backgroundColor: colors.accent + '11',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  webLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
});
