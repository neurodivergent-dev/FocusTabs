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
import { ChevronLeft, Palette, Box, Sparkles, Waves, CircleOff, Gem, Atom, Hexagon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { BackgroundEffectType } from "../src/store/themeStore";

export default function ThemeSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDarkMode, themeId } = useTheme();
  const { setBackgroundEffect, backgroundEffect, setThemeId } = useThemeStore((state) => ({
    setThemeId: state.setThemeId,
    setBackgroundEffect: state.setBackgroundEffect,
    backgroundEffect: state.backgroundEffect,
  }));
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
              {t("settings.title", "Ayarlar")}
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text 
              style={[styles.headerTitle, { color: "#FFFFFF" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("themeSettings.title", "Tema Ayarları")}
            </Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentHeader}>
            <View style={[styles.mainIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Palette size={32} color={colors.primary} />
            </View>
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

          <Text
            style={[styles.sectionTitle, { color: colors.text }]}
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
                    backgroundColor: colors.card,
                    borderColor: themeId === theme.id ? theme.colors.primary : colors.border,
                    borderWidth: themeId === theme.id ? 2 : 1,
                  },
                ]}
                onPress={() => handleThemeSelect(theme.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
                  style={styles.themeCardGradient}
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
                          elevation: 6,
                        },
                      ]}
                    />
                  </View>
                  {theme.id === 'nova' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#38BDF8' }]}>
                      <Text style={styles.specialBadgeText}>RARE</Text>
                    </View>
                  )}
                  {theme.id === 'zenith' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#00F5D4' }]}>
                      <Text style={[styles.specialBadgeText, { color: '#000' }]}>BEST</Text>
                    </View>
                  )}
                  {theme.id === 'cosmos' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#7B2CBF' }]}>
                      <Text style={styles.specialBadgeText}>COSMIC</Text>
                    </View>
                  )}
                  {theme.id === 'nebula' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#9D4EDD' }]}>
                      <Text style={styles.specialBadgeText}>DEEP</Text>
                    </View>
                  )}
                  {theme.id === 'supernova' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#FF2E00' }]}>
                      <Text style={[styles.specialBadgeText]}>HOT</Text>
                    </View>
                  )}
                  {theme.id === 'galaxy' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#9B5DE5' }]}>
                      <Text style={styles.specialBadgeText}>STAR</Text>
                    </View>
                  )}
                  {theme.id === 'void' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#6B6B80' }]}>
                      <Text style={styles.specialBadgeText}>DARK</Text>
                    </View>
                  )}
                  {theme.id === 'universe' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#00E5FF', shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#0B0014', fontWeight: 'bold' }]}>ULTIMATE</Text>
                    </View>
                  )}
                  {theme.id === 'dimension-x' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#00F0FF' }]}>
                      <Text style={[styles.specialBadgeText, { color: '#000' }]}>X-MAN</Text>
                    </View>
                  )}
                  {theme.id === 'atlantis' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#00B4D8' }]}>
                      <Text style={[styles.specialBadgeText, { color: '#000' }]}>DEEP</Text>
                    </View>
                  )}
                  {theme.id === 'sakura' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#FFB7C5' }]}>
                      <Text style={[styles.specialBadgeText, { color: '#000' }]}>ZEN</Text>
                    </View>
                  )}
                  {theme.id === 'vaporwave' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#FF71CE' }]}>
                      <Text style={styles.specialBadgeText}>RETRO</Text>
                    </View>
                  )}
                  {theme.id === 'enchanted' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#2D5A3D' }]}>
                      <Text style={styles.specialBadgeText}>MAGIC</Text>
                    </View>
                  )}
                  {theme.id === 'ottoman' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#D4AF37', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 4 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#0B1426', fontWeight: 'bold' }]}>SULTAN</Text>
                    </View>
                  )}
                  {theme.id === 'vampire' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#8B0000', shadowColor: '#DC143C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#F5E6E0', fontWeight: 'bold' }]}>IMMORTAL</Text>
                    </View>
                  )}
                  {theme.id === 'midnight' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#FF006E', shadowColor: '#FF006E', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#FFE5EC', fontWeight: 'bold', letterSpacing: 1 }]}>HOT</Text>
                    </View>
                  )}
                  {theme.id === 'dragon' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#FF2400', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 14, elevation: 8 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#FFD700', fontWeight: 'bold', letterSpacing: 1 }]}>LEGENDARY</Text>
                    </View>
                  )}
                  {theme.id === 'ice' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#A5F2F3', shadowColor: '#A5F2F3', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 15, elevation: 8 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#000810', fontWeight: 'bold', letterSpacing: 1 }]}>FROZEN</Text>
                    </View>
                  )}
                  {theme.id === 'dna' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#00CED1', shadowColor: '#00CED1', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 12, elevation: 7 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#000C10', fontWeight: 'bold', letterSpacing: 1 }]}>SCIENCE</Text>
                    </View>
                  )}
                  {theme.id === 'amber' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#FFBF00', shadowColor: '#FFBF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 14, elevation: 8 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#0C0804', fontWeight: 'bold', letterSpacing: 1 }]}>FOSSIL</Text>
                    </View>
                  )}
                  {theme.id === 'peacock' && (
                    <View style={[styles.specialBadge, { backgroundColor: '#0077BE', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 10 }]}>
                      <Text style={[styles.specialBadgeText, { color: '#FFD700', fontWeight: 'bold', letterSpacing: 1 }]}>ROYAL</Text>
                    </View>
                  )}
                  {themeId === theme.id && (
                    <View style={[styles.checkmarkContainer, { backgroundColor: theme.colors.primary }]}>
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
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            {t("themeSettings.backgroundEffects", "Arka Plan Efektleri")}
          </Text>

          <View style={styles.effectsContainer}>
            {[
              { id: 'shapes', name: t("themeSettings.effectShapes", "3D Şekiller"), icon: Box },
              { id: 'particles', name: t("themeSettings.effectParticles", "Parçacıklar"), icon: Sparkles },
              { id: 'waves', name: t("themeSettings.effectWaves", "Aura"), icon: Waves },
              { id: 'crystals', name: t("themeSettings.effectCrystals", "Atom Modeli"), icon: Atom },
              { id: 'tesseract', name: t("themeSettings.effectTesseract", "Tesseract"), icon: Hexagon },
              { id: 'none', name: t("themeSettings.effectNone", "Yok"), icon: CircleOff },
            ].map((effect) => (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.effectCard,
                  { 
                    backgroundColor: colors.card,
                    borderColor: backgroundEffect === effect.id ? colors.primary : colors.border,
                    borderWidth: backgroundEffect === effect.id ? 2 : 1,
                  }
                ]}
                onPress={() => setBackgroundEffect(effect.id as BackgroundEffectType)}
              >
                <View style={[
                  styles.effectIconContainer, 
                  { backgroundColor: backgroundEffect === effect.id ? colors.primary + '20' : colors.subText + '10' }
                ]}>
                  <effect.icon size={20} color={backgroundEffect === effect.id ? colors.primary : colors.subText} />
                </View>
                <Text style={[
                  styles.effectName, 
                  { color: backgroundEffect === effect.id ? colors.text : colors.subText }
                ]}>
                  {effect.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.previewSection}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 20 }]}>
              {t("themeSettings.preview", "Önizleme")}
            </Text>

            <View style={[styles.previewCardContainer, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              <LinearGradient
                colors={[colors.primary + '10', colors.secondary + '10']}
                style={styles.previewCardGradient}
              >
                <View style={styles.previewCardHeader}>
                  <Text style={[styles.previewCardTitle, { color: colors.text }]}>
                    {t("themeSettings.sampleCard", "Örnek Kart")}
                  </Text>
                  <View style={[styles.previewBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.previewBadgeText}>New</Text>
                  </View>
                </View>
                <Text style={[styles.previewDescription, { color: colors.subText }]}>
                  {t(
                    "themeSettings.previewDescription",
                    "Bu bir tema önizlemesidir. Renklerin ve bileşenlerin nasıl göründüğünü kontrol edin."
                  )}
                </Text>
                
                <View style={styles.buttonPreviewContainer}>
                  <ThemedButton
                    title={t("themeSettings.primaryButton", "Birincil Buton")}
                    onPress={() => {}}
                    style={styles.previewButton}
                  />
                  <View style={styles.buttonRow}>
                    <ThemedButton
                      title={t("themeSettings.secondaryButton", "İkincil")}
                      onPress={() => {}}
                      variant="secondary"
                      style={[styles.previewButton, { flex: 1, marginRight: 8 }]}
                    />
                    <ThemedButton
                      title={t("themeSettings.dangerButton", "Sil")}
                      onPress={() => {}}
                      variant="danger"
                      style={[styles.previewButton, { flex: 1 }]}
                    />
                  </View>
                </View>
              </LinearGradient>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentHeader: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  mainIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  effectsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  effectCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  effectName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  themeCard: {
    width: "48%",
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  themeCardGradient: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  themeColorRing: {
    padding: 4,
    borderRadius: 50,
    marginBottom: 12,
  },
  themePreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  specialBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  specialBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  colorDotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previewSection: {
    marginBottom: 40,
  },
  previewCardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewCardGradient: {
    padding: 24,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewCardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previewDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonPreviewContainer: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  previewButton: {
    marginBottom: 0,
  },
});
