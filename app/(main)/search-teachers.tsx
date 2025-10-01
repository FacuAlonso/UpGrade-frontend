import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SearchTeachersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Profes</Text>
      <Text style={styles.subtitle}>Acá irá la FlatList + filtros</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#6B7280" },
});
