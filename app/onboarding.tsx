import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
  Dimensions,
  ViewToken,
  ImageSourcePropType,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../src/components/ThemeProvider";
import OnboardingItem from "../src/components/OnboardingItem";
import Paginator from "../src/components/Paginator";
import { useOnboardingStore } from "../src/store/onboardingStore";

// Onboarding görselleri
const onboardingImages = {
  welcome: require("../assets/images/onboarding/welcome.png"),
  dailyGoals: require("../assets/images/onboarding/daily-goals.png"),
  tracking: require("../assets/images/onboarding/tracking.png"),
  themes: require("../assets/images/onboarding/themes.png"),
};

// Onboarding öğe türü
interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

// Geçici onboarding görsellerini oluşturmak için basit bir bileşen
const _PlaceholderImage = ({
  icon,
  color,
}: {
  icon: string;
  color: string;
}) => {
  const { colors } = useTheme();

  // İkon türüne göre içerik oluştur
  const renderContent = () => {
    switch (icon) {
      case "welcome":
        return (
          <>
            <View style={[styles.circle, { backgroundColor: color }]} />
            <Text style={[styles.iconText, { color: colors.text }]}>
              FocusTabs
            </Text>
          </>
        );
      case "dailyGoals":
        return (
          <>
            <View style={[styles.card, { backgroundColor: color }]}>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <View style={styles.line} />
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <View style={styles.line} />
              </View>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox} />
                <View style={styles.line} />
              </View>
            </View>
          </>
        );
      case "tracking":
        return (
          <View style={styles.chartContainer}>
            <View
              style={[styles.bar, { height: 60, backgroundColor: color }]}
            />
            <View
              style={[styles.bar, { height: 90, backgroundColor: color }]}
            />
            <View
              style={[styles.bar, { height: 40, backgroundColor: color }]}
            />
            <View
              style={[styles.bar, { height: 70, backgroundColor: color }]}
            />
          </View>
        );
      case "themes":
        return (
          <View style={styles.themesContainer}>
            <View
              style={[styles.colorCircle, { backgroundColor: "#FF5252" }]}
            />
            <View
              style={[styles.colorCircle, { backgroundColor: "#FFD740" }]}
            />
            <View
              style={[styles.colorCircle, { backgroundColor: "#4A90E2" }]}
            />
            <View
              style={[styles.colorCircle, { backgroundColor: "#66BB6A" }]}
            />
          </View>
        );
      default:
        return <View style={[styles.box, { backgroundColor: color }]} />;
    }
  };

  return <View style={styles.placeholderContainer}>{renderContent()}</View>;
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const { setOnboardingComplete } = useOnboardingStore();
  const [dimensions, setDimensions] = useState({ width: 375, height: 812 });

  // Ekran boyutlarını al
  useEffect(() => {
    const { width, height } = Dimensions.get("window");
    setDimensions({ width, height });
  }, []);

  // Onboarding ekranları için veriler
  const slides: OnboardingItem[] = [
    {
      id: "welcome",
      title: t("onboarding.welcome.title"),
      description: t("onboarding.welcome.description"),
      image: onboardingImages.welcome,
    },
    {
      id: "dailyGoals",
      title: t("onboarding.dailyGoals.title"),
      description: t("onboarding.dailyGoals.description"),
      image: onboardingImages.dailyGoals,
    },
    {
      id: "tracking",
      title: t("onboarding.tracking.title"),
      description: t("onboarding.tracking.description"),
      image: onboardingImages.tracking,
    },
    {
      id: "themes",
      title: t("onboarding.themes.title"),
      description: t("onboarding.themes.description"),
      image: onboardingImages.themes,
    },
  ];

  // Özel OnboardingItem bileşeni
  const renderOnboardingItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={[styles.itemContainer, { width: dimensions.width }]}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: colors.subText }]}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  // Scroll olayını izleme
  const viewableItemsChanged = useRef(
    (info: { viewableItems: Array<ViewToken>; changed: Array<ViewToken> }) => {
      if (
        info.viewableItems.length > 0 &&
        typeof info.viewableItems[0].index === "number"
      ) {
        setCurrentIndex(info.viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Sonraki ekrana geçiş
  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  // Onboarding'i tamamla
  const completeOnboarding = () => {
    setOnboardingComplete(true);
    router.replace("/(tabs)");
  };

  // Onboarding'i atla
  const skipOnboarding = () => {
    completeOnboarding();
  };

  // Durum çubuğu için koyu mod kontrolü
  const isDarkMode = (colors: Record<string, string>) => {
    return (
      colors.background.startsWith("#0") ||
      colors.background.startsWith("#1") ||
      colors.background.startsWith("#2") ||
      colors.background.startsWith("#3") ||
      colors.background === "black"
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode(colors) ? "light-content" : "dark-content"}
      />

      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={skipOnboarding}>
          <Text style={[styles.skipText, { color: colors.primary }]}>
            {t("onboarding.skip")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flatlistContainer}>
        <FlatList
          data={slides}
          renderItem={renderOnboardingItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.bottomContainer}>
        <Paginator data={slides} scrollX={scrollX} />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1
              ? t("onboarding.getStarted")
              : t("onboarding.next")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  flatlistContainer: {
    flex: 1,
  },
  bottomContainer: {
    marginBottom: 40,
  },
  button: {
    height: 56,
    marginHorizontal: 20,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Onboarding item stilleri
  itemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  image: {
    width: 300,
    height: 300,
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 28,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 24,
  },

  // Placeholder görsel stilleri
  placeholderContainer: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
  },
  box: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    width: 160,
    height: 180,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    marginRight: 12,
  },
  line: {
    height: 8,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 4,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 150,
    width: 200,
    justifyContent: "space-between",
  },
  bar: {
    width: 30,
    borderRadius: 4,
  },
  themesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 160,
    height: 160,
    justifyContent: "space-between",
    alignContent: "space-between",
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 8,
  },
});
