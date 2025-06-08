import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useDailyGoalsStore } from "../store/dailyGoalsStore";
import { useTheme } from "../components/ThemeProvider";
import { getThemeByIdAndMode } from "../constants/themes";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

export const CalendarScreen: React.FC = () => {
  const { colors, isDarkMode, themeId } = useTheme();
  const router = useRouter();

  // Store ve veri
  const {
    completionData,
    calendarLoading,
    calendarError,
    fetchAllCompletions,
    updateDailyStats,
  } = useDailyGoalsStore();

  // Seçilen tarih state'i
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Takvim işaretleri (marked dates) için state
  const [markedDates, setMarkedDates] = useState<any>({});

  // Tema değişikliklerini takip etmek için state
  const [themeVersion, setThemeVersion] = useState(0);

  // Tema değiştiğinde theme version'ı güncelle
  useEffect(() => {
    // Tema değiştiğinde version arttır - bu takvimin yeniden render olmasını sağlar
    setThemeVersion((prev) => prev + 1);
  }, [themeId, isDarkMode]);

  // Mevcut ayın tarihlerini getiren yardımcı fonksiyon
  const getCurrentMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);

    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0);

    return {
      startDate: firstDay,
      endDate: lastDay,
    };
  };

  // Sayfa yüklendiğinde ve ay değiştiğinde verileri getir
  useEffect(() => {
    // İlk yükleme sırasında bugünün istatistiklerini güncelle
    updateDailyStats();

    // Tüm tamamlama verilerini getir
    fetchAllCompletions();
  }, []);

  // Tamamlama verileri değiştiğinde takvim işaretlerini güncelle
  useEffect(() => {
    if (completionData.length > 0) {
      const marked: any = {};

      completionData.forEach((item) => {
        // Renk ölçeği oluştur - tamamlanma yüzdesine göre
        const color = getCompletionColor(item.percentage);

        marked[item.date] = {
          selected: item.date === selectedDate,
          selectedColor: colors.primary,
          marked: true,
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
      });

      // Bugünün tarihini her zaman işaretle
      const today = new Date().toISOString().split("T")[0];
      if (!marked[today]) {
        marked[today] = {
          selected: today === selectedDate,
          selectedColor: colors.primary,
          marked: false,
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

      // Seçili tarihi her zaman işaretle
      if (!marked[selectedDate]) {
        marked[selectedDate] = {
          selected: true,
          selectedColor: colors.primary,
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

      setMarkedDates(marked);
    }
  }, [
    completionData,
    selectedDate,
    colors.primary,
    colors.text,
    themeVersion,
    colors,
  ]);

  // Tamamlanma yüzdesine göre renk belirleme
  const getCompletionColor = (percentage: number) => {
    if (percentage === 0) return colors.error;
    if (percentage < 50) return colors.warning;
    if (percentage < 100) return colors.info;
    return colors.success;
  };

  // Tamamlanma durumu metni
  const getCompletionText = (percentage: number) => {
    if (percentage === 0) return "Hiç tamamlanmadı";
    if (percentage < 50) return "Az tamamlandı";
    if (percentage < 100) return "Kısmen tamamlandı";
    return "Tamamen tamamlandı";
  };

  // Tarih seçme işleyicisi
  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
  };

  // Ay değiştiğinde veriler güncellenir
  const handleMonthChange = (monthData: DateData) => {
    const year = monthData.year;
    const month = monthData.month - 1; // JavaScript ayları 0'dan başlar

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Ayın tüm verileri için fetchAllCompletions kullanıyoruz
    fetchAllCompletions();
  };

  // Seçili tarih için veri bulma
  const findCompletionDataForDate = (date: string) => {
    return completionData.find((item) => item.date === date);
  };

  // Seçili gün bilgisi
  const selectedDateData = findCompletionDataForDate(selectedDate);

  // Kalendar teması için gereken stilleri useMemo ile hazırla
  const calendarTheme = useMemo(
    () => ({
      // Kritik arkaplan renklerini zorla uygula
      backgroundColor: colors.background,
      calendarBackground: colors.background,
      contentStyle: {
        backgroundColor: colors.background,
      },

      // Metin renkleri - doğrudan tema renklerini kullan, colors.text/subText kullan
      textSectionTitleColor: colors.text,
      textSectionTitleDisabledColor: colors.subText,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: "#FFFFFF",
      todayTextColor: colors.primary,
      dayTextColor: colors.text,
      textDisabledColor: colors.subText,

      // Nokta ve ok renkleri - doğrudan tema renklerini kullan
      dotColor: colors.primary,
      selectedDotColor: "#FFFFFF",
      arrowColor: colors.primary,
      disabledArrowColor: colors.subText,
      monthTextColor: colors.text,
      indicatorColor: colors.primary,

      // Yazı stilleri
      textDayFontWeight: "400",
      textMonthFontWeight: "bold",
      textDayHeaderFontWeight: "600",
      textDayFontSize: 16,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 14,

      // Header özel stilleri - arka planları ve renkleri zorla tema ile eşleştir
      "stylesheet.calendar.header": {
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 6,
          alignItems: "center",
          backgroundColor: colors.background, // Tema arka planı
        },
        monthText: {
          fontSize: 18,
          fontWeight: "bold",
          color: colors.text, // Tema metin rengi
        },
        arrow: {
          padding: 6,
        },
        week: {
          marginTop: 7,
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: colors.background, // Tema arka planı
        },
        dayHeader: {
          marginTop: 2,
          marginBottom: 7,
          width: 32,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "600",
          color: colors.text, // Tema metin rengi
        },
      },

      // Gün hücreleri için özel stiller - arka planları zorla
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
          color: colors.text, // Tema metin rengi
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
        dot: {
          width: 6,
          height: 6,
          marginTop: 1,
          borderRadius: 3,
          opacity: 0,
        },
      },

      // Gün çizgisi için özel stiller - arka planları zorla
      "stylesheet.day.period": {
        base: {
          width: 38,
          height: 38,
          alignItems: "center",
          backgroundColor: colors.background, // Tema arka planı
        },
      },

      // Takvim alt kısmı - arka planları zorla
      "stylesheet.calendar.main": {
        container: {
          backgroundColor: colors.background, // Tema arka planı
        },
        week: {
          marginTop: 7,
          marginBottom: 7,
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: colors.background, // Tema arka planı
        },
      },

      // Takvim konteyner stilini uygula
      "stylesheet.calendar": {
        main: {
          backgroundColor: colors.background, // Tema arka planı
        },
      },

      // Takvim günler tablosu stilini uygula
      "stylesheet.calendar.day": {
        wrapper: {
          backgroundColor: colors.background, // Tema arka planı
        },
      },

      // Ek bileşenlerin stillerini düzelt
      "stylesheet.expandable-calendar": {
        main: {
          backgroundColor: colors.background,
        },
      },

      // Calendar'ın tüm iç bileşenlerini kapsayan genel stiller
      "stylesheet.expandable-calendar.main": {
        container: {
          backgroundColor: colors.background,
        },
      },
    }),
    [colors, themeId, isDarkMode, themeVersion]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Takvim</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Hedeflerinizi takip edin
        </Text>
      </View>

      <View
        style={[
          styles.calendarContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Calendar
          // Temel yapılandırma
          key={`calendar-${themeVersion}`}
          current={selectedDate}
          onDayPress={handleDateSelect}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          markingType="custom"
          // Tema ve görünüm - tüm renkleri kontrol etmek için geniş tema yapısı
          theme={calendarTheme}
          // Özel ayarlar
          enableSwipeMonths={true}
          hideExtraDays={false}
          firstDay={1} // Pazartesi'den başla
          renderArrow={(direction: string) =>
            direction === "left" ? (
              <ChevronLeft size={20} color={colors.primary} />
            ) : (
              <ChevronRight size={20} color={colors.primary} />
            )
          }
          // Doğrudan takvimin kendisine stil uygula
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
            Veriler yükleniyor...
          </Text>
        </View>
      ) : calendarError ? (
        <View
          style={[styles.detailsContainer, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.errorText, { color: colors.error }]}>
            {calendarError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchAllCompletions()}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[styles.detailsContainer, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.detailsTitle, { color: colors.text }]}>
            {new Date(selectedDate).toLocaleDateString("tr-TR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          {selectedDateData ? (
            <View style={styles.statsContainer}>
              <View
                style={[
                  styles.completionIndicator,
                  {
                    backgroundColor: getCompletionColor(
                      selectedDateData.percentage
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
                  {getCompletionText(selectedDateData.percentage)}
                </Text>
                <Text style={[styles.statsText, { color: colors.subText }]}>
                  {selectedDateData.completedCount} /{" "}
                  {selectedDateData.totalCount} hedef tamamlandı
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: colors.subText }]}>
                Bu tarih için veri bulunmuyor
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.legendContainer}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>
          Renk Açıklamaları:
        </Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.error }]}
            />
            <Text style={[styles.legendText, { color: colors.subText }]}>
              Tamamlanmadı
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.warning }]}
            />
            <Text style={[styles.legendText, { color: colors.subText }]}>
              Az (&lt;50%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.info }]}
            />
            <Text style={[styles.legendText, { color: colors.subText }]}>
              Kısmen (&lt;100%)
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.success }]}
            />
            <Text style={[styles.legendText, { color: colors.subText }]}>
              Tamamen (100%)
            </Text>
          </View>
        </View>
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  loadingText: {
    fontSize: 16,
  },
});

export default CalendarScreen;
