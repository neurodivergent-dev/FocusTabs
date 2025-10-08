import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useLanguageStore } from "../store/languageStore";
import { LANGUAGES } from "../i18n/i18n";
import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";
import { Check } from "lucide-react-native";

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

interface LanguageOption {
  code: string;
  label: string;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { currentLanguage, setLanguage } = useLanguageStore();

  const languageOptions: LanguageOption[] = [
    { code: LANGUAGES.EN, label: "English" },
    { code: LANGUAGES.TR, label: "Türkçe" },
    { code: LANGUAGES.DE, label: "Deutsch" },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[styles.modalContainer, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("settings.language")}
              </Text>

              <ScrollView style={styles.languageList}>
                {languageOptions.map((option) => (
                  <TouchableOpacity
                    key={option.code}
                    style={[
                      styles.languageOption,
                      currentLanguage === option.code && {
                        backgroundColor: colors.primary + "20",
                      },
                    ]}
                    onPress={() => handleLanguageSelect(option.code)}
                  >
                    <Text
                      style={[styles.languageLabel, { color: colors.text }]}
                    >
                      {option.label}
                    </Text>

                    {currentLanguage === option.code && (
                      <Check size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>
                  {t("settings.close") || "Close"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  languageList: {
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LanguageModal;
