import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "../src/store/languageStore";
import { LANGUAGES } from "../src/i18n/i18n";
import i18n from "../src/i18n/i18n";
import {
  resetLanguageSettings,
  getLanguageStorageData,
} from "../src/utils/languageUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../src/components/ThemeProvider";

// Strongly-typed storage shape:
interface LanguageStorage {
  lastSet: string; // e.g. "en" or "tr"
  persistedAt: number; // timestamp
  // add other known keys here...
}

export default function LanguageDebugScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { currentLanguage, setLanguage } = useLanguageStore();

  const [storageData, setStorageData] = useState<LanguageStorage | null>(null);
  const [deviceLanguage, setDeviceLanguage] = useState<string>(
    i18n.language || ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Combined loader with error handling
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLanguageStorageData();
      setStorageData(data);
      setDeviceLanguage(i18n.language || "");
    } catch (e) {
      console.error("Failed to load language data:", e);
      setError(t("settings.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Subscribe to i18n language changes, and load on mount
  useEffect(() => {
    refreshData();

    const onLangChange = (lng: string) => setDeviceLanguage(lng);
    i18n.on("languageChanged", onLangChange);
    return () => {
      i18n.off("languageChanged", onLangChange);
    };
  }, [refreshData]);

  const handleResetLanguage = () => {
    Alert.alert(t("settings.resetTitle"), t("settings.resetConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.reset"),
        style: "destructive",
        onPress: async () => {
          const success = await resetLanguageSettings();
          if (success) {
            await refreshData();
            Alert.alert(t("common.success"), t("settings.resetSuccess"));
          } else {
            Alert.alert(t("common.error"), t("settings.resetError"));
          }
        },
      },
    ]);
  };

  const handleSetEnglish = () => {
    setLanguage(LANGUAGES.EN);
    // i18n.changeLanguage happens in your store; listener updates deviceLanguage
  };

  const handleSetTurkish = () => {
    setLanguage(LANGUAGES.TR);
  };

  const handleSetGerman = () => {
    setLanguage(LANGUAGES.DE);
  };

  // If loading, show spinner
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.spinner}
          accessibilityLabel={t("settings.loading")}
          accessibilityHint={t("settings.loadingHint")}
          testID="language-loading-indicator"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        testID="language-debug-scroll"
      >
        {error && (
          <Text
            style={[styles.errorText, { color: colors.error }]}
            accessibilityRole="alert"
            testID="language-error-message"
          >
            {error}
          </Text>
        )}

        <Text
          style={[styles.title, { color: colors.text }]}
          testID="language-debug-title"
        >
          {t("settings.language")} Debug
        </Text>

        {/* Store vs. i18n language */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("settings.currentLanguage")} (Store)
          </Text>
          <Text
            style={[styles.value, { color: colors.text }]}
            testID="current-language-value"
          >
            {currentLanguage}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            i18n {t("settings.language")}
          </Text>
          <Text
            style={[styles.value, { color: colors.text }]}
            testID="device-language-value"
          >
            {deviceLanguage}
          </Text>
        </View>

        {/* Storage data JSON */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Storage Data
          </Text>
          <Text
            style={[styles.value, { color: colors.text }]}
            testID="storage-data-json"
          >
            {storageData
              ? JSON.stringify(storageData, null, 2)
              : t("about.title")}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* English button using a custom Pressable with explicit accessibility attributes */}
          <Pressable
            onPress={handleSetEnglish}
            style={({ pressed }) => [
              styles.customButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("settings.setEnglish")}
            accessibilityHint={t("settings.setEnglishHint")}
            testID="english-language-button"
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
              English
            </Text>
          </Pressable>
          <View style={styles.buttonSpacer} />

          <Button
            title="Türkçe"
            onPress={handleSetTurkish}
            accessibilityLabel={t("settings.setTurkish")}
            testID="turkish-language-button"
          />
          <View style={styles.buttonSpacer} />

          <Button
            title="Deutsch"
            onPress={handleSetGerman}
            accessibilityLabel="Sprache auf Deutsch umstellen"
            testID="german-language-button"
          />
          <View style={styles.buttonSpacer} />

          <Button
            title="Reset to English"
            onPress={handleResetLanguage}
            accessibilityLabel={t("settings.resetLanguage")}
            testID="reset-language-button"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title={t("settings.refreshData")}
            onPress={refreshData}
            accessibilityLabel={t("settings.refreshAccessibility")}
            testID="refresh-data-button"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title={t("about.back")}
            onPress={() => router.back()}
            accessibilityLabel={t("settings.navigateBack")}
            testID="back-button"
          />
        </View>

        {/* Translation tests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Translation Test
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {t("settings.title")}: {t("settings.title")}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {t("settings.language")}: {t("settings.language")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  value: { fontSize: 16, fontFamily: "SpaceMono" },
  buttonContainer: { marginVertical: 20 },
  buttonSpacer: { height: 10 },
  spinner: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { marginBottom: 10, textAlign: "center" },
  // Custom button styles
  customButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
