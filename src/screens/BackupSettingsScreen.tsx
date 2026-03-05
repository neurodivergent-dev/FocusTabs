import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  Info,
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
import { CustomAlert } from "../components/CustomAlert";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";

export default function BackupSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const [importAlertVisible, setImportAlertVisible] = useState(false);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any>(null);

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
          dialogTitle: t("backup.exportTitle"),
          UTI: "public.json",
        });
      } else {
        Alert.alert(
          t("backup.error"),
          t("backup.sharingNotAvailable")
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        t("backup.error"),
        t("backup.exportError")
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
          t("backup.error"),
          t("backup.invalidFile")
        );
        return;
      }

      // Show Custom Alert instead of standard Alert
      setPendingImportData(data);
      setImportAlertVisible(true);
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert(
        t("backup.error"),
        t("backup.importError")
      );
    }
  };

  const confirmImport = () => {
    setImportAlertVisible(false);
    if (!pendingImportData) return;

    const success = importData(pendingImportData);
    if (success) {
      setSuccessAlertVisible(true);
    } else {
      setErrorAlertVisible(true);
    }
    setPendingImportData(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary || colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
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
              {t("settings.title")}
            </Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text 
              style={[styles.headerTitle, { color: "#FFFFFF" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t("backup.title")}
            </Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </LinearGradient>

        <ScrollView style={styles.scrollView}>
          <View style={styles.contentHeader}>
            <Download size={32} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              {t("backup.title")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              {t("backup.description")}
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
              {t("backup.export")}
            </Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.card }]}
              onPress={handleExport}
            >
              <Download size={24} color={colors.primary} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t("backup.exportJSON")}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: colors.subText }]}
                >
                  {t("backup.exportJSONDescription")}
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
              {t("backup.import")}
            </Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: colors.card }]}
              onPress={handleImport}
            >
              <Upload size={24} color={colors.secondary} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {t("backup.importJSON")}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: colors.subText }]}
                >
                  {t("backup.importJSONDescription")}
                </Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>

          {/* Info Card - Redesigned */}
          <View style={[styles.infoCardContainer, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <LinearGradient
              colors={[isDarkMode ? colors.primary + '20' : colors.primary + '10', isDarkMode ? colors.secondary + '20' : colors.secondary + '10']}
              style={styles.infoCardGradient}
            >
              <View style={[styles.infoIconCircle, { backgroundColor: colors.primary + '20' }]}>
                <Info size={20} color={colors.primary} />
              </View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                {t("backup.info")}
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>

      <CustomAlert
        visible={importAlertVisible}
        title={t("backup.confirmImport")}
        message={t("backup.importWarning")}
        type="danger"
        confirmText={t("backup.import")}
        cancelText={t("common.cancel")}
        onConfirm={confirmImport}
        onCancel={() => setImportAlertVisible(false)}
      />

      <CustomAlert
        visible={successAlertVisible}
        title={t("backup.success")}
        message={t("backup.importSuccess")}
        type="success"
        confirmText={t("common.ok")}
        onConfirm={() => setSuccessAlertVisible(false)}
        onCancel={() => setSuccessAlertVisible(false)}
      />

      <CustomAlert
        visible={errorAlertVisible}
        title={t("backup.error")}
        message={t("backup.importError")}
        type="danger"
        confirmText={t("common.ok")}
        onConfirm={() => setErrorAlertVisible(false)}
        onCancel={() => setErrorAlertVisible(false)}
      />
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
    fontSize: 18,
    fontWeight: "700",
    textAlign: 'center',
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
  infoCardContainer: {
    borderRadius: 24,
    marginBottom: 40,
    overflow: 'hidden',
  },
  infoCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
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
