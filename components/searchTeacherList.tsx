// app/(main)/search-teachers.tsx

import React, { useState, useMemo, useCallback } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useFetchTutorAvailability, useCreateLesson } from "@/hooks/data";
import FormTextInput from "@/components/formTextInput";
import SearchTeacherList from "@/components/searchTeacherList";
import LessonBookModal from "@/components/lessonBookModal";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import type { User, TutorAvailability } from "@/hooks/data";

export default function SearchTeachersScreen() {
  const { data: availabilities, isLoading, refetch, isRefetching } = useFetchTutorAvailability();
  const { mutate: createLesson } = useCreateLesson();

  const [query, setQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Agrupar por tutor
  const tutors = useMemo(() => {
    if (!availabilities) return [];
    const map = new Map<number, { tutor: User; slots: TutorAvailability[] }>();
    availabilities
      .filter((a) => a.active)
      .forEach((a) => {
        if (!map.has(a.tutorId)) map.set(a.tutorId, { tutor: a.tutor, slots: [] });
        map.get(a.tutorId)!.slots.push(a);
      });

    return Array.from(map.values()).filter(({ tutor }) =>
      !query
        ? true
        : tutor.firstName.toLowerCase().includes(query.toLowerCase()) ||
          tutor.lastName.toLowerCase().includes(query.toLowerCase())
    );
  }, [availabilities, query]);

  const handleConfirm = (p: { teacherId: number; isoDate: string; startTime: string }) => {
    createLesson({
      slotId: 0,
      studentId: 1,
      tutorId: p.teacherId,
      subjectId: 1,
      modality: "ONLINE",
      timestamp: `${p.isoDate}T${p.startTime}:00`,
    });
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted }}>Cargando profesores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Buscar profesores" }} />
      <FormTextInput
        placeholder="Buscar por nombre"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />

      <SearchTeacherList
        tutors={tutors}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onSelectTutor={(t) => {
          setSelectedTeacher(t);
          setReserveOpen(true);
        }}
      />

      <LessonBookModal
        teacher={selectedTeacher}
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
});
