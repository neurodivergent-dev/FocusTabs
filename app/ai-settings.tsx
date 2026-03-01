import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BrainCircuit,
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Save,
  CheckCircle2,
} from "lucide-react-native";
import { useTheme } from "../src/components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useAIStore } from "../src/store/aiStore";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { soundService } from "../src/services/SoundService";

export default function AISettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { apiKey, setApiKey, isAIEnabled, toggleAI } = useAIStore();
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setInputKey(apiKey || "");
  }, [apiKey]);

  const handleBack = () => {
    soundService.playClick();
    router.back();
  };

  const handleSave = async () => {
    try {
      await setApiKey(inputKey.trim() || null);
      setIsSaved(true);
      soundService.playComplete();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 3 saniye sonra "Kaydedildi" yazısını kaldır
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      Alert.alert(t("settings.ai.error"), t("settings.ai.invalidKey"));
    }
  };

  const openGeminiDashboard = () => {
    soundService.playClick();
    Linking.openURL("https://aistudio.google.com/app/apikey");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#FFFFFF" />
          <Text style={[styles.backText, { color: "#FFFFFF" }]}>
            {t("settings.title")}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <BrainCircuit size={32} color="#FFFFFF" style={styles.headerIcon} />
          <Text style={[styles.title, { color: "#FFFFFF" }]}>
            {t("settings.ai.title")}
          </Text>
          <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>
            {t("settings.ai.description")}
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* AI Status Toggle */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingText}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  AI Özelliklerini Aktif Et
                </Text>
                <Text style={[styles.cardDesc, { color: colors.subText }]}>
                  Gemini yapay zeka desteğini açın veya kapatın.
                </Text>
              </View>
              <Switch
                value={isAIEnabled && !!apiKey}
                disabled={!apiKey}
                onValueChange={toggleAI}
                trackColor={{ false: "#767577", true: colors.primary + '80' }}
                thumbColor={(isAIEnabled && !!apiKey) ? colors.primary : "#f4f3f4"}
              />
            </View>
          </View>

          {/* API Key Input Section */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {t("settings.ai.apiKey")}
              </Text>
            </View>
            
            <Text style={[styles.cardDesc, { color: colors.subText, marginBottom: 16 }]}>
              API anahtarınız cihazınızda güvenli bir kasada (SecureStore) saklanır ve asla sunucularımıza gönderilmez.
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderColor: isSaved ? colors.success : colors.border,
                },
              ]}
              placeholder={t("settings.ai.apiKeyPlaceholder")}
              placeholderTextColor={colors.subText}
              value={inputKey}
              onChangeText={setInputKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.helpLink}
              onPress={openGeminiDashboard}
            >
              <Text style={[styles.helpLinkText, { color: colors.primary }]}>
                {t("settings.ai.howToGet")}
              </Text>
              <ExternalLink size={14} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
            >
              {isSaved ? (
                <View style={styles.saveContent}>
                  <CheckCircle2 size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{t("common.success")}</Text>
                </View>
              ) : (
                <View style={styles.saveContent}>
                  <Save size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{t("settings.ai.saveKey")}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Features Information */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Neler Kazanacaksınız?</Text>
          
          <View style={styles.featuresList}>
            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient
                colors={[colors.primary + '10', 'transparent']}
                style={styles.featureGradient}
              >
                <Zap size={24} color={colors.warning} />
                <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Refine</Text>
                <Text style={[styles.featureDesc, { color: colors.subText }]}>
                  Yazdığınız basit hedefleri, Gemini daha profesyonel ve takip edilebilir günlük görevlere dönüştürür.
                </Text>
              </LinearGradient>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient
                colors={[colors.secondary + '10', 'transparent']}
                style={styles.featureGradient}
              >
                <Sparkles size={24} color={colors.info} />
                <Text style={[styles.featureTitle, { color: colors.text }]}>AI Motivasyon</Text>
                <Text style={[styles.featureDesc, { color: colors.subText }]}>
                  3 hedefi de bitirdiğinizde Gemini size özel, taze ve motive edici kutlama mesajları hazırlar.
                </Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  headerDecorationCircle1: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerDecorationCircle2: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginLeft: -4,
  },
  backText: { fontSize: 16, fontWeight: "600", marginLeft: 4 },
  headerTitleContainer: { alignItems: "center" },
  headerIcon: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 15, fontWeight: "500", textAlign: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardDesc: { fontSize: 14, lineHeight: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingText: { flex: 1 },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  helpLinkText: { fontSize: 14, fontWeight: "600" },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, marginLeft: 4 },
  featuresList: { gap: 16 },
  featureCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  featureGradient: { padding: 20, gap: 10 },
  featureTitle: { fontSize: 16, fontWeight: "700" },
  featureDesc: { fontSize: 13, lineHeight: 18 },
});
