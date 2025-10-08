import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from "react-native";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import {
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Calendar,
  BarChart4,
  Award,
} from "lucide-react-native";
import { useTheme } from "../components/ThemeProvider";
import { useTranslation } from "react-i18next";

// Haftalık ve aylık performans verilerini hesaplamak için
interface PerformanceData {
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  streak: number;
  bestDay: string;
  totalCompletedTasks: number;
  hasTasks: boolean;
}

export const StatsScreen: React.FC = () => {
  const { goals, getCompletedGoalsCount, getActiveGoalsCount, completionData } =
    useDailyGoalsStore();

  // Tema renklerine erişim
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  // Performans verilerini depolamak için state
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    weeklyCompletionRate: 0,
    monthlyCompletionRate: 0,
    streak: 0,
    bestDay: "Monday",
    totalCompletedTasks: 0,
    hasTasks: false,
  });

  // Kalan süre için state
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>("");

  // Saniye animasyonu için state
  const [secondsOpacity, setSecondsOpacity] = useState<number>(1);

  // Gerçek zamanlı saat güncellemesi için useEffect
  useEffect(() => {
    // İlk çağrı
    updateTimeUntilMidnight();

    // Her saniye güncelle
    const timer = setInterval(() => {
      // Saniye değiştiğinde hafif bir animasyon
      setSecondsOpacity(0.5);
      setTimeout(() => setSecondsOpacity(1), 200);

      updateTimeUntilMidnight();
    }, 1000);

    // Temizleme fonksiyonu
    return () => clearInterval(timer);
  }, []);

  // Format time remaining until midnight
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

  // Bugünün görev istatistikleri
  const completedCount = getCompletedGoalsCount();
  const activeCount = getActiveGoalsCount();

  // Bugünün hedeflerini filtrele
  const today = new Date().toISOString().split("T")[0];
  const todayGoals = goals.filter((goal) => goal.date === today);
  const totalGoals = todayGoals.length;

  const completionRate =
    totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  // Performans verilerini hesapla
  useEffect(() => {
    if (completionData.length > 0) {
      // Şimdiki tarih
      const now = new Date();

      // Bir hafta önceki tarih
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Bir ay önceki tarih
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Haftalık veriler
      const weeklyData = completionData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= oneWeekAgo && itemDate <= now;
      });

      // Aylık veriler
      const monthlyData = completionData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= oneMonthAgo && itemDate <= now;
      });

      // Haftalık tamamlanma oranı
      let weeklyCompletionRate = 0;
      if (weeklyData.length > 0) {
        // Sadece görev olan günleri filtrele
        const daysWithTasks = weeklyData.filter((item) => item.totalCount > 0);
        if (daysWithTasks.length > 0) {
          weeklyCompletionRate =
            daysWithTasks.reduce((sum, item) => sum + item.percentage, 0) /
            daysWithTasks.length;
        }
      }

      // Aylık tamamlanma oranı
      let monthlyCompletionRate = 0;
      if (monthlyData.length > 0) {
        // Sadece görev olan günleri filtrele
        const daysWithTasks = monthlyData.filter((item) => item.totalCount > 0);
        if (daysWithTasks.length > 0) {
          monthlyCompletionRate =
            daysWithTasks.reduce((sum, item) => sum + item.percentage, 0) /
            daysWithTasks.length;
        }
      }

      // Sıralı tamamlanma verilerini al
      const sortedData = [...completionData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Kesintisiz başarı serisini hesapla
      let streak = 0;
      for (const item of sortedData) {
        // Sadece görev olan günleri say
        if (item.totalCount > 0) {
          if (item.percentage >= 70) {
            streak++;
          } else {
            break;
          }
        }
      }

      // En başarılı günü bul
      let bestDay = "Monday";
      let bestRate = 0;
      let hasTasks = false;

      const dayMap: { [key: string]: { count: number; total: number } } = {
        Sunday: { count: 0, total: 0 },
        Monday: { count: 0, total: 0 },
        Tuesday: { count: 0, total: 0 },
        Wednesday: { count: 0, total: 0 },
        Thursday: { count: 0, total: 0 },
        Friday: { count: 0, total: 0 },
        Saturday: { count: 0, total: 0 },
      };

      // Her günün istatistiklerini hesapla
      completionData.forEach((item) => {
        const day = new Date(item.date).toLocaleString("en-US", {
          weekday: "long",
        });
        dayMap[day].count += item.completedCount;
        dayMap[day].total += item.totalCount;
      });

      Object.entries(dayMap).forEach(([day, data]) => {
        if (data.total > 0) {
          hasTasks = true;
          const rate = data.count / data.total;
          if (rate > bestRate) {
            bestRate = rate;
            bestDay = day;
          }
        }
      });

      // Hiç görev yoksa varsayılan değer göster
      if (!hasTasks) {
        bestDay = "Henüz veri yok";
      }

      // Toplam tamamlanan görev sayısını hesapla
      const totalCompletedTasks = completionData.reduce(
        (sum, item) => sum + item.completedCount,
        0
      );

      // Performans verilerini güncelle
      setPerformanceData({
        weeklyCompletionRate,
        monthlyCompletionRate,
        streak,
        bestDay,
        totalCompletedTasks,
        hasTasks: totalCompletedTasks > 0,
      });
    }
  }, [completionData]);

  // Performans seviyesini belirle
  const getPerformanceLevel = (
    rate: number,
    hasTasks: boolean = true
  ): string => {
    if (!hasTasks) return t("stats.noData");
    if (rate >= 80) return t("stats.performanceLevels.excellent");
    if (rate >= 60) return t("stats.performanceLevels.veryGood");
    if (rate >= 40) return t("stats.performanceLevels.good");
    if (rate >= 20) return t("stats.performanceLevels.moderate");
    return t("stats.performanceLevels.needsImprovement");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("stats.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          {t("stats.subtitle")}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Günlük Performans Kartı */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stats.dailyPerformance")}
          </Text>

          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Clock size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {timeUntilMidnight.split(" ").slice(0, 2).join(" ")}
                <Text
                  style={[
                    styles.secondsText,
                    {
                      color: colors.primary,
                      opacity: secondsOpacity,
                    },
                  ]}
                >
                  {" " + timeUntilMidnight.split(" ")[2]}
                </Text>
              </Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>
                {t("stats.timeRemaining")}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <CheckCircle size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {completedCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>
                {t("stats.completed")}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.warning + "20" },
                ]}
              >
                <Circle size={24} color={colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {activeCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.subText }]}>
                {t("stats.remaining")}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionRate}%`,
                    backgroundColor: getProgressColor(completionRate, colors),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {Math.round(completionRate)}%
            </Text>
          </View>

          <Text style={[styles.progressNote, { color: colors.subText }]}>
            {totalGoals === 0
              ? t("stats.progressNotes.noGoals")
              : completionRate === 100
                ? t("stats.progressNotes.allCompleted")
                : completionRate > 0
                  ? t("stats.progressNotes.keepGoing")
                  : t("stats.progressNotes.startCompleting")}
          </Text>
        </View>

        {/* Haftalık ve Aylık Performans */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stats.generalPerformance")}
          </Text>

          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceIconContainer,
                  { backgroundColor: colors.info + "20" },
                ]}
              >
                <Calendar size={20} color={colors.info} />
              </View>
              <View style={styles.performanceTextContainer}>
                <Text
                  style={[styles.performanceLabel, { color: colors.subText }]}
                >
                  {t("stats.weekly")}
                </Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>
                  {Math.round(performanceData.weeklyCompletionRate)}%
                </Text>
              </View>
            </View>

            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceIconContainer,
                  { backgroundColor: colors.secondary + "20" },
                ]}
              >
                <BarChart4 size={20} color={colors.secondary} />
              </View>
              <View style={styles.performanceTextContainer}>
                <Text
                  style={[styles.performanceLabel, { color: colors.subText }]}
                >
                  {t("stats.monthly")}
                </Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>
                  {Math.round(performanceData.monthlyCompletionRate)}%
                </Text>
              </View>
            </View>

            <View style={styles.performanceItem}>
              <View
                style={[
                  styles.performanceIconContainer,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <TrendingUp size={20} color={colors.success} />
              </View>
              <View style={styles.performanceTextContainer}>
                <Text
                  style={[styles.performanceLabel, { color: colors.subText }]}
                >
                  {t("stats.streak")}
                </Text>
                <Text style={[styles.performanceValue, { color: colors.text }]}>
                  {performanceData.streak} {t("stats.days")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.performanceSummary}>
            <View style={styles.performanceDetail}>
              <Text
                style={[
                  styles.performanceDetailLabel,
                  { color: colors.subText },
                ]}
              >
                {t("stats.bestDay")}
              </Text>
              <Text
                style={[styles.performanceDetailValue, { color: colors.text }]}
              >
                {performanceData.bestDay}
              </Text>
            </View>

            <View style={styles.performanceDetail}>
              <Text
                style={[
                  styles.performanceDetailLabel,
                  { color: colors.subText },
                ]}
              >
                {t("stats.totalCompleted")}
              </Text>
              <Text
                style={[styles.performanceDetailValue, { color: colors.text }]}
              >
                {performanceData.totalCompletedTasks} {t("stats.tasks")}
              </Text>
            </View>

            <View style={styles.performanceDetail}>
              <Text
                style={[
                  styles.performanceDetailLabel,
                  { color: colors.subText },
                ]}
              >
                {t("stats.performanceLevel")}
              </Text>
              <Text
                style={[styles.performanceDetailValue, { color: colors.text }]}
              >
                {getPerformanceLevel(
                  performanceData.weeklyCompletionRate,
                  performanceData.hasTasks
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Başarı Kartı */}
        <View
          style={[styles.achievementCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.achievementHeader}>
            <Award size={28} color={colors.primary} />
            <Text style={[styles.achievementTitle, { color: colors.text }]}>
              {t("stats.achievements.title")}
            </Text>
          </View>

          <View style={styles.achievementContent}>
            <Text style={[styles.achievementText, { color: colors.text }]}>
              {performanceData.streak >= 7
                ? t("stats.achievements.streakAchievement")
                : performanceData.totalCompletedTasks >= 50
                  ? t("stats.achievements.tasksAchievement")
                  : performanceData.weeklyCompletionRate >= 80
                    ? t("stats.achievements.weeklyAchievement")
                    : t("stats.achievements.default")}
            </Text>
          </View>
        </View>

        {/* İpuçları Kartı */}
        <View style={[styles.helpCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            {t("stats.tips.title")}
          </Text>
          <Text style={[styles.helpText, { color: colors.text }]}>
            {t("stats.tips.tip1")}
            {"\n"}
            {t("stats.tips.tip2")}
            {"\n"}
            {t("stats.tips.tip3")}
            {"\n"}
            {t("stats.tips.tip4")}
            {"\n"}
            {t("stats.tips.tip5")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// İlerleme çubuğu rengi için yardımcı fonksiyon
const getProgressColor = (rate: number, colors: Record<string, string>) => {
  if (rate >= 80) return colors.success;
  if (rate >= 40) return colors.info;
  if (rate >= 20) return colors.warning;
  return colors.error;
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
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  progressNote: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  performanceItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  performanceTextContainer: {
    flexDirection: "column",
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    marginVertical: 16,
  },
  performanceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  performanceDetail: {
    alignItems: "center",
    flex: 1,
  },
  performanceDetailLabel: {
    fontSize: 12,
    marginBottom: 6,
    textAlign: "center",
  },
  performanceDetailValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  achievementCard: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 8,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  achievementContent: {
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    borderRadius: 10,
    padding: 16,
  },
  achievementText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  helpCard: {
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
  secondsText: {
    fontSize: 12,
    fontWeight: "400",
  },
});
