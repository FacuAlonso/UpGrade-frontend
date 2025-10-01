import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Acá irá el calendario de Mis Clases</Text>

      {/* navButton1: primer acceso → ir a buscador */}
      <Link href="/search-teachers" style={styles.link}>
        Ir a buscar profes →
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#6B7280", marginBottom: 16 },
  link: { color: "#22C55E", fontWeight: "700", fontSize: 16 },
});
