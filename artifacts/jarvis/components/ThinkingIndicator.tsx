import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ThinkingIndicatorProps {
  visible: boolean;
  complexity: number;
}

const COMPLEXITY_COLORS: Record<number, string> = {
  1: '#00ffff',
  2: '#00e5ff',
  3: '#00d4ff',
  4: '#00b4d8',
  5: '#48cae4',
  6: '#00b09b',
  7: '#ff6b6b',
  8: '#ff0040',
};

const ringStyle = (size: number, bw: number, color: string) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  borderWidth: bw,
  backgroundColor: 'transparent',
  borderColor: color,
  shadowColor: color,
  shadowRadius: 15,
  shadowOpacity: 0.9,
  elevation: 10,
});

// Pre-calculate elliptical orbits
const PARTICLE_COUNT = 8;
const RX = 130;
const RY = 80;
const STEPS = 60;
const createEllipticalTrajectory = (rx: number, ry: number) => {
  const xTable: number[] = [];
  const yTable: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const angle = (i * 360 / STEPS) * Math.PI / 180;
    xTable.push(rx * Math.cos(angle));
    yTable.push(ry * Math.sin(angle));
  }
  return { xTable, yTable };
};
const TRAJECTORY = createEllipticalTrajectory(RX, RY);
const INPUT_RANGE = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);

export default function ThinkingIndicator({ visible, complexity }: ThinkingIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  
  // Base Animation Values
  const outerRotate = useRef(new Animated.Value(0)).current;
  const outerScale = useRef(new Animated.Value(1)).current;
  const arcRotate = useRef(new Animated.Value(0)).current;
  const midRotate = useRef(new Animated.Value(0)).current;
  const breatheX = useRef(new Animated.Value(1)).current;
  const breatheY = useRef(new Animated.Value(1)).current;
  const coreScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0.7)).current;
  
  const segmentAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  const particleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  const particleScaleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(1))).current;
  const particleOpacityAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(1))).current;
  
  // HUD v4 Additions
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const lightningOpacity = useRef(new Animated.Value(0)).current;
  const flickerAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Pre-calculate Markers
  const markers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 36; i++) {
      const angle = i * 10;
      arr.push({ angle, isLarge: i % 9 === 0 });
    }
    return arr;
  }, []);

  // Pre-calculate Scanlines
  const scanlines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 20; i++) lines.push(i * 18);
    return lines;
  }, []);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      
      const loop = (anim: Animated.Value, to: number, duration: number, easing = Easing.linear) => 
        Animated.loop(Animated.timing(anim, { toValue: to, duration, easing, useNativeDriver: true }));

      // Continuous Rotations
      const outerRotAnim = loop(outerRotate, 1, 8000);
      const arcRotAnim = loop(arcRotate, 1, 6000);
      const midRotAnim = loop(midRotate, -1, 4000);
      
      // Pulsing Effects
      const outerPulseAnim = Animated.loop(Animated.sequence([
        Animated.timing(outerScale, { toValue: 1.03, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(outerScale, { toValue: 0.97, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));

      const breatheAnim = Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheX, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breatheY, { toValue: 0.85, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(breatheX, { toValue: 0.85, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breatheY, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ]));

      const corePulseAnim = Animated.loop(Animated.sequence([
        Animated.timing(coreScale, { toValue: 1.1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(coreScale, { toValue: 0.9, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));

      const textPulseAnim = Animated.loop(Animated.sequence([
        Animated.timing(textOpacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0.7, duration: 750, useNativeDriver: true }),
      ]));

      // Energy Loading / Progressive Segments (8 segments, 3000ms loop)
      const segAnims = segmentAnims.map((anim, i) => Animated.loop(Animated.sequence([
        Animated.delay(i * 375), // 3000ms / 8 = 375ms
        Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.1, duration: 500, useNativeDriver: true }),
      ])));

      // Particles Orbits & Individual Pulses
      const partOrbits = particleAnims.map((anim, i) => loop(anim, 1, 2000 + i * 500));
      const partScales = particleScaleAnims.map((anim, i) => Animated.loop(Animated.sequence([
        Animated.delay(i * 100),
        Animated.timing(anim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      ])));
      const partOpacities = particleOpacityAnims.map((anim, i) => Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
      ])));

      // Periodic Effects (Ripple & Lightning)
      const periodicEffects = Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.sequence([
            Animated.timing(rippleOpacity, { toValue: 0.6, duration: 100, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          ]),
          Animated.timing(rippleScale, { toValue: 3.5, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(lightningOpacity, { toValue: 0.15, duration: 60, useNativeDriver: true }),
            Animated.timing(lightningOpacity, { toValue: 0, duration: 60, useNativeDriver: true }),
          ]),
        ]),
        Animated.delay(3000), // Total cycle 4s
      ]));

      // Electric Flickers
      const flickAnims = flickerAnims.map((anim) => Animated.loop(Animated.sequence([
        Animated.delay(1500 + Math.random() * 1500),
        Animated.timing(anim, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ])));

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        outerRotAnim, outerPulseAnim, arcRotAnim, midRotAnim, breatheAnim, corePulseAnim, textPulseAnim,
        periodicEffects, ...segAnims, ...partOrbits, ...partScales, ...partOpacities, ...flickAnims
      ]).start();

      return () => {
        [outerRotAnim, outerPulseAnim, arcRotAnim, midRotAnim, breatheAnim, corePulseAnim, textPulseAnim, periodicEffects, ...segAnims, ...partOrbits, ...partScales, ...partOpacities, ...flickAnims].forEach(a => a.stop());
      };
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setShouldRender(false);
        rippleScale.setValue(0);
      });
    }
  }, [visible]);

  if (!shouldRender) return null;

  const hudColor = COMPLEXITY_COLORS[complexity] || '#00d4ff';
  const spinOuter = outerRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinArc = arcRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinMid = midRotate.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="none">
      
      {/* HUD v4 Lightning Flash Overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: lightningOpacity, zIndex: 10000 }]} />

      {/* Background HUD Elements */}
      <View style={styles.hudBg}>
        {scanlines.map((top, i) => <View key={`sl-${i}`} style={[styles.scanline, { top }]} />)}
        <View style={styles.circularBackdrop}>
           <View style={[styles.bgRing, { width: 200, height: 200, borderRadius: 100 }]} />
           <View style={[styles.bgRing, { width: 120, height: 120, borderRadius: 60 }]} />
        </View>
      </View>

      <Animated.View style={[styles.center, { transform: [{ scale: scaleAnim }] }]}>
        
        {/* Ripple Shockwave */}
        <Animated.View style={[
          styles.ripple, 
          { borderColor: hudColor, transform: [{ scale: rippleScale }], opacity: rippleOpacity }
        ]} />

        {/* Ring 1 - Outer 300x300 (Fixed Graduation Markers inside) */}
        <Animated.View style={[
          ringStyle(300, 8, hudColor), 
          { position: 'absolute', transform: [{ rotate: spinOuter }, { scale: outerScale }] }
        ]}>
          {markers.map((m, i) => (
            <View key={`m-${i}`} style={[
              m.isLarge ? styles.markerLarge : styles.markerSmall,
              { transform: [{ rotate: `${m.angle}deg` }, { translateY: -145 }] }
            ]}>
              {m.isLarge && <Text style={styles.hudLabel}>{m.angle}</Text>}
            </View>
          ))}
        </Animated.View>

        {/* Orange Arc on Outer Ring */}
        <Animated.View style={[styles.orangeArc, { transform: [{ rotate: spinArc }] }]}>
           <View style={styles.arcSegment} />
        </Animated.View>

        {/* Ring 2 - 240x240 Mid (Energy Loading Segments) */}
        <Animated.View style={[
          ringStyle(240, 2, hudColor), 
          { position: 'absolute', transform: [{ rotate: spinMid }] }
        ]}>
           {segmentAnims.map((anim, i) => (
             <Animated.View key={`seg-${i}`} style={[
               styles.midSegment, 
               { backgroundColor: hudColor, opacity: anim, transform: [{ rotate: `${i * 45}deg` }, { translateY: -120 }] }
             ]} />
           ))}
        </Animated.View>

        {/* Electric Flickers */}
        {flickerAnims.map((anim: Animated.Value, i: number) => (
          <Animated.View key={`flick-${i}`} style={[
            styles.flicker, 
            { 
              backgroundColor: hudColor, 
              opacity: anim, 
              transform: [
                { rotate: `${i * 90 + Math.random() * 45}deg` }, 
                { translateY: -105 }
              ] 
            }
          ]} />
        ))}

        {/* Ring 3 - Breathing 180x180 */}
        <Animated.View style={[
          ringStyle(180, 1.5, hudColor), 
          { position: 'absolute', opacity: 0.6, transform: [{ scaleX: breatheX }, { scaleY: breatheY }] }
        ]} />

        {/* Layer 4 - Orbiting Particles (Elliptical Trajectory + Scale/Opacity Pulse) */}
        {particleAnims.map((anim, i) => {
           const tx = anim.interpolate({ inputRange: INPUT_RANGE, outputRange: TRAJECTORY.xTable });
           const ty = anim.interpolate({ inputRange: INPUT_RANGE, outputRange: TRAJECTORY.yTable });
           return (
             <Animated.View key={`p-${i}`} style={[
               styles.particle, 
               { 
                 backgroundColor: hudColor, 
                 opacity: particleOpacityAnims[i],
                 transform: [
                   { translateX: tx }, 
                   { translateY: ty },
                   { scale: particleScaleAnims[i] }
                 ] 
               }
             ]} />
           );
        })}

        {/* Ring 5 - Core 70x70 */}
        <Animated.View style={[
          styles.core, 
          { borderColor: hudColor, shadowColor: hudColor, shadowRadius: 10, shadowOpacity: 0.8, transform: [{ scale: coreScale }] }
        ]}>
           <View style={styles.coreInner} />
        </Animated.View>

        {/* Center Text */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, { color: hudColor, opacity: textOpacity }]}>J.A.R.V.I.S</Animated.Text>
          <Text style={[styles.subtext, { color: hudColor }]}>
            {complexity <= 2 ? 'PROCESEZ...' : complexity <= 5 ? 'ANALIZEZ...' : 'CALCUL COMPLEX...'}
          </Text>
        </View>

        {/* HUD Rays */}
        {['0deg', '90deg', '180deg', '270deg'].map((rot, i) => (
          <View key={`ray-${i}`} style={[styles.ray, { backgroundColor: hudColor, transform: [{ rotate: rot }, { translateY: -170 }] }]} />
        ))}

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.70)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  center: { alignItems: 'center', justifyContent: 'center' },
  hudBg: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanline: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#fff', opacity: 0.03 },
  circularBackdrop: { width: 280, height: 280, borderRadius: 140, backgroundColor: '#050d14', borderWidth: 1, borderColor: '#0a2a3a', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bgRing: { position: 'absolute', borderWidth: 1, borderColor: '#fff', opacity: 0.08 },
  
  markerSmall: { position: 'absolute', width: 2, height: 8, backgroundColor: '#fff', opacity: 0.4 },
  markerLarge: { position: 'absolute', width: 3, height: 14, backgroundColor: '#fff', opacity: 0.9, alignItems: 'center' },
  hudLabel: { position: 'absolute', top: 16, color: '#fff', fontSize: 8, opacity: 0.5 },
  
  orangeArc: { position: 'absolute', width: 310, height: 310, justifyContent: 'center', alignItems: 'center' },
  arcSegment: { width: 310, height: 310, borderRadius: 155, borderWidth: 4, borderColor: '#f59e0b', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: '-30deg' }] },
  
  midSegment: { position: 'absolute', width: 12, height: 3, borderRadius: 1 },
  particle: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  
  core: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, backgroundColor: '#050d14', justifyContent: 'center', alignItems: 'center' },
  coreInner: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  textContainer: { position: 'absolute', alignItems: 'center', width: 200 },
  title: { fontSize: 18, fontWeight: 'bold', letterSpacing: 4 },
  subtext: { fontSize: 10, letterSpacing: 2, opacity: 0.7, marginTop: 4 },
  
  ray: { position: 'absolute', width: 2, height: 20, opacity: 0.5 },
  
  // v4 New Styles
  ripple: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2 },
  flicker: { position: 'absolute', width: 1, height: 30 },
});
