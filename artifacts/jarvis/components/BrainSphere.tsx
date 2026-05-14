import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RADIUS = 110;

interface LobeInfo {
  id: string;
  name: string;
  color: string;
  count: number;
  max: number;
}

interface BrainSphereProps {
  lobes: LobeInfo[];
  activeLobe: string | null;
  onLobePress: (id: string) => void;
  entries: any[];
  onEntryPress: (entry: any) => void;
}

export default function BrainSphere({ lobes, activeLobe, onLobePress, entries, onEntryPress }: BrainSphereProps) {
  // Rotație continuă (0 la 1)
  const rotationY = useRef(new Animated.Value(0)).current;
  const sphereScale = useRef(new Animated.Value(1)).current;
  const nodeOpacity = useRef(new Animated.Value(0)).current;

  // Auto-rotație: 30s per rotație completă
  const autoRotate = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!activeLobe) {
      autoRotate.current = Animated.loop(
        Animated.timing(rotationY, {
          toValue: 1,
          duration: 30000,
          easing: Easing.linear,
          useNativeDriver: false, // Folosim false pentru interpolări de poziție complexe
        })
      );
      autoRotate.current.start();
      
      Animated.timing(sphereScale, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      Animated.timing(nodeOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    } else {
      autoRotate.current?.stop();
      Animated.timing(sphereScale, { toValue: 0.8, duration: 500, useNativeDriver: true }).start();
      Animated.timing(nodeOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [activeLobe]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !activeLobe,
      onPanResponderMove: (_, gestureState) => {
        const val = (gestureState.moveX / SCREEN_WIDTH);
        rotationY.setValue(val % 1);
      },
      onPanResponderRelease: () => {
        if (!activeLobe) {
          autoRotate.current?.start();
        }
      },
    })
  ).current;

  // Animație orbitală pentru nodurile de memorie
  const orbitAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (activeLobe) {
      Animated.loop(
        Animated.timing(orbitAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      orbitAnim.setValue(0);
    }
  }, [activeLobe]);

  const renderLobe = (lobe: LobeInfo, index: number) => {
    const angleOffset = (index * 2 * Math.PI) / lobes.length;
    const isActive = activeLobe === lobe.id;
    
    // Calculăm poziția pe cerc folosind interpolare
    // theta = (rotationY * 2*PI) + offset
    const theta = rotationY.interpolate({
      inputRange: [0, 1],
      outputRange: [angleOffset, angleOffset + 2 * Math.PI],
    });

    const translateX = theta.interpolate({
      inputRange: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI],
      outputRange: [0, RADIUS, 0, -RADIUS, 0],
    });

    const scale = theta.interpolate({
      inputRange: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI],
      outputRange: [1, 0.8, 0.6, 0.8, 1], // Efect de adâncime
    });

    const zIndex = theta.interpolate({
      inputRange: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI],
      outputRange: [100, 50, 10, 50, 100],
    });

    const opacity = theta.interpolate({
      inputRange: [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI],
      outputRange: [1, 0.7, 0.4, 0.7, 1],
    });

    return (
      <Animated.View
        key={lobe.id}
        style={[
          styles.lobeWrapper,
          {
            zIndex,
            opacity,
            transform: [
              { translateX },
              { scale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onLobePress(lobe.id)}
          activeOpacity={0.7}
          style={[
            styles.lobe,
            { backgroundColor: lobe.color, borderColor: '#fff' },
            isActive && styles.activeLobeGlow,
          ]}
        >
          <Text style={styles.lobeText}>{lobe.name.substring(0, 3).toUpperCase()}</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.lobeCounter, { color: lobe.color }]}>
          {lobe.count}/{lobe.max}
        </Animated.Text>
      </Animated.View>
    );
  };

  const renderEntryNode = (entry: any, index: number) => {
    const total = Math.min(entries.length, 12);
    if (index >= total) return null;

    const baseAngle = (index * 2 * Math.PI) / total;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }, []);

    const spinNode = orbitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={entry.id}
        style={[
          styles.entryNodeWrapper,
          {
            opacity: nodeOpacity,
            transform: [
              { rotate: `${(baseAngle * 180) / Math.PI}deg` }, // Poziția inițială pe cerc
              { rotate: spinNode }, // Rotația orbitală
              { translateY: -150 }, // Distanța de la centru
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onEntryPress(entry)}
          style={[
            styles.entryNode, 
            { backgroundColor: lobes.find(l => l.id === activeLobe)?.color || '#fff' }
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Glow de fundal pentru sferă */}
      <View style={[styles.sphereBackdrop, { zIndex: 0 }]} />
      
      <Animated.View style={[styles.sphere, { transform: [{ scale: sphereScale }], zIndex: 1 }]}>
        {/* Linii HUD circulare */}
        <View style={styles.hudLines} />
        
        {lobes.map((lobe, i) => renderLobe(lobe, i))}
        
        {/* Nucleul central al creierului */}
        <View style={[styles.core, { zIndex: 5 }]}>
           <View style={styles.coreInner} />
        </View>
      </Animated.View>

      {/* Intrări orbitale care apar la selecția unui lob */}
      {activeLobe && entries.map((entry, i) => renderEntryNode(entry, i))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sphere: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sphereBackdrop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
  },
  hudLines: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  lobeWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 80,
  },
  lobe: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  activeLobeGlow: {
    shadowRadius: 15,
    shadowOpacity: 0.8,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  lobeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
  lobeCounter: {
    fontSize: 8,
    marginTop: 4,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  core: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(5, 13, 20, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00f0ff',
    shadowRadius: 10,
    shadowOpacity: 0.4,
  },
  coreInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.6)',
  },
  entryNodeWrapper: {
    position: 'absolute',
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowRadius: 6,
    shadowOpacity: 0.8,
    elevation: 5,
  },
});

