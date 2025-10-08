import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Check, Trash2, Edit2, X } from "lucide-react-native";
import { Goal } from "../types/goal";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (id: string, completed: boolean) => void;
  onUpdateText: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggleComplete,
  onUpdateText,
  onDelete,
  index,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(goal.text);
  const { colors } = useTheme();
  const { t: _t } = useTranslation();

  // Tema renkleri kullanarak gradient setleri oluşturalım
  const gradientSets = [
    [colors.primary, colors.secondary], // Ana tema renkleri
    [colors.secondary, colors.primary], // Tersine çevirilmiş
    [colors.info, colors.primary], // Bilgi rengi ve ana renk
  ];

  // Get the gradient colors based on the index
  const gradientColors = gradientSets[index % gradientSets.length];

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleComplete(goal.id, !goal.completed);
  };

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(goal.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== "") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdateText(goal.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleDeletePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(goal.id);
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, goal.completed && styles.completedCard]}
    >
      <View style={styles.contentContainer}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              multiline
              maxLength={100}
              placeholderTextColor="#FFFFFF99"
              selectionColor="#FFFFFF"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleCancelEdit}
              >
                <X color="#FFF" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Check color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={handleToggleComplete}
            >
              {goal.completed && <Check color="#FFF" size={16} />}
            </TouchableOpacity>
            <Text
              style={[styles.goalText, goal.completed && styles.completedText]}
              numberOfLines={3}
            >
              {goal.text}
            </Text>
            <View style={styles.actions}>
              {!goal.completed && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEditPress}
                >
                  <Edit2 color="#FFF" size={18} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeletePress}
              >
                <Trash2 color="#FFF" size={18} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: width - 32,
    overflow: "hidden",
  },
  completedCard: {
    opacity: 0.7,
  },
  contentContainer: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  goalText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  editContainer: {
    flex: 1,
    flexDirection: "column",
  },
  editInput: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF80",
    paddingBottom: 8,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF33",
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: "#FFFFFF66",
  },
});
