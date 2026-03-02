import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withRepeat, 
  withTiming, 
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { useThemeStore } from '../store/themeStore';
import Svg, { Path, RadialGradient, Defs, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// --- 3D MATH HELPERS (Worklets) ---
const rotateX = (p: any, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x,
    y: p.y * cos - p.z * sin,
    z: p.y * sin + p.z * cos
  };
};

const rotateY = (p: any, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x * cos + p.z * sin,
    y: p.y,
    z: -p.x * sin + p.z * cos
  };
};

const rotateZ = (p: any, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
    z: p.z
  };
};

const project = (p: any, size: number) => {
  'worklet';
  const fov = 300;
  const distance = 2.5;
  const scale = fov / (fov + p.z + distance);
  return {
    x: p.x * scale * size + width / 2,
    y: p.y * scale * size + height / 2,
    z: p.z
  };
};

// --- LINE COMPONENT ---
const TesseractLine = ({ idx1, idx2, vertices, angleX, angleY, angleZ, color, size }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const v1 = vertices[idx1];
    const v2 = vertices[idx2];

    // Rotasyonlar
    let r1 = rotateX(v1, angleX.value);
    r1 = rotateY(r1, angleY.value);
    r1 = rotateZ(r1, angleZ.value);
    const p1 = project(r1, size);

    let r2 = rotateX(v2, angleX.value);
    r2 = rotateY(r2, angleY.value);
    r2 = rotateZ(r2, angleZ.value);
    const p2 = project(r2, size);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const avgZ = (p1.z + p2.z) / 2;

    return {
      width: length,
      height: 1.5,
      backgroundColor: color,
      position: 'absolute',
      left: (p1.x + p2.x) / 2 - length / 2,
      top: (p1.y + p2.y) / 2 - 0.75,
      transform: [{ rotate: `${angle}rad` }],
      opacity: interpolate(avgZ, [-1.5, 1.5], [0.8, 0.1]),
    };
  });

  return <Animated.View style={animatedStyle} />;
};

// --- TESSERACT SYSTEM ---
const Tesseract4D = () => {
  const { colors } = useTheme();
  const angleX = useSharedValue(0);
  const angleY = useSharedValue(0);
  const angleZ = useSharedValue(0);

  useEffect(() => {
    angleX.value = withRepeat(withTiming(Math.PI * 2, { duration: 15000, easing: Easing.linear }), -1, false);
    angleY.value = withRepeat(withTiming(Math.PI * 2, { duration: 20000, easing: Easing.linear }), -1, false);
    angleZ.value = withRepeat(withTiming(Math.PI * 2, { duration: 25000, easing: Easing.linear }), -1, false);
  }, []);

  // 16 Köşeli HyperCube (Tesseract)
  const vertices = useMemo(() => {
    const v = [];
    // Outer Cube (+-1)
    for (let i = 0; i < 8; i++) {
      v.push({ x: (i & 1) ? 1 : -1, y: (i & 2) ? 1 : -1, z: (i & 4) ? 1 : -1 });
    }
    // Inner Cube (+-0.5)
    for (let i = 0; i < 8; i++) {
      v.push({ x: (i & 1) ? 0.5 : -0.5, y: (i & 2) ? 0.5 : -0.5, z: (i & 4) ? 0.5 : -0.5 });
    }
    return v;
  }, []);

  const edges = useMemo(() => {
    const e = [];
    // Outer Cube Edges
    const cubeEdges = [[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[3,7],[2,6]];
    cubeEdges.forEach(([i1, i2]) => e.push([i1, i2]));
    // Inner Cube Edges (offset by 8)
    cubeEdges.forEach(([i1, i2]) => e.push([i1 + 8, i2 + 8]));
    // Connecting Edges
    for (let i = 0; i < 8; i++) e.push([i, i + 8]);
    return e;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {edges.map((edge, i) => (
        <TesseractLine 
          key={i} 
          idx1={edge[0]} 
          idx2={edge[1]} 
          vertices={vertices} 
          angleX={angleX} 
          angleY={angleY} 
          angleZ={angleZ} 
          color={colors.primary}
          size={75}
        />
      ))}
    </View>
  );
};

// --- DIĞER EFEKTLER (Shapes, Particles, Aura, Atomic) ---

const AtomicOrbit = ({ size, color, opacity, rx, ry, rotation, pulse, speedFactor = 1 }: any) => {
  const r = size / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = useSharedValue(0);
  useEffect(() => { dashOffset.value = withRepeat(withTiming(circ, { duration: 3000 / Math.abs(speedFactor), easing: Easing.linear }), -1, false); }, []);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ perspective: 1200 }, { rotateX: rx }, { rotateY: ry }, { rotateZ: `${rotation.value * speedFactor}deg` }], opacity: 0.3 + (pulse.value * 0.4) }));
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const animatedPathProps = useAnimatedProps(() => ({ strokeDashoffset: dashOffset.value }));
  return (
    <Animated.View style={[styles.ringsOverlay, animatedStyle]}>
      <Svg width={size + 20} height={size + 20} viewBox={`0 0 ${size + 20} ${size + 20}`}>
        <Circle cx={(size + 20) / 2} cy={(size + 20) / 2} r={r} stroke={color} strokeWidth={1} fill="none" opacity={opacity * 0.3} />
        <AnimatedCircle cx={(size + 20) / 2} cy={(size + 20) / 2} r={r} stroke={color} strokeWidth={2} fill="none" strokeDasharray={`${circ * 0.2} ${circ * 0.8}`} animatedProps={animatedPathProps} />
        <Circle cx={(size + 20) / 2 + r} cy={(size + 20) / 2} r={4} fill={color} />
      </Svg>
    </Animated.View>
  );
};

const AtomicSystem = () => {
  const { colors } = useTheme();
  const nucleusGradId = useMemo(() => `nuc-${Math.random()}`, []);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0.4);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 25000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  return (
    <View style={styles.saturnContainer}>
      <View style={[styles.saturnGroup, { top: height / 2 - 80 }]}>
        <AtomicOrbit size={width * 0.85} color={colors.primary} opacity={0.6} rx="70deg" ry="0deg" rotation={rotation} pulse={pulse} speedFactor={1.2} />
        <AtomicOrbit size={width * 0.85} color={colors.secondary} opacity={0.5} rx="70deg" ry="60deg" rotation={rotation} pulse={pulse} speedFactor={-1.5} />
        <AtomicOrbit size={width * 0.85} color={colors.primary} opacity={0.4} rx="70deg" ry="120deg" rotation={rotation} pulse={pulse} speedFactor={1.8} />
        <Animated.View style={[styles.planetCore, { opacity: pulse.value }]}>
          <Svg width={180} height={180} viewBox="0 0 100 100">
            <Defs><RadialGradient id={nucleusGradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor="white" stopOpacity="1" /><Stop offset="50%" stopColor={colors.primary} stopOpacity="0.8" /><Stop offset="100%" stopColor={colors.primary} stopOpacity="0" /></RadialGradient></Defs>
            <Circle cx="50" cy="50" r="48" fill={`url(#${nucleusGradId})`} />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

const IsometricCube = ({ size = 100, initialX = 0, initialY = 0, delay = 0, duration = 15000 }) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false)); }, []);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: initialX }, { translateY: initialY + Math.sin(progress.value * Math.PI * 2) * 30 }, { rotate: `${progress.value * 360}deg` }] }));
  return (
    <Animated.View style={[styles.cubeWrapper, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d="M50 20 L80 35 L50 50 L20 35 Z" fill={colors.primary} opacity={0.12} /><Path d="M50 50 L80 35 L80 65 L50 80 Z" fill={colors.primary} opacity={0.08} /><Path d="M50 50 L20 35 L20 65 L50 80 Z" fill={colors.primary} opacity={0.04} />
      </Svg>
    </Animated.View>
  );
};

const FloatingParticle = ({ index }: { index: number }) => {
  const { colors } = useTheme();
  const tx = useSharedValue(Math.random() * width);
  const ty = useSharedValue(Math.random() * height);
  const opacity = useSharedValue(0.2 + Math.random() * 0.5);
  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 15000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 15000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
    opacity.value = withRepeat(withTiming(0.1, { duration: 2000 + Math.random() * 3000 }), -1, true);
  }, []);
  return <Animated.View style={[styles.particle, { backgroundColor: colors.primary }, useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 }], opacity: opacity.value }))] } />;
};

const AuraOrb = ({ delay = 0, initialX = 0, initialY = 0, size = 400, color = '#fff' }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `grad-${Math.random()}`, []);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withTiming(1.4, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.35, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, []);
  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size, left: initialX, top: initialY }, useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
};

export const BackgroundEffects = () => {
  const { colors } = useTheme();
  const { backgroundEffect } = useThemeStore();
  const cubes = useMemo(() => [...Array(10)].map((_, i) => ({ id: i, size: 60 + Math.random() * 120, x: (Math.random() * width) - 50, y: (Math.random() * height) - 50, delay: i * 800, duration: 15000 + Math.random() * 10000 })), []);

  if (backgroundEffect === 'none') return null;
  if (backgroundEffect === 'particles') return <View style={StyleSheet.absoluteFill} pointerEvents="none">{[...Array(15)].map((_, i) => <FloatingParticle key={i} index={i} />)}</View>;
  if (backgroundEffect === 'waves') return <View style={StyleSheet.absoluteFill} pointerEvents="none"><AuraOrb color={colors.primary} initialX={-100} initialY={-100} size={width * 1.2} delay={0} /><AuraOrb color={colors.secondary} initialX={width * 0.2} initialY={height * 0.5} size={width} delay={2000} /></View>;
  if (backgroundEffect === ('crystals' as any)) return <View style={StyleSheet.absoluteFill} pointerEvents="none"><AtomicSystem /></View>;
  if (backgroundEffect === ('tesseract' as any)) return <View style={StyleSheet.absoluteFill} pointerEvents="none"><Tesseract4D /></View>;

  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{cubes.map(cube => <IsometricCube key={cube.id} size={cube.size} initialX={cube.x} initialY={cube.y} delay={cube.delay} duration={cube.duration} />)}</View>;
};

const styles = StyleSheet.create({
  cubeWrapper: { position: 'absolute' },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  auraOrb: { position: 'absolute' },
  saturnContainer: { ...StyleSheet.absoluteFillObject },
  saturnGroup: { width: width, alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  ringsOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  planetCore: { zIndex: 10 },
});
