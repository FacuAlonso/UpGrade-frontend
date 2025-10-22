import { Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

/** Tipos mínimos */
type Modality = "online" | "presencial" | "ambas";
type Availability = "hoy" | "semana" | "finde";
type Teacher = {
  id: string;
  name: string;
  subjects: string[];
  rating: number;
  reviews: number;
  modality: Modality;
  availability: Availability[];
  price: number;
  featured?: boolean;
};

/** Mock simple */
const TEACHERS: Teacher[] = [
  { id: "t1", name: "María López", subjects: ["Análisis I", "Álgebra"], rating: 4.8, reviews: 126, modality: "ambas", availability: ["hoy","semana"], price: 8000 },
  { id: "t2", name: "Juan Pérez",  subjects: ["Física I", "Física II"], rating: 4.5, reviews: 89,  modality: "online", availability: ["semana","finde"], price: 7000 },
  { id: "t3", name: "Ana Rodríguez", subjects: ["Prog. I", "Estructuras"], rating: 4.9, reviews: 210, modality: "presencial", availability: ["hoy"], price: 9000 },
];

/** Helpers de UI */
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

/** === Modal simple de reserva: calendario (14 días) + horarios (1h) === */
const HOURS = Array.from({ length: 10 }).map((_, i) => {
  const h = 9 + i; // 09..18
  return `${String(h).padStart(2, "0")}:00`;
});
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
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { teacherId: string; isoDate: string; startTime: string }) => void;
}) {
  const days = useMemo(() => getNextDays(14), []);
  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.iso ?? "");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) { setSelectedHour(null); }
  }, [open]);

  if (!teacher) return null;

  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sheetTitle}>Reservar con {teacher.name}</Text>
          <Text style={{ color: colors.muted, marginBottom: spacing.s }}>
            ${teacher.price.toLocaleString("es-AR")}/h · módulos de 1 hora
          </Text>

          {/* Calendario simple */}
          <Text style={styles.sectionTitle}>Elegí un día</Text>
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

          {/* Horarios */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.m }]}>Elegí un horario</Text>
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
          <PrimaryButton
            label="Confirmar reserva"
            onPress={() => {
              if (!selectedHour) return;
              onConfirm({ teacherId: teacher.id, isoDate: selectedDay, startTime: selectedHour });
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SearchTeachersScreen() {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fModality, setFModality] = useState<Modality | null>(null);
  const [fAvailability, setFAvailability] = useState<Availability | null>(null);
  const [fMinRating, setFMinRating] = useState<3 | 4 | 4.5 | null>(null);

  const [data, setData] = useState<Teacher[]>(TEACHERS);
  const filtered = useMemo(() => {
    return data
      .filter(t => !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.subjects.some(s => s.toLowerCase().includes(query.toLowerCase())))
      .filter(t => (fModality ? t.modality === fModality || (fModality === "ambas" && t.modality === "ambas") : true))
      .filter(t => (fAvailability ? t.availability.includes(fAvailability) : true))
      .filter(t => (fMinRating ? t.rating >= fMinRating : true))
      .sort((a, b) => b.rating - a.rating);
  }, [data, query, fModality, fAvailability, fMinRating]);

  const toggleFeatured = (id: string) => {
    setData(prev => prev.map(t => (t.id === id ? { ...t, featured: !t.featured } : t)));
  };

  // reserva
  const [reserveOpen, setReserveOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const openReserve = (t: Teacher) => { setSelectedTeacher(t); setReserveOpen(true); };
  const handleConfirm = (p: { teacherId: string; isoDate: string; startTime: string }) => {
    console.log("Reserva simple:", p);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Buscar profes" }} />

      <FormTextInput placeholder="Buscar por materia o profesor" value={query} onChangeText={setQuery} returnKeyType="search" />

      <View style={styles.quickFilters}>
        <Pill label={fModality ?? "Modalidad"} active={!!fModality} onPress={() => setFiltersOpen(true)} />
        <Pill label={fAvailability ?? "Disponibilidad"} active={!!fAvailability} onPress={() => setFiltersOpen(true)} />
        <Pill label={fMinRating ? `${fMinRating}+ ⭐` : "Rating"} active={!!fMinRating} onPress={() => setFiltersOpen(true)} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => toggleFeatured(item.id)} style={[styles.card, { borderColor: colors.inputBorder }]}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}><Text style={{ color: colors.text, fontWeight: "700" }}>{item.name[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}{item.featured ? " ⭐" : ""}</Text>
                <Text style={[styles.subjects, { color: colors.muted }]} numberOfLines={1}>{item.subjects.join(" • ")}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.rating, { color: colors.text }]}>{item.rating.toFixed(1)} ⭐</Text>
                <Text style={{ color: colors.muted }}>{item.reviews} reviews</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={{ color: colors.muted }}>
                {item.modality === "ambas" ? "Online/Presencial" : item.modality.toUpperCase()} · ${item.price.toLocaleString("es-AR")}/h
              </Text>
              <PrimaryButton label="Reservar" onPress={() => openReserve(item)} />
            </View>
          </Pressable>
        )}
      />

      {/* Modal simple de reserva */}
      <ReserveModal teacher={selectedTeacher} open={reserveOpen} onClose={() => setReserveOpen(false)} onConfirm={handleConfirm} />

      {/* (opcional) tu modal de filtros original puede quedar igual */}
      <Modal transparent animationType="slide" visible={filtersOpen} onRequestClose={() => setFiltersOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setFiltersOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Filtros</Text>
            <Text style={styles.sectionTitle}>Modalidad</Text>
            <View style={styles.row}>
              {(["online","presencial","ambas"] as Modality[]).map(m => (
                <Pill key={m} label={m} active={fModality === m} onPress={() => setFModality(fModality === m ? null : m)} />
              ))}
            </View>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <View style={styles.row}>
              {(["hoy","semana","finde"] as Availability[]).map(a => (
                <Pill key={a} label={a} active={fAvailability === a} onPress={() => setFAvailability(fAvailability === a ? null : a)} />
              ))}
            </View>
            <Text style={styles.sectionTitle}>Rating mínimo</Text>
            <View style={styles.row}>
              {[3,4,4.5].map(r => (
                <Pill key={r} label={`${r}+ ⭐`} active={fMinRating === r} onPress={() => setFMinRating(fMinRating === r ? null : (r as 3|4|4.5))} />
              ))}
            </View>
            <View style={{ height: spacing.l }} />
            <PrimaryButton label="Aplicar filtros" onPress={() => setFiltersOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Estilos */
const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
  quickFilters: { flexDirection: "row", gap: spacing.s, marginBottom: spacing.m },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: spacing.m,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
    gap: spacing.m,
  },
  cardHeader: { flexDirection: "row", gap: spacing.m, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#E5E7EB" },
  name: { fontSize: 16, fontWeight: "700" },
  subjects: { marginTop: 2 },
  rating: { fontWeight: "700" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  // Modales / sheets
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.xl,
    gap: spacing.s,
    maxHeight: "80%",
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: spacing.s, color: colors.text },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.s, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s },

  // Calendario simple (grilla)
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  dayCell: {
    width: "23%",
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.s,
    alignItems: "center",
    justifyContent: "center",
  },

  // Horarios
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s, marginTop: spacing.s },
  timeCell: { paddingVertical: 10, paddingHorizontal: spacing.m, borderRadius: 12, borderWidth: 1 },
});
