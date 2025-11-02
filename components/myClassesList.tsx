import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { User } from "../hooks/data";
import { useFetchLessons } from "../hooks/data";
import { ClassCard } from "./classCard";

export function MyClassesList({ userId }: { userId: User["id"] }) {
  const { data: lessons, isLoading, isError, refetch, isRefetching } = useFetchLessons();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const sessions = useMemo(
    () => lessons?.filter((l) => l.studentId === Number(userId)) ?? [],
    [lessons, userId]
  );

  if (isLoading && !isRefetching) {
    return (
      <View style={listStyles.emptyWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={listStyles.emptyText}>Cargando tus clases...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={listStyles.emptyWrap}
      >
        <Text style={listStyles.emptyTitle}>Error</Text>
        <Text style={listStyles.emptyText}>No pudimos cargar tus clases 😞</Text>
      </ScrollView>
    );
  }

  if (!sessions.length) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={listStyles.emptyWrap}
      >
        <Text style={listStyles.emptyTitle}>¡No tenés clases!</Text>
        <Text style={listStyles.emptyText}>
          Deslizá hacia abajo para actualizar o reservá una clase ✨
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={listStyles.container}
    >
      {sessions.map((item) => (
        <View key={item.id} style={{ marginBottom: 12 }}>
          <ClassCard lesson={item} />
        </View>
      ))}
    </ScrollView>
  );
}

const listStyles = StyleSheet.create({
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
