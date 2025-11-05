import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from "react-native";

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle; 
};

export default function PrimaryButton({ label, onPress, style, textStyle }: Props) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
  },
  label: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
