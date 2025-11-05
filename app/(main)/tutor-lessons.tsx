import React from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useFetchLessons } from "../../hooks/data";

export default function TutorLessonsScreen() {
  const { user } = useAuth();
  const { data: lessons, isLoading, error } = useFetchLessons();

  const myLessons = (lessons ?? []).filter(l => l.tutorId === user?.id);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Mis clases (Tutor)" }} />

      {isLoading && <ActivityIndicator />}
      {error && <Text style={styles.error}>Error: {(error as Error).message}</Text>}

      {!isLoading && myLessons.length === 0 && (
        <Text style={styles.empty}>No tenés clases como tutor todavía.</Text>
      )}

      <FlatList
        data={myLessons}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const studentName = `${item.student?.firstName ?? "Alumno"} ${item.student?.lastName ?? ""}`.trim();
          const subject = item.subject?.name ?? "Materia";
          const date = new Date(item.timestamp);
          const when = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

          return (
            <View style={styles.card}>
              <Text style={styles.title}>{studentName}</Text>
              <Text style={styles.sub}>{subject} • {item.modality}</Text>
              <Text style={styles.sub}>{when}</Text>
              <Text style={styles.status}>Estado: {item.status}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#0B0B0C" },
  error: { color: "#ef4444" },
  empty: { color: "#9CA3AF" },
  card: { backgroundColor: "#17181C", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#26282E" },
  title: { color: "white", fontSize: 16, fontWeight: "700" },
  sub: { color: "#9CA3AF", marginTop: 4 },
  status: { color: "#22C55E", marginTop: 6, fontWeight: "600" },
});
