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

function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  // Get auth methods from store
  const { register, error, isLoading, clearError } = useUserStore((state) => ({
    register: state.register,
    error: state.error,
    isLoading: state.isLoading,
    clearError: state.clearError,
  }));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    clearError();
    setValidationError("");

    if (!name.trim()) {
      setValidationError(t("auth.register.errorGeneral"));
      return false;
    }

    if (!email.trim() || !emailRegex.test(email)) {
      setValidationError(t("auth.register.errorEmailInvalid"));
      return false;
    }

    if (password.length < 6) {
      setValidationError(t("auth.register.errorPasswordRequirements"));
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError(t("auth.register.errorPasswordMismatch"));
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(name, email, password);

      // Check if there's an error after registration attempt
      if (!useUserStore.getState().error) {
        // No error, registration successful
        router.replace("/(tabs)");
      }
    } catch (err) {
      // Handle any uncaught errors
      Alert.alert(
        t("auth.register.errorGeneral"),
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
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      showBackButton={true}
      onBackPress={goToLogin}
    >
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>
            {t("auth.register.haveAccount")}
          </Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              {" "}
              {t("auth.register.signIn")}
            </Text>
          </TouchableOpacity>
        </View>

        <AuthInput
          label={t("auth.register.nameLabel")}
          placeholder={t("auth.register.namePlaceholder")}
          value={name}
          onChangeText={setName}
          icon="person"
          error={validationError && !name ? validationError : ""}
        />

        <AuthInput
          label={t("auth.register.emailLabel")}
          placeholder={t("auth.register.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          icon="email"
          error={validationError && !email ? validationError : ""}
        />

        <AuthInput
          label={t("auth.register.passwordLabel")}
          placeholder={t("auth.register.passwordPlaceholder")}
          value={password}
          onChangeText={setPassword}
          isPassword
          icon="lock"
          error={validationError && !password ? validationError : ""}
        />

        <AuthInput
          label={t("auth.register.confirmPasswordLabel")}
          placeholder={t("auth.register.confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          icon="lock-outline"
          error={validationError && !confirmPassword ? validationError : ""}
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

        <ThemedButton
          title={t("auth.register.registerButton")}
          onPress={handleRegister}
          loading={isLoading}
          style={styles.registerButton}
        />

        <View style={styles.orContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.subText }]}>
            {t("auth.login.orContinueWith").split(" ")[0] || "veya"}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <GoogleSignInButton
          text={t("auth.login.continueWithGoogle")}
          onPress={() =>
            Alert.alert(
              "Google Sign In",
              "Google ile giriş özelliği yakında eklenecek."
            )
          }
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
  registerButton: {
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
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
});

export default RegisterScreen;
