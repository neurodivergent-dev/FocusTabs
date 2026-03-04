import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
} from "react-native-reanimated";

interface AddGoalFormProps {
  onAddGoal: (text: string, category: GoalCategory) => void;
  disabled: boolean;
  currentCount?: number;
  existingGoals?: string[];
}

interface CategoryCardProps {
  category: typeof CATEGORIES[0];
  isSelected: boolean;
  onSelect: (id: GoalCategory) => void;
  isDarkMode: boolean;
}

const CategoryCard = ({ category, isSelected, onSelect, isDarkMode }: CategoryCardProps) => {
  const scale = useSharedValue(isSelected ? 1.1 : 1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.1 : 1, { damping: 15, stiffness: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: isSelected ? category.color + '25' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'),
    borderColor: isSelected ? category.color : 'transparent',
    borderWidth: 2,
  }));

  const CategoryIcon = ({ id, size, color, isSelected }: { id: GoalCategory, size: number, color: string, isSelected: boolean }) => {
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
      <Animated.View style={[styles.categoryItem, animatedStyle]}>
        <CategoryIcon id={category.id} size={22} color={isSelected ? category.color : (isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')} isSelected={isSelected} />
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
  const insets = useSafeAreaInsets();
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
      <Modal
        visible={isExpanded}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <BlurView intensity={Platform.OS === 'ios' ? 70 : 100} style={StyleSheet.absoluteFill} tint={isDarkMode ? 'dark' : 'light'}>
          <LinearGradient
            colors={[
              isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
              isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'
            ]}
            style={{ flex: 1 }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <View style={[styles.fullScreenContainer, { paddingTop: insets.top }]}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCancel} style={[styles.closeButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <X color={colors.text} size={24} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{t("home.addGoal")}</Text>
                  <View style={{ width: 44 }} />
                </View>

                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  keyboardDismissMode="on-drag"
                >
                  <View style={{ paddingHorizontal: 24 }}>
                    <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', borderColor: activeColor + '20', borderWidth: 1 }]}>
                      <TextInput
                        style={[styles.fullScreenInput, { color: colors.text }]}
                        placeholder={t("home.addGoalInputPlaceholder")}
                        placeholderTextColor={colors.subText}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={100}
                        autoFocus
                        selectionColor={activeColor}
                      />
                      <Text style={[styles.charCount, { color: colors.subText }]}>{text.length}/100</Text>
                    </View>

                    {isAIEnabled && (
                      <View style={styles.aiActionsRow}>
                        {text.length > 2 ? (
                          <TouchableOpacity
                            style={[styles.aiActionButton, { borderColor: activeColor + '40', backgroundColor: activeColor + '10' }]}
                            onPress={handleAIRefine}
                            disabled={isRefining}
                          >
                            {isRefining ? (
                              <ActivityIndicator size="small" color={activeColor} />
                            ) : (
                              <>
                                <Sparkles size={16} color={activeColor} />
                                <Text style={[styles.aiActionText, { color: activeColor }]}>{t("home.aiRefine")}</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.aiActionButton, { borderColor: colors.secondary + '40', backgroundColor: colors.secondary + '10' }]}
                            onPress={handleAISuggest}
                            disabled={isSuggesting}
                          >
                            {isSuggesting ? (
                              <ActivityIndicator size="small" color={colors.secondary} />
                            ) : (
                              <>
                                <BrainCircuit size={16} color={colors.secondary} />
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
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </View>
                  </View>

                  <View style={[
                    styles.footerWrapper,
                    {
                      paddingTop: 20,
                      paddingBottom: insets.bottom + 20,
                      backgroundColor: 'transparent',
                    }
                  ]}>
                    <TouchableOpacity
                      onPress={handleAddPress}
                      disabled={text.trim() === "" || disabled}
                      activeOpacity={0.8}
                      style={{ width: '100%', paddingHorizontal: 24 }}
                    >
                      <LinearGradient
                        colors={(text.trim() === "" || disabled) ? [colors.border, colors.border] : [colors.primary, colors.secondary || colors.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.submitButton,
                          (text.trim() === "" || disabled) && { opacity: 0.6 }
                        ]}
                      >
                        <Text style={[
                          styles.submitButtonText,
                          { color: (text.trim() === "" || disabled) ? colors.subText : '#FFFFFF' }
                        ]}>
                          {t("common.confirm")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </BlurView>
      </Modal>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  fullScreenContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  closeButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputWrapper: { borderRadius: 24, padding: 20, minHeight: 120, marginBottom: 16 },
  fullScreenInput: { fontSize: 20, fontWeight: '500', flex: 1, textAlignVertical: 'top' },
  charCount: { alignSelf: 'flex-end', fontSize: 11, fontWeight: '600', marginTop: 4 },
  aiActionsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  aiActionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 6 },
  aiActionText: { fontSize: 13, fontWeight: '700' },
  categoryLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  categoryPicker: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryTouchable: { alignItems: 'center', justifyContent: 'center' },
  categoryItem: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  footerWrapper: { borderTopWidth: 1, width: '100%' },
  submitButton: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  submitButtonText: { fontSize: 17, fontWeight: '700' },
  addButtonCollapsedWrapper: { width: '100%' },
  addButtonCollapsed: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, paddingHorizontal: 24, borderRadius: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  addButtonCollapsedText: { marginLeft: 8, fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  disabledContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 10 },
  countBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  addButtonCollapsedSubtext: { color: "#FFFFFF", opacity: 0.9, fontSize: 14, fontWeight: '600' },
});
