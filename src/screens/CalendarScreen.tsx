import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useTheme } from "../components/ThemeProvider";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

export const CalendarScreen: React.FC = () => {
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
    updateDailyStats,
    dateGoals,
    dateGoalsLoading,
    fetchGoalsByDate,
  } = useDailyGoalsStore();

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
      container?: {
        backgroundColor?: string;
        borderWidth?: number;
        borderColor?: string;
      };
      text?: {
        color?: string;
        fontWeight?: string;
      };
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
    updateDailyStats();
  }, [fetchGoalsByDate, fetchAllCompletions, updateDailyStats]);

  // Theme change adjustments
  useEffect(() => {
    // Increase themeVersion to force calendar re-render
    setThemeVersion((prev) => prev + 1);

    // Reload necessary data
    if (selectedDate) {
      setDisplayDate(selectedDate);

      // Fetch data again
      fetchGoalsByDate(selectedDate);
      fetchAllCompletions();
    }
  }, [selectedDate, fetchGoalsByDate, fetchAllCompletions]);

  // Update theme version when theme or language changes
  useEffect(() => {
    setThemeVersion((prev) => prev + 1);
  }, [colors, isDarkMode]);

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

    // console.log(
    //   "Updating markings, completion data count:",
    //   completionData.length
    // );

    const marked: Record<string, MarkedDate> = {};
    const today = getCurrentDate();

    // Debug
    // console.log("Today:", today, "Selected date:", selectedDate);

    // Create markings from completionData
    if (completionData.length > 0) {
      completionData.forEach((item) => {
        // Date validation, especially check for potential errors in May
        if (!item.date || !item.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // console.error(`Invalid date format: ${item.date}`);
          return; // Skip this item
        }

        // Only mark if there are completed tasks or total tasks greater than zero
        if (item.completedCount > 0 || item.totalCount > 0) {
          const color = getCompletionColor(item.percentage, item.totalCount);

          // Use date directly
          // console.log(
          //   `Marking date: ${item.date}, Completion: ${item.completedCount}/${item.totalCount}`
          // );

          marked[item.date] = {
            selected: item.date === selectedDate, // Selection state based on original date
            selectedColor: colors.primary,
            marked: true, // Enable dot indicator
            dotColor: color,
            customStyles: {
              container: {
                backgroundColor:
                  item.date === selectedDate ? colors.primary : "transparent",
              },
              text: {
                color: item.date === selectedDate ? "#FFFFFF" : colors.text,
                fontWeight: item.date === selectedDate ? "bold" : "normal",
              },
            },
          };
        }
      });
    }

    // Mark today's date (even if not in completionData)
    if (!marked[today]) {
      marked[today] = {
        selected: today === selectedDate,
        selectedColor: colors.primary,
        // Just draw a border for today, don't show dot indicator
        marked: false, // Don't show special dot indicator for today
        customStyles: {
          container: {
            backgroundColor:
              today === selectedDate ? colors.primary : "transparent",
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: {
            color: today === selectedDate ? "#FFFFFF" : colors.text,
            fontWeight: today === selectedDate ? "bold" : "normal",
          },
        },
      };
    }

    // Always mark selected date
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colors.primary,
        // Don't show dot indicator for selected date, just mark as selected
        marked: false,
        customStyles: {
          container: {
            backgroundColor: colors.primary,
          },
          text: {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
        },
      };
    }

    // Update markings
    // console.log("Marked dates:", Object.keys(marked).join(", "));
    setMarkedDates(marked);
  }, [
    completionData,
    selectedDate,
    colors.primary,
    colors.text,
    colors.subText,
    colors,
    getCompletionColor,
  ]);

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
      textDayFontWeight: "400",
      textMonthFontWeight: "bold",
      textDayHeaderFontWeight: "600",
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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("calendar.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {t("calendar.subtitle")}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.calendarContainer,
            { backgroundColor: colors.background },
          ]}
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
            locale={i18n.language} // Language setting directly from i18n
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
        </View>

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
          <View
            style={[styles.detailsContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              {selectedDate && formatLocalizedDate(selectedDate)}
            </Text>

            {selectedDateData ? (
              <View style={styles.statsContainer}>
                <View
                  style={[
                    styles.completionIndicator,
                    {
                      backgroundColor: getCompletionColor(
                        selectedDateData.percentage,
                        selectedDateData.totalCount
                      ),
                    },
                  ]}
                >
                  <Text style={styles.completionPercentage}>
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
                  <Text style={[styles.statsText, { color: colors.subText }]}>
                    {t("calendar.completedCount", {
                      completed: selectedDateData.completedCount,
                      total: selectedDateData.totalCount,
                    })}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={[styles.noDataText, { color: colors.subText }]}>
                  {t("calendar.noData")}
                </Text>
              </View>
            )}

            {/* Goals list */}
            <View style={styles.goalsListContainer}>
              <Text style={[styles.goalsListTitle, { color: colors.text }]}>
                {t("calendar.goalsForDate")}
              </Text>

              {dateGoalsLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.goalsLoader}
                />
              ) : dateGoals.length > 0 ? (
                <View style={styles.goalsList}>
                  {dateGoals.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.goalItem,
                        {
                          borderColor: colors.border,
                          backgroundColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.05)",
                          marginBottom: 8,
                        },
                      ]}
                    >
                      {item.completed ? (
                        <CheckCircle size={20} color={colors.success} />
                      ) : (
                        <Circle size={20} color={colors.subText} />
                      )}
                      <Text
                        style={[
                          styles.goalText,
                          {
                            color: colors.text,
                            textDecorationLine: item.completed
                              ? "line-through"
                              : "none",
                          },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noGoalsText, { color: colors.subText }]}>
                  {t("calendar.noGoalsForDate")}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.legendContainer}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>
            {t("calendar.legend.title")}
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.subText }]}
              />
              <Text style={[styles.legendText, { color: colors.subText }]}>
                {t("calendar.legend.noGoals")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.error }]}
              />
              <Text style={[styles.legendText, { color: colors.subText }]}>
                {t("calendar.legend.notCompleted")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.warning }]}
              />
              <Text style={[styles.legendText, { color: colors.subText }]}>
                {t("calendar.legend.partiallyCompleted")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.info }]}
              />
              <Text style={[styles.legendText, { color: colors.subText }]}>
                {t("calendar.legend.mostlyCompleted")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.success }]}
              />
              <Text style={[styles.legendText, { color: colors.subText }]}>
                {t("calendar.legend.fullyCompleted")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
    padding: 16,
    borderRadius: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  completionPercentage: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  statsTextContainer: {
    flex: 1,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
  },
  noDataContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
  },
  goalsListContainer: {
    marginTop: 24,
  },
  goalsListTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  goalsList: {},
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  noGoalsText: {
    textAlign: "center",
    paddingVertical: 16,
  },
  goalsLoader: {
    marginVertical: 16,
  },
  legendContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
    width: "45%",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  bottomPadding: {
    height: 40,
  },
});

export default CalendarScreen;
