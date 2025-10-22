import { Stack } from "expo-router";
import React, { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import FormTextInput from "../../components/formTextInput";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { useFetchTutorAvailability, useCreateLesson } from "../data";
import type { User, TutorAvailability } from "../data";

function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { backgroundColor: active ? colors.primary : colors.surface, borderColor: colors.inputBorder },
      ]}
    >
      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

const HOURS = Array.from({ length: 10 }).map((_, i) => `${String(9 + i).padStart(2, "0")}:00`);
const weekdayFmt = new Intl.DateTimeFormat("es-AR", { weekday: "short" });
const dayFmt = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" });

function getNextDays(n = 14) {
  const out: { iso: string; dow: string; dlabel: string; date: Date }[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    out.push({ iso, dow: weekdayFmt.format(d), dlabel: dayFmt.format(d), date: d });
  }
  return out;
}

function ReserveModal({
  teacher,
  open,
  onClose,
  onConfirm,
}: {
  teacher: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { teacherId: number; isoDate: string; startTime: string }) => void;
}) {
  const days = useMemo(() => getNextDays(14), []);
  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.iso ?? "");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) setSelectedHour(null);
  }, [open]);

  if (!teacher) return null;

  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>Reservar con {teacher.firstName}</Text>
          <Text style={{ color: colors.muted, marginBottom: spacing.s }}>Seleccioná día y horario</Text>

          <Text style={styles.sectionTitle}>Día</Text>
          <View style={styles.calendarGrid}>
            {days.map((d) => {
              const active = selectedDay === d.iso;
              return (
                <Pressable
                  key={d.iso}
                  style={[
                    styles.dayCell,
                    { borderColor: active ? colors.primary : colors.inputBorder, backgroundColor: active ? "#E8F8EE" : colors.background },
                  ]}
                  onPress={() => setSelectedDay(d.iso)}
                >
                  <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase" }}>{d.dow}</Text>
                  <Text style={{ fontWeight: "700", color: colors.text }}>{d.dlabel}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: spacing.m }]}>Horario</Text>
          <View style={styles.timeGrid}>
            {HOURS.map((h) => {
              const active = selectedHour === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => setSelectedHour(h)}
                  style={[
                    styles.timeCell,
                    { borderColor: active ? colors.primary : colors.inputBorder, backgroundColor: active ? "#E8F8EE" : colors.background },
                  ]}
                >
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{h}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: spacing.l }} />
          <Pressable
            style={styles.reserveButton}
            onPress={() => {
              if (!selectedHour) return;
              onConfirm({ teacherId: teacher.id, isoDate: selectedDay, startTime: selectedHour });
              onClose();
            }}
          >
            <Text style={styles.reserveButtonText}>CONFIRMAR RESERVA</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SearchTeachersScreen() {
  const { data: availabilities, isLoading, refetch, isRefetching } = useFetchTutorAvailability();
  const { mutate: createLesson } = useCreateLesson();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fMinRating, setFMinRating] = useState<3 | 4 | 4.5 | null>(null);
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
    return Array.from(map.values())
      .filter(({ tutor }) =>
        !query
          ? true
          : tutor.firstName.toLowerCase().includes(query.toLowerCase()) ||
            tutor.lastName.toLowerCase().includes(query.toLowerCase())
      )
      .filter(({ tutor }) => (fMinRating ? (tutor.rating ?? 0) >= fMinRating : true))
      .sort((a, b) => (b.tutor.rating ?? 0) - (a.tutor.rating ?? 0));
  }, [availabilities, query, fMinRating]);

  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const openReserve = (t: User) => {
    setSelectedTeacher(t);
    setReserveOpen(true);
  };
  const handleConfirm = (p: { teacherId: number; isoDate: string; startTime: string }) => {
    createLesson({
      slotId: 0, // slot real se elige después cuando integres ClassSlot
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
      <FormTextInput placeholder="Buscar por nombre" value={query} onChangeText={setQuery} returnKeyType="search" />
      <View style={styles.quickFilters}>
        <Pill label={fMinRating ? `${fMinRating}+ ⭐` : "Rating"} active={!!fMinRating} onPress={() => setFiltersOpen(true)} />
      </View>

      <FlatList
        data={tutors}
        keyExtractor={(item) => item.tutor.id.toString()}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <Pressable style={[styles.card, { borderColor: colors.inputBorder }]}>
            <View style={styles.cardHeader}>
              {item.tutor.profilePhoto ? (
                <Image source={{ uri: item.tutor.profilePhoto }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{item.tutor.firstName[0]}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.tutor.firstName} {item.tutor.lastName}</Text>
                <Text style={{ color: colors.muted }}>
                  {item.slots.map((s) => `${["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][s.weekday]} ${s.startTime}-${s.endTime}`).join(" · ")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.rating, { color: colors.text }]}>{(item.tutor.rating ?? 5).toFixed(1)} ⭐</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={{ color: colors.muted }}>Disponible</Text>
              <Pressable style={styles.reserveButtonSmall} onPress={() => openReserve(item.tutor)}>
                <Text style={styles.reserveButtonText}>RESERVAR</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      <ReserveModal teacher={selectedTeacher} open={reserveOpen} onClose={() => setReserveOpen(false)} onConfirm={handleConfirm} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
  quickFilters: { flexDirection: "row", gap: spacing.s, marginBottom: spacing.m },
  pill: { paddingVertical: 8, paddingHorizontal: spacing.m, borderRadius: 999, borderWidth: 1, backgroundColor: colors.surface },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderRadius: 16, padding: spacing.l, marginBottom: spacing.m, gap: spacing.m },
  cardHeader: { flexDirection: "row", gap: spacing.m, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#E5E7EB" },
  avatarImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#22C55E" },
  name: { fontSize: 16, fontWeight: "700" },
  rating: { fontWeight: "700" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reserveButtonSmall: { flexDirection: "row", alignItems: "center", backgroundColor: "#22C55E", paddingVertical: 6, paddingHorizontal: 24, borderRadius: 8 },
  reserveButton: { backgroundColor: "#22C55E", paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  reserveButtonText: { color: "#fff", fontWeight: "700" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, gap: spacing.s, maxHeight: "80%" },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: spacing.s, color: colors.text },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.s, color: colors.muted },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s, marginBottom: spacing.s },
  dayCell: { width: "23%", aspectRatio: 1, borderWidth: 1, borderRadius: 12, padding: spacing.s, alignItems: "center", justifyContent: "center" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s, marginTop: spacing.s },
  timeCell: { paddingVertical: 10, paddingHorizontal: spacing.m, borderRadius: 12, borderWidth: 1 },
});
