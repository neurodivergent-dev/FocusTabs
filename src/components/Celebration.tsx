import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Trophy, Sparkles } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { soundService } from "../services/SoundService";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

interface CelebrationProps {
  visible: boolean;
}

export const Celebration: React.FC<CelebrationProps> = ({ visible }) => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [shouldRender, setShouldRender] = useState(false);
  const [internalVisible, setInternalVisible] = useState(false);

  // Shared values must be defined at the top level
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setInternalVisible(true);
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withSpring(0, { damping: 12 });

      // Play celebration sound and haptics
      soundService.playFanfare();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 3 saniye sonra otomatik gizle
      const timer = setTimeout(() => {
        setInternalVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (!internalVisible && shouldRender) {
      scale.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(50, { duration: 300 });
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [internalVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!shouldRender) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.badge, animatedStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary || colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Trophy size={32} color="#FFFFFF" />
              <View style={styles.sparklePosition}>
                <Sparkles size={16} color="#FBBF24" />
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {t("home.celebration.title", "Mükemmel Odak!")}
              </Text>
              <Text style={styles.subtitle}>
                {t("home.celebration.subtitle", "Bugünkü tüm hedeflerini tamamladın.")}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Simple animated dots as light confetti */}
      {visible && [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ConfettiPiece key={i} index={i} color={i % 2 === 0 ? colors.primary : colors.secondary} />
      ))}
    </View>
  );
};

const ConfettiPiece = ({ index, color }: { index: number; color: string }) => {
  const fall = useSharedValue(0);
  const side = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(
      index * 100,
      withTiming(height, {
        duration: 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
    side.value = withDelay(
      index * 100,
      withSpring(Math.random() * 200 - 100, { damping: 10 })
    );
    rot.value = withTiming(360, { duration: 2000 });
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: -20,
    left: width / 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color,
    transform: [
      { translateY: fall.value },
      { translateX: side.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 1900 })),
  }));

  return <Animated.View style={style} />;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  badge: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  gradient: {
    padding: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  sparklePosition: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "500",
  },
});
