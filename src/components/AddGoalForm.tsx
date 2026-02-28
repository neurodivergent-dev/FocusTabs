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
              <View style={styles.disabledContent}>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{currentCount}/3</Text>
                </View>
                <Text style={styles.addButtonCollapsedSubtext}>
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
    width: '100%',
  },
  addButtonCollapsedWrapper: {
    width: '100%',
  },
  expandedForm: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  expandedActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
  },
  cancelButton: {
    padding: 12,
    marginRight: 8,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30, // Tam yuvarlak buton
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonCollapsedText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disabledContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  addButtonCollapsedSubtext: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.8,
  },
});
