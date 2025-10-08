import React from "react";
import { View, StyleSheet, Animated, useWindowDimensions } from "react-native";
import { useTheme } from "./ThemeProvider";

interface PaginatorProps {
  data: unknown[];
  scrollX: Animated.Value;
}

const Paginator: React.FC<PaginatorProps> = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {data.map((_, index) => {
        // Her bir gösterge için inputRange hesaplanır
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        // Göstergenin genişliğini animasyonlu olarak değiştir
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 24, 10],
          extrapolate: "clamp",
        });

        // Göstergenin opaklığını animasyonlu olarak değiştir
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index.toString()}
            style={[
              styles.dot,
              {
                width: dotWidth,
                backgroundColor: colors.primary,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
});

export default Paginator;
