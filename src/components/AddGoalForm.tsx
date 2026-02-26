import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Plus, X } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";

interface AddGoalFormProps {
  onAddGoal: (text: string) => void;
  disabled: boolean;
  currentCount?: number;
}

export const AddGoalForm: React.FC<AddGoalFormProps> = ({
  onAddGoal,
  disabled,
  currentCount = 0,
}) => {
  const [text, setText] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Tema renklerine erişim
  const { colors } = useTheme();

  // Translation hook
  const { t } = useTranslation();

  const handleAddPress = () => {
    if (!isExpanded) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsExpanded(true);
      return;
    }

    if (text.trim() !== "") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAddGoal(text.trim());
      setText("");
      setIsExpanded(false);
      Keyboard.dismiss();
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);
    setText("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {isExpanded ? (
        <View style={[styles.expandedForm, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("home.addGoalInputPlaceholder")}
            placeholderTextColor={colors.subText}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={100}
            autoFocus
          />
          <View style={styles.expandedActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <X color={colors.text} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.primary },
                (text.trim() === "" || disabled) && styles.disabledButton,
              ]}
              onPress={handleAddPress}
              disabled={text.trim() === "" || disabled}
              activeOpacity={0.8}
            >
              <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>
                {t("home.addGoal")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleAddPress}
          disabled={disabled}
          activeOpacity={0.8}
          style={styles.addButtonCollapsedWrapper}
        >
          <LinearGradient
            colors={disabled ? [colors.subText + '40', colors.subText + '40'] : [colors.primary, colors.secondary || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.addButtonCollapsed,
              disabled && styles.disabledButton,
            ]}
          >
            {disabled ? (
              <View style={styles.disabledTextContainer}>
                <Text style={[styles.addButtonCollapsedText, { opacity: 0.8, fontSize: 14 }]}>
                  {currentCount}/3
                </Text>
                <Text style={[styles.addButtonCollapsedSubtext, { color: '#FFFFFF', opacity: 0.7, fontSize: 12, marginTop: 2 }]}>
                  {t("home.maxGoalsReached")}
                </Text>
              </View>
            ) : (
              <>
                <Plus color="#FFFFFF" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.addButtonCollapsedText}>
                  {t("home.addGoal")}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
  },
  addButtonCollapsedWrapper: {
    width: '100%',
  },
  expandedForm: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    minHeight: 60,
  },
  expandedActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
  },
  cancelButton: {
    padding: 10,
    marginRight: 12,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addButtonCollapsed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonCollapsedText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disabledTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonCollapsedSubtext: {
    color: "#FFFFFF",
    opacity: 0.7,
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
