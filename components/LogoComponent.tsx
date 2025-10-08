import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Path, Circle } from "react-native-svg";

interface LogoProps {
  size?: number;
  color?: string;
}

export const FocusTabsLogo: React.FC<LogoProps> = ({
  size = 120,
  color = "#2196F3",
}) => {
  // Scale factors
  const scale = size / 120;
  const padding = 10 * scale;
  const innerSize = 100 * scale;
  const radius = 20 * scale;
  const strokeWidth = 5 * scale;
  const circleStrokeWidth = 3 * scale;
  const smallCircleStrokeWidth = 2 * scale;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Mavi arka plan */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill={color}
        />

        {/* Stilize F harfi */}
        <Path
          d={`M${40 * scale} ${40 * scale} L${70 * scale} ${40 * scale} M${40 * scale} ${40 * scale} L${40 * scale} ${80 * scale} M${40 * scale} ${60 * scale} L${60 * scale} ${60 * scale}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hedef/odak simgesi */}
        <Circle
          cx={75 * scale}
          cy={65 * scale}
          r={15 * scale}
          stroke="white"
          strokeWidth={circleStrokeWidth}
          fill="none"
        />
        <Circle
          cx={75 * scale}
          cy={65 * scale}
          r={7 * scale}
          stroke="white"
          strokeWidth={smallCircleStrokeWidth}
          fill="none"
        />
        <Circle cx={75 * scale} cy={65 * scale} r={2 * scale} fill="white" />
      </Svg>
    </View>
  );
};

// Simplified logo for smaller sizes
export const FocusTabsLogoSmall: React.FC<LogoProps> = ({
  size = 32,
  color = "#2196F3",
}) => {
  // Scale factors
  const scale = size / 32;
  const padding = 2 * scale;
  const innerSize = 28 * scale;
  const radius = 6 * scale;
  const strokeWidth = 2 * scale;
  const circleStrokeWidth = 1.5 * scale;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Mavi arka plan */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill={color}
        />

        {/* Stilize F harfi */}
        <Path
          d={`M${10 * scale} ${10 * scale} L${18 * scale} ${10 * scale} M${10 * scale} ${10 * scale} L${10 * scale} ${22 * scale} M${10 * scale} ${16 * scale} L${16 * scale} ${16 * scale}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Basitleştirilmiş hedef/odak simgesi */}
        <Circle
          cx={20 * scale}
          cy={18 * scale}
          r={4 * scale}
          stroke="white"
          strokeWidth={circleStrokeWidth}
          fill="none"
        />
        <Circle cx={20 * scale} cy={18 * scale} r={1 * scale} fill="white" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FocusTabsLogo;
