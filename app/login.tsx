import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AuthLayout from "../src/components/AuthLayout";
import AuthInput from "../src/components/AuthInput";
import ThemedButton from "../src/components/ThemedButton";
import { useTheme } from "../src/components/ThemeProvider";
import { useUserStore } from "../src/store/userStore";
import { MaterialIcons } from "@expo/vector-icons";
import GoogleSignInButton from "../src/components/GoogleSignInButton";

function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  // Get auth methods from store
  const { login, error, isLoading, clearError, continueAsGuest } = useUserStore(
    (state) => ({
      login: state.login,
      error: state.error,
      isLoading: state.isLoading,
      clearError: state.clearError,
      continueAsGuest: state.continueAsGuest,
    })
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  // Android geri butonuna basıldığında doğrudan ana sayfaya yönlendir
  useEffect(() => {
    const backAction = () => {
      router.replace("/(tabs)");
      return true; // Geri tuşunu engellemek için true döndürüyoruz
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  const handleLogin = async () => {
    // Clear previous errors
    setValidationError("");
    clearError();

    // Basic validation
    if (!email || !password) {
      setValidationError(t("auth.login.errorInvalidCredentials"));
      return;
    }

    // Try to login
    try {
      await login(email, password);

      // Check if there's an error after login attempt
      if (!useUserStore.getState().error) {
        // No error, login successful
        router.replace("/(tabs)");
      }
    } catch (err) {
      // Handle any uncaught errors
      Alert.alert(
        t("auth.login.errorGeneral"),
        Platform.OS === "ios"
          ? err instanceof Error
            ? err.message
            : String(err)
          : ""
      );
    }
  };

  const goToRegister = () => {
    router.push("/register");
  };

  const goToForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    router.replace("/(tabs)");
  };

  return (
    <AuthLayout
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      showBackButton={false}
    >
      <View style={styles.formContainer}>
        <AuthInput
          label={t("auth.login.emailLabel")}
          placeholder={t("auth.login.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          icon="email"
          error={validationError && !email ? validationError : ""}
        />

        <AuthInput
          label={t("auth.login.passwordLabel")}
          placeholder={t("auth.login.passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          isPassword
          icon="lock"
          error={validationError && !password ? validationError : ""}
        />

        <View style={styles.actionLinksContainer}>
          <TouchableOpacity
            onPress={goToForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {t("auth.login.forgotPassword")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToRegister}
            style={styles.registerContainer}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              {t("auth.login.createAccount")}
            </Text>
          </TouchableOpacity>
        </View>

        {(error || validationError) && (
          <View style={styles.errorContainer}>
            <MaterialIcons
              name="error-outline"
              size={16}
              color={colors.error}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error || validationError}
            </Text>
          </View>
        )}

        <ThemedButton
          title={t("auth.login.loginButton")}
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />

        <View style={styles.orDividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.orDividerText, { color: colors.subText }]}>
            {t("auth.login.orContinueWith").split(" ")[0] || "veya"}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          onPress={handleContinueAsGuest}
          style={styles.guestContainer}
        >
          <Text style={[styles.guestText, { color: colors.text }]}>
            {t("auth.guest.continueWithoutAccount")}
          </Text>
        </TouchableOpacity>

        <GoogleSignInButton
          text={t("auth.login.continueWithGoogle")}
          onPress={() =>
            Alert.alert(
              "Google Sign In",
              "Google ile giriş özelliği yakında eklenecek."
            )
          }
          style={styles.googleButton}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24,
  },
  forgotPasswordContainer: {
    alignSelf: "center",
  },
  registerContainer: {
    alignSelf: "center",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  actionLinksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 0, 0, 0.05)",
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
  },
  guestContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  guestText: {
    fontSize: 16,
  },
  orDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  orDividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  googleButton: {
    marginBottom: 0,
  },
});

export default LoginScreen;
