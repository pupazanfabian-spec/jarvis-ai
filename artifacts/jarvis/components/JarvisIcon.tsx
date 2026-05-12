import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Safe linear easing function
const linear = (t: number) => t;

export default function JarvisIcon({ focused, color, size }: {
  focused: boolean; color: string; size: number;
}) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Rotatie ring cand e selectat
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1, duration: 3000,
          easing: linear, useNativeDriver: true
        })
      ).start();
      // Pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2, duration: 800, easing: linear, useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9, duration: 800, easing: linear, useNativeDriver: true
          }),
        ])
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [focused, rotateAnim, pulseAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {focused && (
        <Animated.View style={[styles.ring, {
          transform: [{ rotate: spin }],
          borderColor: color,
        }]} />
      )}
      <Animated.View style={{ transform: [{ scale: focused ? pulseAnim : 1 }] }}>
        <View style={[styles.innerCircle, {
          borderColor: color,
          backgroundColor: focused ? 'rgba(0,212,255,0.1)' : 'transparent'
        }]}>
          <Ionicons
            name="hardware-chip"
            size={size - 6}
            color={color}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  innerCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
