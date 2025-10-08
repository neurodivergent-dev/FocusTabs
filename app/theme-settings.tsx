import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useThemeStore } from "../src/store/themeStore";
import { THEMES } from "../src/constants/themes";
import { useTheme } from "../src/components/ThemeProvider";
import ThemedCard from "../src/components/ThemedCard";
import ThemedButton from "../src/components/ThemedButton";
import { ChevronLeft, Palette } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode, themeId } = useTheme();
  const setThemeId = useThemeStore((state) => state.setThemeId);
  const { t } = useTranslation();

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Tema seçme işleyicisi
  const handleThemeSelect = (id: string) => {
    setThemeId(id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>
              {t("settings.title", "Ayarlar")}
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t("themeSettings.title", "Tema Ayarları")}
            </Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentHeader}>
            <Palette size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {t("themeSettings.customization", "Tema Özelleştirme")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              {t(
                "themeSettings.customizeAppearance",
                "Uygulamanızın görünümünü özelleştirin"
              )}
            </Text>
          </View>

          <ThemedCard
            title={t("themeSettings.activeTheme", "Aktif Tema")}
            description={t(
              "themeSettings.currentlyUsing",
              "Şu anda kullandığınız tema"
            )}
          >
            <View style={styles.activeThemeContainer}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={[styles.themeName, { color: colors.text }]}>
                {t(
                  `themeNames.${themeId}`,
                  THEMES.find((theme) => theme.id === themeId)?.name ||
                    t("themeSettings.default", "Varsayılan")
                )}
              </Text>
            </View>
          </ThemedCard>

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            {t("themeSettings.themes", "Temalar")}
          </Text>

          <View style={styles.themesGrid}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#F5F5F7",
                    borderColor:
                      themeId === theme.id ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => handleThemeSelect(theme.id)}
              >
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
                <Text
                  style={[
                    styles.themeCardTitle,
                    { color: colors.text },
                    themeId === theme.id && { fontWeight: "700" },
                  ]}
                >
                  {t(`themeNames.${theme.id}`, theme.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("themeSettings.preview", "Önizleme")}
            </Text>

            <ThemedCard
              title={t("themeSettings.sampleCard", "Örnek Kart")}
              description={t(
                "themeSettings.themeAppearance",
                "Seçtiğiniz temanın görünümü"
              )}
            >
              <Text style={{ color: colors.text }}>
                {t(
                  "themeSettings.previewDescription",
                  "Bu bir tema önizlemesidir. Renklerin ve bileşenlerin nasıl göründüğünü kontrol edin."
                )}
              </Text>
            </ThemedCard>

            <View style={styles.buttonPreviewContainer}>
              <ThemedButton
                title={t("themeSettings.primaryButton", "Birincil Buton")}
                onPress={() => {}}
                style={{ marginBottom: 12 }}
              />
              <ThemedButton
                title={t("themeSettings.secondaryButton", "İkincil Buton")}
                onPress={() => {}}
                variant="secondary"
                style={{ marginBottom: 12 }}
              />
              <ThemedButton
                title={t("themeSettings.outlineButton", "Çizgili Buton")}
                onPress={() => {}}
                variant="outline"
                style={{ marginBottom: 12 }}
              />
              <ThemedButton
                title={t("themeSettings.dangerButton", "Tehlike Butonu")}
                onPress={() => {}}
                variant="danger"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  rightPlaceholder: {
    minWidth: 80,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentHeader: {
    alignItems: "center",
    marginVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  activeThemeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  themeCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  themePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  themeCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  previewSection: {
    marginBottom: 40,
  },
  buttonPreviewContainer: {
    marginTop: 16,
  },
});
