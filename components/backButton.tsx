import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { useRouter } from "expo-router";

type Props = { style?: ViewStyle; label?: string };

export default function BackButton({ style, label = "← Volver" }: Props) {
  const router = useRouter();

  return (
    <Pressable style={[styles.button, style]} onPress={() => router.back()}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute", 
    top: 40,              
    left: 16,             
    zIndex: 10,           
    padding: 8,
  },
  text: {
    color: "#22C55E",
    fontWeight: "700",
    fontSize: 16,
  },
});
