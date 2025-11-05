import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFetchLessons } from "@/hooks/data";
import { useAuth } from "@/hooks/useAuth";
import ClassCard from "./classCard";

export function MyClassesList() {
  const { user } = useAuth();
  const { data: lessons, isLoading, isError, refetch, isRefetching } = useFetchLessons();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const sessions = useMemo(() => {
    if (!lessons || !user) return [];
    return lessons.filter(
      (l) => l.studentId === user.id || l.tutorId === user.id
    );
  }, [lessons, user]);

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.emptyText}>Cargando tus clases...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.emptyWrap}
      >
        <Text style={styles.emptyTitle}>Error</Text>
        <Text style={styles.emptyText}>No pudimos cargar tus clases 😞</Text>
      </ScrollView>
    );
  }

  if (!sessions.length) {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.emptyWrap}
      >
        <Text style={styles.emptyTitle}>¡No tenés clases!</Text>
        <Text style={styles.emptyText}>
          Deslizá hacia abajo para actualizar o reservá una clase ✨
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.container}
    >
      {sessions.map((item) => (
        <View key={item.id} style={{ marginBottom: 12 }}>
          <ClassCard lesson={item} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    backgroundColor: "#092a54ff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 25,
    paddingBottom: 25,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 6,
    flexGrow: 1,
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
