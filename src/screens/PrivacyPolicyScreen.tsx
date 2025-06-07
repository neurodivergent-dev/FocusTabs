import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useThemeStore } from "../store/themeStore";
import {
  ChevronLeft,
  Shield,
  Lock,
  Eye,
  CheckCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";

export const PrivacyPolicyScreen: React.FC = () => {
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
            Privacy Policy
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBackground,
              { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
            ]}
          >
            <Shield size={40} color="#10B981" />
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
            Our Privacy Commitment
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            FocusTabs is engineered with a privacy-first approach. We believe
            your personal data belongs to you, which is why we've designed our
            app to respect your privacy completely.
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
            Data Collection
          </Text>
          <View style={styles.policyItem}>
            <Eye size={20} color="#6366F1" style={styles.policyIcon} />
            <Text
              style={[
                styles.policyText,
                { color: useDarkMode ? "#FFFFFF" : "#000000" },
              ]}
            >
              <Text style={styles.bold}>Zero Data Collection: </Text>
              The application operates entirely offline with absolutely no data
              collection mechanisms.
            </Text>
          </View>
          <View style={styles.policyItem}>
            <Lock size={20} color="#EC4899" style={styles.policyIcon} />
            <Text
              style={[
                styles.policyText,
                { color: useDarkMode ? "#FFFFFF" : "#000000" },
              ]}
            >
              <Text style={styles.bold}>Local Storage Only: </Text>
              All your goal information and settings are stored locally on your
              device and never transmitted elsewhere.
            </Text>
          </View>
          <View style={styles.policyItem}>
            <CheckCircle size={20} color="#F59E0B" style={styles.policyIcon} />
            <Text
              style={[
                styles.policyText,
                { color: useDarkMode ? "#FFFFFF" : "#000000" },
              ]}
            >
              <Text style={styles.bold}>No Third-Party Analytics: </Text>
              We don't use any third-party analytics or tracking tools in our
              application.
            </Text>
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
            Data Security
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            All user information is securely stored locally on your device using
            SQLite. We follow industry best practices for local data security to
            ensure your information remains private.
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
            Your Rights
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            Since all data is stored locally on your device, you maintain
            complete control over your information. You can delete the app at
            any time to remove all associated data.
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
            Policy Updates
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: useDarkMode ? "#FFFFFF" : "#000000" },
            ]}
          >
            We may update this privacy policy from time to time. When we do, we
            will revise the "last updated" date at the bottom of this page.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
            ]}
          >
            Last updated: June 2025
          </Text>
          <Text
            style={[
              styles.footerText,
              { color: useDarkMode ? "#FFFFFF80" : "#00000080" },
            ]}
          >
            © 2025 Melih Can Demir. All rights reserved.
          </Text>
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
  iconContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  policyItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  policyIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  policyText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  bold: {
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
});
