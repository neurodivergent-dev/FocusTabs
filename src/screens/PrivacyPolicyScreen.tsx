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
  Heart,
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
            {t("privacy.back")}
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { color: "#FFFFFF" }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
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
                {t("privacy.zeroDataCollectionTitle")}:{" "}
              </Text>
              {t("privacy.zeroDataCollectionDesc")}
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
                {t("privacy.localStorageOnlyTitle")}:{" "}
              </Text>
              {t("privacy.localStorageOnlyDesc")}
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
                {t("privacy.noThirdPartyAnalyticsTitle")}:{" "}
              </Text>
              {t("privacy.noThirdPartyAnalyticsDesc")}
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
          <View style={[styles.footerDivider, { backgroundColor: colors.border, opacity: 0.3 }]} />
          
          <Text style={[styles.footerText, { color: colors.text, opacity: 0.7 }]}>
            {t("privacy.lastUpdated")}
          </Text>
          <Text style={[styles.copyright, { color: colors.text, opacity: 0.7, marginBottom: 16 }]}>
            {t("privacy.copyright")}
          </Text>

          <View style={styles.madeWithContainer}>
            {t("common.language") === "tr" ? (
              <>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {t("about.inTurkey")}
                </Text>
                <View style={styles.heartPulse}>
                  <Heart size={14} color="#EF4444" fill="#EF4444" />
                </View>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {" " + t("about.madeWith") + " yapıldı"}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
                  {t("about.madeWith")}
                </Text>
                <View style={styles.heartPulse}>
                  <Heart size={14} color="#EF4444" fill="#EF4444" />
                </View>
                <Text style={[styles.madeLoveText, { color: colors.subText }]}>
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
  title: {
    fontSize: 20,
    fontWeight: "700",
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
    paddingBottom: 12,
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
    marginTop: 8,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  footerDivider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  copyright: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  madeLoveText: {
    fontSize: 13,
    fontWeight: "500",
  },
  madeWithContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heartPulse: {
    marginHorizontal: 6,
  },
});
