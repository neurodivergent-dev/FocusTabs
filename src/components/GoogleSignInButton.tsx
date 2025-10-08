import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "./ThemeProvider";
import { FontAwesome } from "@expo/vector-icons";

interface GoogleSignInButtonProps {
  text?: string;
  onPress: () => void;
  style?: ViewStyle;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = "Sign in with Google",
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        <FontAwesome
          name="google"
          size={22}
          color={colors.text}
          style={styles.googleIcon}
        />
        <Text style={[styles.googleButtonText, { color: colors.text }]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default GoogleSignInButton;
