import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ringStyle = (size: number, bw: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  borderWidth: bw,
  backgroundColor: 'transparent',
});

// Pre-calculate orbits
const PARTICLE_COUNT = 8;
const RADIUS_PARTICLE = 100;
const STEPS = 60;
const createTrajectory = (radius: number) => {
  const cosTable: number[] = [];
  const sinTable: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const angle = (i * 360 / STEPS) * Math.PI / 180;
    cosTable.push(radius * Math.cos(angle));
    sinTable.push(radius * Math.sin(angle));
  }
  return { cosTable, sinTable };
};
const TRAJECTORY = createTrajectory(RADIUS_PARTICLE);
const INPUT_RANGE = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);

export default function JarvisSplash({ onFinish }: { onFinish: () => void }) {
  // Animation Values
  const outerRotate = useRef(new Animated.Value(0)).current;
  const outerScale = useRef(new Animated.Value(1)).current;
  const arcRotate = useRef(new Animated.Value(0)).current;
  const midRotate = useRef(new Animated.Value(0)).current;
  const breatheX = useRef(new Animated.Value(1)).current;
  const breatheY = useRef(new Animated.Value(1)).current;
  const coreScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0.7)).current;
  
  const segmentAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;
  const particleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  
  // v5 Cinematic Additions
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

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

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
    const loop = (anim: Animated.Value, to: number, duration: number, easing = Easing.linear) => 
      Animated.loop(Animated.timing(anim, { toValue: to, duration, easing, useNativeDriver: true }));

    const outerRotAnim = loop(outerRotate, 1, 8000);
    const arcRotAnim = loop(arcRotate, 1, 6000);
    const midRotAnim = loop(midRotate, 1, 4000); // Fixed direction
    const mathRotAnim = loop(mathRotate, 1, 15000);
    const holoRotAnim = loop(holoRotate, 1, 10000);
    const hexRotAnim = loop(hexRotate, 1, 20000);
    
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

    const crosshairPulseAnim = loop(crosshairScale, 1.2, 800, Easing.inOut(Easing.ease));

    const glitchCycle = Animated.loop(Animated.sequence([
      Animated.delay(2500),
      Animated.parallel([
        Animated.timing(glitchFlash, { toValue: 0.3, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchTranslateX, { toValue: Math.random() > 0.5 ? 3 : -3, duration: 40, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(glitchFlash, { toValue: 0, duration: 40, useNativeDriver: true }),
        Animated.timing(glitchTranslateX, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]),
    ]));

    const scanScroll = loop(scanTranslateY, 1, 2000);

    const energyPulseAnim = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(energyPulseScale, { toValue: 1.3, duration: 5000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(energyPulseOpacity, { toValue: 0.4, duration: 500, useNativeDriver: true }),
          Animated.timing(energyPulseOpacity, { toValue: 0, duration: 4500, useNativeDriver: true }),
        ])
      ]),
      Animated.timing(energyPulseScale, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));

    const codeLoopAnims = codeAnims.map((anim, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 1000),
      Animated.parallel([
        Animated.timing(anim.pos, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(anim.opacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ]),
      Animated.timing(anim.pos, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])));

    const segAnims = segmentAnims.map((anim, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 100),
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.1, duration: 200, useNativeDriver: true }),
    ])));

    const partAnims = particleAnims.map((anim, i) => loop(anim, 1, 1000 + i * 250));

    // Entry
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();

    // Start all loops
    const allAnims = [outerRotAnim, outerPulseAnim, arcRotAnim, midRotAnim, breatheAnim, corePulseAnim, textPulseAnim, crosshairPulseAnim, glitchCycle, scanScroll, energyPulseAnim, mathRotAnim, holoRotAnim, hexRotAnim, ...segAnims, ...partAnims, ...codeLoopAnims];
    allAnims.forEach(a => a.start());

    // Fade out and finish
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, { toValue: 0, duration: 600, easing: Easing.linear, useNativeDriver: true }).start(() => onFinish());
    }, 3200);

    return () => {
      clearTimeout(timer);
      allAnims.forEach(a => a.stop());
    };
  }, [onFinish]);

  const hudColor = '#00d4ff';
  const spinOuter = outerRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinArc = arcRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinMid = midRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinMath = mathRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinHolo = holoRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinHex = hexRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  
  const scanY = scanTranslateY.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]} pointerEvents="none">
      
      {/* v5 Glitch Flash */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: glitchFlash, zIndex: 10001 }]} />

      {/* Background HUD Elements */}
      <View style={styles.hudBg}>
        {scanlines.map((top, i) => <View key={`sl-${i}`} style={[styles.scanline, { top }]} />)}
        <View style={styles.circularBackdrop}>
           <View style={[styles.bgRing, { width: 200, height: 200, borderRadius: 100 }]} />
           <View style={[styles.bgRing, { width: 120, height: 120, borderRadius: 60 }]} />
        </View>
      </View>

      <Animated.View style={[styles.center, { transform: [{ scale: scaleAnim }, { translateX: glitchTranslateX }] }]}>
        
        {/* v5 Energy Ring Pulse */}
        <Animated.View style={[
          ringStyle(220, 4),
          { position: 'absolute', borderColor: hudColor, opacity: energyPulseOpacity, transform: [{ scale: energyPulseScale }] }
        ]} />

        {/* v5 Hexagonal Ring */}
        <Animated.View style={[
          styles.hexagon,
          { borderColor: hudColor, opacity: 0.15, transform: [{ rotate: spinHex }] }
        ]} />

        {/* v5 HUD Math Diagrams (320x320) */}
        <Animated.View style={[
          ringStyle(320, 1),
          { position: 'absolute', borderColor: 'transparent', transform: [{ rotate: spinMath }] }
        ]}>
          {[0, 90, 180, 270].map(angle => (
            <View key={`math-${angle}`} style={[styles.mathWrapper, { transform: [{ rotate: `${angle}deg` }, { translateY: -160 }] }]}>
              <Text style={styles.mathText}>0010 1101 1011</Text>
            </View>
          ))}
        </Animated.View>

        {/* v5 Holograms */}
        <Animated.View style={[styles.holoContainer, { transform: [{ rotate: spinHolo }] }]}>
          {[90, 110, 140, 170].map((r, i) => (
            <View key={`holo-${i}`} style={[
              styles.holoCircle, 
              { 
                borderColor: hudColor, 
                opacity: 0.3 * (i % 2 === 0 ? 1 : 0.5), 
                transform: [{ translateY: -r }] 
              }
            ]} />
          ))}
        </Animated.View>

        {/* Ring 1 - Outer 300x300 */}
        <Animated.View style={[ringStyle(300, 8), {
          position: 'absolute',
          borderColor: hudColor,
          shadowColor: hudColor,
          shadowRadius: 12,
          shadowOpacity: 0.8,
          transform: [{ rotate: spinOuter }, { scale: outerScale }]
        }]}>
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
           {/* v5 Status Text */}
           <View style={styles.statusTextWrapper}>
              <Text style={[styles.statusText, { color: hudColor }]}>INITIALIZING...</Text>
              <Text style={[styles.statusText, { color: hudColor }]}>POWER: 100%</Text>
           </View>
        </Animated.View>

        {/* Ring 2 - 240x240 Mid */}
        <Animated.View style={[ringStyle(240, 2), {
          position: 'absolute',
          borderColor: hudColor,
          transform: [{ rotate: spinMid }]
        }]}>
           {segmentAnims.map((anim, i) => (
             <Animated.View key={`seg-${i}`} style={[
               styles.midSegment, 
               { backgroundColor: hudColor, opacity: anim, transform: [{ rotate: `${i * 30}deg` }, { translateY: -120 }] }
             ]} />
           ))}
        </Animated.View>

        {/* v5 Code Fragments */}
        {codeAnims.map((anim, i) => (
          <Animated.Text key={`code-${i}`} style={[
            styles.codeFragment, 
            { 
              color: hudColor, 
              opacity: anim.opacity,
              transform: [
                { translateX: (i % 2 === 0 ? 1 : -1) * (60 + i * 20) },
                { translateY: anim.pos.interpolate({ inputRange: [0, 1], outputRange: [40, -40] }) }
              ]
            }
          ]}>
            {['{', '}', ';', '/'][i]}
          </Animated.Text>
        ))}

        {/* Ring 3 - Breathing 180x180 */}
        <Animated.View style={[ringStyle(180, 1.5), {
          position: 'absolute',
          borderColor: hudColor,
          opacity: 0.6,
          transform: [{ scaleX: breatheX }, { scaleY: breatheY }]
        }]} />

        {/* Layer 4 - Orbiting Particles */}
        {particleAnims.map((anim, i) => {
           const tx = anim.interpolate({ inputRange: INPUT_RANGE, outputRange: TRAJECTORY.cosTable });
           const ty = anim.interpolate({ inputRange: INPUT_RANGE, outputRange: TRAJECTORY.sinTable });
           return (
             <Animated.View key={`p-${i}`} style={[
               styles.particle, 
               { backgroundColor: hudColor, transform: [{ translateX: tx }, { translateY: ty }] }
             ]} />
           );
        })}

        {/* v5 Path Particles */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
           <View key={`path-p-${i}`} style={[styles.pathParticleWrapper, { transform: [{ rotate: spinOuter }, { rotate: `${angle}deg` }, { translateY: -100 }] }]}>
              <View style={[styles.pathParticle, { backgroundColor: hudColor }]} />
           </View>
        ))}

        {/* Ring 5 - Core 70x70 */}
        <Animated.View style={[styles.core, { borderColor: hudColor, transform: [{ scale: coreScale }] }]}>
           <View style={styles.coreInner} />
           {/* v5 Central Crosshair */}
           <Animated.View style={[styles.crosshair, { transform: [{ scale: crosshairScale }] }]}>
              <View style={[styles.chLine, { backgroundColor: hudColor, height: 10, width: 2 }]} />
              <View style={[styles.chLine, { backgroundColor: hudColor, height: 2, width: 10, position: 'absolute' }]} />
           </Animated.View>
        </Animated.View>

        {/* Center Text */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, { color: hudColor, opacity: textOpacity }]}>J.A.R.V.I.S</Animated.Text>
          <Text style={[styles.subtext, { color: hudColor }]}>SYSTEM ONLINE</Text>
          
          {/* v5 Text Scanning HUD */}
          <View style={styles.scanWindow}>
             <Animated.View style={{ transform: [{ translateY: scanY }] }}>
                <Text style={styles.scanText}>SCANNING...</Text>
                <Text style={styles.scanText}>ANALYZING...</Text>
                <Text style={styles.scanText}>PROCESSING...</Text>
             </Animated.View>
          </View>
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
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
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

  // v5 Cinematic Styles
  mathWrapper: { position: 'absolute', alignItems: 'center' },
  mathText: { color: '#00ffff', fontSize: 8, opacity: 0.4, fontWeight: 'bold' },
  holoContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  holoCircle: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 1 },
  hexagon: { position: 'absolute', width: 260, height: 260, borderWidth: 1, transform: [{ rotate: '30deg' }] },
  codeFragment: { position: 'absolute', fontSize: 14, fontWeight: 'bold' },
  pathParticleWrapper: { position: 'absolute', alignItems: 'center' },
  pathParticle: { width: 4, height: 4, borderRadius: 2, opacity: 0.6 },
  crosshair: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  chLine: { opacity: 0.6 },
  scanWindow: { height: 12, overflow: 'hidden', marginTop: 8 },
  scanText: { color: '#00ffff', fontSize: 7, opacity: 0.5, textAlign: 'center' },
  statusTextWrapper: { position: 'absolute', bottom: 40, alignItems: 'center' },
  statusText: { fontSize: 7, fontWeight: 'bold', opacity: 0.6 },
});

