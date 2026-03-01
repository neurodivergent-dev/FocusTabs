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
import { Plus, X, Briefcase, Heart, User, DollarSign, Tag } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { CATEGORIES } from "../constants/categories";
import { GoalCategory } from "../types/goal";
import { soundService } from "../services/SoundService";
import { aiService } from "../services/aiService";
import { useAIStore } from "../store/aiStore";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react-native";
import { ActivityIndicator } from "react-native";

import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, cancelAnimation } from "react-native-reanimated";

interface AddGoalFormProps {
  onAddGoal: (text: string, category: GoalCategory) => void;
  disabled: boolean;
  currentCount?: number;
  existingGoals?: string[];
}

export const AddGoalForm: React.FC<AddGoalFormProps> = ({
  onAddGoal,
  disabled,
  currentCount = 0,
  existingGoals = [],
}) => {
  const [text, setText] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>("other");
  const [isRefining, setIsRefining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { isAIEnabled } = useAIStore();
  const { i18n } = useTranslation();

  const handleAIRefine = async () => {
    if (text.trim() === "" || isRefining) return;
    
    setIsRefining(true);
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const refined = await aiService.refineGoal(text, i18n.language);
      if (refined === text) {
        // Eğer AI orijinal metni döndürdüyse (hata/kota durumu)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // İstersen buraya bir Alert veya küçük bir toast mesajı da koyabiliriz
      } else {
        setText(refined);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAISuggest = async () => {
    if (isSuggesting) return;
    
    setIsSuggesting(true);
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const suggestion = await aiService.suggestGoal(existingGoals, "tr"); 
      setText(suggestion.text);
      setSelectedCategory(suggestion.category);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Category Icon Mapper
  const CategoryIcon = ({ id, size, color }: { id: GoalCategory, size: number, color: string }) => {
    switch (id) {
      case 'work': return <Briefcase size={size} color={color} />;
      case 'health': return <Heart size={size} color={color} fill={selectedCategory === 'health' && id === 'health' ? color : 'transparent'} />;
      case 'personal': return <User size={size} color={color} />;
      case 'finance': return <DollarSign size={size} color={color} />;
      default: return <Tag size={size} color={color} />;
    }
  };

  // Scale animation for interaction
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();

  // Translation hook
  const { t } = useTranslation();

  const handleAddPress = () => {
    if (!isExpanded) {
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsExpanded(true);
      return;
    }

    if (text.trim() !== "") {
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAddGoal(text.trim(), selectedCategory);
      setText("");
      setSelectedCategory("other");
      setIsExpanded(false);
      Keyboard.dismiss();
    }
  };

  const handleCancel = () => {
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);
    setText("");
    setSelectedCategory("other");
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

          {isAIEnabled && (
            <View style={styles.aiActionsRow}>
              {text.length > 2 ? (
                <TouchableOpacity 
                  style={[styles.aiActionButton, { borderColor: colors.primary + '40' }]} 
                  onPress={handleAIRefine}
                  disabled={isRefining}
                >
                  {isRefining ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Sparkles size={14} color={colors.primary} />
                      <Text style={[styles.aiActionText, { color: colors.primary }]}>AI Refine</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.aiActionButton, { borderColor: colors.secondary + '40' }]} 
                  onPress={handleAISuggest}
                  disabled={isSuggesting}
                >
                  {isSuggesting ? (
                    <ActivityIndicator size="small" color={colors.secondary} />
                  ) : (
                    <>
                      <BrainCircuit size={14} color={colors.secondary} />
                      <Text style={[styles.aiActionText, { color: colors.secondary }]}>AI Suggestion</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={[styles.categoryLabel, { color: colors.subText }]}>
            {t("home.selectCategory", "Kategori Seçin")}
          </Text>
          <View style={styles.categoryPicker}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  soundService.playClick();
                  setSelectedCategory(category.id);
                }}
                style={[
                  styles.categoryItem,
                  { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                  selectedCategory === category.id && { 
                    backgroundColor: category.color + '20',
                    borderColor: category.color,
                    borderWidth: 1.5
                  }
                ]}
              >
                <CategoryIcon 
                  id={category.id} 
                  size={18} 
                  color={selectedCategory === category.id ? category.color : colors.subText} 
                />
              </TouchableOpacity>
            ))}
          </View>

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
        <Animated.View style={[styles.addButtonCollapsedWrapper, animatedButtonStyle]}>
          <TouchableOpacity
            onPress={handleAddPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={0.8}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={
                disabled 
                  ? [colors.primary + '60', colors.primary + '40'] 
                  : [colors.primary, colors.secondary || colors.primary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.addButtonCollapsed,
              ]}
            >
              {disabled ? (
                <View style={styles.disabledContent}>
                  <View style={[styles.countBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)' }]}>
                    <Text style={[styles.countBadgeText, { color: '#FFFFFF' }]}>
                      {currentCount}/3
                    </Text>
                  </View>
                  <Text style={[styles.addButtonCollapsedSubtext, { color: '#FFFFFF', opacity: 0.85 }]}>
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
        </Animated.View>
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
  aiActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  aiActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
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
