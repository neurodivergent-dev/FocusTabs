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
import { aiService } from "../services/aiService";
import { useAIStore } from "../store/aiStore";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

interface CelebrationProps {
  visible: boolean;
  goals?: string[];
}

export const Celebration: React.FC<CelebrationProps> = ({ visible, goals = [] }) => {
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [shouldRender, setShouldRender] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const { isAIEnabled, lastCelebrationMessage, lastCelebrationDate, setCelebrationCache } = useAIStore();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      console.log("[CELEBRATION] Görünürlük tetiklendi!");
      setShouldRender(true);
      
      // Animasyonları başlat
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withSpring(0, { damping: 12 });

      // Ses ve Titreşim
      soundService.playFanfare();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Otomatik kapanma süresi
      let closeTimer: NodeJS.Timeout;

      // AI Mesajını çek
      if (isAIEnabled && goals.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        
        // Önce kalıcı hafızaya bak (RPD kısıtlaması için kritik!)
        if (lastCelebrationDate === today && lastCelebrationMessage) {
          console.log("[CELEBRATION] Günlük cache'den mesaj yüklendi.");
          setAiMessage(lastCelebrationMessage);
          closeTimer = setTimeout(() => hide(), 6000);
        } else {
          setAiMessage(t("common.loading", "Gemini senin için bir mesaj hazırlıyor..."));
          
          aiService.getCelebrationMessage(goals, i18n.language).then(msg => {
            if (msg) {
              console.log("[CELEBRATION] Gemini'den taze mesaj geldi.");
              setAiMessage(msg);
              setCelebrationCache(msg); // Kalıcı hafızaya kaydet
              closeTimer = setTimeout(() => hide(), 6000);
            } else {
              setAiMessage(null);
              closeTimer = setTimeout(() => hide(), 4000);
            }
          }).catch(err => {
            console.log("AI Hata:", err);
            setAiMessage(null);
            closeTimer = setTimeout(() => hide(), 4000);
          });
        }
      } else {
        closeTimer = setTimeout(() => hide(), 4000);
      }

      return () => {
        if (closeTimer) clearTimeout(closeTimer);
      };
    }
  }, [visible, isAIEnabled]);

  const hide = () => {
    scale.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(0, { duration: 400 });
    translateY.value = withTiming(50, { duration: 400 });
    setTimeout(() => {
      setShouldRender(false);
      setAiMessage(null);
    }, 400);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

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
                {aiMessage || t("home.celebration.subtitle", "Bugünkü tüm hedeflerini tamamladın.")}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Konfeti efektleri */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
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
    fall.value = withDelay(index * 50, withTiming(height, { duration: 2500 }));
    side.value = withDelay(index * 50, withSpring(Math.random() * 300 - 150));
    rot.value = withTiming(720, { duration: 2500 });
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: -20,
    left: width / 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color,
    transform: [{ translateY: fall.value }, { translateX: side.value }, { rotate: `${rot.value}deg` }],
    opacity: withSequence(withTiming(1, { duration: 100 }), withTiming(0, { duration: 2400 })),
  }));

  return <Animated.View style={style} />;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // En tepede!
    elevation: 9999,
  },
  badge: {
    width: width * 0.9,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
  },
  gradient: { padding: 24 },
  content: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  sparklePosition: { position: "absolute", top: -5, right: -5 },
  textContainer: { marginLeft: 18, flex: 1 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: "rgba(255, 255, 255, 0.95)", fontSize: 14, fontWeight: "600", lineHeight: 20 },
});
