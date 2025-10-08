import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ViewStyle,
} from "react-native";
import { useTheme } from "./ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FocusTabsLogo from "../../components/LogoComponent";

const { height } = Dimensions.get("window");

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  containerStyle?: ViewStyle;
  onBackPress?: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  containerStyle,
  onBackPress,
}) => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.background },
        containerStyle,
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={[
                styles.backButton,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}

          <FocusTabsLogo size={80} color={colors.primary} />

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.subText }]}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: height * 0.08,
    paddingBottom: 32,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 0,
    borderRadius: 12,
    padding: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
});

export default AuthLayout;
