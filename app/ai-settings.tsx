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
  MessagesSquare,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
} from "lucide-react-native";
import { useTheme } from "../src/components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useAIStore } from "../src/store/aiStore";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { soundService } from "../src/services/SoundService";
import { CustomAlert } from "../src/components/CustomAlert";

export default function AISettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { 
    apiKey, 
    setApiKey, 
    isAIEnabled, 
    toggleAI, 
    customSystemPrompt, 
    setCustomSystemPrompt,
    pollinationsApiKey,
    setPollinationsApiKey,
    chatSoundsEnabled,
    setChatSoundsEnabled,
    chatSoundType,
    setChatSoundType,
  } = useAIStore();
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [inputPollinationsKey, setInputPollinationsKey] = useState(pollinationsApiKey || "");
  const [inputPrompt, setInputPrompt] = useState(customSystemPrompt || "");
  const [isSaved, setIsSaved] = useState(false);
  const [isPollinationsSaved, setIsPollinationsSaved] = useState(false);
  const [isPromptSaved, setIsPromptSaved] = useState(false);
  const [resetAlertVisible, setResetAlertVisible] = useState(false);

  useEffect(() => {
    setInputKey(apiKey || "");
    setInputPollinationsKey(pollinationsApiKey || "");
  }, [apiKey, pollinationsApiKey]);

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

  const handleSavePollinations = async () => {
    try {
      await setPollinationsApiKey(inputPollinationsKey.trim() || null);
      setIsPollinationsSaved(true);
      soundService.playComplete();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setIsPollinationsSaved(false), 3000);
    } catch (error) {
      Alert.alert(t("settings.ai.error"), t("settings.ai.invalidKey"));
    }
  };

  const handleSavePrompt = () => {
    setCustomSystemPrompt(inputPrompt.trim() || null);
    setIsPromptSaved(true);
    soundService.playComplete();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setIsPromptSaved(false), 3000);
  };

  const resetPrompt = () => {
    soundService.playClick();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setResetAlertVisible(true);
  };

  const confirmResetPrompt = () => {
    setResetAlertVisible(false);
    setInputPrompt("");
    setCustomSystemPrompt(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    soundService.playComplete();
  };

  const openGeminiDashboard = () => {
    soundService.playClick();
    Linking.openURL("https://aistudio.google.com/app/apikey");
  };

  const openPollinationsDashboard = () => {
    soundService.playClick();
    Linking.openURL("https://enter.pollinations.ai");
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
                  {t("settings.ai.enableAI")}
                </Text>
                <Text style={[styles.cardDesc, { color: colors.subText }]}>
                  {t("settings.ai.enableAIDesc")}
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

          {/* Gemini API Key */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Gemini API Key
              </Text>
            </View>
            
            <Text style={[styles.cardDesc, { color: colors.subText, marginBottom: 16 }]}>
              {t("settings.ai.secureStorageDesc")}
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

          {/* Pollinations API Key */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Sparkles size={20} color={colors.info} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Pollinations AI Key
              </Text>
            </View>
            
            <Text style={[styles.cardDesc, { color: colors.subText, marginBottom: 16 }]}>
              {isDarkMode ? "Görüntü oluşturma için Pollinatios AI anahtarı kullanın." : "Use Pollinations AI key for image generation."}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderColor: isPollinationsSaved ? colors.success : colors.border,
                },
              ]}
              placeholder="pk_..."
              placeholderTextColor={colors.subText}
              value={inputPollinationsKey}
              onChangeText={setInputPollinationsKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.helpLink}
              onPress={openPollinationsDashboard}
            >
              <Text style={[styles.helpLinkText, { color: colors.info }]}>
                {isDarkMode ? "Anahtar Al (enter.pollinations.ai)" : "Get Key (enter.pollinations.ai)"}
              </Text>
              <ExternalLink size={14} color={colors.info} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.info }]} 
              onPress={handleSavePollinations}
            >
              {isPollinationsSaved ? (
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

          {/* Custom Persona Section */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <MessagesSquare size={20} color={colors.secondary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {t("settings.ai.customPersona")}
              </Text>
            </View>
            
            <Text style={[styles.cardDesc, { color: colors.subText, marginBottom: 16 }]}>
              {t("settings.ai.customPersonaDesc")}
            </Text>

            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderColor: isPromptSaved ? colors.success : colors.border,
                },
              ]}
              placeholder={t("settings.ai.personaPlaceholder")}
              placeholderTextColor={colors.subText}
              value={inputPrompt}
              onChangeText={setInputPrompt}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.secondary || colors.primary }]} 
              onPress={handleSavePrompt}
            >
              {isPromptSaved ? (
                <View style={styles.saveContent}>
                  <CheckCircle2 size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{t("common.success")}</Text>
                </View>
              ) : (
                <View style={styles.saveContent}>
                  <Sparkles size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>{t("settings.ai.updatePersona")}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.resetActionCard, { borderColor: '#EF4444' + '30', marginTop: 12 }]}
              onPress={resetPrompt}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EF4444' + '15', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resetActionGradient}
              >
                <RotateCcw size={20} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resetActionTitle, { color: "#EF4444" }]}>
                    {t("settings.ai.resetPromptTitle")}
                  </Text>
                  <Text style={[styles.resetActionDesc, { color: colors.subText }]}>
                    {t("settings.ai.resetPromptConfirm")}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* AI Chat Sounds Section */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Volume2 size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {t("settings.ai.chatSounds")}
              </Text>
            </View>

            <View style={[styles.settingRow, { marginBottom: 20 }]}>
              <View style={styles.settingText}>
                <Text style={[styles.cardDesc, { color: colors.subText }]}>
                  {t("settings.ai.chatSoundsDesc")}
                </Text>
              </View>
              <Switch
                value={chatSoundsEnabled}
                onValueChange={(val) => {
                  setChatSoundsEnabled(val);
                  if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                trackColor={{ false: "#767577", true: colors.primary + '80' }}
                thumbColor={chatSoundsEnabled ? colors.primary : "#f4f3f4"}
              />
            </View>

            {chatSoundsEnabled && (
              <View style={styles.soundTypeContainer}>
                <Text style={[styles.soundTypeTitle, { color: colors.text }]}>
                  {t("settings.ai.soundType")}
                </Text>
                <View style={styles.soundTypeGrid}>
                  {[
                    { id: 'pop', label: t("settings.ai.pop"), icon: Radio },
                    { id: 'digital', label: t("settings.ai.digital"), icon: Zap },
                    { id: 'minimal', label: t("settings.ai.minimal"), icon: ShieldCheck },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.soundOption,
                        { 
                          backgroundColor: chatSoundType === item.id ? colors.primary + '15' : 'transparent',
                          borderColor: chatSoundType === item.id ? colors.primary : colors.border,
                        }
                      ]}
                      onPress={() => {
                        setChatSoundType(item.id as any);
                        if (item.id === 'pop') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        else if (item.id === 'digital') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        else Haptics.selectionAsync();
                      }}
                    >
                      <item.icon size={18} color={chatSoundType === item.id ? colors.primary : colors.subText} />
                      <Text style={[
                        styles.soundOptionLabel, 
                        { color: chatSoundType === item.id ? colors.text : colors.subText }
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Features Information */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("settings.ai.whatYouGet")}</Text>
          
          <View style={styles.featuresList}>
            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient
                colors={[colors.primary + '10', 'transparent']}
                style={styles.featureGradient}
              >
                <Zap size={24} color={colors.warning} />
                <Text style={[styles.featureTitle, { color: colors.text }]}>{t("settings.ai.smartRefineTitle")}</Text>
                <Text style={[styles.featureDesc, { color: colors.subText }]}>
                  {t("settings.ai.smartRefineDesc")}
                </Text>
              </LinearGradient>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient
                colors={[colors.secondary + '10', 'transparent']}
                style={styles.featureGradient}
              >
                <Sparkles size={24} color={colors.info} />
                <Text style={[styles.featureTitle, { color: colors.text }]}>{t("settings.ai.aiMotivationTitle")}</Text>
                <Text style={[styles.featureDesc, { color: colors.subText }]}>
                  {t("settings.ai.aiMotivationDesc")}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={resetAlertVisible}
        title={t("settings.ai.resetPromptTitle")}
        message={t("settings.ai.resetPromptConfirm")}
        type="danger"
        confirmText={t("settings.ai.reset")}
        cancelText={t("common.cancel")}
        onConfirm={confirmResetPrompt}
        onCancel={() => setResetAlertVisible(false)}
      />
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
  scrollContent: { padding: 20, paddingBottom: 100 },
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
  textArea: {
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 100,
  },
  resetIcon: {
    padding: 4,
    marginLeft: 'auto',
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
  resetActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  resetActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  resetActionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  resetActionDesc: {
    fontSize: 12,
    opacity: 0.8,
  },
  soundTypeContainer: {
    marginTop: 0,
  },
  soundTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  soundTypeGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  soundOption: {
    flex: 1,
    minWidth: '28%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  soundOptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
