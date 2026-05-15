import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Easing, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ThinkingIndicatorProps {
  visible: boolean;
  complexity: number;
  mode?: 'auto' | 'manual';
  provider?: 'groq' | 'openrouter' | 'agent' | 'memory';
  accessingMemory?: boolean;
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
const RX = 140;
const RY = 90;
const STEPS = 80;
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

export default function ThinkingIndicator({ visible, complexity, mode = 'auto', provider, accessingMemory }: ThinkingIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const [internalComplexity, setInternalComplexity] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  
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
  
  // HUD v5 Cinematic Additions
  const glitchTranslateX = useRef(new Animated.Value(0)).current;
  const glitchFlash = useRef(new Animated.Value(0)).current;
  const mathRotate = useRef(new Animated.Value(0)).current;
  const holoRotate = useRef(new Animated.Value(0)).current;
  const scanTranslateY = useRef(new Animated.Value(0)).current;
  const codeAnims = useRef(Array.from({ length: 4 }, () => ({
    pos: new Animated.Value(0),
    opacity: new Animated.Value(0)
  }))).current;
  const crosshairScale = useRef(new Animated.Value(1)).current;
  const hexRotate = useRef(new Animated.Value(0)).current;
  const energyPulseScale = useRef(new Animated.Value(0)).current;
  const energyPulseOpacity = useRef(new Animated.Value(0)).current;

  // Memory Access Lines
  const memLineAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  // Provider Pulse
  const providerScale = useRef(new Animated.Value(1)).current;

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
    AsyncStorage.getItem('@jarvis_reduced_motion').then(val => {
      if (val === 'true') setReducedMotion(true);
    });
  }, []);

  useEffect(() => {
    let interval: any;
    if (visible) {
      setInternalComplexity(1);
      interval = setInterval(() => {
        setInternalComplexity(prev => (prev < 8 ? prev + 1 : 8));
      }, 1200);
    } else {
      setInternalComplexity(1);
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      
      const loop = (anim: Animated.Value, to: number, duration: number, easing = Easing.linear) => 
        Animated.loop(Animated.timing(anim, { toValue: to, duration, easing, useNativeDriver: true }));

      const anims: Animated.CompositeAnimation[] = [];

      // Continuous Rotations
      anims.push(loop(outerRotate, 1, 8000));
      anims.push(loop(arcRotate, 1, 6000));
      anims.push(loop(midRotate, 1, 4000));
      
      // Pulsing Effects
      anims.push(Animated.loop(Animated.sequence([
        Animated.timing(outerScale, { toValue: 1.03, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(outerScale, { toValue: 0.97, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])));

      anims.push(Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheX, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breatheY, { toValue: 0.85, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(breatheX, { toValue: 0.85, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breatheY, { toValue: 1.15, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])));

      anims.push(Animated.loop(Animated.sequence([
        Animated.timing(coreScale, { toValue: 1.1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(coreScale, { toValue: 0.9, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])));

      anims.push(Animated.loop(Animated.sequence([
        Animated.timing(textOpacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0.7, duration: 750, useNativeDriver: true }),
      ])));

      anims.push(loop(crosshairScale, 1.2, 800, Easing.inOut(Easing.ease)));

      // Provider Pulse
      anims.push(Animated.loop(Animated.sequence([
        Animated.timing(providerScale, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(providerScale, { toValue: 0.95, duration: 500, useNativeDriver: true }),
      ])));

      // Segments
      segmentAnims.forEach((anim, i) => {
        anims.push(Animated.loop(Animated.sequence([
          Animated.delay(i * 375),
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.1, duration: 500, useNativeDriver: true }),
        ])));
      });

      if (!reducedMotion) {
        anims.push(loop(mathRotate, 1, 15000));
        anims.push(loop(holoRotate, 1, 10000));
        anims.push(loop(hexRotate, 1, 20000));

        // Periodic Effects (Ripple & Lightning)
        anims.push(Animated.loop(Animated.sequence([
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
          Animated.delay(3000),
        ])));

        // Glitch
        anims.push(Animated.loop(Animated.sequence([
          Animated.delay(2500),
          Animated.parallel([
            Animated.timing(glitchFlash, { toValue: 0.3, duration: 40, useNativeDriver: true }),
            Animated.timing(glitchTranslateX, { toValue: Math.random() > 0.5 ? 3 : -3, duration: 40, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(glitchFlash, { toValue: 0, duration: 40, useNativeDriver: true }),
            Animated.timing(glitchTranslateX, { toValue: 0, duration: 40, useNativeDriver: true }),
          ]),
        ])));

        // Energy Ring Pulse
        anims.push(Animated.loop(Animated.sequence([
          Animated.parallel([
            Animated.timing(energyPulseScale, { toValue: 1.3, duration: 5000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(energyPulseOpacity, { toValue: 0.4, duration: 500, useNativeDriver: true }),
              Animated.timing(energyPulseOpacity, { toValue: 0, duration: 4500, useNativeDriver: true }),
            ])
          ]),
          Animated.timing(energyPulseScale, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])));

        // Particles
        particleAnims.forEach((anim, i) => anims.push(loop(anim, 1, 2000 + i * 500)));
        particleScaleAnims.forEach((anim, i) => anims.push(Animated.loop(Animated.sequence([
          Animated.delay(i * 100),
          Animated.timing(anim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        ]))));
      }

      // Memory lines
      memLineAnims.forEach((anim, i) => {
        anims.push(Animated.loop(Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])));
      });

      anims.push(loop(scanTranslateY, 1, 2000));

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        ...anims
      ]).start();

      return () => anims.forEach(a => a.stop());
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible, reducedMotion]);

  if (!shouldRender) return null;

  const currentComplexity = mode === 'auto' ? internalComplexity : complexity;
  const hudColor = COMPLEXITY_COLORS[currentComplexity] || '#00d4ff';
  const spinOuter = outerRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinArc = arcRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinMid = midRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinMath = mathRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinHolo = holoRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinHex = hexRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  
  const scanY = scanTranslateY.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });

  // Provider Badge Config
  const providerConfig = {
    groq: { label: 'G', color: '#f59e0b' },
    openrouter: { label: 'O', color: '#00d4ff' },
    agent: { label: 'A', color: '#00ff88' },
    memory: { label: 'M', color: '#ff5500' },
  }[provider || 'groq'];

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="none">
      
      {/* Memory Access Visualization */}
      {accessingMemory && memLineAnims.map((anim, i) => (
        <Animated.View key={`mem-line-${i}`} style={[
          styles.memoryLine,
          {
            backgroundColor: '#00ffff66',
            transform: [
              { rotate: `${i * 90}deg` },
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_HEIGHT / 2, 0] }) }
            ]
          }
        ]} />
      ))}

      {/* Provider Indicator Badge */}
      {provider && (
        <Animated.View style={[
          styles.providerBadge,
          { backgroundColor: providerConfig.color, transform: [{ scale: providerScale }] }
        ]}>
          <Text style={styles.providerLetter}>{providerConfig.label}</Text>
        </Animated.View>
      )}
      
      {!reducedMotion && <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: lightningOpacity, zIndex: 10000 }]} />}
      {!reducedMotion && <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: glitchFlash, zIndex: 10001 }]} />}

      {/* Background HUD Elements */}
      <View style={styles.hudBg}>
        {scanlines.map((top, i) => <View key={`sl-${i}`} style={[styles.scanline, { top }]} />)}
        <View style={styles.circularBackdrop}>
           <View style={[styles.bgRing, { width: 200, height: 200, borderRadius: 100 }]} />
           <View style={[styles.bgRing, { width: 120, height: 120, borderRadius: 60 }]} />
        </View>
      </View>

      <Animated.View style={[styles.center, { transform: [{ scale: scaleAnim }, { translateX: glitchTranslateX }] }]}>
        
        {!reducedMotion && <Animated.View style={[
          styles.ripple, 
          { borderColor: hudColor, transform: [{ scale: rippleScale }], opacity: rippleOpacity }
        ]} />}

        {!reducedMotion && <Animated.View style={[
          ringStyle(220, 4, hudColor),
          { position: 'absolute', opacity: energyPulseOpacity, transform: [{ scale: energyPulseScale }] }
        ]} />}

        {!reducedMotion && <Animated.View style={[
          styles.hexagon,
          { borderColor: hudColor, opacity: 0.15, transform: [{ rotate: spinHex }] }
        ]} />}

        {!reducedMotion && <Animated.View style={[
          ringStyle(320, 1, hudColor),
          { position: 'absolute', borderColor: 'transparent', transform: [{ rotate: spinMath }] }
        ]}>
          {[0, 90, 180, 270].map(angle => (
            <View key={`math-${angle}`} style={[styles.mathWrapper, { transform: [{ rotate: `${angle}deg` }, { translateY: -160 }] }]}>
              <Text style={styles.mathText}>0010 1101 1011</Text>
            </View>
          ))}
        </Animated.View>}

        {!reducedMotion && <Animated.View style={[styles.holoContainer, { transform: [{ rotate: spinHolo }] }]}>
          {[90, 110, 140, 170].map((r, i) => (
            <View key={`holo-${i}`} style={[
              styles.holoCircle, 
              { borderColor: hudColor, opacity: 0.3, transform: [{ translateY: -r }] }
            ]} />
          ))}
        </Animated.View>}

        {/* Ring 1 - Outer */}
        <Animated.View style={[
          ringStyle(300, 8, hudColor), 
          { position: 'absolute', transform: [{ rotate: spinOuter }, { scale: outerScale }] }
        ]}>
          {markers.map((m, i) => (
            <View key={`m-${i}`} style={[
              m.isLarge ? styles.markerLarge : styles.markerSmall,
              { 
                position: 'absolute',
                top: 150 - (m.isLarge ? 14 : 8) / 2,
                left: 150 - 1.5,
                transform: [{ rotate: `${m.angle}deg` }, { translateY: -145 }] 
              }
            ]}>
              {m.isLarge && <Text style={[styles.hudLabel, { transform: [{ rotate: `${-m.angle}deg` }] }]}>{m.angle}</Text>}
            </View>
          ))}
        </Animated.View>

        {/* Orange Arc */}
        <Animated.View style={[styles.orangeArc, { transform: [{ rotate: spinArc }] }]}>
           <View style={styles.arcSegment} />
           <View style={styles.statusTextWrapper}>
              <Text style={[styles.statusText, { color: hudColor }]}>COMPLEXITY: {currentComplexity}/8</Text>
              <Text style={[styles.statusText, { color: hudColor }]}>ENERGY: {80 + currentComplexity * 2}%</Text>
           </View>
        </Animated.View>

        {/* Ring 2 - Mid */}
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

        {/* Ring 3 - Core */}
        <Animated.View style={[
          styles.core, 
          { borderColor: hudColor, transform: [{ scale: coreScale }] }
        ]}>
           <View style={styles.coreInner} />
           <Animated.View style={[styles.crosshair, { transform: [{ scale: crosshairScale }] }]}>
              <View style={[styles.chLine, { backgroundColor: hudColor, height: 10, width: 2 }]} />
              <View style={[styles.chLine, { backgroundColor: hudColor, height: 2, width: 10, position: 'absolute' }]} />
           </Animated.View>
        </Animated.View>

        {/* Center Text */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, { color: hudColor, opacity: textOpacity }]}>J.A.R.V.I.S</Animated.Text>
          <Text style={[styles.subtext, { color: hudColor }]}>
            {currentComplexity <= 2 ? 'PROCESEZ...' : currentComplexity <= 5 ? 'ANALIZEZ...' : 'CALCUL COMPLEX...'}
          </Text>
          
          <View style={styles.scanWindow}>
             <Animated.View style={{ transform: [{ translateY: scanY }] }}>
                <Text style={styles.scanText}>SCANNING...</Text>
                <Text style={styles.scanText}>ANALYZING...</Text>
                <Text style={styles.scanText}>PROCESSING...</Text>
             </Animated.View>
          </View>
        </View>

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
  ripple: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2 },
  mathWrapper: { position: 'absolute', alignItems: 'center' },
  mathText: { color: '#00ffff', fontSize: 8, opacity: 0.4, fontWeight: 'bold' },
  holoContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  holoCircle: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 1 },
  hexagon: { position: 'absolute', width: 260, height: 260, borderWidth: 1 },
  crosshair: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  chLine: { opacity: 0.6 },
  scanWindow: { height: 12, overflow: 'hidden', marginTop: 8 },
  scanText: { color: '#00ffff', fontSize: 7, opacity: 0.5, textAlign: 'center' },
  statusTextWrapper: { position: 'absolute', bottom: 40, alignItems: 'center' },
  statusText: { fontSize: 7, fontWeight: 'bold', opacity: 0.6 },
  memoryLine: { position: 'absolute', width: 1, height: SCREEN_HEIGHT, zIndex: -1 },
  providerBadge: { position: 'absolute', bottom: 40, left: 40, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 10002 },
  providerLetter: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

