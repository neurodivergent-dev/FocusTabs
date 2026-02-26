import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  Download,
  Upload,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  exportData,
  dataToJSON,
  jsonToData,
  importData,
} from "../utils/backup";

export default function BackupSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Export data to JSON file
  const handleExport = async () => {
    try {
      const data = exportData();
      const jsonString = dataToJSON(data);

      // Create a temporary file
      const fileName = `focustabs-backup-${new Date().toISOString().split("T")[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString);

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: t("backup.exportTitle") || "Export Backup",
          UTI: "public.json",
        });
      } else {
        Alert.alert(
          t("backup.error") || "Error",
          t("backup.sharingNotAvailable") ||
            "Sharing is not available on this device"
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        t("backup.error") || "Error",
        t("backup.exportError") || "Failed to export data"
      );
    }
  };

  // Import data from JSON file
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const data = jsonToData(content);

      if (!data) {
        Alert.alert(
          t("backup.error") || "Error",
          t("backup.invalidFile") || "Invalid backup file"
        );
        return;
      }

      // Confirm import
      Alert.alert(
        t("backup.confirmImport") || "Confirm Import",
        t("backup.importWarning") ||
          "This will replace your current data. Continue?",
        [
          {
            text: t("common.cancel") || "Cancel",
            style: "cancel",
          },
          {
            text: t("backup.import") || "Import",
            style: "destructive",
            onPress: () => {
              const success = importData(data);
              if (success) {
                Alert.alert(
                  t("backup.success") || "Success",
                  t("backup.importSuccess") || "Data imported successfully"
                );
              } else {
                Alert.alert(
                  t("backup.error") || "Error",
                  t("backup.importError") || "Failed to import data"
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert(
        t("backup.error") || "Error",
        t("backup.importError") || "Failed to import data"
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

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
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#FFFFFF" />
            <Text style={[styles.backText, { color: "#FFFFFF" }]}>
              {t("settings.title") || "Settings"}
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>
              {t("backup.title") || "Backup & Restore"}
            </Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </LinearGradient>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentHeader}>
            <Download size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {t("backup.title") || "Backup & Restore"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              {t("backup.description") ||
                "Save your data or transfer to another device"}
            </Text>
          </View>

          {/* Export Options */}
          <LinearGradient
            colors={[colors.primary + '10', colors.secondary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.section, { borderWidth: 1, borderColor: colors.primary + '20' }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("backup.export") || "Export"}
            </Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.card }]}
              onPress={handleExport}
            >
              <Download size={24} color={colors.primary} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t("backup.exportJSON") || "Export to JSON"}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: colors.subText }]}
                >
                  {t("backup.exportJSONDescription") ||
                    "Download your data as a JSON file"}
                </Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>

          {/* Import Options */}
          <LinearGradient
            colors={[colors.primary + '10', colors.secondary + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.section, { borderWidth: 1, borderColor: colors.primary + '20' }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("backup.import") || "Import"}
            </Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.card }]}
              onPress={handleImport}
            >
              <Upload size={24} color={colors.secondary} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t("backup.importJSON") || "Import from JSON"}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: colors.subText }]}
                >
                  {t("backup.importJSONDescription") ||
                    "Restore data from a JSON file"}
                </Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.info }]}>
            <Text style={[styles.infoText, { color: "#FFFFFF" }]}>
              {t("backup.info") ||
                "Backup includes your goals, theme settings, and language preference."}
            </Text>
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
    paddingBottom: 16,
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
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  qrInstructions: {
    fontSize: 14,
    textAlign: "center",
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  scannerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  scannerContent: {
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
  },
  scanner: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
  },
  permissionContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
