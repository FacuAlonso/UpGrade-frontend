import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;     // ⬅️ nueva
  loading?: boolean;      // opcional, por si querés mostrar “Guardando...”
  style?: ViewStyle;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: Props) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text style={styles.text}>
        {loading ? "Guardando..." : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
  },
});