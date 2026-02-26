import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import {
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Calendar,
  BarChart4,
  Award,
  Lightbulb,
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
  const insets = useSafeAreaInsets();
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

  // Bugünün görevlerini filtrele (local time kullanarak)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  const todayGoals = goals.filter((goal) => goal.date === today);
  const totalGoals = todayGoals.length;

  const completionRate =
    totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  // Bugünün completion rate'ini performance için kullan
  const todayPerformanceRate = totalGoals > 0 ? completionRate : 0;
  const hasTodayTasks = totalGoals > 0;

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
      <LinearGradient
        colors={[
          colors.primary,
          colors.secondary || colors.primary,
          colors.info || colors.primary,
          colors.primary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
        style={[styles.header, { 
          paddingTop: insets.top + 8
        }]}
      >
        <Text style={[styles.title, { color: "#FFFFFF" }]}>
          {t("stats.title")}
        </Text>
        <Text style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.9)" }]}>
          {t("stats.subtitle")}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Günlük Performans Kartı - Gradient */}
        <View style={[styles.sectionCard, { 
          backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
          borderColor: colors.primary + '40',
          borderWidth: 1,
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stats.dailyPerformance")}
          </Text>

          <View style={styles.statsContainer}>
            <View style={[styles.statCardLarge, { backgroundColor: colors.primary + '15' }]}>
              <View style={[styles.statIconLarge, { backgroundColor: colors.primary + '25' }]}>
                <CheckCircle size={28} color={colors.primary} />
              </View>
              <Text style={[styles.statValueLarge, { color: colors.primary }]}>
                {completedCount}/{totalGoals}
              </Text>
              <Text style={[styles.statLabelLarge, { color: colors.subText }]}>
                {t("stats.completed")}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.success + '25' }]}>
                  <CheckCircle size={22} color={colors.success} />
                </View>
                <Text style={[styles.statValue, { color: colors.success, fontWeight: '700' }]}>
                  {completedCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>
                  {t("stats.completed")}
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.warning + '25' }]}>
                  <Circle size={22} color={colors.warning} />
                </View>
                <Text style={[styles.statValue, { color: colors.warning, fontWeight: '700' }]}>
                  {activeCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>
                  {t("stats.remaining")}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.primary + '30', borderWidth: 1 }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>
                {t("stats.dailyProgress")}
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.primary, fontWeight: '700' }]}>
                {Math.round(completionRate)}%
              </Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionRate}%`,
                    backgroundColor: getProgressColor(completionRate, colors),
                    borderRadius: 4,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressNote, { color: colors.subText, marginTop: 8 }]}>
              {totalGoals === 0
                ? t("stats.progressNotes.noGoals")
                : completionRate === 100
                  ? t("stats.progressNotes.allCompleted")
                  : completionRate > 0
                    ? t("stats.progressNotes.keepGoing")
                    : t("stats.progressNotes.startCompleting")}
            </Text>
          </View>

          <View style={[styles.timeCard, { backgroundColor: isDarkMode ? colors.primary + '10' : colors.info + '10', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={[styles.timeIconContainer, { backgroundColor: colors.primary + '20', padding: 8, borderRadius: 12 }]}>
              <Clock size={24} color={colors.primary} />
            </View>
            <View style={styles.timeTextContainer}>
              <Text style={[styles.timeLabel, { color: colors.subText, fontSize: 12 }]}>
                {t("stats.timeRemaining")}
              </Text>
              <Text style={[styles.timeValue, { color: colors.text, fontSize: 16, fontWeight: '600' }]}>
                {timeUntilMidnight}
              </Text>
            </View>
          </View>
        </View>

        {/* General Performance - Modern Cards */}
        <View style={[styles.sectionCard, { 
          backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
          borderColor: colors.primary + '40',
          borderWidth: 1,
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("stats.generalPerformance")}
          </Text>

          <View style={styles.performanceGrid}>
            <View style={[styles.performanceCard, { 
              backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
              borderWidth: 1,
              borderColor: colors.primary + '40',
            }]}>
              <View style={[styles.performanceIcon, { backgroundColor: colors.primary + '30' }]}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <Text style={[styles.performanceLabel, { color: colors.subText }]}>
                {t("stats.weekly")}
              </Text>
              <Text style={[styles.performanceValue, { color: colors.primary, fontWeight: '700' }]}>
                {Math.round(performanceData.weeklyCompletionRate)}%
              </Text>
            </View>

            <View style={[styles.performanceCard, { 
              backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
              borderWidth: 1,
              borderColor: colors.primary + '40',
            }]}>
              <View style={[styles.performanceIcon, { backgroundColor: colors.primary + '30' }]}>
                <BarChart4 size={24} color={colors.primary} />
              </View>
              <Text style={[styles.performanceLabel, { color: colors.subText }]}>
                {t("stats.monthly")}
              </Text>
              <Text style={[styles.performanceValue, { color: colors.primary, fontWeight: '700' }]}>
                {Math.round(performanceData.monthlyCompletionRate)}%
              </Text>
            </View>

            <View style={[styles.performanceCard, { 
              backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
              borderWidth: 1,
              borderColor: colors.primary + '40',
            }]}>
              <View style={[styles.performanceIcon, { backgroundColor: colors.primary + '30' }]}>
                <TrendingUp size={24} color={colors.primary} />
              </View>
              <Text style={[styles.performanceLabel, { color: colors.subText }]}>
                {t("stats.streak")}
              </Text>
              <Text style={[styles.performanceValue, { color: colors.primary, fontWeight: '700' }]}>
                {performanceData.streak} <Text style={{ fontSize: 12 }}>{t("stats.days")}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.performanceSummary}>
            <View style={styles.performanceDetail}>
              <Text style={[styles.performanceDetailLabel, { color: colors.subText }]}>
                {t("stats.bestDay")}
              </Text>
              <Text style={[styles.performanceDetailValue, { color: colors.text }]}>
                {performanceData.bestDay}
              </Text>
            </View>

            <View style={styles.performanceDetail}>
              <Text style={[styles.performanceDetailLabel, { color: colors.subText }]}>
                {t("stats.totalCompleted")}
              </Text>
              <Text style={[styles.performanceDetailValue, { color: colors.text }]}>
                {performanceData.totalCompletedTasks} <Text style={{ fontSize: 12 }}>{t("stats.tasks")}</Text>
              </Text>
            </View>

            <View style={styles.performanceDetail}>
              <Text style={[styles.performanceDetailLabel, { color: colors.subText }]}>
                {t("stats.performanceLevel")}
              </Text>
              <Text style={[styles.performanceDetailValue, { color: getPerformanceLevelColor(todayPerformanceRate) }]}>
                {getPerformanceLevel(
                  todayPerformanceRate,
                  hasTodayTasks
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements Card - Modern Design */}
        <View style={[styles.achievementCard, { 
          backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
          borderColor: colors.primary + '40',
          borderWidth: 1,
        }]}>
          <View style={styles.achievementHeader}>
            <View style={[styles.achievementIconContainer, { backgroundColor: colors.primary + '25' }]}>
              <Award size={28} color={colors.primary} />
            </View>
            <Text style={[styles.achievementTitle, { color: colors.text, fontWeight: '700' }]}>
              {t("stats.achievements.title")}
            </Text>
          </View>

          <View style={styles.achievementContent}>
            <Text style={[styles.achievementText, { color: colors.text, fontSize: 15, lineHeight: 22 }]}>
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

        {/* Focus Tips Card - Modern Design */}
        <View style={[styles.helpCard, { 
          backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)',
          borderColor: colors.primary + '40',
          borderWidth: 1,
        }]}>
          <View style={styles.helpHeader}>
            <View style={[styles.helpIconContainer, { backgroundColor: colors.info + '25' }]}>
              <Lightbulb size={24} color={colors.info} />
            </View>
            <Text style={[styles.helpTitle, { color: colors.text, fontWeight: '700' }]}>
              {t("stats.tips.title")}
            </Text>
          </View>
          
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {t("stats.tips.tip1")}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {t("stats.tips.tip2")}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {t("stats.tips.tip3")}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {t("stats.tips.tip4")}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipDot, { backgroundColor: colors.info }]} />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {t("stats.tips.tip5")}
              </Text>
            </View>
          </View>
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

// Performance level için renk fonksiyonu
const getPerformanceLevelColor = (rate: number) => {
  if (rate >= 80) return '#10B981'; // success green
  if (rate >= 50) return '#3B82F6'; // info blue
  if (rate >= 20) return '#F59E0B'; // warning yellow
  return '#EF4444'; // error red
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    paddingBottom: 0,
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
  statsContainer: {
    marginBottom: 16,
  },
  statCardLarge: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  statIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValueLarge: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabelLarge: {
    fontSize: 14,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  progressCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressNote: {
    fontSize: 14,
    fontStyle: "italic",
  },
  timeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  timeIconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  timeTextContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  performanceCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  performanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 4,
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
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  helpIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  tipsContainer: {},
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  secondsText: {
    fontSize: 12,
    fontWeight: "400",
  },
});
