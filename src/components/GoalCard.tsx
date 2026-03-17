import React, { useState, useEffect, useRef, memo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { 
  Check, Trash2, Edit2, X, Target, Briefcase, Heart, 
  User, DollarSign, Tag, Play, Pause, Timer, Scissors, 
  ChevronDown, ChevronUp, RotateCcw, Sparkles 
} from "lucide-react-native";
import { Goal, GoalCategory } from "../types/goal";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { getCategoryById, CATEGORIES } from "../constants/categories";
import { soundService } from "../services/SoundService";
import { aiService } from "../services/aiService";
import { useAIStore } from "../store/aiStore";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (id: string, completed: boolean) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: (id: string, finalTime?: number) => void;
  onResetTimer: (id: string) => void;
  onDecompose: (id: string) => Promise<boolean>;
  onToggleSubTask: (goalId: string, subTaskId: string) => void;
  onDeleteSubTask: (goalId: string, subTaskId: string) => void;
  onUpdateSubTask: (goalId: string, subTaskId: string, text: string) => void;
  isActiveTimer: boolean;
  isAIEnabled: boolean;
  isFocusMode?: boolean; 
}

const CategoryCard = ({ category, isSelected, onSelect, isDarkMode }: any) => {
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
      <Animated.View style={[styles.categoryItemGrid, animatedStyle]}>
        <CategoryIcon id={category.id} size={22} color={isSelected ? category.color : (isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)')} isSelected={isSelected} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const GoalCardComponent = ({
  goal,
  onToggleComplete,
  onUpdateGoal,
  onDelete,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onDecompose,
  onToggleSubTask,
  onDeleteSubTask,
  onUpdateSubTask,
  isActiveTimer,
  isAIEnabled,
  isFocusMode = false,
}: GoalCardProps) => {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(goal.text);
  const [editCategory, setEditCategory] = useState<GoalCategory>(goal.category);
  const [isRefining, setIsRefining] = useState(false);
  
  // Sub-task editing state
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [editingSubTaskText, setEditingSubTaskText] = useState<string>("");

  const [isActionPending, setIsActionPending] = useState(false);

  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const { incrementGoalTime } = useDailyGoalsStore();

  const handleTimerAction = () => {
    if (isActionPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    soundService.playTimer();
    setIsActionPending(true);
    if (isActiveTimer) onStopTimer(goal.id, goal.focusTime);
    else onStartTimer(goal.id);
    setTimeout(() => setIsActionPending(false), 300);
  };

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!goal.completed) soundService.playComplete();
    else soundService.playUndo();
    onToggleComplete(goal.id, !goal.completed);
  };

  const handleAIRefine = async () => {
    if (editText.trim() === "" || isRefining) return;
    setIsRefining(true);
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const refined = await aiService.refineGoal(editText, i18n.language);
      if (refined !== editText) {
        setEditText(refined);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== "") {
      onUpdateGoal(goal.id, { text: editText.trim(), category: editCategory });
      setIsEditing(false);
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSaveSubTaskEdit = (subTaskId: string) => {
    if (editingSubTaskText.trim() !== "") {
      onUpdateSubTask(goal.id, subTaskId, editingSubTaskText.trim());
      setEditingSubTaskId(null);
      setEditingSubTaskText("");
      soundService.playClick();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCancelSubTaskEdit = () => {
    setEditingSubTaskId(null);
    setEditingSubTaskText("");
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    onDeleteSubTask(goal.id, subTaskId);
    soundService.playDelete();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatDuration = (seconds: number, target?: number) => {
    const displaySeconds = target ? Math.max(0, target - seconds) : seconds;
    const hrs = Math.floor(displaySeconds / 3600);
    const mins = Math.floor((displaySeconds % 3600) / 60);
    const secs = displaySeconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryInfo = getCategoryById(goal.category);
  const editCategoryInfo = getCategoryById(editCategory);
  const accentColor = goal.completed ? colors.success : colors.primary;

  const CategoryIconHelper = ({ id, size, color, fill = 'transparent' }: { id: GoalCategory, size: number, color: string, fill?: string }) => {
    switch (id) {
      case 'work': return <Briefcase size={size} color={color} />;
      case 'health': return <Heart size={size} color={color} fill={fill} />;
      case 'personal': return <User size={size} color={color} />;
      case 'finance': return <DollarSign size={size} color={color} />;
      default: return <Tag size={size} color={color} />;
    }
  };

  const CategoryHeader = ({ id, color, isFocused = false }: { id: GoalCategory, color: string, isFocused?: boolean }) => (
    <View style={[styles.categoryHeader, { justifyContent: 'flex-start', width: '100%', marginBottom: isFocused ? 24 : 8 }]}>
      <CategoryIconHelper id={id} size={isFocused ? 14 : 10} color={color} fill={id === 'health' ? color : 'transparent'} />
      <Text style={[styles.categoryHeaderText, { color, fontSize: isFocused ? 12 : 10 }]}>
        {t(`common.categories.${id}`).toUpperCase()}
      </Text>
    </View>
  );

  const renderFocusLayout = () => (
    <View style={styles.focusContentContainer}>
      <CategoryHeader id={goal.category} color={categoryInfo.color} isFocused />

      <TouchableOpacity
        style={[styles.focusCheckbox, { borderColor: accentColor }, goal.completed && { backgroundColor: colors.success }]}
        onPress={handleToggleComplete}
      >
        {goal.completed && <Check color="#FFFFFF" size={24} strokeWidth={3} />}
      </TouchableOpacity>

      <View style={styles.focusTextContainer}>
        {(goal.focusTime > 0 || isActiveTimer) && !goal.completed && (
          <View style={styles.focusTimerContainer}>
            <Timer size={20} color={isActiveTimer ? (goal.targetTime ? colors.secondary : colors.primary) : colors.subText} />
            <Text style={[
              styles.focusTimerText, 
              { color: isActiveTimer ? (goal.targetTime ? colors.secondary : colors.primary) : colors.subText }
            ]}>
              {formatDuration(goal.focusTime || 0, goal.targetTime)}
            </Text>
            {goal.targetTime && <Text style={[styles.countdownLabel, { color: colors.secondary }]}>REMAINING</Text>}
          </View>
        )}
        
        <Text style={[styles.focusGoalText, { color: colors.text }, goal.completed && styles.completedText]} numberOfLines={5}>
          {goal.text}
        </Text>
        
        <View style={styles.badgeRowFocus}>
          <View style={[styles.statusBadge, { backgroundColor: accentColor + '15' }]}>
            <Target size={10} color={accentColor} /><Text style={[styles.statusText, { color: accentColor }]}>{goal.completed ? t("common.completed") : t("common.active")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.focusActions}>
        {!goal.completed && (
          <>
            <TouchableOpacity
              style={[styles.focusPlayButtonContainer, isActionPending && { opacity: 0.5 }]}
              onPress={handleTimerAction}
              disabled={isActionPending}
            >
              <LinearGradient colors={[colors.primary, colors.secondary || colors.primary]} style={styles.focusPlayButtonGradient}>
                {isActiveTimer ? <Pause color="#FFFFFF" size={32} fill="#FFFFFF" /> : <Play color="#FFFFFF" size={32} fill="#FFFFFF" />}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.focusResetButton} onPress={() => { onResetTimer(goal.id); soundService.playUndo(); }}>
              <RotateCcw color={colors.subText} size={24} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderDefaultLayout = () => (
    <View style={styles.contentContainer}>
      <TouchableOpacity
        style={[styles.checkbox, { borderColor: accentColor }, goal.completed && { backgroundColor: colors.success }]}
        onPress={handleToggleComplete}
      >
        {goal.completed && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <CategoryHeader id={goal.category} color={categoryInfo.color} />

        <Text style={[styles.goalText, { color: colors.text }, goal.completed && styles.completedText]} numberOfLines={3}>
          {goal.text}
        </Text>

        <View style={styles.badgeRow}>
          {(goal.focusTime > 0 || isActiveTimer) && !goal.completed && (
            <View style={[styles.statusBadge, { backgroundColor: (goal.targetTime ? colors.secondary : colors.primary) + '10' }]}>
              <Timer size={10} color={isActiveTimer ? (goal.targetTime ? colors.secondary : colors.primary) : colors.subText} />
              <Text style={[styles.statusText, { color: isActiveTimer ? (goal.targetTime ? colors.secondary : colors.primary) : colors.subText }]}>
                {formatDuration(goal.focusTime || 0, goal.targetTime)}
              </Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: accentColor + '15' }]}>
            <Target size={10} color={accentColor} /><Text style={[styles.statusText, { color: accentColor }]}>{goal.completed ? t("common.completed") : t("common.active")}</Text>
          </View>
          {goal.subTasks && goal.subTasks.length > 0 && (
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={[styles.statusBadge, { backgroundColor: colors.info + '15' }]}>
              <Text style={[styles.statusText, { color: colors.info }]}>{goal.subTasks.filter(st => st.completed).length}/{goal.subTasks.length}</Text>
              {isExpanded ? <ChevronUp size={10} color={colors.info} /> : <ChevronDown size={10} color={colors.info} />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {!goal.completed && (
          <>
            {isAIEnabled && (!goal.subTasks || goal.subTasks.length === 0) && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  setIsSlicing(true);
                  await onDecompose(goal.id);
                  setIsSlicing(false);
                }}
                disabled={isSlicing}
              >
                {isSlicing ? <ActivityIndicator size="small" color={colors.secondary} /> : <Scissors color={colors.secondary} size={20} />}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.actionButton, isActionPending && { opacity: 0.5 }]} onPress={handleTimerAction} disabled={isActionPending}>
              {isActiveTimer ? <Pause color={colors.primary} size={20} fill={colors.primary} /> : <Play color={colors.primary} size={20} fill={colors.primary} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => { setIsEditing(true); setEditText(goal.text); setEditCategory(goal.category); }}>
              <Edit2 color={colors.subText} size={18} />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(goal.id)}>
          <Trash2 color={goal.completed ? colors.subText : colors.error} size={18} opacity={goal.completed ? 0.5 : 0.8} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const scale = useSharedValue(1);
  const handlePressIn = () => scale.value = withSpring(0.96);
  const handlePressOut = () => scale.value = withSpring(1);
  const animatedCardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const cardGradient = isFocusMode
    ? (isDarkMode 
        ? [colors.primary + '40', colors.secondary + '30'] 
        : [colors.primary + '15', colors.secondary + '10'])
    : (goal.completed 
        ? (isDarkMode ? [colors.success + '25', colors.success + '10'] : ['#FFFFFF', colors.success + '15'])
        : (isDarkMode ? [colors.primary + '20', colors.secondary + '15'] : ['#FFFFFF', colors.primary + '08']));

  const footerPadding = 20 + insets.bottom;

  return (
    <Animated.View style={[
      styles.cardWrapper,
      animatedCardStyle,
      isFocusMode && styles.focusCardWrapper,
      {
        shadowColor: goal.completed ? colors.success : (isDarkMode ? "#000" : colors.primary),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: goal.completed ? 8 : 4,
      }
    ]}>
      <View style={[
        styles.cardContainer, 
        isFocusMode && styles.focusCardContainer,
        { 
          backgroundColor: colors.card,
          borderColor: isDarkMode 
            ? (goal.completed ? colors.success + '30' : 'rgba(255,255,255,0.08)')
            : (goal.completed ? colors.success + '20' : 'rgba(0,0,0,0.03)'),
          borderWidth: 1,
        }
      ]}>
        <LinearGradient
          colors={cardGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {isEditing ? (
          <Modal
            visible={isEditing}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setIsEditing(false)}
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
                      <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.closeButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <X color={colors.text} size={24} />
                      </TouchableOpacity>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>{t("common.edit")}</Text>
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
                        <View style={[styles.inputWrapperModal, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', borderColor: editCategoryInfo.color + '20', borderWidth: 1 }]}>
                          <TextInput
                            style={[styles.fullScreenInput, { color: colors.text }]}
                            placeholder={t("home.addGoalInputPlaceholder")}
                            placeholderTextColor={colors.subText}
                            value={editText}
                            onChangeText={setEditText}
                            multiline
                            maxLength={100}
                            autoFocus
                            selectionColor={editCategoryInfo.color}
                          />
                          <Text style={[styles.charCount, { color: colors.subText }]}>{editText.length}/100</Text>
                        </View>

                        {isAIEnabled && (
                          <View style={styles.aiActionsRowModal}>
                            {editText.length > 2 && (
                              <TouchableOpacity
                                style={[styles.aiActionButtonModal, { borderColor: editCategoryInfo.color + '40', backgroundColor: editCategoryInfo.color + '10' }]}
                                onPress={handleAIRefine}
                                disabled={isRefining}
                              >
                                {isRefining ? (
                                  <ActivityIndicator size="small" color={editCategoryInfo.color} />
                                ) : (
                                  <>
                                    <Sparkles size={16} color={editCategoryInfo.color} />
                                    <Text style={[styles.aiActionTextModal, { color: editCategoryInfo.color }]}>{t("home.aiRefine")}</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        <Text style={[styles.categoryLabelModal, { color: colors.subText }]}>
                          {t("home.selectCategory")}
                        </Text>
                        <View style={styles.categoryPickerModal}>
                          {CATEGORIES.map((cat) => (
                            <CategoryCard
                              key={cat.id}
                              category={cat}
                              isSelected={editCategory === cat.id}
                              onSelect={(id: GoalCategory) => {
                                soundService.playClick();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setEditCategory(id);
                              }}
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </View>
                      </View>

                      <View style={[
                        styles.footerWrapperModal,
                        {
                          paddingTop: 20,
                          paddingBottom: insets.bottom + 20,
                          backgroundColor: 'transparent',
                        }
                      ]}>
                        <TouchableOpacity
                          onPress={handleSaveEdit}
                          disabled={editText.trim() === ""}
                          activeOpacity={0.8}
                          style={{ width: '100%', paddingHorizontal: 24 }}
                        >
                          <LinearGradient
                            colors={editText.trim() === "" ? [colors.border, colors.border] : [colors.primary, colors.secondary || colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                              styles.saveButtonModal,
                              editText.trim() === "" && { opacity: 0.6 }
                            ]}
                          >
                            <Text style={[
                              styles.saveButtonTextModal,
                              { color: editText.trim() === "" ? colors.subText : '#FFFFFF' }
                            ]}>
                              {t("common.save")}
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
        ) : (
          isFocusMode ? renderFocusLayout() : renderDefaultLayout()
        )}

        {isExpanded && goal.subTasks && goal.subTasks.length > 0 && !isFocusMode && (
          <View style={[styles.subTasksContainer, { borderTopColor: colors.border + '40' }]}>
            {goal.subTasks.map((subTask) => (
              <View key={subTask.id} style={styles.subTaskRow}>
                {editingSubTaskId === subTask.id ? (
                  <View style={styles.subTaskEditContainer}>
                    <TextInput
                      style={[styles.subTaskEditInput, { color: colors.text, borderColor: colors.primary + '40' }]}
                      value={editingSubTaskText}
                      onChangeText={setEditingSubTaskText}
                      autoFocus
                      maxLength={100}
                    />
                    <View style={styles.subTaskEditActions}>
                      <TouchableOpacity onPress={() => handleSaveSubTaskEdit(subTask.id)} style={styles.subTaskActionIcon}>
                        <Check size={16} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCancelSubTaskEdit} style={styles.subTaskActionIcon}>
                        <X size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity style={styles.subTaskItem} onPress={() => onToggleSubTask(goal.id, subTask.id)}>
                      <View style={[styles.subTaskCheckbox, { borderColor: subTask.completed ? colors.success : colors.subText + '40' }, subTask.completed && { backgroundColor: colors.success }]}>
                        {subTask.completed && <Check color="#FFFFFF" size={10} strokeWidth={4} />}
                      </View>
                      <Text style={[styles.subTaskText, { color: subTask.completed ? colors.subText : colors.text }, subTask.completed && styles.completedText]}>{subTask.text}</Text>
                    </TouchableOpacity>
                    <View style={styles.subTaskActions}>
                      <TouchableOpacity 
                        onPress={() => { setEditingSubTaskId(subTask.id); setEditingSubTaskText(subTask.text); }}
                        style={styles.subTaskActionIcon}
                      >
                        <Edit2 size={14} color={colors.subText} opacity={0.6} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteSubTask(subTask.id)}
                        style={styles.subTaskActionIcon}
                      >
                        <Trash2 size={14} color={colors.error} opacity={0.4} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {isFocusMode && goal.subTasks && goal.subTasks.length > 0 && (
          <View style={styles.focusSubTasksContainer}>
            {goal.subTasks.map((subTask) => (
              <TouchableOpacity key={subTask.id} style={styles.focusSubTaskItem} onPress={() => onToggleSubTask(goal.id, subTask.id)}>
                <View style={[styles.focusSubTaskCheckbox, { borderColor: subTask.completed ? colors.success : colors.subText + '40' }, subTask.completed && { backgroundColor: colors.success }]}>
                  {subTask.completed && <Check color="#FFFFFF" size={14} strokeWidth={4} />}
                </View>
                <Text style={[styles.focusSubTaskText, { color: subTask.completed ? colors.subText : colors.text }, subTask.completed && styles.completedText]}>{subTask.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export const GoalCard = memo(GoalCardComponent);

const styles = StyleSheet.create({
  cardWrapper: { marginBottom: 16, width: '100%' },
  focusCardWrapper: { marginTop: 20, marginBottom: 30 },
  cardContainer: { borderRadius: 24, overflow: 'hidden' },
  focusCardContainer: { borderRadius: 32 },
  contentContainer: { padding: 20, flexDirection: "row", alignItems: "flex-start" },
  focusContentContainer: { padding: 30, flexDirection: 'column', alignItems: 'flex-start' },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, justifyContent: "center", alignItems: "center", marginTop: 4 },
  focusCheckbox: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 16, marginRight: 8 }, 
  focusTextContainer: { alignItems: 'flex-start', width: '100%' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }, 
  categoryHeaderText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  goalText: { fontSize: 17, fontWeight: "600", lineHeight: 24, marginBottom: 12 }, 
  focusGoalText: { fontSize: 26, fontWeight: '800', lineHeight: 34, textAlign: 'left', marginBottom: 16 },
  completedText: { textDecorationLine: "line-through", opacity: 0.6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }, 
  badgeRowFocus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, justifyContent: 'center' },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  actions: { flexDirection: "row", alignItems: 'center', marginTop: 4 }, 
  focusActions: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 20 },
  actionButton: { padding: 8 },
  focusPlayButtonContainer: { width: 74, height: 74, borderRadius: 37, overflow: 'hidden', elevation: 10, shadowColor: "#6366F1", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15 },
  focusPlayButtonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  focusResetButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  // Modal Styles
  fullScreenContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  closeButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputWrapperModal: { borderRadius: 24, padding: 20, minHeight: 120, marginBottom: 16 },
  fullScreenInput: { fontSize: 20, fontWeight: '500', flex: 1, textAlignVertical: 'top' },
  charCount: { alignSelf: 'flex-end', fontSize: 11, fontWeight: '600', marginTop: 4 },
  aiActionsRowModal: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  aiActionButtonModal: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 6 },
  aiActionTextModal: { fontSize: 13, fontWeight: '700' },
  categoryLabelModal: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  categoryPickerModal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  categoryTouchable: { alignItems: 'center', justifyContent: 'center' },
  categoryItemGrid: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  footerWrapperModal: { borderTopWidth: 1, width: '100%' },
  saveButtonModal: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveButtonTextModal: { fontSize: 17, fontWeight: '700' },

  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  focusTimerContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  timerText: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  focusTimerText: { fontSize: 32, fontWeight: '900', fontVariant: ['tabular-nums'] },
  countdownLabel: { fontSize: 10, fontWeight: '900', marginLeft: 8, letterSpacing: 1 },
  subTasksContainer: { padding: 16, paddingTop: 0, marginTop: -8, borderTopWidth: 1 },
  focusSubTasksContainer: { width: '100%', marginTop: 10, paddingHorizontal: 20, paddingBottom: 20 },
  subTaskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subTaskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, flex: 1 },
  subTaskActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subTaskActionIcon: { padding: 4 },
  subTaskEditContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  subTaskEditInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 1, marginRight: 8 },
  subTaskEditActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusSubTaskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  subTaskCheckbox: { width: 18, height: 18, borderRadius: 6, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  focusSubTaskCheckbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  subTaskText: { fontSize: 14, fontWeight: '500' },
  focusSubTaskText: { fontSize: 18, fontWeight: '600' },
});
