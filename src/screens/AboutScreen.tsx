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
} from "react-native";
import { ChevronLeft, Github, Mail, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";

export const AboutScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

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
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>
            Settings
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>About</Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoContainer}>
          {/* App icon */}
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.text }]}>
            FocusTabs
          </Text>
          <Text style={[styles.version, { color: colors.subText }]}>
            Version 1.0.0
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            A premium minimalist productivity solution designed to enhance focus
            through simplicity. Our distraction-free environment allows you to
            prioritize up to three essential daily objectives.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Features
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.primary }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Daily goal tracking
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.success }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Minimalist distraction-free interface
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.warning }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Dark mode support
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[styles.bullet, { backgroundColor: colors.secondary }]}
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Complete privacy - no data collection
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Connect
          </Text>
          <View style={styles.connectButtons}>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: colors.card }]}
              onPress={handleOpenGithub}
            >
              <Github size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text }]}>
                GitHub
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.connectButton, { backgroundColor: colors.card }]}
              onPress={handleSendEmail}
            >
              <Mail size={20} color={colors.text} />
              <Text style={[styles.connectButtonText, { color: colors.text }]}>
                Contact
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: colors.subText }]}>
            © 2025 Melih Can Demir
          </Text>
          <View style={styles.madeWithContainer}>
            <Text style={[styles.madeLove, { color: colors.subText }]}>
              Made with
            </Text>
            <Heart size={12} color="#EC4899" style={styles.heartIcon} />
            <Text style={[styles.madeLove, { color: colors.subText }]}>
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
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
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
