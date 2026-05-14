import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const rotationY = useRef(new Animated.Value(0)).current;
  const sphereScale = useRef(new Animated.Value(1)).current;
  const nodeOpacity = useRef(new Animated.Value(0)).current;

  // Auto-rotation
  const autoRotate = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!activeLobe) {
      autoRotate.current = Animated.loop(
        Animated.timing(rotationY, {
          toValue: 1,
          duration: 30000,
          easing: Easing.linear,
          useNativeDriver: true,
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

  const spinY = rotationY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Orbital Nodes Animation
  const orbitAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (activeLobe) {
      Animated.loop(
        Animated.timing(orbitAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [activeLobe]);

  const renderLobe = (lobe: LobeInfo, index: number) => {
    const angle = (index * 360) / lobes.length;
    const isActive = activeLobe === lobe.id;
    
    // Position lobes in a "3D" circle
    const rotateLobe = rotationY.interpolate({
      inputRange: [0, 1],
      outputRange: [`${angle}deg`, `${angle + 360}deg`],
    });

    return (
      <Animated.View
        key={lobe.id}
        style={[
          styles.lobeWrapper,
          {
            transform: [
              { rotateY: rotateLobe },
              { perspective: 200 }, // Simulated depth via perspective

              { perspective: 1000 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onLobePress(lobe.id)}
          style={[
            styles.lobe,
            { backgroundColor: lobe.color, borderColor: lobe.color },
            isActive && styles.activeLobeGlow,
          ]}
        >
          <Text style={styles.lobeText}>{lobe.name.substring(0, 3).toUpperCase()}</Text>
        </TouchableOpacity>
        <Text style={[styles.lobeCounter, { color: lobe.color }]}>
          {lobe.count}/{lobe.max}
        </Text>
      </Animated.View>
    );
  };

  const renderEntryNode = (entry: any, index: number) => {
    const total = Math.min(entries.length, 12);
    if (index >= total) return null;

    const angle = (index * 360) / total;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.85, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }, []);

    const rotationNode = orbitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${angle}deg`, `${angle + 360}deg`],
    });

    return (
      <Animated.View
        key={entry.id}
        style={[
          styles.entryNodeWrapper,
          {
            opacity: nodeOpacity,
            transform: [
              { rotate: rotationNode },
              { translateY: -160 },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onEntryPress(entry)}
          style={[styles.entryNode, { backgroundColor: lobes.find(l => l.id === activeLobe)?.color || '#fff' }]}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Central Sphere Glow */}
      <View style={styles.sphereBackdrop} />
      
      <Animated.View style={[styles.sphere, { transform: [{ scale: sphereScale }] }]}>
        {/* Connection Lines (HUD effect) */}
        <View style={styles.hudLines} />
        
        {lobes.map((lobe, i) => renderLobe(lobe, i))}
        
        {/* Brain Core */}
        <View style={styles.core}>
           <View style={styles.coreInner} />
        </View>
      </Animated.View>

      {/* Orbital Entries */}
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
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
  },
  hudLines: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  lobeWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  lobe: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  activeLobeGlow: {
    shadowRadius: 20,
    shadowOpacity: 1,
    borderWidth: 3,
    borderColor: '#fff',
  },
  lobeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  lobeCounter: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  core: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  entryNodeWrapper: {
    position: 'absolute',
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#fff',
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
});
