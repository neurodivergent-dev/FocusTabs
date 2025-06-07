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
  useColorScheme,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Plus, X } from "lucide-react-native";
import { useThemeStore } from "../store/themeStore";
import Colors from "../../constants/Colors";

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

  // Get theme information
  const { themeMode, isDarkMode } = useThemeStore();
  const systemColorScheme = useColorScheme();

  // Determine if we should use dark mode
  const useDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark") ||
    isDarkMode;

  // Get theme colors
  const themeColors = Colors[useDarkMode ? "dark" : "light"];

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
          <View
            style={[
              styles.expandedForm,
              { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
            ]}
          >
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              placeholder="What's your goal for today?"
              placeholderTextColor={useDarkMode ? "#FFFFFF50" : "#00000050"}
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
                <X color={themeColors.text} size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: useDarkMode ? "#FFFFFF" : "#000000" },
                  (text.trim() === "" || disabled) && styles.disabledButton,
                ]}
                onPress={handleAddPress}
                disabled={text.trim() === "" || disabled}
              >
                <Text
                  style={[
                    styles.addButtonText,
                    { color: useDarkMode ? "#000000" : "#FFFFFF" },
                  ]}
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
              { backgroundColor: useDarkMode ? "#2A2A2A" : "#F5F5F7" },
              disabled && styles.disabledButton,
            ]}
            onPress={handleAddPress}
            disabled={disabled}
          >
            <Plus
              color={
                disabled
                  ? useDarkMode
                    ? "#FFFFFF50"
                    : "#00000050"
                  : themeColors.text
              }
              size={24}
            />
            <Text
              style={[
                styles.addButtonCollapsedText,
                { color: themeColors.text },
                disabled && { color: useDarkMode ? "#FFFFFF50" : "#00000050" },
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
