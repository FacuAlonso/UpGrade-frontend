import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Modal } from "react-native";
import { Stack } from "expo-router";
import FormTextInput from "../../components/formTextInput";
import PrimaryButton from "../../components/primaryButton";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

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

// MOCK
const TEACHERS: Teacher[] = [
  { id: "t1", name: "María López",   subjects: ["Análisis I", "Álgebra"],     rating: 4.8, reviews: 126, modality: "ambas",      availability: ["hoy","semana"], price: 8000 },
  { id: "t2", name: "Juan Pérez",    subjects: ["Física I", "Física II"],     rating: 4.5, reviews: 89,  modality: "online",     availability: ["semana","finde"], price: 7000 },
  { id: "t3", name: "Ana Rodríguez", subjects: ["Prog. I", "Estructuras"],    rating: 4.9, reviews: 210, modality: "presencial", availability: ["hoy"], price: 9000 },
  { id: "t4", name: "Carlos Díaz",   subjects: ["Química", "Bioquímica"],     rating: 4.2, reviews: 44,  modality: "online",     availability: ["finde"], price: 6500 },
  { id: "t5", name: "Sofía Gómez",   subjects: ["Inglés", "TOEFL"],           rating: 4.7, reviews: 300, modality: "ambas",      availability: ["hoy","finde"], price: 7500 },
];

// Chip sencillo
function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: colors.inputBorder,
        },
      ]}
    >
      <Text style={{ color: active ? "#fff" : colors.text, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export default function SearchTeachersScreen() {
  // búsqueda + filtros
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fModality, setFModality] = useState<Modality | null>(null);
  const [fAvailability, setFAvailability] = useState<Availability | null>(null);
  const [fMinRating, setFMinRating] = useState<3 | 4 | 4.5 | null>(null);

  const [data, setData] = useState<Teacher[]>(TEACHERS);

  const filtered = useMemo(() => {
    return data
      .filter(t =>
        !query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.subjects.some(s => s.toLowerCase().includes(query.toLowerCase()))
      )
      .filter(t => (fModality ? t.modality === fModality || (fModality === "ambas" && t.modality === "ambas") : true))
      .filter(t => (fAvailability ? t.availability.includes(fAvailability) : true))
      .filter(t => (fMinRating ? t.rating >= fMinRating : true))
      .sort((a, b) => b.rating - a.rating);
  }, [data, query, fModality, fAvailability, fMinRating]);

  const toggleFeatured = (id: string) => {
    setData(prev => prev.map(t => (t.id === id ? { ...t, featured: !t.featured } : t)));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Buscar profes" }} />

      {/* Buscador */}
      <FormTextInput
        placeholder="Buscar por materia o profesor"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />

      {/* Filtros rápidos */}
      <View style={styles.quickFilters}>
        <Pill label={fModality ?? "Modalidad"} active={!!fModality} onPress={() => setFiltersOpen(true)} />
        <Pill label={fAvailability ?? "Disponibilidad"} active={!!fAvailability} onPress={() => setFiltersOpen(true)} />
        <Pill label={fMinRating ? `${fMinRating}+ ⭐` : "Rating"} active={!!fMinRating} onPress={() => setFiltersOpen(true)} />
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => console.log("Ir al perfil del profe", item.id)}
            onLongPress={() => toggleFeatured(item.id)}  // destacar
            style={[styles.card, { borderColor: colors.inputBorder }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.avatar}><Text style={{ color: colors.text, fontWeight: "700" }}>{item.name[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.name}{item.featured ? " ⭐" : ""}
                </Text>
                <Text style={[styles.subjects, { color: colors.muted }]} numberOfLines={1}>
                  {item.subjects.join(" • ")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.rating, { color: colors.text }]}>{item.rating.toFixed(1)} ⭐</Text>
                <Text style={{ color: colors.muted }}>{item.reviews} reviews</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={{ color: colors.muted }}>
                {item.modality === "ambas" ? "Online/Presencial" : item.modality.toUpperCase()}
                {"  ·  $"}{item.price.toLocaleString("es-AR")}/h
              </Text>
              <PrimaryButton label="Ver perfil" onPress={() => console.log("Detalle", item.id)} />
            </View>
          </Pressable>
        )}
      />

      {/* Filtros */}
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background, justifyContent: 'center' },
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

  // bottom sheet
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.xl,
    gap: spacing.s,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: spacing.s, color: colors.text },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.s, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s },
});
