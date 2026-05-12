import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ThinkingIndicator({ visible }: { visible: boolean }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const colorCycle = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      // Fade in + scale in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 300, useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1, tension: 60, friction: 8, useNativeDriver: true
        })
      ]).start();

      // Rotatie continua
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1, duration: 2000,
          easing: Easing.linear, useNativeDriver: true
        })
      ).start();

      // Rotatie inversa
      Animated.loop(
        Animated.timing(rotateAnim2, {
          toValue: 1, duration: 1500,
          easing: Easing.linear, useNativeDriver: true
        })
      ).start();

      // Color cycle - NU useNativeDriver pentru culori
      Animated.loop(
        Animated.timing(colorCycle, {
          toValue: 4, duration: 4000,
          easing: Easing.linear, useNativeDriver: false
        })
      ).start();

      // Pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15, duration: 600, useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.85, duration: 600, useNativeDriver: true
          }),
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 200, useNativeDriver: true
      }).start(() => {
        rotateAnim.setValue(0);
        rotateAnim2.setValue(0);
        colorCycle.setValue(0);
        scaleAnim.setValue(0.5);
        pulseAnim.setValue(0.8);
      });
    }
  }, [visible]);

  const spin1 = rotateAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg']
  });
  const spin2 = rotateAnim2.interpolate({
    inputRange: [0, 1], outputRange: ['360deg', '0deg']
  });

  // Ciclu de culori: albastru -> mov -> rosu -> galben -> albastru
  const ringColor = colorCycle.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['#00d4ff', '#6366f1', '#ff0066', '#fbbf24', '#00d4ff']
  });
  const innerColor = colorCycle.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['rgba(0,212,255,0.15)', 'rgba(99,102,241,0.15)',
      'rgba(255,0,102,0.15)', 'rgba(251,191,36,0.15)', 'rgba(0,212,255,0.15)']
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents="none">
      <Animated.View style={[styles.container, {
        transform: [{ scale: scaleAnim }]
      }]}>
        {/* Cerc exterior */}
        <Animated.View style={[styles.outerRing, {
          transform: [{ rotate: spin1 }],
          borderColor: ringColor,
        }]} />

        {/* Cerc middle */}
        <Animated.View style={[styles.middleRing, {
          transform: [{ rotate: spin2 }],
          borderColor: ringColor,
        }]} />

        {/* Cerc interior */}
        <Animated.View style={[styles.innerCircle, {
          backgroundColor: innerColor,
          borderColor: ringColor,
          transform: [{ scale: pulseAnim }]
        }]}>
          <Animated.View style={[styles.coreCircle, {
            backgroundColor: ringColor
          }]} />
        </Animated.View>

        {/* Text */}
        <Animated.Text style={[styles.text, { color: ringColor }]}>
          Procesez...
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5000,
  },
  container: { alignItems: 'center', justifyContent: 'center' },
  outerRing: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  middleRing: {
    position: 'absolute',
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 1.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  innerCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreCircle: {
    width: 30, height: 30, borderRadius: 15,
    opacity: 0.8,
  },
  text: {
    marginTop: 120,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
});
