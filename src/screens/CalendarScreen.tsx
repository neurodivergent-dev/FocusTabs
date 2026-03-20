import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useTheme } from "../components/ThemeProvider";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Sparkles,
  Trophy,
  Briefcase,
  Heart,
  User,
  DollarSign,
  Tag,
  RotateCcw,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { GoalCard } from "../components/GoalCard";
import { AddGoalForm } from "../components/AddGoalForm";
import { useAIStore } from "../store/aiStore";
import Animated, { FadeInDown, SlideOutDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { GoalCategory } from "../types/goal";
import { getCategoryById } from "../constants/categories";

export const CalendarScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode, themeId: _themeId } = useTheme();
  const { t, i18n } = useTranslation();

  // Configure calendar language settings according to i18n
  const configureCalendarLocale = useCallback(() => {
    // Get localized weekdays
    const getLocalizedWeekdays = () => {
      const weekdays = [];
      for (let i = 0; i < 7; i++) {
        // January 2, 2000 was a Sunday, by adding i we can get all days
        const date = new Date(2000, 0, 2 + i);
        weekdays.push(
          date.toLocaleDateString(i18n.language, { weekday: "long" })
        );
      }
      return weekdays;
    };

    // Get localized short weekdays
    const getLocalizedWeekdaysShort = () => {
      const weekdaysShort = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(2000, 0, 2 + i);
        weekdaysShort.push(
          date.toLocaleDateString(i18n.language, { weekday: "short" })
        );
      }
      return weekdaysShort;
    };

    // Get localized month names
    const getLocalizedMonthNames = () => {
      const monthNames = [];
      for (let i = 0; i < 12; i++) {
        // We're using 2023 as the year because in some calendar systems
        // there might be issues with May in the year 2000
        const date = new Date(2023, i, 1);
        monthNames.push(
          date.toLocaleDateString(i18n.language, { month: "long" })
        );
      }
      return monthNames;
    };

    // Create month and day names according to current language
    const weekdays = getLocalizedWeekdays();
    const weekdaysShort = getLocalizedWeekdaysShort();
    const monthNames = getLocalizedMonthNames();
    const monthNamesShort = monthNames.map((month) =>
      month.length > 3 ? month.substring(0, 3) : month
    );

    // Update LocaleConfig according to current language
    LocaleConfig.locales[i18n.language] = {
      monthNames,
      monthNamesShort,
      dayNames: weekdays,
      dayNamesShort: weekdaysShort,
      today: t("calendar.today", "Today"),
    };

    // Set default language
    LocaleConfig.defaultLocale = i18n.language;
  }, [i18n.language, t]);

  // i18n configuration - Set language settings for calendar
  useEffect(() => {
    configureCalendarLocale();
  }, [configureCalendarLocale]);

  // Store and data
  const {
    completionData,
    calendarLoading,
    calendarError,
    fetchAllCompletions,
    fetchGoalsByDate,
    dateGoals,
    dateGoalsLoading,
    addGoal,
    toggleGoalCompletion,
    updateGoal,
    deleteGoal,
    undoDelete,
    lastDeletedGoal,
    activeTimerGoalId,
    startGoalTimer,
    stopGoalTimer,
    resetGoalTimer,
    decomposeGoal,
    toggleSubTask,
    deleteSubTask,
    updateSubTask,
    hasReachedMaxGoals,
  } = useDailyGoalsStore();

  const { isAIEnabled } = useAIStore();
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const undoTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    setIsUndoVisible(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setIsUndoVisible(false), 5000);
  };

  // State to track theme changes
  const [themeVersion, setThemeVersion] = useState(0);

  // Keep track of actual date and display date
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");

  // Get current date as formatted string using native JavaScript Date
  const getCurrentDate = (): string => {
    // Use UTC for consistent date formatting
    const today = new Date();
    const year = today.getFullYear();
    // JavaScript months are 0-indexed so we add +1
    // In some regional settings month calculation might be problematic, so we get the getMonth() value first and then add +1
    const monthValue = today.getMonth();
    const month = String(monthValue + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // Debug logs
    // console.log(
    //   `Calculating date: Year: ${year}, Month index: ${monthValue}, Month: ${month}, Day: ${day}`
    // );

    return `${year}-${month}-${day}`;
  };

  // Check date format and return in correct format
  const formatDate = (date: string | Date): string => {
    try {
      if (typeof date === "string") {
        // Check YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error("Invalid date format");
        }
        return date;
      }

      // If it's a Date object, convert to string - add +1 to month value since it's 0-indexed
      const year = date.getFullYear();
      const monthValue = date.getMonth(); // Get the value first
      const month = String(monthValue + 1).padStart(2, "0"); // Then add +1 and format
      const day = String(date.getDate()).padStart(2, "0");

      // Debug logs
      // console.log(
      //   `Formatting date: Year: ${year}, Month index: ${monthValue}, Month: ${month}, Day: ${day}`
      // );

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Date format error:", error);
      return getCurrentDate();
    }
  };

  // MarkedDate interface definition
  interface MarkedDate {
    selected?: boolean;
    selectedColor?: string;
    marked?: boolean;
    dotColor?: string;
    customStyles?: {
      container?: ViewStyle;
      text?: TextStyle;
    };
  }

  // State for calendar markings (marked dates)
  const [markedDates, setMarkedDates] = useState<Record<string, MarkedDate>>(
    {}
  );

  // Initial loading and settings
  useEffect(() => {
    const today = getCurrentDate();
    setSelectedDate(today);
    setDisplayDate(today);
    fetchGoalsByDate(today);
    fetchAllCompletions();
    // updateDailyStats() - Gereksiz, zaten fetchAllCompletions yeterli
  }, [fetchAllCompletions, fetchGoalsByDate]);

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log('CalendarScreen: Tab focused, refreshing data...');
      fetchAllCompletions();
      if (selectedDate) {
        fetchGoalsByDate(selectedDate);
      }
    }, [selectedDate, fetchAllCompletions, fetchGoalsByDate])
  );

  // Theme change adjustments
  useEffect(() => {
    // Increase themeVersion to force calendar re-render
    setThemeVersion((prev) => prev + 1);

    // Reload selected date data only
    if (selectedDate) {
      setDisplayDate(selectedDate);
      fetchGoalsByDate(selectedDate);
    }
  }, [selectedDate, fetchGoalsByDate]);

  // Update theme version when theme or language changes
  useEffect(() => {
    setThemeVersion((prev) => prev + 1);
  }, [colors, isDarkMode]);

  const isPastDate = useMemo(() => {
    if (!selectedDate) return false;
    const today = getCurrentDate();
    return selectedDate < today;
  }, [selectedDate]);

  // Determine color based on completion percentage
  const getCompletionColor = useCallback(
    (percentage: number, totalCount?: number) => {
      if (totalCount === 0) return colors.subText; // Neutral color if no goals
      if (percentage === 0) return colors.error;
      if (percentage < 50) return colors.warning;
      if (percentage < 100) return colors.info;
      return colors.success;
    },
    [colors]
  );

  // Update calendar markings when completion data changes
  useEffect(() => {
    if (!selectedDate) return;

    const marked: Record<string, MarkedDate> = {};
    const today = getCurrentDate();

    // Create markings from completionData
    if (completionData.length > 0) {
      completionData.forEach((item) => {
        if (!item.date || !item.date.match(/^\d{4}-\d{2}-\d{2}$/)) return;

        const isSelected = item.date === selectedDate;
        const color = getCompletionColor(item.percentage, item.totalCount);
        const opacity = item.completedCount > 0 ? Math.max(0.1, item.percentage / 100) : 0;

        marked[item.date] = {
          selected: isSelected,
          marked: item.completedCount > 0,
          dotColor: color,
          customStyles: {
            container: {
              backgroundColor: isSelected ? colors.primary : (item.completedCount > 0 ? color + Math.floor(opacity * 255).toString(16).padStart(2, '0') : 'transparent'),
              borderRadius: 10,
              borderWidth: item.date === today ? 1.5 : 0,
              borderColor: colors.primary,
              // Shadow for selected or high completion
              ...(isSelected || item.percentage >= 100 ? {
                shadowColor: color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              } : {}),
            },
            text: {
              color: isSelected ? "#FFFFFF" : colors.text,
              fontWeight: (isSelected ? "bold" : "500") as "bold" | "500",
            },
          },
        };
      });
    }

    // Mark today's date if not in completionData
    if (!marked[today]) {
      marked[today] = {
        selected: today === selectedDate,
        customStyles: {
          container: {
            backgroundColor: today === selectedDate ? colors.primary : "transparent",
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderRadius: 10,
          },
          text: {
            color: today === selectedDate ? "#FFFFFF" : colors.primary,
            fontWeight: "bold",
          },
        },
      };
    }

    // Ensure selected date is marked even if no data
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: colors.primary,
            borderRadius: 10,
          },
          text: {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
        },
      };
    }

    setMarkedDates(marked);
  }, [completionData, selectedDate, colors, getCompletionColor]);

  // Completion status text
  const getCompletionText = (percentage: number, totalCount?: number) => {
    if (totalCount === 0) return t("calendar.completionStatus.noGoals");
    if (percentage === 0) return t("calendar.completionStatus.notCompleted");
    if (percentage < 50)
      return t("calendar.completionStatus.partiallyCompleted");
    if (percentage < 100) return t("calendar.completionStatus.mostlyCompleted");
    return t("calendar.completionStatus.fullyCompleted");
  };

  // Date selection handler
  const handleDateSelect = (date: DateData) => {
    // console.log("Selected date:", date.dateString);

    // Update selected date in string format
    const formattedDate = formatDate(date.dateString);
    setSelectedDate(formattedDate);
    setDisplayDate(formattedDate);

    // Get tasks for the newly selected date
    fetchGoalsByDate(formattedDate);
  };

  // When month changes, update data
  const handleMonthChange = () => {
    // Ensure data continuity when calendar changes
    fetchAllCompletions();
  };

  // Find data for selected date
  const findCompletionDataForDate = (date: string) => {
    return completionData.find((item) => item.date === date);
  };

  // Selected day info
  const selectedDateData = findCompletionDataForDate(selectedDate);

  // Set first day of the week
  const getFirstDayOfWeek = () => {
    // Default: Monday (1)
    // Can be customized based on language - e.g. Sunday (0) for US
    return i18n.language === "en-US" ? 0 : 1;
  };

  // Prepare calendar theme styles with useMemo
  const calendarTheme = useMemo(
    () => ({
      // Force apply critical background colors
      backgroundColor: colors.background,
      calendarBackground: colors.background,

      // Text colors - use theme colors directly
      textSectionTitleColor: colors.text,
      textSectionTitleDisabledColor: colors.subText,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: "#FFFFFF",
      todayTextColor: colors.primary,
      dayTextColor: colors.text,
      textDisabledColor: colors.subText,

      // Dot and arrow colors - use theme colors directly
      dotColor: colors.primary,
      selectedDotColor: "#FFFFFF",
      arrowColor: colors.primary,
      disabledArrowColor: colors.subText,
      monthTextColor: colors.text,
      indicatorColor: colors.primary,

      // Text styles
      textDayFontWeight: "400" as const,
      textMonthFontWeight: "bold" as const,
      textDayHeaderFontWeight: "600" as const,
      textDayFontSize: 16,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 14,

      // Header custom styles - force match backgrounds and colors with theme
      "stylesheet.calendar.header": {
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 6,
          alignItems: "center",
          backgroundColor: colors.background,
        },
        monthText: {
          fontSize: 18,
          fontWeight: "bold",
          color: colors.text,
        },
        arrow: {
          padding: 6,
        },
        week: {
          marginTop: 7,
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: colors.background,
        },
        dayHeader: {
          marginTop: 2,
          marginBottom: 7,
          width: 32,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "600",
          color: colors.text,
        },
      },

      // Day cell custom styles
      "stylesheet.day.basic": {
        base: {
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        },
        text: {
          fontSize: 16,
          color: colors.text,
          fontWeight: "400",
          marginTop: 2,
        },
        today: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.primary,
        },
        todayText: {
          color: colors.primary,
          fontWeight: "bold",
        },
        // Increase dot visibility
        dot: {
          width: 8,
          height: 8,
          marginTop: 1,
          borderRadius: 4,
          opacity: 1, // Make dot visible
        },
      },

      // Day period custom styles
      "stylesheet.day.period": {
        base: {
          width: 38,
          height: 38,
          alignItems: "center",
          backgroundColor: colors.background,
        },
      },

      // Main calendar container styles
      "stylesheet.calendar.main": {
        container: {
          backgroundColor: colors.background,
        },
        week: {
          marginTop: 7,
          marginBottom: 7,
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: colors.background,
        },
      },
    }),
    [colors]
  );

  // Display date in localized format
  const formatLocalizedDate = (dateString: string): string => {
    try {
      // Split string into parts
      const [year, month, day] = dateString.split("-").map(Number);
      // Check valid date
      if (!year || !month || !day) {
        throw new Error("Invalid date format");
      }

      // Create JavaScript Date object (month is 0-indexed so use month-1)
      // Use UTC to prevent regional date issues
      const date = new Date(Date.UTC(year, month - 1, day));

      // Debug logs
      // console.log(
      //   `Localized date: Input: ${dateString}, Parsed: ${year}-${month}-${day}, UTC Date: ${date.toISOString()}`
      // );

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Return specially formatted date
      return date.toLocaleDateString(i18n.language, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date format error:", error);
      return dateString;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, {
          paddingTop: insets.top + 12
        }]}
      >

        {/* Decorative background elements */}
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />

        <Text style={[styles.title, { color: "#FFFFFF" }]}>
          {t("calendar.title")}
        </Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>
          {t("calendar.subtitle")}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={[
            styles.calendarCard,
            { backgroundColor: colors.card, borderColor: colors.border + '30', borderWidth: 1 },
          ]}
        >
          <LinearGradient
            colors={[isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)', 'transparent']}
            style={styles.calendarGradient}
          >
            {/* Set key prop to force re-render when theme or language changes */}
            <Calendar
              key={`calendar-${themeVersion}-${i18n.language}-${isDarkMode ? "dark" : "light"}`}
              current={displayDate}
              onDayPress={handleDateSelect}
              onMonthChange={handleMonthChange}
              markedDates={markedDates}
              markingType="custom"
              theme={calendarTheme}
              enableSwipeMonths={true}
              hideExtraDays={false}
              firstDay={getFirstDayOfWeek()} // First day of week based on language
              renderArrow={(direction: string) =>
                direction === "left" ? (
                  <ChevronLeft size={20} color={colors.primary} />
                ) : (
                  <ChevronRight size={20} color={colors.primary} />
                )
              }
              style={{
                backgroundColor: colors.background,
                borderRadius: 10,
                padding: 6,
              }}
            />
          </LinearGradient>
        </Animated.View>

        {calendarLoading ? (
          <View
            style={[
              styles.detailsContainer,
              {
                backgroundColor: colors.card,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.loadingText,
                { color: colors.subText, marginTop: 10 },
              ]}
            >
              {t("calendar.loading")}
            </Text>
          </View>
        ) : calendarError ? (
          <View
            style={[styles.detailsContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.errorText, { color: colors.error }]}>
              {t("calendar.error")}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => fetchAllCompletions()}
            >
              <Text style={styles.retryButtonText}>{t("calendar.retry")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.detailsContainerWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <LinearGradient
              colors={[isDarkMode ? colors.primary + '15' : colors.primary + '08', isDarkMode ? colors.secondary + '15' : colors.secondary + '08']}
              style={styles.detailsContainerGradient}
            >
              <View style={styles.detailsHeader}>
                <View style={[styles.dateBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.dateBadgeText}>
                    {selectedDate && selectedDate.split("-")[2]}
                  </Text>
                </View>
                <Text style={[styles.detailsTitle, { color: colors.text }]}>
                  {selectedDate && formatLocalizedDate(selectedDate)}
                </Text>
              </View>

              {selectedDateData ? (
                <View style={[styles.statsCardContainer, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                  <LinearGradient
                    colors={[isDarkMode ? colors.primary + '20' : 'rgba(255,255,255,0.8)', isDarkMode ? colors.secondary + '20' : 'rgba(255,255,255,0.8)']}
                    style={styles.statsCardGradient}
                  >
                    <View style={styles.statsRow}>
                      <View
                        style={[
                          styles.completionIndicator,
                          {
                            backgroundColor: getCompletionColor(
                              selectedDateData.percentage,
                              selectedDateData.totalCount
                            ) + '20',
                            borderColor: getCompletionColor(
                              selectedDateData.percentage,
                              selectedDateData.totalCount
                            ),
                            borderWidth: 2,
                          },
                        ]}
                      >
                        <Text style={[styles.completionPercentage, {
                          color: getCompletionColor(selectedDateData.percentage, selectedDateData.totalCount)
                        }]}>
                          {Math.round(selectedDateData.percentage)}%
                        </Text>
                      </View>

                      <View style={styles.statsTextContainer}>
                        <Text style={[styles.completionText, { color: colors.text }]}>
                          {getCompletionText(
                            selectedDateData.percentage,
                            selectedDateData.totalCount
                          )}
                        </Text>
                        <View style={styles.countBadge}>
                          <Trophy size={14} color={colors.primary} style={{ marginRight: 4 }} />
                          <Text style={[styles.statsText, { color: colors.primary }]}>
                            {t("calendar.completedCount", {
                              completed: selectedDateData.completedCount,
                              total: selectedDateData.totalCount,
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Sparkles size={32} color={colors.subText} opacity={0.5} />
                  <Text style={[styles.noDataText, { color: colors.subText }]}>
                    {t("calendar.noData")}
                  </Text>
                </View>
              )}

              {/* Timeline Goals List */}
              <View style={styles.goalsListContainer}>
                {dateGoalsLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.goalsLoader}
                  />
                ) : dateGoals.length > 0 ? (
                  <View style={styles.timelineList}>
                    <View style={[styles.timelineVerticalLine, { backgroundColor: colors.border + '40' }]} />
                    {dateGoals.map((item, index) => (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineSide}>
                          <View style={[
                            styles.timelineDot,
                            { backgroundColor: item.completed ? colors.success : colors.card, borderColor: item.completed ? colors.success : colors.primary }
                          ]}>
                            {item.completed && <CheckCircle2 size={12} color="#FFFFFF" />}
                          </View>
                        </View>
                        <View style={styles.timelineContent}>
                          <Animated.View
                            entering={FadeInDown.delay(index * 100).springify().damping(15)}
                          >
                            <GoalCard
                              goal={item}
                              onToggleComplete={toggleGoalCompletion}
                              onUpdateGoal={updateGoal}
                              onDelete={handleDeleteGoal}
                              onStartTimer={startGoalTimer}
                              onStopTimer={stopGoalTimer}
                              onResetTimer={resetGoalTimer}
                              onDecompose={(id) => decomposeGoal(id, i18n.language)}
                              onToggleSubTask={toggleSubTask}
                              onDeleteSubTask={deleteSubTask}
                              onUpdateSubTask={updateSubTask}
                              isActiveTimer={activeTimerGoalId === item.id}
                              isAIEnabled={isAIEnabled}
                              isPastDate={isPastDate}
                            />
                          </Animated.View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noGoalsPlaceholder}>
                    <CircleDashed size={48} color={colors.subText} opacity={0.3} style={{ marginBottom: 12 }} />
                    <Text style={[styles.noGoalsPlaceholderText, { color: colors.subText }]}>
                      {t("calendar.noGoalsForDate")}
                    </Text>
                  </View>
                )}

                {!isPastDate && (
                  <View style={styles.addGoalWrapper}>
                    <AddGoalForm
                      onAddGoal={(text, category) => addGoal({ text, category, date: selectedDate })}
                      disabled={hasReachedMaxGoals(selectedDate)}
                      currentCount={dateGoals.length}
                      existingGoals={dateGoals.map(g => g.text)}
                    />
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={[styles.detailsContainerWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, marginTop: 0, marginBottom: 40 }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.primary + '15' : colors.primary + '08', isDarkMode ? colors.secondary + '15' : colors.secondary + '08']}
            style={styles.detailsContainerGradient}
          >
            <Text style={[styles.legendTitle, { color: colors.text }]}>
              {t("calendar.legend.title")}
            </Text>
            <View style={styles.legendGrid}>
              {[
                {
                  color: colors.subText,
                  label: t("calendar.legend.noGoals"),
                  icon: CircleDashed,
                  bgColor: colors.subText + '10'
                },
                {
                  color: colors.error,
                  label: t("calendar.legend.notCompleted"),
                  icon: XCircle,
                  bgColor: colors.error + '10'
                },
                {
                  color: colors.warning,
                  label: t("calendar.legend.partiallyCompleted"),
                  icon: CircleDot,
                  bgColor: colors.warning + '10'
                },
                {
                  color: colors.info,
                  label: t("calendar.legend.mostlyCompleted"),
                  icon: Sparkles,
                  bgColor: colors.info + '10'
                },
                {
                  color: colors.success,
                  label: t("calendar.legend.fullyCompleted"),
                  icon: CheckCircle2,
                  bgColor: colors.success + '10'
                },
              ].map((item, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 100).springify().damping(15)}
                  style={[
                    styles.legendPillContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[
                      isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                      isDarkMode ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.4)'
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.legendPillGradient}
                  >
                    <View style={[styles.legendIconWrapper, { backgroundColor: item.bgColor }]}>
                      <item.icon size={16} color={item.color} strokeWidth={2.5} />
                    </View>
                    <View style={styles.legendTextContainer}>
                      <Text
                        style={[styles.legendText, { color: colors.text }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <View style={[styles.legendStatusPill, { backgroundColor: item.color + '20' }]}>
                      <View style={[styles.legendStatusDot, { backgroundColor: item.color }]} />
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {isUndoVisible && (
        <Animated.View
          entering={FadeInDown}
          exiting={SlideOutDown}
          style={[
            styles.undoToast,
            {
              backgroundColor: colors.card,
              borderLeftColor: colors.primary,
              bottom: 40,
            }
          ]}
        >
          <View style={styles.undoContent}>
            <Text style={[styles.undoText, { color: colors.text }]}>{t("common.goalDeleted")}</Text>
            <TouchableOpacity
              style={[styles.undoButton, { backgroundColor: colors.primary + '20' }]}
              onPress={async () => {
                await undoDelete();
                setIsUndoVisible(false);
              }}
            >
              <RotateCcw size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.undoButtonText, { color: colors.primary }]}>{t("common.undo")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  calendarContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  detailsContainer: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailsContainerWrapper: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  detailsContainerGradient: {
    padding: 24,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateBadgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  statsCardContainer: {
    borderRadius: 20,
    marginBottom: 28,
    overflow: 'hidden',
  },
  statsCardGradient: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  completionPercentage: {
    fontSize: 18,
    fontWeight: "800",
  },
  statsTextContainer: {
    flex: 1,
  },
  completionText: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 28,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  goalsListContainer: {
    marginTop: 0,
  },
  goalsListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalsListTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  countPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalsList: {},
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  goalStatusIcon: {
    marginRight: 16,
  },
  goalContent: {
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyGoalsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noGoalsText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.7,
  },
  goalsLoader: {
    marginVertical: 24,
  },
  legendWrapper: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 24,
  },
  legendTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
  },
  legendGrid: {
    gap: 12,
  },
  legendPillContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  legendPillGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  legendIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  legendTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  legendStatusPill: {
    width: 24,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  legendStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calendarCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  calendarGradient: {
    padding: 8,
  },
  timelineList: {
    paddingLeft: 10,
    position: 'relative',
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 17,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineSide: {
    width: 36,
    alignItems: 'center',
    paddingTop: 12,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
  },
  bottomPadding: {
    height: 125,
  },
  noGoalsPlaceholder: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noGoalsPlaceholderText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  addGoalWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  undoToast: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  undoContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  undoText: { fontSize: 14, fontWeight: '600' },
  undoButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  undoButtonText: { fontSize: 14, fontWeight: '800' },
});

export default CalendarScreen;
