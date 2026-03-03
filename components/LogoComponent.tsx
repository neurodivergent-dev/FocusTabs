import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../src/components/ThemeProvider";

interface LogoProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

export const FocusTabsLogo: React.FC<LogoProps> = ({
  size = 120,
  color,
  secondaryColor,
}) => {
  const { colors } = useTheme();
  
  // Theme-aware colors
  const primary = color || colors.primary;
  const secondary = secondaryColor || colors.secondary || colors.info;

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
        <Defs>
          <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={primary} stopOpacity="1" />
            <Stop offset="1" stopColor={secondary} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Gradient Background Rect */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill="url(#logoGrad)"
        />

        {/* Stylized F */}
        <Path
          d={`M${40 * scale} ${40 * scale} L${70 * scale} ${40 * scale} M${40 * scale} ${40 * scale} L${40 * scale} ${80 * scale} M${40 * scale} ${60 * scale} L${60 * scale} ${60 * scale}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Target/Focus symbol */}
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
  color,
  secondaryColor,
}) => {
  const { colors } = useTheme();
  
  // Theme-aware colors
  const primary = color || colors.primary;
  const secondary = secondaryColor || colors.secondary || colors.info;

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
        <Defs>
          <LinearGradient id="smallLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={primary} stopOpacity="1" />
            <Stop offset="1" stopColor={secondary} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Gradient Background Rect */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill="url(#smallLogoGrad)"
        />

        {/* Stylized F */}
        <Path
          d={`M${10 * scale} ${10 * scale} L${18 * scale} ${10 * scale} M${10 * scale} ${10 * scale} L${10 * scale} ${22 * scale} M${10 * scale} ${16 * scale} L${16 * scale} ${16 * scale}`}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Simplified Target */}
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
