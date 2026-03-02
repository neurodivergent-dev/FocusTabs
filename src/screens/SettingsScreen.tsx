import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Linking,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Moon,
  Layout,
  Star,
  ChevronRight,
  Lock,
  Sun,
  Smartphone,
  Paintbrush,
  Languages,
  CloudUpload,
  Trash2,
  Heart,
  Volume2,
  VolumeX,
  BrainCircuit,
} from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useLanguageStore } from "../store/languageStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { useAIStore } from "../store/aiStore";
import { soundService } from "../services/SoundService";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import LanguageModal from "../components/LanguageModal";
import { CustomAlert } from "../components/CustomAlert";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";

// Logo komponentini içe aktarıyoruz
import FocusTabsLogo from "../../components/LogoComponent";

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themeMode, setThemeMode, soundsEnabled, setSoundsEnabled } = useThemeStore();
  const { t } = useTranslation();
  const systemColorScheme = useColorScheme();
  const { colors, isDarkMode } = useTheme();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [resetAlertVisible, setResetAlertVisible] = useState(false);

  // Easter Egg State
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleLogoPress = () => {
    const now = Date.now();
    if (now - lastTapTime > 1000) {
      setTapCount(1);
    } else {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 5) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/easter-egg');
        setTapCount(0);
      }
    }
    setLastTapTime(now);
  };

  // Update isDarkMode based on system preference when using system theme
  useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  }, [systemColorScheme, themeMode]);

  const handleRateApp = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.melihcandemir.focustabs";
    Linking.canOpenURL(playStoreUrl).then((supported) => {
      if (supported) Linking.openURL(playStoreUrl);
    });
  };

  const handleNavigateToAbout = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/about");
  };

  const handleNavigateToPrivacyPolicy = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/privacy-policy");
  };

  const handleNavigateToAISettings = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/ai-settings");
  };

  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setThemeMode(mode);
    if (mode !== "system") {
      useThemeStore.getState().setIsDarkMode(mode === "dark");
    } else if (systemColorScheme) {
      useThemeStore.getState().setIsDarkMode(systemColorScheme === "dark");
    }
  };

  const handleNavigateToThemeSettings = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/theme-settings");
  };

  const handleOpenLanguageModal = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguageModalVisible(true);
  };

  const handleNavigateToBackupSettings = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/backup-settings");
  };

  const handleResetAllData = () => {
    soundService.playClick();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setResetAlertVisible(true);
  };

  const confirmResetAllData = async () => {
    setResetAlertVisible(false);
    try {
      const { clearGoals } = useDailyGoalsStore.getState();
      await clearGoals();
      useOnboardingStore.getState().resetState();
      useThemeStore.getState().setThemeId("default");
      useThemeStore.getState().setThemeMode("system");
      useLanguageStore.getState().resetState();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/onboarding");
    } catch (error) {
      console.error("Reset data error:", error);
    }
  };

  const gradientColors: [string, string, string, string] = [
    colors.primary || "#6366F1",
    colors.secondary || colors.primary || "#EC4899",
    colors.info || colors.primary || "#3B82F6",
    colors.primary || "#6366F1",
  ];

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0.0, 0.3, 0.7, 1.0]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />
        <Text style={[styles.title, { color: "#FFFFFF" }]}>{t("settings.title")}</Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>{t("settings.customizeYourExperience")}</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 125 }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.preferences")}</Text>

          <View style={[styles.themeSectionContainer, { 
            backgroundColor: colors.card, 
            borderWidth: 1, 
            borderColor: colors.primary + '15',
            borderLeftWidth: 4,
            borderLeftColor: colors.primary
          }]}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>{t("settings.theme")}</Text>
            <View style={styles.themeOptionsContainer}>
              {(["light", "dark", "system"] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modernThemeCard,
                    { backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" },
                    themeMode === mode && { backgroundColor: colors.primary + '15', borderColor: colors.primary, borderWidth: 1.5 },
                  ]}
                  onPress={() => handleThemeChange(mode)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconCircle, themeMode === mode && { backgroundColor: colors.primary }]}>
                    {mode === "light" ? <Sun size={20} color={themeMode === mode ? "#FFFFFF" : colors.subText} /> :
                     mode === "dark" ? <Moon size={20} color={themeMode === mode ? "#FFFFFF" : colors.subText} /> :
                     <Smartphone size={20} color={themeMode === mode ? "#FFFFFF" : colors.subText} />}
                  </View>
                  <Text style={[styles.modernThemeText, { color: colors.text }, themeMode === mode && { color: colors.primary, fontWeight: "700" }]}>
                    {t(`settings.themeOptions.${mode}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.settingRowNoBorder, { marginTop: 24 }]}>
              <View style={[styles.settingIconContainer, { backgroundColor: (soundsEnabled ? colors.primary : colors.subText) + '15' }]}>
                {soundsEnabled ? <Volume2 size={20} color={colors.primary} /> : <VolumeX size={20} color={colors.subText} />}
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t("settings.uiSounds")}</Text>
                <Text style={[styles.settingDescription, { color: colors.subText }]}>{t("settings.uiSoundsDescription")}</Text>
              </View>
              <Switch
                value={soundsEnabled}
                onValueChange={(value) => {
                  setSoundsEnabled(value);
                  if (value) soundService.playComplete();
                  else soundService.playClick();
                }}
                trackColor={{ false: "#767577", true: colors.primary + '80' }}
                thumbColor={soundsEnabled ? colors.primary : "#f4f3f4"}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: colors.primary }]} 
            onPress={handleNavigateToAISettings}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <BrainCircuit size={20} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: colors.text, fontWeight: '700' }]}>{t("settings.ai.title")}</Text>
              <Text style={[styles.settingDescription, { color: colors.subText }]}>{t("settings.ai.description")}</Text>
            </View>
            <ChevronRight size={20} color={colors.subText} opacity={0.5} />
          </TouchableOpacity>

          {[
            { label: "settings.theme", desc: "settings.customizeYourExperience", icon: Paintbrush, color: "#A855F7", onPress: handleNavigateToThemeSettings },
            { label: "settings.language", desc: "settings.languageDescription", icon: Languages, color: "#3B82F6", onPress: handleOpenLanguageModal },
            { label: "settings.backup", desc: "settings.backupDescription", icon: CloudUpload, color: "#10B981", onPress: handleNavigateToBackupSettings },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.settingItem, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: item.color }]} 
              onPress={item.onPress}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: item.color + '15' }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t(item.label)}</Text>
                <Text style={[styles.settingDescription, { color: colors.subText }]}>{t(item.desc)}</Text>
              </View>
              <ChevronRight size={20} color={colors.subText} opacity={0.5} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: "#EF4444" }]} onPress={handleResetAllData}>
            <View style={[styles.settingIconContainer, { backgroundColor: "#EF4444" + '15' }]}>
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: "#EF4444" }]}>{t("settings.resetAllData")}</Text>
              <Text style={[styles.settingDescription, { color: colors.subText }]}>{t("settings.resetAllDataDescription")}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.about")}</Text>
          <TouchableOpacity activeOpacity={1} onPress={handleLogoPress} style={styles.logoContainer}>
            <FocusTabsLogo size={100} color={colors.primary} />
            <View style={styles.versionBadge}>
              <Text style={[styles.versionText, { color: colors.primary }]}>FocusTabs v{Constants.expoConfig?.version || "1.0.0"}</Text>
            </View>
          </TouchableOpacity>

          {[
            { label: "settings.rateApp", desc: "settings.supportUsWithARating", icon: Star, color: "#F59E0B", onPress: handleRateApp },
            { label: "settings.about", desc: "settings.versionAndAppInformation", icon: Layout, color: "#6366F1", onPress: handleNavigateToAbout },
            { label: "settings.privacyPolicy", desc: "settings.howWeHandleYourData", icon: Lock, color: "#10B981", onPress: handleNavigateToPrivacyPolicy },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.settingItem, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: item.color }]} 
              onPress={item.onPress}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: item.color + '15' }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{t(item.label)}</Text>
                <Text style={[styles.settingDescription, { color: colors.subText }]}>{t(item.desc)}</Text>
              </View>
              <ChevronRight size={20} color={colors.subText} opacity={0.5} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <LanguageModal visible={languageModalVisible} onClose={() => setLanguageModalVisible(false)} />
      
      <CustomAlert
        visible={resetAlertVisible}
        title={t("settings.clearDataConfirmTitle")}
        message={t("settings.clearDataConfirmMessage")}
        type="danger"
        confirmText={t("settings.reset")}
        cancelText={t("settings.cancel")}
        onConfirm={confirmResetAllData}
        onCancel={() => setResetAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28, position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerDecorationCircle1: { position: 'absolute', top: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  headerDecorationCircle2: { position: 'absolute', bottom: -30, left: -40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: "500", opacity: 0.9 },
  scrollView: { flex: 1 },
  scrollViewContent: { paddingBottom: 0 },
  section: { marginTop: 24, paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  settingItem: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 12 },
  settingIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 16 },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: "500", marginBottom: 2 },
  settingDescription: { fontSize: 14 },
  themeSectionContainer: { padding: 16, borderRadius: 12, marginBottom: 12 },
  themeLabel: { fontSize: 16, fontWeight: "500", marginBottom: 16 },
  themeOptionsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  modernThemeCard: { width: '31%', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  themeIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150, 150, 150, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  modernThemeText: { fontSize: 12, fontWeight: '600' },
  settingRowNoBorder: { flexDirection: "row", alignItems: "center" },
  logoContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  versionBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(99, 102, 241, 0.15)', marginTop: 8 },
  versionText: { fontSize: 13, fontWeight: "600" },
});
