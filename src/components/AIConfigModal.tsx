import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Brain, X, ExternalLink, ShieldCheck, Zap, Sparkles } from "lucide-react-native";
import { useAIStore } from "../store/aiStore";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

interface AIConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ visible, onClose }) => {
  const { apiKey, setApiKey } = useAIStore();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [inputKey, setInputKey] = useState(apiKey || "");

  useEffect(() => {
    if (visible) {
      setInputKey(apiKey || "");
    }
  }, [visible, apiKey]);

  const handleSave = async () => {
    await setApiKey(inputKey.trim() || null);
    onClose();
  };

  const openGeminiDashboard = () => {
    Linking.openURL("https://aistudio.google.com/app/apikey");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                <Brain size={24} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("settings.ai.title")}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.subText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.description, { color: colors.subText }]}>
              {t("settings.ai.description")}
            </Text>

            <View style={[styles.infoCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
              <ShieldCheck size={20} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                API anahtarınız sadece cihazınızda güvenli bir kasada saklanır.
              </Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("settings.ai.apiKey")}
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderColor: colors.border
                  }
                ]}
                placeholder={t("settings.ai.apiKeyPlaceholder")}
                placeholderTextColor={colors.subText}
                value={inputKey}
                onChangeText={setInputKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.helpLink} 
                onPress={openGeminiDashboard}
              >
                <Text style={[styles.helpLinkText, { color: colors.primary }]}>
                  {t("settings.ai.howToGet")}
                </Text>
                <ExternalLink size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.featuresPreview}>
              <View style={styles.featureItem}>
                <Zap size={20} color={colors.warning} />
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Refine</Text>
                  <Text style={[styles.featureDesc, { color: colors.subText }]}>Hedeflerinizi daha profesyonel hale getirir.</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Sparkles size={20} color={colors.info} />
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>AI Motivation</Text>
                  <Text style={[styles.featureDesc, { color: colors.subText }]}>Size özel günlük motivasyon sağlar.</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={[colors.primary, colors.secondary || colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              <Text style={styles.saveButtonText}>{t("settings.ai.saveKey")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: "flex-end" },
  modalView: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  closeButton: { padding: 4 },
  scrollContent: { flex: 1 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: { fontSize: 13, flex: 1, opacity: 0.8 },
  inputSection: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 10, textTransform: 'uppercase', opacity: 0.6 },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  helpLinkText: { fontSize: 14, fontWeight: "600" },
  saveButton: { marginTop: 12, borderRadius: 18, overflow: 'hidden' },
  saveGradient: { paddingVertical: 16, alignItems: 'center' },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  featuresPreview: { gap: 20, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  featureDesc: { fontSize: 13 },
});
