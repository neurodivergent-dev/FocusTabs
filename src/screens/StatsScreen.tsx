import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Platform } from "react-native";
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
} from "lucide-react-native";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";

interface PerformanceData {
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  streak: number;
  bestDay: string;
  totalCompletedTasks: number;
  hasTasks: boolean;
}

export const StatsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { goals, getCompletedGoalsCount, getActiveGoalsCount, completionData } = useDailyGoalsStore();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    weeklyCompletionRate: 0,
    monthlyCompletionRate: 0,
    streak: 0,
    bestDay: "-",
    totalCompletedTasks: 0,
    hasTasks: false,
  });

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
  
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
      
      setPerformanceData({
        weeklyCompletionRate: completionData.slice(0, 7).reduce((acc, curr) => acc + curr.percentage, 0) / Math.min(completionData.length, 7),
        monthlyCompletionRate: completionData.slice(0, 30).reduce((acc, curr) => acc + curr.percentage, 0) / Math.min(completionData.length, 30),
        streak,
        bestDay: "Pazartesi", // Örnek veri
        totalCompletedTasks,
        hasTasks: totalCompletedTasks > 0,
      });
    }
  }, [completionData]);

  const getPerformanceLevelColor = (rate: number) => {
    if (rate >= 80) return colors.success;
    if (rate >= 50) return colors.info;
    if (rate >= 20) return colors.warning;
    return colors.error;
  };

  const getPerformanceLevel = (rate: number, hasTasks: boolean = true): string => {
    if (!hasTasks) return t("stats.noData");
    if (rate >= 80) return t("stats.performanceLevels.excellent");
    if (rate >= 60) return t("stats.performanceLevels.veryGood");
    if (rate >= 40) return t("stats.performanceLevels.good");
    if (rate >= 20) return t("stats.performanceLevels.moderate");
    return t("stats.performanceLevels.needsImprovement");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        locations={[0.0, 0.3, 0.7, 1.0]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerDecorationCircle1} />
        <View style={styles.headerDecorationCircle2} />
        <Text style={[styles.title, { color: "#FFFFFF" }]}>{t("stats.title")}</Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.85)" }]}>{t("stats.subtitle")}</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={[styles.badgeText, { color: colors.primary }]}>{timeUntilMidnight}</Text>
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
              <Text style={[styles.progressAdvice, { color: colors.subText }]}>
                {totalGoals === 0 ? t("stats.progressNotes.noGoals") : completionRate === 100 ? t("stats.progressNotes.allCompleted") : t("stats.progressNotes.keepGoing")}
              </Text>
            </View>
          </LinearGradient>
        </View>

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
            <View style={[styles.achievementBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}>
              <Text style={[styles.achievementText, { color: colors.text }]}>
                {performanceData.streak >= 7 ? t("stats.achievements.streakAchievement") : t("stats.achievements.default")}
              </Text>
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
  scrollView: { flex: 1 },
  scrollViewContent: { paddingBottom: 20 },
  cardContainer: { marginHorizontal: 20, marginVertical: 8, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  cardGradient: { padding: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
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
  progressAdvice: { fontSize: 13, fontStyle: 'italic' },
  verticalStack: { gap: 12 },
  stackCard: { width: '100%', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  stackIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stackLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  stackValue: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: 'rgba(150, 150, 150, 0.1)', marginVertical: 24 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryItem: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sumLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  sumValue: { fontSize: 14, fontWeight: '700' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, marginTop: 12 },
  levelText: { fontSize: 14, fontWeight: '700' },
  achievementBox: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  achievementText: { fontSize: 15, lineHeight: 22 },
  tipsList: { gap: 12 },
  tipItem: { flexDirection: 'row', alignItems: 'center' },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20, marginLeft: 12 },
});
