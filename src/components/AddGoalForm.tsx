import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Plus, X, Briefcase, Heart, User, DollarSign, Tag, BrainCircuit, Sparkles } from "lucide-react-native";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { CATEGORIES } from "../constants/categories";
import { GoalCategory } from "../types/goal";
import { soundService } from "../services/SoundService";
import { aiService } from "../services/aiService";
import { useAIStore } from "../store/aiStore";

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
} from "react-native-reanimated";

interface AddGoalFormProps {
  onAddGoal: (text: string, category: GoalCategory) => void;
  disabled: boolean;
  currentCount?: number;
  existingGoals?: string[];
}

// --- ELITE CATEGORY CARD COMPONENT ---
const CategoryCard = ({ category, isSelected, onSelect, colors, isDarkMode }: any) => {
  const scale = useSharedValue(isSelected ? 1.2 : 1);
  const glow = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.25 : 1, { damping: 12, stiffness: 200 });
    glow.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isSelected ? category.color + '15' : 'transparent',
    shadowColor: category.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glow.value * 0.6,
    shadowRadius: glow.value * 15,
    borderWidth: isSelected ? 1 : 0,
    borderColor: category.color + '40',
  }));

  const CategoryIcon = ({ id, size, color }: { id: GoalCategory, size: number, color: string }) => {
    switch (id) {
      case 'work': return <Briefcase size={size} color={color} />;
      case 'health': return <Heart size={size} color={color} fill={isSelected ? color : 'transparent'} />;
      case 'personal': return <User size={size} color={color} />;
      case 'finance': return <DollarSign size={size} color={color} />;
      default: return <Tag size={size} color={color} />;
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => onSelect(category.id)}
      style={styles.categoryTouchable}
    >
      <Animated.View style={[styles.categoryItemElite, animatedStyle]}>
        <CategoryIcon id={category.id} size={22} color={isSelected ? category.color : (isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')} />
      </Animated.View>
    </TouchableOpacity>
  );
};

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
  
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { isAIEnabled } = useAIStore();

  const activeColor = CATEGORIES.find(c => c.id === selectedCategory)?.color || colors.primary;

  const handleAIRefine = async () => {
    if (text.trim() === "" || isRefining) return;
    setIsRefining(true);
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const refined = await aiService.refineGoal(text, i18n.language);
      if (refined !== text) {
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
      const suggestion = await aiService.suggestGoal(existingGoals, i18n.language); 
      setText(suggestion.text);
      setSelectedCategory(suggestion.category);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

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

  const scale = useSharedValue(1);
  const handlePressIn = () => { if (!disabled) scale.value = withSpring(0.96); };
  const handlePressOut = () => { scale.value = withSpring(1); };
  const animatedButtonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container}>
      {isExpanded ? (
        <View style={[styles.expandedForm, { backgroundColor: colors.card, borderColor: activeColor + '30', borderWidth: 1 }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("home.addGoalInputPlaceholder")}
            placeholderTextColor={colors.subText}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={100}
            autoFocus
            selectionColor={activeColor}
          />

          {isAIEnabled && (
            <View style={styles.aiActionsRow}>
              {text.length > 2 ? (
                <TouchableOpacity 
                  style={[styles.aiActionButton, { borderColor: activeColor + '40' }]} 
                  onPress={handleAIRefine}
                  disabled={isRefining}
                >
                  {isRefining ? (
                    <ActivityIndicator size="small" color={activeColor} />
                  ) : (
                    <>
                      <Sparkles size={14} color={activeColor} />
                      <Text style={[styles.aiActionText, { color: activeColor }]}>{t("home.aiRefine")}</Text>
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
                      <Text style={[styles.aiActionText, { color: colors.secondary }]}>{t("home.aiSuggestion")}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={[styles.categoryLabel, { color: colors.subText }]}>
            {t("home.selectCategory")}
          </Text>
          <View style={styles.categoryPicker}>
            {CATEGORIES.map((category) => (
              <CategoryCard 
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={(id: GoalCategory) => {
                  soundService.playClick();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(id);
                }}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>

          <View style={styles.expandedActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <X color={colors.text} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: activeColor }, (text.trim() === "" || disabled) && styles.disabledButton]}
              onPress={handleAddPress}
              disabled={text.trim() === "" || disabled}
              activeOpacity={0.8}
            >
              <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>{t("home.addGoal")}</Text>
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
              colors={disabled ? [colors.primary + '60', colors.primary + '40'] : [colors.primary, colors.secondary || colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonCollapsed}
            >
              {disabled ? (
                <View style={styles.disabledContent}>
                  <View style={[styles.countBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={styles.countBadgeText}>{currentCount}/3</Text>
                  </View>
                  <Text style={styles.addButtonCollapsedSubtext}>{t("home.maxGoalsReached")}</Text>
                </View>
              ) : (
                <>
                  <Plus color="#FFFFFF" size={24} style={{ marginRight: 8 }} />
                  <Text style={styles.addButtonCollapsedText}>{t("home.addGoal")}</Text>
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
  container: { width: '100%' },
  addButtonCollapsedWrapper: { width: '100%' },
  expandedForm: { width: '100%', borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  input: { fontSize: 17, fontWeight: '600', minHeight: 80, textAlignVertical: 'top' },
  aiActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  aiActionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 6 },
  aiActionText: { fontSize: 12, fontWeight: '700' },
  categoryLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginTop: 8 },
  categoryPicker: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 },
  categoryTouchable: { alignItems: 'center', justifyContent: 'center' },
  categoryItemElite: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, // Kareyi yumuşatılmış köşelerle geri getiriyoruz
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1.5,
  },
  expandedActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 12 },
  cancelButton: { padding: 12, marginRight: 8 },
  addButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  addButtonText: { fontSize: 16, fontWeight: "700" },
  addButtonCollapsed: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  addButtonCollapsedText: { marginLeft: 8, fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  disabledContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 10 },
  countBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  addButtonCollapsedSubtext: { color: "#FFFFFF", opacity: 0.9, fontSize: 14, fontWeight: '600' },
  disabledButton: { opacity: 0.5 },
});
