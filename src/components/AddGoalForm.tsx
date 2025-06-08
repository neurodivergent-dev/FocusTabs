import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Plus, X } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";

interface AddGoalFormProps {
  onAddGoal: (text: string) => void;
  disabled: boolean;
}

export const AddGoalForm: React.FC<AddGoalFormProps> = ({
  onAddGoal,
  disabled,
}) => {
  const [text, setText] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        {isExpanded ? (
          <View style={[styles.expandedForm, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="What's your goal for today?"
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
              >
                <Text
                  style={[styles.addButtonText, { color: colors.buttonText }]}
                >
                  Add Goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.addButtonCollapsed,
              { backgroundColor: colors.card },
              disabled && styles.disabledButton,
            ]}
            onPress={handleAddPress}
            disabled={disabled}
          >
            <Plus color={disabled ? colors.subText : colors.text} size={24} />
            <Text
              style={[
                styles.addButtonCollapsedText,
                { color: colors.text },
                disabled && { color: colors.subText },
              ]}
            >
              {disabled ? "Max Goals Reached" : "Add Goal"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 16,
    width: "100%",
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
    fontWeight: "600",
  },
  addButtonCollapsed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonCollapsedText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
