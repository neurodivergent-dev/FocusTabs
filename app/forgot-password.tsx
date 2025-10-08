import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
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

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  // Get auth methods from store
  const { resetPassword, error, isLoading, clearError } = useUserStore(
    (state) => ({
      resetPassword: state.resetPassword,
      error: state.error,
      isLoading: state.isLoading,
      clearError: state.clearError,
    })
  );

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    clearError();
    setValidationError("");

    if (!email.trim() || !emailRegex.test(email)) {
      setValidationError(t("auth.register.errorEmailInvalid"));
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email);

      // Check if there's an error after reset attempt
      if (!useUserStore.getState().error) {
        // No error, reset request successful
        setResetSent(true);
      }
    } catch (err) {
      // Handle any uncaught errors
      Alert.alert(
        t("auth.forgotPassword.errorGeneral"),
        Platform.OS === "ios"
          ? err instanceof Error
            ? err.message
            : String(err)
          : ""
      );
    }
  };

  // Android geri butonuna basıldığında Login ekranına yönlendir
  useEffect(() => {
    const backAction = () => {
      router.replace("/login");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  // Login ekranına dön
  const goToLogin = () => {
    router.replace("/login");
  };

  return (
    <AuthLayout
      title={t("auth.forgotPassword.title")}
      subtitle={t("auth.forgotPassword.subtitle")}
      showBackButton={true}
      onBackPress={goToLogin}
    >
      <View style={styles.formContainer}>
        {resetSent ? (
          <View style={styles.successContainer}>
            <MaterialIcons
              name="check-circle"
              size={60}
              color={colors.primary}
              style={styles.successIcon}
            />
            <Text style={[styles.successText, { color: colors.text }]}>
              {t("auth.forgotPassword.instructionsSent")}
            </Text>

            <ThemedButton
              title={t("auth.forgotPassword.backToLogin")}
              onPress={goToLogin}
              style={styles.loginButton}
            />
          </View>
        ) : (
          <>
            <AuthInput
              label={t("auth.forgotPassword.emailLabel")}
              placeholder={t("auth.forgotPassword.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="email"
              error={validationError}
            />

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

            <View style={styles.buttonContainer}>
              <ThemedButton
                title={t("auth.forgotPassword.resetButton")}
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.resetButton}
              />

              <ThemedButton
                title={t("auth.forgotPassword.backToLogin")}
                onPress={goToLogin}
                variant="outline"
                style={styles.loginButton}
              />
            </View>
          </>
        )}
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24,
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
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  resetButton: {},
  loginButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
});
