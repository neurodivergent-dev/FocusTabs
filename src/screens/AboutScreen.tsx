import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  useColorScheme,
} from "react-native";
import { useThemeStore } from "../store/themeStore";
import { ChevronLeft, Github, Mail, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";

export const AboutScreen: React.FC = () => {
  const router = useRouter();
  const { themeMode, isDarkMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Determine if we should use dark mode
  const useDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark") ||
    isDarkMode;

  const handleBack = () => {
    router.back();
  };

  const handleOpenGithub = () => {
    Linking.openURL("https://github.com/melihcanndemir");
  };

  const handleSendEmail = () => {
    Linking.openURL("mailto:melihcandemir@protonmail.com");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: useDarkMode ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={useDarkMode ? "#FFFFFF" : "#000000"} />
          <Text
            style={[
              styles.backText,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            About
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoContainer}>
          {/* Replace with your actual logo */}
          <View
            style={[
              styles.logoPlaceholder,
              { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
            ]}
          >
            <Text
              style={[
                styles.logoText,
                { color: useDarkMode ? "#FFFFFF" : "#000000" },
              ]}
            >
              FT
            </Text>
          </View>
          <Text
            style={[
              styles.appName,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            FocusTabs
          </Text>
          <Text
            style={[
              styles.version,
              { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
            ]}
          >
            Version 1.0.0
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            About
          </Text>
          <Text
            style={[
              styles.description,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            A premium minimalist productivity solution designed to enhance focus
            through simplicity. Our distraction-free environment allows you to
            prioritize up to three essential daily objectives.
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            Features
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: "#6366F1" }]} />
              <Text
                style={[
                  styles.featureText,
                  { color: useDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                Daily goal tracking
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: "#10B981" }]} />
              <Text
                style={[
                  styles.featureText,
                  { color: useDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                Minimalist distraction-free interface
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: "#F59E0B" }]} />
              <Text
                style={[
                  styles.featureText,
                  { color: useDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                Dark mode support
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.bullet, { backgroundColor: "#EC4899" }]} />
              <Text
                style={[
                  styles.featureText,
                  { color: useDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                Complete privacy - no data collection
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            Connect
          </Text>
          <View style={styles.connectButtons}>
            <TouchableOpacity
              style={[
                styles.connectButton,
                { backgroundColor: useDarkMode ? "#1F1F1F" : "#FFFFFF" },
              ]}
              onPress={handleOpenGithub}
            >
              <Github size={20} color={useDarkMode ? "#FFFFFF" : "#000000"} />
              <Text
                style={[
                  styles.connectButtonText,
                  { color: useDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                GitHub
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.connectButton,
                { backgroundColor: useDarkMode ? "#1F1F1F" : "#FFFFFF" },
              ]}
              onPress={handleSendEmail}
            >
              <Mail size={20} color={useDarkMode ? "#FFFFFF" : "#000000"} />
              <Text
                style={[
                  styles.connectButtonText,
                  { color: useDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                Contact
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.copyright,
              { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
            ]}
          >
            © 2025 Melih Can Demir
          </Text>
          <View style={styles.madeWithContainer}>
            <Text
              style={[
                styles.madeLove,
                { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
              ]}
            >
              Made with
            </Text>
            <Heart size={12} color="#EC4899" style={styles.heartIcon} />
            <Text
              style={[
                styles.madeLove,
                { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
              ]}
            >
              in Turkey
            </Text>
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
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
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
