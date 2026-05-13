import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';

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

const ring = (size: number, bw: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  borderWidth: bw,
  backgroundColor: 'transparent',
});

// Pre-calculate trajectories for 8 particles
const PARTICLE_COUNT = 8;
const RADIUS = 120;
const STEPS = 60; // Granularity of interpolation

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

const TRAJECTORY = createTrajectory(RADIUS);
const INPUT_RANGE = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);

export default function ThinkingIndicator({ visible, complexity }: ThinkingIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  
  const rotateA = useRef(new Animated.Value(0)).current;
  const rotateB = useRef(new Animated.Value(0)).current;
  const rotateC = useRef(new Animated.Value(0)).current;
  const rotateD = useRef(new Animated.Value(0)).current;
  
  const pulseCore = useRef(new Animated.Value(1)).current;
  const pulseInner = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Layer 1: Segments (12)
  const segmentAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;

  // Layer 2: Particles (8)
  const particleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;

  // Layer 3: Deformation (Ring 140)
  const deformX = useRef(new Animated.Value(1)).current;
  const deformY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      
      const loopRotate = (anim: Animated.Value, duration: number, clockwise: boolean) => {
        return Animated.loop(
          Animated.timing(anim, {
            toValue: clockwise ? 1 : -1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
      };

      const rotateAAnim = loopRotate(rotateA, 8000, true);
      const rotateBAnim = loopRotate(rotateB, 5000, false);
      const rotateCAnim = loopRotate(rotateC, 3000, true);
      const rotateDAnim = loopRotate(rotateD, 2000, false);

      const pulseCoreAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseCore, { toValue: 1.15, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseCore, { toValue: 0.85, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

      const pulseInnerAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseInner, { toValue: 0.85, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseInner, { toValue: 1.15, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );

      const pulseOpacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        ])
      );

      // Layer 1: Segments Pulse
      const segmentPulseAnims = segmentAnims.map((anim, i) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.2, duration: 200, useNativeDriver: true }),
          ])
        );
      });

      // Layer 2: Particle Orbits
      const particleOrbitAnims = particleAnims.map((anim, i) => {
        return Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 + (i * 250),
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
      });

      // Layer 3: Deformation
      const deformAnim = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(deformX, { toValue: 1.2, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(deformY, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(deformX, { toValue: 0.8, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(deformY, { toValue: 1.2, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ])
      );

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        rotateAAnim,
        rotateBAnim,
        rotateCAnim,
        rotateDAnim,
        pulseCoreAnim,
        pulseInnerAnim,
        pulseOpacityAnim,
        deformAnim,
        ...segmentPulseAnims,
        ...particleOrbitAnims,
      ]).start();

      return () => {
        [rotateAAnim, rotateBAnim, rotateCAnim, rotateDAnim, pulseCoreAnim, pulseInnerAnim, pulseOpacityAnim, deformAnim, ...segmentPulseAnims, ...particleOrbitAnims].forEach(a => a.stop());
      };
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  if (!shouldRender) return null;

  const ringColor = COMPLEXITY_COLORS[complexity] || '#00d4ff';

  const spin1 = rotateA.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] });
  const spin2 = rotateB.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] });
  const spin3 = rotateC.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] });
  const spin4 = rotateD.interpolate({ inputRange: [-1, 1], outputRange: ['-360deg', '360deg'] });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="none">
      <Animated.View style={[styles.center, { transform: [{ scale: scaleAnim }] }]}>
        
        {/* Inel 1 - 280x280 */}
        <Animated.View style={[ring(280, 2), {
          position: 'absolute',
          borderTopColor: ringColor,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: [{ rotate: spin1 }]
        }]} />
        
        {/* Inel 2 - 240x240 */}
        <Animated.View style={[ring(240, 3), {
          position: 'absolute',
          borderTopColor: ringColor,
          borderBottomColor: ringColor,
          borderRightColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: [{ rotate: spin2 }]
        }]} />

        {/* Layer 1: 12 Segments positioned on 240 ring */}
        {segmentAnims.map((anim, i) => (
          <Animated.View
            key={`seg-${i}`}
            style={[{
              position: 'absolute',
              width: 15,
              height: 4,
              backgroundColor: ringColor,
              borderRadius: 2,
              opacity: anim,
              transform: [
                { rotate: `${i * 30}deg` },
                { translateY: -120 }
              ]
            }]}
          />
        ))}
        
        {/* Inel 3 - 190x190 */}
        <Animated.View style={[ring(190, 2), {
          position: 'absolute',
          borderTopColor: ringColor,
          borderRightColor: ringColor,
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: [{ rotate: spin3 }]
        }]} />
        
        {/* Layer 2: 8 Particles (6x6) */}
        {particleAnims.map((anim, i) => {
           const tx = anim.interpolate({ inputRange: INPUT_RANGE, outputRange: TRAJECTORY.cosTable });
           const ty = anim.interpolate({ inputRange: INPUT_RANGE, outputRange: TRAJECTORY.sinTable });
           return (
             <Animated.View
               key={`part-${i}`}
               style={[{
                 position: 'absolute',
                 width: 6,
                 height: 6,
                 borderRadius: 3,
                 backgroundColor: ringColor,
                 transform: [{ translateX: tx }, { translateY: ty }]
               }]}
             />
           );
        })}
        
        {/* Inel 4 - 140x140 cu deformation pulse */}
        <Animated.View style={[ring(140, 1), {
          position: 'absolute',
          borderColor: ringColor,
          transform: [
            { rotate: spin4 },
            { scaleX: deformX },
            { scaleY: deformY }
          ],
          opacity: pulseOpacity
        }]} />
        
        {/* Core 80x80 */}
        <Animated.View style={[{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: ringColor + '26',
          borderWidth: 2, borderColor: ringColor,
          justifyContent: 'center', alignItems: 'center',
          transform: [{ scale: pulseCore }]
        }]}>
          <Animated.View style={[{
            width: 30, height: 30, borderRadius: 15,
            backgroundColor: ringColor + '99',
            transform: [{ scale: pulseInner }]
          }]} />
        </Animated.View>

        {/* Text complexity */}
        <Text style={{
          position: 'absolute',
          bottom: -85,
          color: ringColor,
          fontSize: 12,
          letterSpacing: 3,
          fontWeight: 'bold'
        }}>
          {complexity <= 2 ? 'PROCESEZ...' : 
           complexity <= 5 ? 'ANALIZEZ...' : 
           'CALCUL COMPLEX...'}
        </Text>

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
