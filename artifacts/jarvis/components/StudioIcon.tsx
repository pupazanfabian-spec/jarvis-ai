import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const linear = (t: number) => t;

export default function StudioIcon({ focused, color, size }: {
  focused: boolean; color: string; size: number;
}) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1, duration: 4000,
          easing: linear, useNativeDriver: true
        })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2, duration: 1000, easing: linear, useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, duration: 1000, easing: linear, useNativeDriver: true
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

  const staticColor = '#6366f1';

  return (
    <View style={styles.container}>
      {focused && (
        <Animated.View style={[styles.ring, {
          transform: [{ rotate: spin }],
          borderColor: staticColor,
        }]} />
      )}
      <Animated.View style={{ transform: [{ scale: focused ? pulseAnim : 1 }] }}>
        <View style={[styles.innerCircle, {
          borderColor: focused ? staticColor : '#94a3b8',
        }]}>
          <Ionicons
            name="git-network-outline"
            size={size - 6}
            color={focused ? staticColor : '#94a3b8'}
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
    width: 34, height: 34, borderRadius: 17,
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
