import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  ChevronLeft, 
  Github, 
  Mail, 
  Heart, 
  CheckCircle2, 
  Layout, 
  Moon, 
  ShieldCheck, 
  Palette, 
  CalendarDays, 
  Play, 
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import FocusTabsLogo from "../../components/LogoComponent";
import Constants from "expo-constants";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Svg, Circle, Path } from "react-native-svg";

const ProductHuntIcon = ({ size = 20, color }: { size?: number, color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10 8H13.5C14.8807 8 16 9.11929 16 10.5C16 11.8807 14.8807 13 13.5 13H10V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 13V17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M10 8V13" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </Svg>
);

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const handleBack = () => {
    router.back();
  };

  const handleOpenGithub = () => {
    Linking.openURL("https://github.com/neurodivergent-dev");
  };

  const handleSendEmail = () => {
    Linking.openURL("mailto:melihcandemir@protonmail.com");
  };

  const handleOpenPlayStore = () => {
    Linking.openURL("https://play.google.com/store/apps/dev?id=5145471264212833611&hl=en");
  };

  const handleOpenProductHunt = () => {
    Linking.openURL("https://www.producthunt.com/@melihcandemir");
  };

  // Advanced Feature Card component with Reanimated
  const FeatureCard = ({ icon: Icon, label, color }: { icon: React.ElementType, label: string, color: string }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
      opacity.value = withTiming(0.85, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    };

    return (
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <Animated.View style={[
          styles.featureCard, 
          { 
            backgroundColor: colors.card, 
            borderColor: colors.border,
          },
          animatedStyle
        ]}>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Icon size={22} color={color} />
          </View>
          <Text style={[styles.featureLabel, { color: colors.text }]}>{label}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, {
          paddingTop: insets.top + 12
        }]}
      >
        {/* Decorative background elements */}
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#FFFFFF" />
          <Text 
            style={[styles.backText, { color: "#FFFFFF" }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t("about.back")}
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { color: "#FFFFFF" }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t("about.title")}
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
      >
        <View style={styles.logoContainer}>
          {/* App SVG Logo */}
          <View style={styles.logoWrapper}>
            <FocusTabsLogo size={100} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            {t("about.appName")}
          </Text>
          <View style={styles.versionBadge}>
            <Text style={[styles.versionText, { color: colors.primary }]}>
              {t("about.version")}: v{Constants.expoConfig?.version || Constants.manifest2?.extra?.expoClient?.version || "1.0.0"}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={[
            colors.primary + '15',
            colors.secondary + '15',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.section, { borderWidth: 1, borderColor: colors.primary + '30' }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.title")}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {t("about.description")}
          </Text>
        </LinearGradient>

        <LinearGradient
          colors={[
            colors.primary + '15',
            colors.secondary + '15',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.section, { borderWidth: 1, borderColor: colors.primary + '30' }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.featuresTitle")}
          </Text>
          <View style={styles.featuresGrid}>
            <FeatureCard icon={CheckCircle2} label={t("about.features.dailyGoalTracking")} color={colors.primary} />
            <FeatureCard icon={Layout} label={t("about.features.minimalist")} color={colors.success} />
            <FeatureCard icon={Moon} label={t("about.features.darkMode")} color={colors.warning} />
            <FeatureCard icon={ShieldCheck} label={t("about.features.privacy")} color={colors.secondary} />
            <FeatureCard icon={Palette} label={t("about.features.themePalette")} color={colors.info} />
            <FeatureCard icon={CalendarDays} label={t("about.features.calendar")} color={colors.primary} />
          </View>
        </LinearGradient>

        <LinearGradient
          colors={[
            colors.primary + '15',
            colors.secondary + '15',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.section, { borderWidth: 1, borderColor: colors.primary + '30' }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.connectTitle")}
          </Text>
          <View style={styles.connectButtons}>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: colors.card }]}
              onPress={handleOpenPlayStore}
            >
              <Play size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text }]}>
                Google Play
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: colors.card }]}
              onPress={handleOpenGithub}
            >
              <Github size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text }]}>
                GitHub
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: colors.card }]}
              onPress={handleOpenProductHunt}
            >
              <ProductHuntIcon size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text, marginLeft: 8 }]}>
                Product Hunt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: colors.card }]}
              onPress={handleSendEmail}
            >
              <Mail size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text }]}>
                {t("about.contact")}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.footer}>
          <View style={[styles.footerDivider, { backgroundColor: colors.border, opacity: 0.3 }]} />
          
          <Text style={[styles.copyright, { color: colors.text, opacity: 0.7 }]}>
            {t("about.copyright")}
          </Text>
          
          <View style={styles.madeWithContainer}>
            {i18n.language && i18n.language.startsWith("tr") ? (
              <>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {t("about.inTurkey")}
                </Text>
                <View style={styles.heartPulse}>
                  <Heart size={14} color="#EF4444" fill="#EF4444" />
                </View>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {" " + t("about.madeWith") + " yapıldı"}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {t("about.madeWith")}
                </Text>
                <View style={styles.heartPulse}>
                  <Heart size={14} color="#EF4444" fill="#EF4444" />
                </View>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {t("about.inTurkey")}
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 4,
  },
  rightPlaceholder: {
    minWidth: 60,
  },
  backText: {
    fontSize: 15,
    marginLeft: 4,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginTop: 4,
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  featureCard: {
    width: '48%',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  connectButtons: {
    flexDirection: "row",
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 40,
  },
  footerDivider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  copyright: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  madeLoveText: {
    fontSize: 13,
    fontWeight: "500",
  },
  madeWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heartPulse: {
    marginHorizontal: 6,
  },
});
