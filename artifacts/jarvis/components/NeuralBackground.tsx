import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Props {
  intensity: 'idle' | 'thinking' | 'recall';
}

const NODES_COUNT = 14;
const CONNECTIVITY = 0.25; // Procentaj de conexiuni

// Generăm nodurile o singură dată (pe mount)
const nodes = Array.from({ length: NODES_COUNT }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
}));

// Generăm conexiunile între nodurile apropiate
const connections: [number, number][] = [];
for (let i = 0; i < NODES_COUNT; i++) {
  for (let j = i + 1; j < NODES_COUNT; j++) {
    const dist = Math.sqrt((nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2);
    if (dist < width / 2.5) {
      connections.push([i, j]);
    }
  }
}

const NodePulse = ({ x, y, intensity }: { x: number, y: number, intensity: Props['intensity'] }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    const duration = intensity === 'thinking' ? 4000 : 8000;
    const moveX = (Math.random() - 0.5) * 50;
    const moveY = (Math.random() - 0.5) * 50;
    
    scale.value = withRepeat(withTiming(1.05, { duration: duration / 4, easing: Easing.inOut(Easing.ease) }), -1, true);
    opacity.value = withRepeat(withTiming(0.6, { duration: duration / 4, easing: Easing.inOut(Easing.ease) }), -1, true);
    translateX.value = withRepeat(withTiming(moveX, { duration, easing: Easing.linear }), -1, true);
    translateY.value = withRepeat(withTiming(moveY, { duration, easing: Easing.linear }), -1, true);
  }, [intensity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.node, { left: x - 4, top: y - 4 }, style]}>
      <Svg width={8} height={8}>
        <Circle cx={4} cy={4} r={4} fill="#00d4ff" />
      </Svg>
    </Animated.View>
  );
};

export default function NeuralBackground({ intensity }: Props) {
  const opacity = useSharedValue(0.15);
  React.useEffect(() => {
    opacity.value = withTiming(intensity === 'thinking' ? 0.6 : 0.2, { duration: 500 });
  }, [intensity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, containerStyle]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
            <RadialGradient id="pulse">
                <Stop offset="0" stopColor="#fff" stopOpacity="0.8" />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
            </RadialGradient>
        </Defs>
        {connections.map(([i, j], idx) => (
          <Line
            key={idx}
            x1={nodes[i].x}
            y1={nodes[i].y}
            x2={nodes[j].x}
            y2={nodes[j].y}
            stroke="#00ffff"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
        ))}
      </Svg>
      {nodes.map((n, i) => (
        <NodePulse key={i} x={n.x} y={n.y} intensity={intensity} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4ff',
  },
});
