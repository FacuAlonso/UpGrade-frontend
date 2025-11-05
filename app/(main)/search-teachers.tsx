import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import FormTextInput from "../../components/formTextInput";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import {
  useFetchTutors,
  type User,
  type ClassSlot,
  fetchJSON,
} from "../../hooks/data";
import SearchTeacherList from "../../components/searchTeacherList";
import LessonBookModal from "../../components/lessonBookModal";
import { useCreateLesson } from "../../hooks/data";
import { useAuth } from "../../hooks/useAuth";

export default function SearchTeachersScreen() {
  const { user } = useAuth();
  const { data: tutors, isLoading, refetch, isRefetching } = useFetchTutors();
  const [query, setQuery] = useState("");
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [teacherSlots, setTeacherSlots] = useState<ClassSlot[]>([]);
  const { mutateAsync: createLesson } = useCreateLesson();

  // 🔍 Filtro combinado por nombre o materia
  const filteredTutors = useMemo(() => {
    if (!tutors) return [];

    const normalize = (text: string) =>
      text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const q = normalize(query);

    return tutors.filter((tutor: User) => {
      const fullName = normalize(`${tutor.firstName} ${tutor.lastName}`);
      const subjectNames = (tutor.tutorSubjects ?? [])
        .map((ts: { subject: { name: string } }) => normalize(ts.subject.name))
        .join(" ");

      return !q || fullName.includes(q) || subjectNames.includes(q);
    });
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
        <Text style={{ color: colors.muted, marginTop: 8 }}>Cargando tutores...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.xl, backgroundColor: colors.background, marginTop: 20 }}>
      <Stack.Screen />

      <FormTextInput
        placeholder="Buscar por nombre o materia"
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
