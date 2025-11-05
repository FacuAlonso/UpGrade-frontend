import React from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { MyClassesList } from "../../components/myClassesList";
import UserXPCard from "../../components/userXPCard";
import { useAuth } from "../../hooks/useAuth";

export default function HomeScreen() {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );

  if (!isLoggedIn || !user)
    return (
      <View style={styles.center}>
        <Text>Iniciá sesión para ver tus clases</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Home</Text>
      <UserXPCard />
      <Text style={styles.subtitle}>Mis clases</Text>
      <MyClassesList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "black", marginTop: 20 },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8, color: "black" },
});
