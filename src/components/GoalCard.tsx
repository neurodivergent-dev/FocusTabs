import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Check, Trash2, Edit2, X, Target, Briefcase, Heart as HeartIcon, User, DollarSign, Tag, Play, Pause, Timer, Scissors, ChevronDown, ChevronUp } from "lucide-react-native";
import { Goal, GoalCategory, SubTask } from "../types/goal";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { getCategoryById } from "../constants/categories";
import { soundService } from "../services/SoundService";

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (id: string, completed: boolean) => void;
  onUpdateText: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: () => void;
  onDecompose: (id: string) => Promise<boolean>;
  onToggleSubTask: (goalId: string, subTaskId: string) => void;
  isActiveTimer: boolean;
  isAIEnabled: boolean;
  index: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onToggleComplete,
  onUpdateText,
  onDelete,
  onStartTimer,
  onStopTimer,
  onDecompose,
  onToggleSubTask,
  isActiveTimer,
  isAIEnabled,
  index,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(goal.text);

  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const category = getCategoryById(goal.category);

  const CategoryIcon = ({ id, size, color }: { id: GoalCategory, size: number, color: string }) => {
    switch (id) {
      case 'work': return <Briefcase size={size} color={color} />;
      case 'health': return <HeartIcon size={size} color={color} fill={id === 'health' ? color : 'transparent'} />;
      case 'personal': return <User size={size} color={color} />;
      case 'finance': return <DollarSign size={size} color={color} />;
      default: return <Tag size={size} color={color} />;
    }
  };

  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!goal.completed) {
      soundService.playComplete();
    } else {
      soundService.playUndo();
    }
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
    soundService.playDelete();
    onDelete(goal.id);
  };

  const cardGradient = goal.completed 
    ? (isDarkMode ? [colors.success + '25', colors.success + '10'] : ['#FFFFFF', colors.success + '15'])
    : (isDarkMode ? [colors.primary + '20', colors.secondary + '15'] : ['#FFFFFF', colors.primary + '08']);
  
  const accentColor = goal.completed ? colors.success : colors.primary;

  return (
    <Animated.View style={[
      styles.cardWrapper,
      animatedCardStyle,
      {
        // Temel gölge ayarları (Her zaman dışta)
        shadowColor: goal.completed ? colors.success : (isDarkMode ? "#000" : colors.primary),
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: goal.completed ? (isDarkMode ? 8 : 2) : (isDarkMode ? 4 : 3),
      }
    ]}>
      <View style={[
        styles.cardContainer, 
        { 
          backgroundColor: colors.card,
          borderColor: isDarkMode 
            ? (goal.completed ? colors.success + '30' : 'rgba(255,255,255,0.08)')
            : (goal.completed ? colors.success + '20' : 'rgba(0,0,0,0.03)'),
          borderWidth: 1,
        }
      ]}>
        <LinearGradient
          colors={cardGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.contentContainer}>
          {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={editText}
                  onChangeText={setEditText}
                  autoFocus
                  multiline
                  maxLength={100}
                  placeholderTextColor={colors.subText}
                  selectionColor={colors.primary}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    onPress={handleCancelEdit}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <X color={colors.text} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveEdit}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Check color="#FFFFFF" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: accentColor },
                    goal.completed && { backgroundColor: colors.success }
                  ]}
                  onPress={handleToggleComplete}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.7}
                >
                  {goal.completed && <Check color="#FFFFFF" size={14} strokeWidth={3} />}
                </TouchableOpacity>

                <View style={styles.textContainer}>
                  {/* Timer Display */}
                  {(goal.focusTime > 0 || isActiveTimer) && !goal.completed && (
                    <View style={styles.timerContainer}>
                      <Timer size={12} color={isActiveTimer ? colors.primary : colors.subText} />
                      <Text style={[styles.timerText, { color: isActiveTimer ? colors.primary : colors.subText }]}>
                        {formatDuration(goal.focusTime || 0)}
                      </Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={handleToggleComplete}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Text
                      style={[
                        styles.goalText,
                        { color: colors.text },
                        goal.completed && styles.completedText
                      ]}
                      numberOfLines={3}
                    >
                      {goal.text}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.badgeRow}>
                    <View style={[styles.statusBadge, { backgroundColor: accentColor + '15' }]}>
                      <Target size={10} color={accentColor} />
                      <Text style={[styles.statusText, { color: accentColor }]}>
                        {goal.completed ? t("common.completed") : t("common.active")}
                      </Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: category.color + '15', marginLeft: 8 }]}>
                      <CategoryIcon id={goal.category} size={10} color={category.color} />
                      <Text style={[styles.statusText, { color: category.color }]}>
                        {t(category.nameKey)}
                      </Text>
                    </View>

                    {/* Subtask count badge */}
                    {goal.subTasks && goal.subTasks.length > 0 && (
                      <TouchableOpacity 
                        onPress={() => setIsExpanded(!isExpanded)}
                        style={[styles.statusBadge, { backgroundColor: colors.info + '15', marginLeft: 8 }]}
                      >
                        <Text style={[styles.statusText, { color: colors.info }]}>
                          {goal.subTasks.filter(st => st.completed).length}/{goal.subTasks.length}
                        </Text>
                        {isExpanded ? <ChevronUp size={10} color={colors.info} /> : <ChevronDown size={10} color={colors.info} />}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.actions}>
                  {!goal.completed && (
                    <>
                      {/* AI Slicer Button - Only show if AI is enabled and no subtasks exist yet */}
                      {isAIEnabled && !goal.subTasks && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={async () => {
                            setIsSlicing(true);
                            const success = await onDecompose(goal.id);
                            setIsSlicing(false);
                            
                            if (!success) {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                              Alert.alert(t("home.aiErrorTitle"), t("home.aiDecomposeError"));
                            }
                          }}
                          disabled={isSlicing}
                          onPressIn={handlePressIn}
                          onPressOut={handlePressOut}
                        >
                          {isSlicing ? (
                            <ActivityIndicator size="small" color={colors.secondary} />
                          ) : (
                            <Scissors color={colors.secondary} size={20} />
                          )}
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => isActiveTimer ? onStopTimer() : onStartTimer(goal.id)}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                      >
                        {isActiveTimer ? (
                          <Pause color={colors.primary} size={20} fill={colors.primary} />
                        ) : (
                          <Play color={colors.primary} size={20} fill={colors.primary} />
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleEditPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                      >
                        <Edit2 color={colors.subText} size={18} />
                      </TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDeletePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Trash2 color={goal.completed ? colors.subText : colors.error} size={18} opacity={goal.completed ? 0.5 : 0.8} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Expanded Subtasks Section */}
          {isExpanded && goal.subTasks && goal.subTasks.length > 0 && (
            <View style={[styles.subTasksContainer, { borderTopColor: colors.border + '40' }]}>
              {goal.subTasks.map((subTask) => (
                <TouchableOpacity
                  key={subTask.id}
                  style={styles.subTaskItem}
                  onPress={() => onToggleSubTask(goal.id, subTask.id)}
                >
                  <View style={[
                    styles.subTaskCheckbox, 
                    { borderColor: subTask.completed ? colors.success : colors.subText + '40' },
                    subTask.completed && { backgroundColor: colors.success }
                  ]}>
                    {subTask.completed && <Check color="#FFFFFF" size={10} strokeWidth={4} />}
                  </View>
                  <Text style={[
                    styles.subTaskText, 
                    { color: subTask.completed ? colors.subText : colors.text },
                    subTask.completed && styles.completedText
                  ]}>
                    {subTask.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { marginBottom: 16, width: '100%' },
  cardContainer: { borderRadius: 24, overflow: 'hidden' },
  gradient: { width: '100%' },
  contentContainer: { padding: 20, flexDirection: "row", alignItems: "flex-start" },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, justifyContent: "center", alignItems: "center", marginTop: 2 },
  textContainer: { flex: 1, marginLeft: 16, marginRight: 8 },
  goalText: { fontSize: 17, fontWeight: "600", lineHeight: 24, marginBottom: 8 },
  completedText: { textDecorationLine: "line-through", opacity: 0.6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  actions: { flexDirection: "row", alignItems: 'center' },
  actionButton: { padding: 8, marginLeft: 4 },
  editContainer: { flex: 1 },
  editInput: { fontSize: 17, fontWeight: "600", borderBottomWidth: 2, paddingBottom: 8, marginBottom: 16, minHeight: 40 },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  timerText: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  subTasksContainer: {
    padding: 16,
    paddingTop: 0,
    marginTop: -8,
    borderTopWidth: 1,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  subTaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subTaskText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
