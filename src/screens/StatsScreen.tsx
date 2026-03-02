import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import {
  Clock,
  TrendingUp,
  Calendar,
  BarChart4,
  Award,
  Lightbulb,
  Sun,
  Moon,
  CheckCircle,
  Circle,
  Briefcase,
  Heart,
  User,
  DollarSign,
  Tag,
  BrainCircuit,
  RefreshCw,
} from "lucide-react-native";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";
import { GoalCategory } from "../types/goal";
import { getCategoryById } from "../constants/categories";
import { aiService } from "../services/aiService";
import { useAIStore } from "../store/aiStore";
import { MarkdownText } from "../components/MarkdownText";
import { soundService } from "../services/SoundService";
import * as Haptics from "expo-haptics";

interface PerformanceData {
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  streak: number;
  bestDay: string;
  totalCompletedTasks: number;
  totalFocusTime: number;
  hasTasks: boolean;
}

interface InsightData {
  topCategory: string;
  topCategoryName: string;
  productiveDay: string;
  productiveDayName: string;
  workStyle: 'morning' | 'night' | 'balanced';
  hasEnoughData: boolean;
}

export const StatsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { goals, getCompletedGoalsCount, getActiveGoalsCount, completionData } = useDailyGoalsStore();
  const { colors, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    weeklyCompletionRate: 0,
    monthlyCompletionRate: 0,
    streak: 0,
    bestDay: "-",
    totalCompletedTasks: 0,
    totalFocusTime: 0,
    hasTasks: false,
  });

  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [dynamicAIInsights, setDynamicAIInsights] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { isAIEnabled, apiKey } = useAIStore();

  const handleRefresh = async () => {
    if (!isAIEnabled || !apiKey || isAiLoading) return;
    
    soundService.playClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    setIsAiLoading(true);
    setAiInsight(null);
    setDynamicAIInsights([]);

    const statsSummary = {
      weeklyRate: Math.round(performanceData.weeklyCompletionRate),
      streak: performanceData.streak,
      total: performanceData.totalCompletedTasks,
      bestDay: performanceData.bestDay,
      topCategory: insights.topCategoryName
    };
    
    try {
      const [insightRes, weeklyRes] = await Promise.all([
        aiService.getPerformanceInsight(statsSummary, i18n.language),
        aiService.getWeeklyInsights(statsSummary, i18n.language)
      ]);
      
      if (insightRes) setAiInsight(insightRes);
      if (weeklyRes && weeklyRes.length > 0) setDynamicAIInsights(weeklyRes);
    } catch (err) {
      console.error("AI Stats Hatası:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Gemini gelmezse diye gerçek verilere dayalı "Statik ama Dinamik" rozetler
  const fallbackAchievements = useMemo(() => [
    {
      title: performanceData.streak >= 3 
        ? t("stats.achievements.fallback.streakKral") 
        : t("stats.achievements.fallback.yolunBasinda"),
      desc: performanceData.streak > 0 
        ? t("stats.achievements.fallback.streakKralDesc", { count: performanceData.streak }) 
        : t("stats.achievements.fallback.yolunBasindaDesc"),
      type: 'streak'
    },
    {
      title: t("stats.achievements.fallback.efficiency"),
      desc: t("stats.achievements.fallback.efficiencyDesc", { count: Math.round(performanceData.weeklyCompletionRate) }),
      type: 'consistency'
    },
    {
      title: t("stats.achievements.fallback.goalHunter"),
      desc: t("stats.achievements.fallback.goalHunterDesc", { count: performanceData.totalCompletedTasks }),
      type: 'focus'
    }
  ], [performanceData, t]);

  // Calculate insights
  const insights = useMemo<InsightData>(() => {
    const completedGoals = goals.filter(g => g.completed);
    
    if (completedGoals.length < 3) {
      return {
        topCategory: 'other',
        topCategoryName: '-',
        productiveDay: '-',
        productiveDayName: '-',
        workStyle: 'balanced',
        hasEnoughData: false
      };
    }

    // 1. Top Category
    const categoryCounts: Record<string, number> = {};
    completedGoals.forEach(g => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });
    const topCatId = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // 2. Productive Day (Based on completion rate per day of week)
    const dayStats: Record<number, { completed: number, total: number }> = {
      0: { completed: 0, total: 0 }, // Sun
      1: { completed: 0, total: 0 }, // Mon
      2: { completed: 0, total: 0 }, // Tue
      3: { completed: 0, total: 0 }, // Wed
      4: { completed: 0, total: 0 }, // Thu
      5: { completed: 0, total: 0 }, // Fri
      6: { completed: 0, total: 0 }, // Sat
    };

    // Use all goals to find the day with highest completion ratio
    goals.forEach(g => {
      // goal.date is YYYY-MM-DD, parse safely
      const dateParts = g.date.split('-');
      const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      const dayIndex = d.getDay();
      dayStats[dayIndex].total++;
      if (g.completed) dayStats[dayIndex].completed++;
    });

    let bestDayIndex = 0;
    let maxRatio = -1;

    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.total > 0) {
        const ratio = stats.completed / stats.total;
        if (ratio > maxRatio) {
          maxRatio = ratio;
          bestDayIndex = parseInt(day);
        }
      }
    });

    // Correct day name mapping
    const dayNames = {
      tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    const lang = (i18n.language && i18n.language.startsWith('tr')) ? 'tr' : 'en';
    const topDayName = dayNames[lang][bestDayIndex];

    // 3. Work Style
    const morningCount = completedGoals.filter(g => {
      const hour = new Date(g.updatedAt).getHours();
      return hour >= 5 && hour < 13;
    }).length;
    const nightCount = completedGoals.filter(g => {
      const hour = new Date(g.updatedAt).getHours();
      return hour >= 18 || hour < 5;
    }).length;

    let style: 'morning' | 'night' | 'balanced' = 'balanced';
    if (morningCount > completedGoals.length * 0.45) style = 'morning';
    else if (nightCount > completedGoals.length * 0.45) style = 'night';

    return {
      topCategory: topCatId,
      topCategoryName: t(`common.categories.${topCatId}`),
      productiveDay: String(bestDayIndex),
      productiveDayName: topDayName,
      workStyle: style,
      hasEnoughData: true
    };
  }, [goals, t, i18n.language]);

  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>("");

  useEffect(() => {
    updateTimeUntilMidnight();
    const timer = setInterval(updateTimeUntilMidnight, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTimeUntilMidnight = (): void => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diffMs = midnight.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    setTimeUntilMidnight(`${diffHrs}h ${diffMins}m ${diffSecs}s`);
  };

  const completedCount = getCompletedGoalsCount();
  const activeCount = getActiveGoalsCount();
  
  const nowTime = new Date();
  const today = `${nowTime.getFullYear()}-${String(nowTime.getMonth() + 1).padStart(2, '0')}-${String(nowTime.getDate()).padStart(2, '0')}`;
  const todayGoals = goals.filter((goal) => goal.date === today);
  const totalGoals = todayGoals.length;
  const completionRate = totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;
  const todayPerformanceRate = totalGoals > 0 ? completionRate : 0;
  const hasTodayTasks = totalGoals > 0;

  const gradientColors: [string, string, string, string] = [
    colors.primary || "#6366F1",
    colors.secondary || colors.primary || "#EC4899",
    colors.info || colors.primary || "#3B82F6",
    colors.primary || "#6366F1",
  ];

  useEffect(() => {
    if (completionData.length > 0) {
      const sortedData = [...completionData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let streak = 0;
      for (const item of sortedData) {
        if (item.totalCount > 0) {
          if (item.percentage >= 70) streak++;
          else break;
        }
      }

      const totalCompletedTasks = completionData.reduce((sum, item) => sum + item.completedCount, 0);
      const totalFocusTime = goals.reduce((sum, goal) => sum + (goal.focusTime || 0), 0);
      
      setPerformanceData({
        weeklyCompletionRate: completionData.slice(0, 7).reduce((acc, curr) => acc + curr.percentage, 0) / Math.min(completionData.length, 7),
        monthlyCompletionRate: completionData.slice(0, 30).reduce((acc, curr) => acc + curr.percentage, 0) / Math.min(completionData.length, 30),
        streak,
        bestDay: insights.productiveDayName,
        totalCompletedTasks,
        totalFocusTime,
        hasTasks: totalCompletedTasks > 0,
      });
    }
  }, [completionData, insights.productiveDayName]);

  const getPerformanceLevelColor = (rate: number) => {
    if (rate >= 80) return colors.success;
    if (rate >= 50) return colors.info;
    if (rate >= 20) return colors.warning;
    return colors.error;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'streak': return <TrendingUp size={20} color={colors.primary} />;
      case 'focus': return <TrendingUp size={20} color={colors.info} />;
      case 'speed': return <Clock size={20} color={colors.warning} />;
      case 'consistency': return <Calendar size={20} color={colors.success} />;
      case 'variety': return <Lightbulb size={20} color={colors.secondary} />;
      default: return <Award size={20} color={colors.primary} />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'streak': return colors.primary + '20';
      case 'focus': return colors.info + '20';
      case 'speed': return colors.warning + '20';
      case 'consistency': return colors.success + '20';
      case 'variety': return colors.secondary + '20';
      default: return colors.primary + '20';
    }
  };

  const getPerformanceLevel = (rate: number, hasTasks: boolean = true): string => {
    if (!hasTasks) return t("stats.noData");
    if (rate >= 80) return t("stats.performanceLevels.excellent");
    if (rate >= 60) return t("stats.performanceLevels.veryGood");
    if (rate >= 40) return t("stats.performanceLevels.good");
    if (rate >= 20) return t("stats.performanceLevels.moderate");
    return t("stats.performanceLevels.needsImprovement");
  };

  // Category Icon Mapper
  const CategoryIcon = ({ id, size, color }: { id: GoalCategory, size: number, color: string }) => {
    switch (id) {
      case 'work': return <Briefcase size={size} color={color} />;
      case 'health': return <Heart size={size} color={color} fill={id === 'health' ? color : 'transparent'} />;
      case 'personal': return <User size={size} color={color} />;
      case 'finance': return <DollarSign size={size} color={color} />;
      default: return <Tag size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.title, { color: "#FFFFFF" }]}>{t("stats.title")}</Text>
            <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>{t("stats.subtitle")}</Text>
          </View>
          {isAIEnabled && apiKey && (
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
              onPress={handleRefresh}
              disabled={isAiLoading}
            >
              <RefreshCw size={20} color="#FFFFFF" style={isAiLoading && { transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Countdown Card - MOVED TO TOP */}
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12, marginBottom: 8 }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.primary + '25' : colors.primary + '15', isDarkMode ? colors.secondary + '25' : colors.secondary + '15']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '25' }]}>
                <Clock size={24} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text, flex: 1, marginLeft: 12 }]}>
                {t("stats.dayRemaining")}
              </Text>
            </View>
            
            <View style={styles.countdownWrapper}>
              <Text style={[styles.countdownTime, { color: colors.primary }]}>
                {timeUntilMidnight}
              </Text>
              <Text style={[styles.countdownSubtext, { color: colors.subText }]}>
                {t("stats.countdownAdvice")}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Daily Performance */}
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.primary + '25' : colors.primary + '15', isDarkMode ? colors.secondary + '25' : colors.secondary + '15']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("stats.dailyPerformance")}</Text>
              <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Clock size={14} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {formatTotalTime(performanceData.totalFocusTime)}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.mainStat}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                  <Award size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.statValueLarge, { color: colors.text }]}>{completedCount}/{totalGoals}</Text>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>{t("stats.completed")}</Text>
                </View>
              </View>
              <View style={styles.vDivider} />
              <View style={styles.sideStats}>
                <View style={styles.miniStat}>
                  <View style={[styles.dot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.miniText, { color: colors.subText }]}>{t("stats.completed")}: <Text style={{ color: colors.text, fontWeight: '700' }}>{completedCount}</Text></Text>
                </View>
                <View style={styles.miniStat}>
                  <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.miniText, { color: colors.subText }]}>{t("stats.remaining")}: <Text style={{ color: colors.text, fontWeight: '700' }}>{activeCount}</Text></Text>
                </View>
              </View>
            </View>

            <View style={[styles.progressBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)' }]}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: colors.text }]}>{t("stats.dailyProgress")}</Text>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>{Math.round(completionRate)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary || colors.primary]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.max(completionRate, 5)}%` }]}
                />
              </View>
              <Text 
                style={[styles.progressAdvice, { color: colors.subText }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {totalGoals === 0 
                  ? t("stats.progressNotes.noGoals") 
                  : completionRate === 100 
                    ? t("stats.progressNotes.allCompleted") 
                    : completionRate === 0
                      ? t("stats.progressNotes.startCompleting")
                      : t("stats.progressNotes.keepGoing")}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Today's Goals List */}
        {todayGoals.length > 0 && (
          <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
            <LinearGradient
              colors={[isDarkMode ? colors.primary + '15' : colors.primary + '05', isDarkMode ? colors.secondary + '15' : colors.secondary + '05']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("calendar.goalsForDate")}</Text>
                <View style={[styles.countPill, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.countPillText, { color: colors.primary }]}>{todayGoals.length}</Text>
                </View>
              </View>

              <View style={styles.goalsList}>
                {todayGoals.map((item) => {
                  const category = getCategoryById(item.category);
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.goalItem,
                        {
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                          borderColor: item.completed ? colors.success + '30' : colors.border,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={styles.goalStatusIcon}>
                        {item.completed ? (
                          <CheckCircle size={20} color={colors.success} />
                        ) : (
                          <Circle size={20} color={colors.subText} opacity={0.5} />
                        )}
                      </View>
                      <View style={styles.goalContent}>
                        <Text
                          style={[
                            styles.goalText,
                            {
                              color: item.completed ? colors.subText : colors.text,
                              textDecorationLine: item.completed
                                ? "line-through"
                                : "none",
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {item.text}
                        </Text>
                        <View style={[styles.categoryBadge, { backgroundColor: category.color + '15' }]}>
                          <CategoryIcon id={item.category} size={10} color={category.color} />
                          <Text style={[styles.categoryText, { color: category.color }]}>
                            {t(category.nameKey)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        )}

        {/* General Performance */}
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.secondary + '20' : colors.secondary + '10', isDarkMode ? colors.info + '20' : colors.info + '10']}
            style={styles.cardGradient}
          >
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 24 }]}>{t("stats.generalPerformance")}</Text>
            
            <View style={styles.verticalStack}>
              <View style={[styles.stackCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
                <View style={[styles.stackIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Calendar size={20} color={colors.primary} />
                </View>
                <Text style={[styles.stackLabel, { color: colors.subText }]}>{t("stats.weekly")}</Text>
                <Text style={[styles.stackValue, { color: colors.text }]}>{Math.round(performanceData.weeklyCompletionRate)}%</Text>
              </View>

              <View style={[styles.stackCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
                <View style={[styles.stackIcon, { backgroundColor: colors.info + '20' }]}>
                  <BarChart4 size={20} color={colors.info} />
                </View>
                <Text style={[styles.stackLabel, { color: colors.subText }]}>{t("stats.monthly")}</Text>
                <Text style={[styles.stackValue, { color: colors.text }]}>{Math.round(performanceData.monthlyCompletionRate)}%</Text>
              </View>

              <View style={[styles.stackCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
                <View style={[styles.stackIcon, { backgroundColor: colors.warning + '20' }]}>
                  <TrendingUp size={20} color={colors.warning} />
                </View>
                <Text style={[styles.stackLabel, { color: colors.subText }]}>{t("stats.streak")}</Text>
                <Text style={[styles.stackValue, { color: colors.text }]}>{performanceData.streak}d</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
                <Text style={[styles.sumLabel, { color: colors.subText }]}>{t("stats.bestDay")}</Text>
                <Text style={[styles.sumValue, { color: colors.text }]}>{performanceData.bestDay}</Text>
              </View>
              <View style={[styles.summaryItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
                <Text style={[styles.sumLabel, { color: colors.subText }]}>{t("stats.totalCompleted")}</Text>
                <Text style={[styles.sumValue, { color: colors.text }]}>{performanceData.totalCompletedTasks} {t("stats.tasks")}</Text>
              </View>
            </View>

            <View style={[styles.levelBadge, { backgroundColor: getPerformanceLevelColor(todayPerformanceRate) + '15', borderColor: getPerformanceLevelColor(todayPerformanceRate) + '30' }]}>
              <Award size={16} color={getPerformanceLevelColor(todayPerformanceRate)} />
              <Text style={[styles.levelText, { color: getPerformanceLevelColor(todayPerformanceRate) }]}>
                {t("stats.performanceLevel")}: {getPerformanceLevel(todayPerformanceRate, hasTodayTasks)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Smart Insights - New Section */}
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.primary + '15' : colors.primary + '05', isDarkMode ? colors.info + '15' : colors.info + '05']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("stats.insights.title")}</Text>
              {!insights.hasEnoughData && (
                <View style={[styles.badge, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
                  <Clock size={12} color={colors.subText} />
                  <Text style={[styles.badgeText, { color: colors.subText, fontSize: 11 }]}>{t("stats.noData")}</Text>
                </View>
              )}
            </View>

            {isAIEnabled && apiKey && (isAiLoading || aiInsight) && (
              <View style={[styles.aiInsightCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
                {isAiLoading ? (
                  <>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.aiInsightText, { color: colors.subText }]}>Gemini verilerini analiz ediyor...</Text>
                  </>
                ) : (
                  <>
                    <BrainCircuit size={18} color={colors.primary} />
                    <MarkdownText 
                      content={aiInsight || ""} 
                      style={styles.aiInsightText} 
                      baseColor={colors.text} 
                    />
                  </>
                )}
              </View>
            )}

            {isAIEnabled && apiKey && dynamicAIInsights.length > 0 ? (
              <View style={styles.insightsList}>
                {dynamicAIInsights.map((insight, idx) => (
                  <View key={idx} style={styles.insightItem}>
                    <View style={[styles.insightIcon, { backgroundColor: getInsightBgColor(insight.type) }]}>
                      {getInsightIcon(insight.type)}
                    </View>
                    <View style={styles.insightTextContent}>
                      <Text style={[styles.insightLabel, { color: colors.text }]}>{insight.title}</Text>
                      <Text style={[styles.insightDesc, { color: colors.subText }]}>
                        {insight.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : insights.hasEnoughData ? (
              <View style={styles.insightsList}>
                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: colors.primary + '20' }]}>
                    <TrendingUp size={20} color={colors.primary} />
                  </View>
                  <View style={styles.insightTextContent}>
                    <Text style={[styles.insightLabel, { color: colors.text }]}>{t("stats.insights.topCategory")}</Text>
                    <Text style={[styles.insightDesc, { color: colors.subText }]}>
                      {t("stats.insights.topCategoryDesc", { category: insights.topCategoryName })}
                    </Text>
                  </View>
                </View>

                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: colors.success + '20' }]}>
                    <Calendar size={20} color={colors.success} />
                  </View>
                  <View style={styles.insightTextContent}>
                    <Text style={[styles.insightLabel, { color: colors.text }]}>{t("stats.insights.productiveDay")}</Text>
                    <Text style={[styles.insightDesc, { color: colors.subText }]}>
                      {t("stats.insights.productiveDayDesc", { day: insights.productiveDayName })}
                    </Text>
                  </View>
                </View>

                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: colors.warning + '20' }]}>
                    {insights.workStyle === 'morning' ? <Sun size={20} color={colors.warning} /> : <Moon size={20} color={colors.warning} />}
                  </View>
                  <View style={styles.insightTextContent}>
                    <Text style={[styles.insightLabel, { color: colors.text }]}>
                      {insights.workStyle === 'morning' ? t("stats.insights.morningPerson") : insights.workStyle === 'night' ? t("stats.insights.nightOwl") : t("stats.performanceLevel")}
                    </Text>
                    <Text style={[styles.insightDesc, { color: colors.subText }]}>
                      {insights.workStyle === 'morning' ? t("stats.insights.morningPersonDesc") : insights.workStyle === 'night' ? t("stats.insights.nightOwlDesc") : t("stats.achievements.default")}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={[styles.noDataInfo, { color: colors.subText }]}>
                {t("stats.insights.noData")}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Achievements */}
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.primary + '20' : colors.primary + '10', isDarkMode ? colors.secondary + '20' : colors.secondary + '10']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '25' }]}><Award size={24} color={colors.primary} /></View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 12 }]}>{t("stats.achievements.title")}</Text>
            </View>
            
            <View style={styles.achievementsList}>
              {(isAIEnabled && apiKey && dynamicAIInsights.length > 0 ? dynamicAIInsights : fallbackAchievements).map((achievement, idx) => (
                <View key={idx} style={[styles.achievementListItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
                  <View style={[styles.badgeIconBox, { backgroundColor: getInsightBgColor(achievement.type) }]}>
                    {getInsightIcon(achievement.type)}
                  </View>
                  <View style={styles.badgeContent}>
                    <Text style={[styles.badgeTitle, { color: colors.text }]} numberOfLines={1}>
                      {achievement.title}
                    </Text>
                    <Text style={[styles.badgeDesc, { color: colors.subText }]} numberOfLines={2}>
                      {achievement.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Tips */}
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12, marginBottom: 40 }]}>
          <LinearGradient
            colors={[isDarkMode ? colors.primary + '20' : colors.primary + '10', isDarkMode ? colors.secondary + '20' : colors.secondary + '10']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + '25' }]}><Lightbulb size={24} color={colors.primary} /></View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0, marginLeft: 12 }]}>{t("stats.tips.title")}</Text>
            </View>
            <View style={styles.tipsList}>
              {[1, 2, 3, 4, 5].map((num) => (
                <View key={num} style={styles.tipItem}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.tipText, { color: colors.text }]}>{t(`stats.tips.tip${num}`)}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  headerDecorationCircle1: { position: 'absolute', top: -40, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  headerDecorationCircle2: { position: 'absolute', bottom: -30, left: -40, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: "500", opacity: 0.9 },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollViewContent: { paddingBottom: 20 },
  cardContainer: { marginHorizontal: 20, marginVertical: 8, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  cardGradient: { padding: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  badgeColumn: { alignItems: 'flex-end' },
  badgeMinimal: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 8, 
    borderLeftWidth: 2,
    gap: 6
  },
  badgeTextSmall: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { marginLeft: 6, fontWeight: '600', fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  mainStat: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statValueLarge: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 13, fontWeight: '600' },
  vDivider: { width: 1, height: 40, backgroundColor: 'rgba(150, 150, 150, 0.2)' },
  sideStats: { gap: 8 },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  miniText: { fontSize: 13 },
  progressBox: { padding: 16, borderRadius: 20 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 14, fontWeight: '700' },
  progressPercent: { fontSize: 18, fontWeight: '800' },
  progressTrack: { height: 10, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressAdvice: { fontSize: 13, fontStyle: 'italic', flexShrink: 1 },
  goalsList: { marginTop: 8 },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  goalStatusIcon: { marginRight: 12 },
  goalContent: { flex: 1 },
  goalText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
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
    letterSpacing: 0.5,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verticalStack: { gap: 12 },
  stackCard: { width: '100%', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stackIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stackLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  stackValue: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(150, 150, 150, 0.1)', marginVertical: 24 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryItem: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sumLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  sumValue: { fontSize: 14, fontWeight: '700' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, marginTop: 12 },
  levelText: { fontSize: 14, fontWeight: '700' },
  achievementBox: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  achievementText: { fontSize: 15, lineHeight: 22 },
  achievementsList: {
    gap: 12,
  },
  achievementListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeContent: {
    flex: 1,
    marginLeft: 16,
  },
  badgeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  insightsList: {
    gap: 20,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightTextContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  countdownWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  countdownTime: {
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  countdownSubtext: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noDataInfo: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  aiInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  aiInsightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  tipsList: { gap: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'center' },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20, marginLeft: 12 },
});
