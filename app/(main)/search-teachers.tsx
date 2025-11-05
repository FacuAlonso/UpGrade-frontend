import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import FormTextInput from "@/components/formTextInput";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import { useFetchTutors, type User, type ClassSlot, fetchJSON } from "@/hooks/data";
import SearchTeacherList from "@/components/searchTeacherList";
import LessonBookModal from "@/components/lessonBookModal";
import { useCreateLesson } from "@/hooks/data";
import { useAuth } from "@/hooks/useAuth";

export default function SearchTeachersScreen() {
  const { user } = useAuth();
  const { data: tutors, isLoading, refetch, isRefetching } = useFetchTutors();
  const [query, setQuery] = useState("");
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [teacherSlots, setTeacherSlots] = useState<ClassSlot[]>([]);
  const { mutateAsync: createLesson } = useCreateLesson();

  const filteredTutors = useMemo(() => {
    if (!tutors) return [];
    return tutors
      .filter((t) =>
        !query
          ? true
          : `${t.firstName} ${t.lastName}`.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [tutors, query]);

  const handleOpenReserve = useCallback(async (t: User) => {
    setSelectedTeacher(t);
    const slots = await fetchJSON<ClassSlot[]>(`/slots?tutorId=${t.id}&status=AVAILABLE`);
    setTeacherSlots(slots);
    setReserveOpen(true);
  }, []);

  const handleConfirmReserve = useCallback(
    async (payload: { slotIds: number[]; subjectId: number; modality: "ONLINE" | "ONSITE" }) => {
      if (!selectedTeacher || !user) return;

      for (const slotId of payload.slotIds) {
        await createLesson({
          slotId,
          studentId: user.id,
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
    [createLesson, refetch, selectedTeacher, teacherSlots, user]
  );

  if (isLoading && !isRefetching) {
    return (
      <View
        style={{
          flex: 1,
          padding: spacing.xl,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, marginTop: 8 }}>Cargando profesores...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.xl, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: "Buscar tutores" }} />

      <FormTextInput
        placeholder="Buscar por nombre"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />

      <SearchTeacherList
        tutors={filteredTutors.map((t) => ({ tutor: t, slots: t.classSlots ?? [] }))}
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
