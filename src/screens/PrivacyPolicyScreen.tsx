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
import {
  ChevronLeft,
  Shield,
  Lock,
  Eye,
  CheckCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

export const PrivacyPolicyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleBack = () => {
    router.back();
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
            {t("privacy.back")}
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: "#FFFFFF" }]}>
            {t("privacy.title")}
          </Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
      >
        <View style={styles.iconContainer}>
          <View
            style={[styles.iconBackground, { backgroundColor: colors.card }]}
          >
            <Shield size={40} color={colors.success} />
          </View>
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
            {t("privacy.ourPrivacyCommitmentTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t("privacy.ourPrivacyCommitment")}
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
            {t("privacy.dataCollectionTitle")}
          </Text>
          <View style={styles.policyItem}>
            <Eye size={20} color={colors.primary} style={styles.policyIcon} />
            <Text style={[styles.policyText, { color: colors.text }]}>
              <Text style={styles.bold}>
                {t("privacy.zeroDataCollection").split(":")[0]}:{" "}
              </Text>
              {t("privacy.zeroDataCollection").split(": ").slice(1).join(": ")}
            </Text>
          </View>
          <View style={styles.policyItem}>
            <Lock
              size={20}
              color={colors.secondary}
              style={styles.policyIcon}
            />
            <Text style={[styles.policyText, { color: colors.text }]}>
              <Text style={styles.bold}>
                {t("privacy.localStorageOnly").split(":")[0]}:{" "}
              </Text>
              {t("privacy.localStorageOnly").split(": ").slice(1).join(": ")}
            </Text>
          </View>
          <View style={styles.policyItem}>
            <CheckCircle
              size={20}
              color={colors.warning}
              style={styles.policyIcon}
            />
            <Text style={[styles.policyText, { color: colors.text }]}>
              <Text style={styles.bold}>
                {t("privacy.noThirdPartyAnalytics").split(":")[0]}:{" "}
              </Text>
              {t("privacy.noThirdPartyAnalytics")
                .split(": ")
                .slice(1)
                .join(": ")}
            </Text>
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
            {t("privacy.dataSecurityTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t("privacy.dataSecurity")}
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
            {t("privacy.yourRightsTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t("privacy.yourRights")}
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
            {t("privacy.policyUpdatesTitle")}
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            {t("privacy.policyUpdates")}
          </Text>
        </LinearGradient>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subText }]}>
            {t("privacy.lastUpdated")}
          </Text>
          <Text style={[styles.footerText, { color: colors.subText }]}>
            {t("privacy.copyright")}
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
