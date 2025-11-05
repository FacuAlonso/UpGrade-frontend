import React from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { ClassCard } from "./classCard";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

export function MyClassesList() {
  const { user, fetchWithAuth } = useAuth();

  const {
    data: lessons = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      const res = await fetchWithAuth("/lessons");
      return res ?? [];
    },
  });

  if (!user)
    return <Text style={styles.muted}>Iniciá sesión para ver tus clases.</Text>;

  if (isFetching)
    return <ActivityIndicator size="large" color={colors.primary} />;

  const now = new Date();
  const validLessons = lessons.filter((l: any) => {
    const start = new Date(l.timestamp);
    const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > -1; // excluir las que terminaron hace más de 1h
  });

  const sortedLessons = validLessons.sort(
    (a: any, b: any) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (sortedLessons.length === 0)
    return <Text style={styles.muted}>No hay clases próximas.</Text>;

  return (
    <ScrollView
      contentContainerStyle={{ gap: spacing.m }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
      }
    >
      {sortedLessons.map((lesson: any) => {
        const role = lesson.tutorId === user.id ? "TUTOR" : "STUDENT";
        return (
          <ClassCard
            key={lesson.id}
            lesson={lesson}
            role={role}
            onCancelled={refetch} 
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, marginTop: spacing.s },
});
