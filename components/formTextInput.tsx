import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

type Props = TextInputProps & { invalid?: boolean };

export default function FormTextInput({ invalid, style, ...rest }: Props) {
  return (
    <TextInput
      {...rest}
      style={[styles.input, invalid && styles.invalid, style]}
      placeholderTextColor="#9CA3AF"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderBottomWidth: 2,
    borderBottomColor: "#86EFAC", 
    fontSize: 16,
    marginBottom: 16,
  },
  invalid: { borderBottomColor: "#EF4444" },
});
