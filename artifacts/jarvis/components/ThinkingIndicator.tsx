import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';


const { width, height } = Dimensions.get('window');

// Safe linear easing function
const linear = (t: number) => t;

export default function ThinkingIndicator({ visible }: { visible: boolean }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

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
          easing: linear, useNativeDriver: true
        })
      ).start();

      // Rotatie inversa
      Animated.loop(
        Animated.timing(rotateAnim2, {
          toValue: 1, duration: 1500,
          easing: linear, useNativeDriver: true
        })
      ).start();

      // Pulse principal
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1, duration: 600, easing: linear, useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9, duration: 600, easing: linear, useNativeDriver: true
          }),
        ])
      ).start();

      // Glow pulse (opacity based, safe for native driver)
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8, duration: 1000, easing: linear, useNativeDriver: true
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3, duration: 1000, easing: linear, useNativeDriver: true
          }),
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0, duration: 200, useNativeDriver: true
      }).start(() => {
        rotateAnim.setValue(0);
        rotateAnim2.setValue(0);
        scaleAnim.setValue(0.5);
        pulseAnim.setValue(0.8);
        glowAnim.setValue(0.3);
      });
    }
  }, [visible, rotateAnim, rotateAnim2, pulseAnim, fadeAnim, scaleAnim, glowAnim]);

  const spin1 = rotateAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg']
  });
  const spin2 = rotateAnim2.interpolate({
    inputRange: [0, 1], outputRange: ['360deg', '0deg']
  });

  if (!visible) return null;

  const BLUE = '#00d4ff';

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="none">
      <Animated.View style={[styles.container, {
        transform: [{ scale: scaleAnim }]
      }]}>
        {/* Cerc exterior - Culoare fixa, rotatie animata */}
        <Animated.View style={[styles.outerRing, {
          transform: [{ rotate: spin1 }],
          borderColor: BLUE,
        }]} />

        {/* Cerc middle - Culoare fixa, rotatie inversa */}
        <Animated.View style={[styles.middleRing, {
          transform: [{ rotate: spin2 }],
          borderColor: BLUE,
        }]} />

        {/* Cerc interior - Glow pulse prin opacity (safe pentru native driver) */}
        <Animated.View style={[styles.innerCircle, {
          borderColor: BLUE,
          transform: [{ scale: pulseAnim }],
          opacity: glowAnim
        }]}>
          <View style={[styles.coreCircle, {
            backgroundColor: BLUE
          }]} />
        </Animated.View>

        {/* Text - Culoare fixa */}
        <Text style={[styles.text, { color: BLUE }]}>
          Procesez...
        </Text>
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
