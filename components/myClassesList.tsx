import React, { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFetchLessons } from "../app/data";
import { ClassCard } from "./classCard";
import type { User } from "../app/data";

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

  // Estado de carga inicial
  if (isLoading && !isRefetching) {
    return (
      <View style={listStyles.emptyWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={listStyles.emptyText}>Cargando tus clases...</Text>
      </View>
    );
  }

  // Estado de error
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

  // Estado sin clases
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

  // Lista de clases
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
