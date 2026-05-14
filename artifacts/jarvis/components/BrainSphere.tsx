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

// Componentă separată pentru nodurile de memorie pentru a gestiona animațiile proprii
const EntryNode = ({ entry, index, total, color, onEntryPress, orbitAnim }: any) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Apariție graduală
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 50,
      useNativeDriver: true,
    }).start();

    // Pulsare continuă
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.9, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const baseAngle = (index * 2 * Math.PI) / total;
  
  // Rotație orbitală
  const rotateNode = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.entryNodeWrapper,
        {
          opacity: opacityAnim,
          transform: [
            { rotate: `${(baseAngle * 180) / Math.PI}deg` },
            { rotate: rotateNode },
            { translateY: -RADIUS - 30 },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onEntryPress(entry)}
        style={[styles.entryNode, { backgroundColor: color }]}
      />
    </Animated.View>
  );
};

export default function BrainSphere({ lobes, activeLobe, onLobePress, entries, onEntryPress }: BrainSphereProps) {
  const rotationY = useRef(new Animated.Value(0)).current;
  const sphereScale = useRef(new Animated.Value(1)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  
  // Auto-rotație continuă 30s
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
    } else {
      autoRotate.current?.stop();
      Animated.timing(sphereScale, { toValue: 0.85, duration: 500, useNativeDriver: true }).start();
    }
  }, [activeLobe]);

  // Animație orbitală pentru noduri
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
    } else {
      orbitAnim.setValue(0);
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

  const renderLobe = (lobe: LobeInfo, index: number) => {
    const angleOffset = (index * 2 * Math.PI) / lobes.length;
    const isActive = activeLobe === lobe.id;
    
    // Calculăm poziția folosind direct rotationY (0-1)
    // Folosim o logică de interpolare care simulează 3D pe X și Z
    const translateX = rotationY.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        RADIUS * Math.sin(angleOffset),
        RADIUS * Math.sin(angleOffset + Math.PI / 2),
        RADIUS * Math.sin(angleOffset + Math.PI),
        RADIUS * Math.sin(angleOffset + 3 * Math.PI / 2),
        RADIUS * Math.sin(angleOffset + 2 * Math.PI),
      ],
    });

    const scale = rotationY.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        0.7 + 0.3 * Math.cos(angleOffset),
        0.7 + 0.3 * Math.cos(angleOffset + Math.PI / 2),
        0.7 + 0.3 * Math.cos(angleOffset + Math.PI),
        0.7 + 0.3 * Math.cos(angleOffset + 3 * Math.PI / 2),
        0.7 + 0.3 * Math.cos(angleOffset + 2 * Math.PI),
      ],
    });

    const opacity = rotationY.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        0.5 + 0.5 * Math.cos(angleOffset),
        0.5 + 0.5 * Math.cos(angleOffset + Math.PI / 2),
        0.5 + 0.5 * Math.cos(angleOffset + Math.PI),
        0.5 + 0.5 * Math.cos(angleOffset + 3 * Math.PI / 2),
        0.5 + 0.5 * Math.cos(angleOffset + 2 * Math.PI),
      ],
    });

    // Z-Index trebuie să fie întreg, deci folosim un transform sau o valoare discretă dacă e posibil, 
    // dar React Native nu suportă interpolare de zIndex cu native driver.
    // Soluție: Lobii sunt mereu deasupra sferei prin structura View.
    
    return (
      <Animated.View
        key={lobe.id}
        style={[
          styles.lobeWrapper,
          {
            opacity,
            transform: [
              { translateX },
              { scale },
            ],
            // Folosim o logică simplă: dacă scale > 0.8 e în față
            zIndex: isActive ? 200 : 100, 
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
        <Text style={[styles.lobeCounter, { color: lobe.color }]}>
          {lobe.count}/{lobe.max}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Glow de fundal */}
      <View style={styles.sphereBackdrop} />
      
      <Animated.View style={[styles.sphere, { transform: [{ scale: sphereScale }] }]}>
        {/* Linii HUD */}
        <View style={styles.hudLines} />
        
        {/* Lobii creierului */}
        {lobes.map((lobe, i) => renderLobe(lobe, i))}
        
        {/* Nucleu central (mereu în spate sau mijloc) */}
        <View style={styles.core}>
           <View style={styles.coreInner} />
        </View>
      </Animated.View>

      {/* Nodurile de memorie (apar doar când un lob e activ) */}
      {activeLobe && entries.slice(0, 15).map((entry, i) => (
        <EntryNode 
          key={entry.id}
          entry={entry}
          index={i}
          total={Math.min(entries.length, 15)}
          color={lobes.find(l => l.id === activeLobe)?.color || '#fff'}
          onEntryPress={onEntryPress}
          orbitAnim={orbitAnim}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  sphere: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sphereBackdrop: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
  },
  hudLines: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  activeLobeGlow: {
    shadowRadius: 20,
    shadowOpacity: 1,
    borderColor: '#fff',
    borderWidth: 3,
  },
  lobeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 2,
  },
  lobeCounter: {
    fontSize: 9,
    marginTop: 6,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  core: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(10, 20, 30, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00f0ff',
    shadowRadius: 15,
    shadowOpacity: 0.5,
    zIndex: 1,
  },
  coreInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowRadius: 10,
    shadowOpacity: 0.8,
  },
  entryNodeWrapper: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  entryNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 10,
  },
});
