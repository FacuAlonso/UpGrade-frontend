import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { MyClassesList } from "../../components/myClassesList";
import UserXPCard from "../../components/userXPCard";
import { TEST_USER_ID } from "@/config";

export default function HomeScreen() {
  const userId = TEST_USER_ID; // estudiante de ejemplo

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Home</Text>
      <UserXPCard studentId={userId} />

      <Text style={styles.subtitle}>Mis clases</Text>
      <MyClassesList userId={userId} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16, 
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    marginTop: 20
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "black",
  },
  link: {
    color: "#22C55E",
    fontWeight: "700",
    fontSize: 16,
    marginTop: 24,
  },
});