import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Github, Mail, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import FocusTabsLogo from "../../components/LogoComponent";

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

  return (
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
            {t("about.back")}
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: "#FFFFFF" }]}>
            {t("about.title")}
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
      >
        <View style={styles.logoContainer}>
          {/* App SVG Logo */}
          <View style={styles.logoWrapper}>
            <FocusTabsLogo size={100} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            {t("about.appName")}
          </Text>
          <Text style={[styles.version, { color: colors.subText }]}>
            {t("about.version")} 1.0.0
          </Text>
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
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t("about.features.dailyGoalTracking")}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.success }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t("about.features.minimalist")}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.warning }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t("about.features.darkMode")}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.secondary }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t("about.features.privacy")}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: colors.info }]} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t("about.features.themePalette")}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {t("about.features.calendar")}
              </Text>
            </View>
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
              onPress={handleOpenGithub}
            >
              <Github size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text }]}>
                {t("about.github")}
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
          <Text style={[styles.copyright, { color: colors.subText }]}>
            {t("about.copyright")}
          </Text>
          <View style={styles.madeWithContainer}>
            {i18n.language && i18n.language.startsWith("tr") ? (
              <>
                <Text style={[styles.madeLove, { color: colors.subText }]}>
                  {t("about.inTurkey")}
                </Text>
                <Heart size={12} color="#EC4899" style={styles.heartIcon} />
                <Text style={[styles.madeLove, { color: colors.subText }]}>
                  {" " + t("about.madeWith") + " yapıldı"}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.madeLove, { color: colors.subText }]}>
                  {t("about.madeWith")}
                </Text>
                <Heart size={12} color="#EC4899" style={styles.heartIcon} />
                <Text style={[styles.madeLove, { color: colors.subText }]}>
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
    paddingHorizontal: 16,
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
  title: {
    fontSize: 20,
    fontWeight: "600",
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
  version: {
    fontSize: 16,
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
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
  },
  connectButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  copyright: {
    fontSize: 14,
    marginBottom: 8,
  },
  madeLove: {
    fontSize: 14,
  },
  madeWithContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartIcon: {
    marginHorizontal: 4,
  },
});
