import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useThemeStore } from "../src/store/themeStore";
import { THEMES } from "../src/constants/themes";
import { useTheme } from "../src/components/ThemeProvider";
import ThemedCard from "../src/components/ThemedCard";
import ThemedButton from "../src/components/ThemedButton";
import { ChevronLeft, Palette } from "lucide-react-native";

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { colors, isDarkMode, themeId } = useTheme();
  const setThemeId = useThemeStore((state) => state.setThemeId);

  // Tema seçme işleyicisi
  const handleThemeSelect = (id: string) => {
    setThemeId(id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Tema Ayarları",
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft color={colors.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Palette size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Tema Özelleştirme
            </Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              Uygulamanızın görünümünü özelleştirin
            </Text>
          </View>

          <ThemedCard
            title="Aktif Tema"
            description="Şu anda kullandığınız tema"
          >
            <View style={styles.activeThemeContainer}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text style={[styles.themeName, { color: colors.text }]}>
                {THEMES.find((theme) => theme.id === themeId)?.name ||
                  "Varsayılan"}
              </Text>
            </View>
          </ThemedCard>

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            Temalar
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
                  {theme.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Önizleme
            </Text>

            <ThemedCard
              title="Örnek Kart"
              description="Seçtiğiniz temanın görünümü"
            >
              <Text style={{ color: colors.text }}>
                Bu bir tema önizlemesidir. Renklerin ve bileşenlerin nasıl
                göründüğünü kontrol edin.
              </Text>
            </ThemedCard>

            <View style={styles.buttonPreviewContainer}>
              <ThemedButton
                title="Birincil Buton"
                onPress={() => {}}
                style={{ marginBottom: 12 }}
              />
              <ThemedButton
                title="İkincil Buton"
                onPress={() => {}}
                variant="secondary"
                style={{ marginBottom: 12 }}
              />
              <ThemedButton
                title="Çizgili Buton"
                onPress={() => {}}
                variant="outline"
                style={{ marginBottom: 12 }}
              />
              <ThemedButton
                title="Tehlike Butonu"
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
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
