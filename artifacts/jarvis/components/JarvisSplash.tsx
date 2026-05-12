import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function JarvisSplash({ onFinish }: { onFinish: () => void }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;
  const fadeText = useRef(new Animated.Value(0)).current;
  const fadeSubText = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotatie cerc exterior - continua
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, duration: 3000,
        easing: Easing.linear, useNativeDriver: true
      })
    ).start();

    // Rotatie cerc interior - sens opus
    Animated.loop(
      Animated.timing(rotateAnim2, {
        toValue: -1, duration: 2000,
        easing: Easing.linear, useNativeDriver: true
      })
    ).start();

    // Scale in
    Animated.spring(scaleAnim, {
      toValue: 1, tension: 50, friction: 7,
      useNativeDriver: true
    }).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Text fade in
    setTimeout(() => {
      Animated.timing(fadeText, {
        toValue: 1, duration: 600, useNativeDriver: true
      }).start();
    }, 800);

    setTimeout(() => {
      Animated.timing(fadeSubText, {
        toValue: 1, duration: 600, useNativeDriver: true
      }).start();
    }, 1400);

    // Fade out si finish
    setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0, duration: 600, useNativeDriver: true
      }).start(() => onFinish());
    }, 3200);
  }, []);

  const spin1 = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  const spin2 = rotateAnim2.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-360deg', '0deg']
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <Animated.View style={[styles.center, {
        transform: [{ scale: scaleAnim }]
      }]}>
        {/* Cerc exterior rotativ */}
        <Animated.View style={[styles.outerRing, {
          transform: [{ rotate: spin1 }]
        }]} />
        
        {/* Cerc middle rotativ invers */}
        <Animated.View style={[styles.middleRing, {
          transform: [{ rotate: spin2 }]
        }]} />

        {/* Cerc interior pulsator */}
        <Animated.View style={[styles.innerCircle, {
          transform: [{ scale: pulseAnim }]
        }]}>
          {/* Arc reactor dots */}
          <View style={styles.reactorCenter} />
        </Animated.View>

        {/* Text JARVIS */}
        <Animated.Text style={[styles.titleText, { opacity: fadeText }]}>
          J.A.R.V.I.S
        </Animated.Text>
        <Animated.Text style={[styles.subText, { opacity: fadeSubText }]}>
          Just A Rather Very Intelligent System
        </Animated.Text>
      </Animated.View>

      {/* Corner decorations HUD style */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
    </Animated.View>
  );
}

const BLUE = '#00d4ff';
const PURPLE = '#6366f1';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  outerRing: {
    position: 'absolute',
    width: 260, height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: BLUE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  middleRing: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: PURPLE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  innerCircle: {
    width: 140, height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: BLUE,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactorCenter: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
    borderWidth: 2,
    borderColor: BLUE,
  },
  titleText: {
    marginTop: 160,
    color: BLUE,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 8,
    textAlign: 'center',
  },
  subText: {
    marginTop: 8,
    color: 'rgba(0, 212, 255, 0.6)',
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30, height: 30,
    borderColor: BLUE,
  },
  topLeft: { top: 40, left: 20,
    borderTopWidth: 2, borderLeftWidth: 2 },
  topRight: { top: 40, right: 20,
    borderTopWidth: 2, borderRightWidth: 2 },
  bottomLeft: { bottom: 40, left: 20,
    borderBottomWidth: 2, borderLeftWidth: 2 },
  bottomRight: { bottom: 40, right: 20,
    borderBottomWidth: 2, borderRightWidth: 2 },
});
