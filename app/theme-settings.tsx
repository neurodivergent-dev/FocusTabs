import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useThemeStore } from "../src/store/themeStore";
import { THEMES } from "../src/constants/themes";
import { useTheme } from "../src/components/ThemeProvider";
import ThemedCard from "../src/components/ThemedCard";
import ThemedButton from "../src/components/ThemedButton";
import { ChevronLeft, Palette } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export default function ThemeSettingsScreen() {
  const insets = useSafeAreaInsets();
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
        <LinearGradient
          colors={[
            colors.primary,
            colors.secondary || colors.primary,
            colors.info || colors.primary,
            colors.primary,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.3, 0.7, 1]}
          style={[styles.header, { 
            paddingTop: insets.top + 8
          }]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#FFFFFF" />
            <Text style={[styles.backText, { color: "#FFFFFF" }]}>
              {t("settings.title", "Ayarlar")}
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>
              {t("themeSettings.title", "Tema Ayarları")}
            </Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
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
                    backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
                    borderColor: themeId === theme.id ? theme.colors.primary : "transparent",
                    borderWidth: themeId === theme.id ? 3 : 0,
                    shadowColor: themeId === theme.id ? theme.colors.primary : "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: themeId === theme.id ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: themeId === theme.id ? 8 : 4,
                  },
                ]}
                onPress={() => handleThemeSelect(theme.id)}
              >
                <View style={styles.themeColorRing}>
                  <View
                    style={[
                      styles.themePreview,
                      { 
                        backgroundColor: theme.colors.primary,
                        shadowColor: theme.colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                      },
                    ]}
                  />
                </View>
                {themeId === theme.id && (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.themeCardTitle,
                    { color: colors.text },
                    themeId === theme.id && { 
                      fontWeight: "700",
                      color: theme.colors.primary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {t(`themeNames.${theme.id}`, theme.name)}
                </Text>
                <View style={styles.colorDotsContainer}>
                  <View style={[styles.colorDot, { backgroundColor: theme.colors.primary }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.colors.secondary }]} />
                  <View style={[styles.colorDot, { backgroundColor: theme.colors.success }]} />
                </View>
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
    paddingBottom: 24,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  themeColorRing: {
    padding: 4,
    borderRadius: 50,
    marginBottom: 12,
  },
  themePreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  colorDotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewSection: {
    marginBottom: 40,
  },
  buttonPreviewContainer: {
    marginTop: 16,
  },
});
