import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import FormTextInput from "@/components/formTextInput";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import { getCurrentUserId, type User, type TutorAvailability, type ClassSlot, fetchJSON } from "@/hooks/data";
import { useFetchTutorAvailability, useCreateLesson } from "@/hooks/data";
import SearchTeacherList from "@/components/searchTeacherList";
import LessonBookModal from "@/components/lessonBookModal";

export default function SearchTeachersScreen() {
  const { data: availabilities, isLoading, refetch, isRefetching } = useFetchTutorAvailability();
  const [query, setQuery] = useState("");
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [teacherSlots, setTeacherSlots] = useState<ClassSlot[]>([]);
  const { mutateAsync: createLesson } = useCreateLesson();

  const tutors = useMemo(() => {
    if (!availabilities) return [];
    const map = new Map<number, { tutor: User; slots: TutorAvailability[] }>();
    availabilities
      .filter((a) => a.active)
      .forEach((a) => {
        if (!map.has(a.tutorId)) map.set(a.tutorId, { tutor: a.tutor, slots: [] });
        map.get(a.tutorId)!.slots.push(a);
      });
    return Array.from(map.values())
      .filter(({ tutor }) =>
        !query
          ? true
          : `${tutor.firstName} ${tutor.lastName}`.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => (b.tutor.rating ?? 0) - (a.tutor.rating ?? 0));
  }, [availabilities, query]);

  const handleOpenReserve = useCallback(async (t: User) => {
    setSelectedTeacher(t);
    const slots = await fetchJSON<ClassSlot[]>(`/slots?tutorId=${t.id}&status=AVAILABLE`);
    setTeacherSlots(slots);
    setReserveOpen(true);
  }, []);

  const handleConfirmReserve = useCallback(
    async (payload: { slotIds: number[]; subjectId: number; modality: "ONLINE" | "ONSITE" }) => {
      const studentId = getCurrentUserId();
      if (!selectedTeacher) return;

      for (const slotId of payload.slotIds) {
        await createLesson({
          slotId,
          studentId,
          tutorId: selectedTeacher.id,
          subjectId: payload.subjectId,
          modality: payload.modality,
          timestamp: teacherSlots.find((s) => s.id === slotId)?.date ?? new Date().toISOString(),
        });
      }

      setReserveOpen(false);
      setSelectedTeacher(null);
      setTeacherSlots([]);
      await refetch();
    },
    [createLesson, refetch, selectedTeacher, teacherSlots]
  );

  if (isLoading && !isRefetching) {
    return (
      <View style={{ flex: 1, padding: spacing.xl, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, marginTop: 8 }}>Cargando profesores...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.xl, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Buscar profesores" }} />
      <FormTextInput placeholder="Buscar por nombre" value={query} onChangeText={setQuery} returnKeyType="search" />

      <SearchTeacherList
        tutors={tutors}
        refreshing={!!isRefetching}
        onRefresh={refetch}
        onSelectTutor={handleOpenReserve}
      />

      <LessonBookModal
        teacher={selectedTeacher}
        open={reserveOpen}
        slots={teacherSlots}
        onClose={() => setReserveOpen(false)}
        onConfirm={handleConfirmReserve}
      />
    </View>
  );
}