import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
  SharedValue
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { useThemeStore } from '../store/themeStore';
import Svg, { Path, RadialGradient, Defs, Stop, Circle, G, Line, Rect, LinearGradient, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cubeWrapper: { position: 'absolute' },
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  auraOrb: { position: 'absolute' },
  saturnContainer: { ...StyleSheet.absoluteFillObject },
  saturnGroup: { width: width, alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  ringsOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  planetCore: { zIndex: 10 },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  matrixColumn: { position: 'absolute', width: 6, alignItems: 'center' },
  matrixBit: { width: 4, marginBottom: 2, borderRadius: 2 },
  vortexContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  gridContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  gridInner: { width: width * 2, height: height * 1.5 },
  rainDrop: { position: 'absolute', width: 2, height: 40, borderRadius: 1 },
});

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// --- 3D MATH HELPERS (Worklets) ---
const rotateX = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x,
    y: p.y * cos - p.z * sin,
    z: p.y * sin + p.z * cos
  };
};

const rotateY = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x * cos + p.z * sin,
    y: p.y,
    z: -p.x * sin + p.z * cos
  };
};

const rotateZ = (p: Point3D, theta: number) => {
  'worklet';
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
    z: p.z
  };
};

const project = (p: Point3D, size: number) => {
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
interface TesseractLineProps {
  idx1: number;
  idx2: number;
  vertices: Point3D[];
  angleX: SharedValue<number>;
  angleY: SharedValue<number>;
  angleZ: SharedValue<number>;
  color: string;
  size: number;
}

const WireframeLine = ({ idx1, idx2, vertices, angleX, angleY, angleZ, color, size }: TesseractLineProps) => {
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
      height: 4, // Much thicker for wireframe visibility
      backgroundColor: color,
      position: 'absolute',
      left: (p1.x + p2.x) / 2 - length / 2,
      top: (p1.y + p2.y) / 2 - 2,
      transform: [{ rotate: `${angle}rad` }],
      opacity: interpolate(avgZ, [-1.5, 1.5], [1, 0.4]), // Better visibility
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10, // Glow effect
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
  }, [angleX, angleY, angleZ]);

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
    const cubeEdges = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [3, 7], [2, 6]];
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
        <WireframeLine
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

interface AtomicOrbitProps {
  size: number;
  color: string;
  opacity: number;
  rx: string;
  ry: string;
  rotation: SharedValue<number>;
  pulse: SharedValue<number>;
  speedFactor?: number;
}

const AtomicOrbit = ({ size, color, opacity, rx, ry, rotation, pulse, speedFactor = 1 }: AtomicOrbitProps) => {
  const r = size / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = useSharedValue(0);
  useEffect(() => { dashOffset.value = withRepeat(withTiming(circ, { duration: 3000 / Math.abs(speedFactor), easing: Easing.linear }), -1, false); }, [circ, dashOffset, speedFactor]);
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
  }, [rotation, pulse]);
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

// --- DREAMSCAPE BOKEH (SOFT ORBS) SYSTEM ---
const BokehOrb = ({ color, size, delay }: { color: string, size: number, delay: number }) => {
  const tx = useSharedValue(Math.random() * width);
  const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.2);
  const gradId = useMemo(() => `bokeh-grad-${Math.random()}`, []);

  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 15000 + Math.random() * 5000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scale.value = withDelay(delay, withRepeat(withTiming(1.6, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.4, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay, tx, ty, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value - size / 2 }, { translateY: ty.value - size / 2 }, { scale: scale.value }],
    opacity: opacity.value
  }));

  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} />
      </Svg>
    </Animated.View>
  );
};

const DreamscapeBokehSystem = () => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <BokehOrb color={colors.primary} size={width * 1.5} delay={0} />
      <BokehOrb color={colors.secondary || colors.primary} size={width * 1.2} delay={2000} />
      <BokehOrb color={colors.primary} size={width * 1.3} delay={4000} />
      <BokehOrb color={colors.info || colors.primary} size={width * 1.1} delay={6000} />
    </View>
  );
};

// --- QUANTUM DUST (GLOWING COSMOS) SYSTEM ---
const QuantumParticle = ({ cloudX, cloudY, index, color }: { cloudX: SharedValue<number>, cloudY: SharedValue<number>, index: number, color: string }) => {
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);
  const dist = useMemo(() => 50 + Math.random() * 80, []);
  const size = useMemo(() => 2 + Math.random() * 1.5, []);
  const pulse = useSharedValue(0.2 + Math.random() * 0.4);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500 + Math.random() * 2500, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const orbitSpeed = (Date.now() / 4000) + (index * 0.15);
    const tx = cloudX.value + Math.cos(angle + orbitSpeed) * dist;
    const ty = cloudY.value + Math.sin(angle + orbitSpeed) * dist;

    return {
      transform: [{ translateX: tx }, { translateY: ty }, { scale: pulse.value }],
      opacity: pulse.value * 0.8,
      backgroundColor: color,
      shadowColor: color,
      shadowRadius: 4,
      shadowOpacity: 0.6,
    };
  });

  return <Animated.View style={[styles.particle, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]} />;
};

const QuantumCloud = ({ color }: { color: string }) => {
  const cloudX = useSharedValue(Math.random() * width);
  const cloudY = useSharedValue(Math.random() * height);

  useEffect(() => {
    cloudX.value = withRepeat(withTiming(Math.random() * width, { duration: 20000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
    cloudY.value = withRepeat(withTiming(Math.random() * height, { duration: 20000 + Math.random() * 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  return (
    <>
      {[...Array(25)].map((_, i) => <QuantumParticle key={i} index={i} cloudX={cloudX} cloudY={cloudY} color={color} />)}
    </>
  );
};

const QuantumDustSystem = () => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <QuantumCloud color={colors.primary} />
      <QuantumCloud color={colors.secondary || colors.primary} />
      <QuantumCloud color="#FFD700" />
      <QuantumCloud color={colors.primary} />
    </View>
  );
};

const AuraOrb = ({ delay = 0, initialX = 0, initialY = 0, size = 400, color = '#fff' }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `grad-${Math.random()}`, []);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withTiming(1.4, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true));
    opacity.value = withDelay(delay, withRepeat(withTiming(0.35, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay, opacity, scale]);
  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size, left: initialX, top: initialY }, useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }))]}>
      <Svg width={size} height={size}><Defs><RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%"><Stop offset="0%" stopColor={color} stopOpacity="1" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></RadialGradient></Defs><Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} /></Svg>
    </Animated.View>
  );
};

const AuroraLight = ({ color, duration = 20000 }: { color: string, duration?: number }) => {
  const tx = useSharedValue(Math.random() * width);
  const ty = useSharedValue(Math.random() * height);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.15);
  const gradId = useMemo(() => `aurora-${Math.random()}`, []);

  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: duration + Math.random() * 8000, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: duration + Math.random() * 8000, easing: Easing.inOut(Easing.sin) }), -1, true);
    scale.value = withRepeat(withTiming(1.6 + Math.random() * 0.4, { duration: duration / 1.5, easing: Easing.inOut(Easing.sin) }), -1, true);
    opacity.value = withRepeat(withTiming(0.35, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [tx, ty, scale, opacity, duration]);

  const size = width * 1.8;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value - size / 2 },
      { translateY: ty.value - size / 2 },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.auraOrb, { width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradId})`} />
      </Svg>
    </Animated.View>
  );
};

const AuroraEffect = () => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <AuroraLight color={colors.primary} />
      <AuroraLight color={colors.secondary || colors.primary} />
      <AuroraLight color={colors.info || colors.primary} />
      <AuroraLight color={colors.primary} />
    </View>
  );
};

// --- MATRIX RAIN ---
const MatrixColumn = ({ x, delay, color }: { x: number, delay: number, color: string }) => {
  const ty = useSharedValue(-height * 0.5);
  const gradId = useMemo(() => `matrix-grad-${Math.random()}`, []);

  useEffect(() => {
    ty.value = withDelay(delay, withRepeat(withTiming(height * 1.5, { duration: 4000 + Math.random() * 3000, easing: Easing.linear }), -1, false));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x }, { translateY: ty.value }],
    opacity: interpolate(ty.value, [-height * 0.5, height * 0.8, height * 1.5], [0, 1, 0]),
  }));

  const colWidth = 6;
  const colHeight = height * 0.4;

  return (
    <Animated.View style={[styles.matrixColumn, animatedStyle, { width: colWidth, height: colHeight }]}>
      <Svg width={colWidth} height={colHeight}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0" />
            <Stop offset="0.8" stopColor={color} stopOpacity="0.6" />
            <Stop offset="1" stopColor={color} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={colWidth} height={colHeight} fill={`url(#${gradId})`} rx={colWidth / 2} />
      </Svg>
    </Animated.View>
  );
};

const MatrixRain = () => {
  const { colors } = useTheme();
  const columns = useMemo(() => {
    const count = 15;
    return [...Array(count)].map((_, i) => ({
      id: i,
      x: (width / count) * i + (Math.random() * (width / count / 2)),
      delay: Math.random() * 4000
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {columns.map(col => <MatrixColumn key={col.id} x={col.x} delay={col.delay} color={colors.primary} />)}
    </View>
  );
};

// --- VORTEX SYSTEM ---
const VortexRing = ({ radius, color, speed, index }: { radius: number, color: string, speed: number, index: number }) => {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: speed, easing: Easing.linear }), -1, false);
  }, [speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: 0.1 + (Math.sin(rotation.value * (Math.PI / 180)) * 0.1),
  }));

  const strokeDash = useMemo(() => `${radius * (0.2 + Math.random() * 0.5)} ${radius * 2}`, [radius]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <Svg width={radius * 2.2} height={radius * 2.2} viewBox={`0 0 ${radius * 2.2} ${radius * 2.2}`}>
        <Circle
          cx={radius * 1.1}
          cy={radius * 1.1}
          r={radius}
          stroke={color}
          strokeWidth={2 + index}
          fill="none"
          strokeDasharray={strokeDash}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};

const VortexSystem = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.vortexContainer}>
      {[...Array(8)].map((_, i) => (
        <VortexRing
          key={i}
          index={i}
          radius={50 + (i * 35)}
          color={i % 2 === 0 ? colors.primary : colors.secondary || colors.primary}
          speed={8000 + (i * 3000)}
        />
      ))}
    </View>
  );
};

// --- CYBER GRID ---
const CyberGrid = () => {
  const { colors } = useTheme();
  const move = useSharedValue(0);

  useEffect(() => {
    move.value = withRepeat(withTiming(60, { duration: 3000, easing: Easing.linear }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: '70deg' },
      { translateY: move.value }
    ],
    opacity: 0.3,
  }));

  const gridPath = useMemo(() => {
    let p = "";
    // Horizontal Lines
    for (let i = 0; i < 25; i++) {
      const y = i * 60;
      p += `M0 ${y} L${width * 2} ${y} `;
    }
    // Vertical Lines
    const stepX = (width * 2) / 15;
    for (let i = 0; i < 16; i++) {
      const x = i * stepX;
      p += `M${x} 0 L${x} ${height * 1.5} `;
    }
    return p;
  }, []);

  return (
    <View style={styles.gridContainer}>
      <Animated.View style={[styles.gridInner, animatedStyle]}>
        <Svg
          width={width * 2}
          height={height * 1.5}
          viewBox={`0 0 ${width * 2} ${height * 1.5}`}
        >
          <Path
            d={gridPath}
            stroke={colors.primary}
            strokeWidth={1.5}
            opacity={0.4}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const DynamicParticle = ({ el }: { el: any }) => {
  const tx = useSharedValue(el.x);
  const ty = useSharedValue(el.y);

  useEffect(() => {
    tx.value = withRepeat(withTiming(Math.random() * width, { duration: 10000 / el.speed, easing: Easing.inOut(Easing.sin) }), -1, true);
    ty.value = withRepeat(withTiming(Math.random() * height, { duration: 10000 / el.speed, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [tx, ty, el.speed]);

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: el.color, width: el.size, height: el.size, borderRadius: el.size / 2 },
        useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }))
      ]}
    />
  );
};

const DynamicShape = ({ el, opacity, type }: { el: any, opacity: number, type: 'triangle' | 'square' }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: (type === 'square' ? 8000 : 5000) / el.speed, easing: Easing.linear }), -1, false);
  }, [rotation, el.speed, type]);

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: el.x, top: el.y },
        useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }))
      ]}
    >
      <Svg width={el.size} height={el.size} viewBox="0 0 100 100">
        {type === 'triangle' ? (
          <Path d="M50 0 L100 100 L0 100 Z" fill={el.color} opacity={opacity} />
        ) : (
          <Path d="M20 20 H80 V80 H20 Z" fill={el.color} opacity={opacity} />
        )}
      </Svg>
    </Animated.View>
  );
};

const DynamicCircle = ({ el, opacity }: { el: any, opacity: number }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.2, { duration: 2000 / el.speed, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, el.speed]);

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: el.x, top: el.y },
        useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))
      ]}
    >
      <Svg width={el.size} height={el.size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" fill={el.color} opacity={opacity} />
      </Svg>
    </Animated.View>
  );
};

const DynamicIsometricCube = ({ el, opacity }: { el: any, opacity: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 15000 / el.speed, easing: Easing.linear }), -1, false);
  }, [el.speed, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: el.x },
      { translateY: el.y + Math.sin(progress.value * Math.PI * 2) * 20 },
      { rotate: `${progress.value * 360}deg` }
    ],
    opacity: opacity
  }));

  return (
    <Animated.View style={[styles.cubeWrapper, animatedStyle]}>
      <Svg width={el.size} height={el.size} viewBox="0 0 100 100">
        <Path d="M50 20 L80 35 L50 50 L20 35 Z" fill={el.color} opacity={0.6} />
        <Path d="M50 50 L80 35 L80 65 L50 80 Z" fill={el.color} opacity={0.4} />
        <Path d="M50 50 L20 35 L20 65 L50 80 Z" fill={el.color} opacity={0.2} />
      </Svg>
    </Animated.View>
  );
};

const DynamicWireframeCube = ({ color, size, speed = 1 }: { color: string, size: number, speed?: number }) => {
  const angleX = useSharedValue(0);
  const angleY = useSharedValue(0);
  const angleZ = useSharedValue(0);

  useEffect(() => {
    angleX.value = withRepeat(withTiming(Math.PI * 2, { duration: 15000 / speed, easing: Easing.linear }), -1, false);
    angleY.value = withRepeat(withTiming(Math.PI * 2, { duration: 20000 / speed, easing: Easing.linear }), -1, false);
    angleZ.value = withRepeat(withTiming(Math.PI * 2, { duration: 25000 / speed, easing: Easing.linear }), -1, false);
  }, [angleX, angleY, angleZ, speed]);

  const vertices = useMemo(() => {
    const v = [];
    for (let i = 0; i < 8; i++) {
      v.push({ x: (i & 1) ? 1 : -1, y: (i & 2) ? 1 : -1, z: (i & 4) ? 1 : -1 });
    }
    return v;
  }, []);

  const edges = useMemo(() => [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [3, 7], [2, 6]], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {edges.map((edge, i) => (
        <WireframeLine
          key={i}
          idx1={edge[0]}
          idx2={edge[1]}
          vertices={vertices}
          angleX={angleX}
          angleY={angleY}
          angleZ={angleZ}
          color={color}
          size={size}
        />
      ))}
    </View>
  );
};

const DynamicEffect = ({ config }: { config: any }) => {
  const { colors } = useTheme();

  const elements = useMemo(() => {
    const count = config.count || 10;
    return [...Array(count)].map((_, i) => ({
      id: i,
      size: (config.size || 20) * (0.5 + Math.random()),
      x: Math.random() * width,
      y: Math.random() * height,
      color: config.color || colors.primary,
      speed: (config.speed || 1) * (1 + Math.random()),
    }));
  }, [config, colors.primary]);

  if (config.type === 'particles') {
    return (
      <View style={styles.backgroundContainer} pointerEvents="none">
        {elements.map(el => <DynamicParticle key={el.id} el={el} />)}
      </View>
    );
  }

  if (config.type === 'shapes' || config.type === 'squares') {
    return (
      <View style={styles.backgroundContainer} pointerEvents="none">
        {elements.map(el => (
          <DynamicShape
            key={el.id}
            el={el}
            opacity={config.opacity || (config.type === 'shapes' ? 0.6 : 0.5)}
            type={config.type === 'squares' ? 'square' : 'triangle'}
          />
        ))}
      </View>
    );
  }

  if (config.type === 'circles') {
    return (
      <View style={styles.backgroundContainer} pointerEvents="none">
        {elements.map(el => <DynamicCircle key={el.id} el={el} opacity={config.opacity || 0.5} />)}
      </View>
    );
  }

  if (config.type === 'cubes') {
    return (
      <View style={styles.backgroundContainer} pointerEvents="none">
        {elements.map(el => <DynamicIsometricCube key={el.id} el={el} opacity={config.opacity || 0.8} />)}
      </View>
    );
  }

  if (config.type === 'waves') {
    return (
      <View style={styles.backgroundContainer} pointerEvents="none">
        <AuraOrb color={config.color || colors.primary} size={width * 1.5} initialX={-width * 0.25} initialY={-height * 0.1} delay={0} />
        <AuraOrb color={config.color || colors.secondary} size={width * 1.2} initialX={width * 0.1} initialY={height * 0.4} delay={2000} />
      </View>
    );
  }

  if (config.type === 'wireframe') {
    return (
      <View style={styles.backgroundContainer} pointerEvents="none">
        <DynamicWireframeCube
          color={config.color || colors.primary}
          size={config.size || width * 0.15}
          speed={config.speed || 1}
        />
      </View>
    );
  }
  return null;
};
// --- LIQUID SILK (FLOWING FABRIC) SYSTEM ---
const SilkPath = ({ color, delay, duration }: { color: string, delay: number, duration: number }) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(Math.PI * 2, { duration, easing: Easing.inOut(Easing.sin) }), -1, false));
  }, [delay, duration]);

  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const animatedProps = useAnimatedProps(() => {
    const cp1x = width * 0.2 + Math.sin(t.value) * 100;
    const cp1y = height * 0.3 + Math.cos(t.value) * 150;
    const cp2x = width * 0.8 + Math.cos(t.value * 0.8) * 120;
    const cp2y = height * 0.7 + Math.sin(t.value * 0.8) * 150;

    // Create a smooth waving path
    const d = `M -50 ${height * 0.2} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${width + 50} ${height * 0.8}`;
    return { d };
  });

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedPath
        animatedProps={animatedProps}
        stroke={color}
        strokeWidth={80}
        strokeLinecap="round"
        fill="none"
        opacity={0.08}
      />
      {/* Thinner inner highlight */}
      <AnimatedPath
        animatedProps={animatedProps}
        stroke={color}
        strokeWidth={30}
        strokeLinecap="round"
        fill="none"
        opacity={0.05}
      />
    </Svg>
  );
};

const LiquidSilkSystem = () => {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill}>
      <SilkPath color={colors.primary} delay={0} duration={15000} />
      <SilkPath color={colors.secondary || colors.primary} delay={2000} duration={18000} />
      <SilkPath color={colors.primary} delay={5000} duration={22000} />
    </View>
  );
};

// --- PRISM RAY (CRYSTAL SCAN) SYSTEM ---
const PrismRaySystem = () => {
  const { colors } = useTheme();
  const tx = useSharedValue(-width);
  const rotation = useSharedValue(35); // Diagonal angle
  const gradId = useMemo(() => `prism-grad-${Math.random()}`, []);

  useEffect(() => {
    tx.value = withRepeat(withTiming(width * 1.5, { duration: 12000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { rotate: `${rotation.value}deg` }],
    opacity: 0.25
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[{ position: 'absolute', top: -height * 0.5, height: height * 2, width: width * 0.8 }, animatedStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="0" />
              <Stop offset="0.45" stopColor={colors.primary} stopOpacity="0.4" />
              <Stop offset="0.5" stopColor={colors.secondary || colors.primary} stopOpacity="0.8" />
              <Stop offset="0.55" stopColor={colors.primary} stopOpacity="0.4" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
        </Svg>
      </Animated.View>

      {/* Subtle secondary ray in different direction */}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}>
        <AuraOrb color={colors.primary} size={width * 1.2} initialX={-width * 0.4} initialY={height * 0.3} delay={0} />
      </View>
    </View>
  );
};

export const BackgroundEffects = () => {
  const { colors } = useTheme();
  const { backgroundEffect, customBackgroundConfig } = useThemeStore();

  interface CubeData {
    id: number;
    size: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
  }

  const cubes = useMemo<CubeData[]>(() => [...Array(10)].map((_, i) => ({ id: i, size: 60 + Math.random() * 120, x: (Math.random() * width) - 50, y: (Math.random() * height) - 50, delay: i * 800, duration: 15000 + Math.random() * 10000 })), []);

  if (backgroundEffect === 'none') return null;
  if (backgroundEffect === 'dynamic' && customBackgroundConfig) return <DynamicEffect config={customBackgroundConfig} />;
  if (backgroundEffect === 'quantum') return <View style={styles.backgroundContainer} pointerEvents="none"><QuantumDustSystem /></View>;
  if (backgroundEffect === 'waves') return <View style={styles.backgroundContainer} pointerEvents="none"><AuraOrb color={colors.primary} initialX={-100} initialY={-100} size={width * 1.2} delay={0} /><AuraOrb color={colors.secondary} initialX={width * 0.2} initialY={height * 0.5} size={width} delay={2000} /></View>;
  if (backgroundEffect === 'crystals') return <View style={styles.backgroundContainer} pointerEvents="none"><AtomicSystem /></View>;
  if (backgroundEffect === 'tesseract') return <View style={styles.backgroundContainer} pointerEvents="none"><Tesseract4D /></View>;
  if (backgroundEffect === 'aurora') return <View style={styles.backgroundContainer} pointerEvents="none"><AuroraEffect /></View>;
  if (backgroundEffect === 'matrix') return <View style={styles.backgroundContainer} pointerEvents="none"><MatrixRain /></View>;
  if (backgroundEffect === 'vortex') return <View style={styles.backgroundContainer} pointerEvents="none"><VortexSystem /></View>;
  if (backgroundEffect === 'grid') return <View style={styles.backgroundContainer} pointerEvents="none"><CyberGrid /></View>;
  if (backgroundEffect === 'bokeh') return <View style={styles.backgroundContainer} pointerEvents="none"><DreamscapeBokehSystem /></View>;
  if (backgroundEffect === 'silk') return <View style={styles.backgroundContainer} pointerEvents="none"><LiquidSilkSystem /></View>;
  if (backgroundEffect === 'prism') return <View style={styles.backgroundContainer} pointerEvents="none"><PrismRaySystem /></View>;

  return null;
};
