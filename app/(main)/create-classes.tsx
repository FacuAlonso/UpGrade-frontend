
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable, FlatList } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PrimaryButton from "../../components/primaryButton";

type TimeBlock = { start: string; end: string };
type Availability = {
  id: number;
  tutorId: number;
  weekdays: number[];        // 1..7 (suponiendo 1=Lunes)
  timeBlocks: TimeBlock[];
};

const WD = [
  { n: 1, label: "Lun" },
  { n: 2, label: "Mar" },
  { n: 3, label: "Mié" },
  { n: 4, label: "Jue" },
  { n: 5, label: "Vie" },
  { n: 6, label: "Sáb" },
  { n: 7, label: "Dom" },
];

export default function CreateClassesScreen() {
  const { user, fetchWithAuth } = useAuth();
  const qc = useQueryClient();

  const { data: availabilities = [], refetch: refetchAvail } = useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const res = await fetchWithAuth<Availability[]>("/availability");
      return res ?? [];
    },
  });

  const [weekdays, setWeekdays] = useState<number[]>([1, 3]); 
  const [blocks, setBlocks] = useState<TimeBlock[]>([
    { start: "10:00", end: "11:00" },
  ]);
  const [creating, setCreating] = useState(false);

  const toggleDay = (n: number) => {
    setWeekdays((prev) =>
      prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n].sort((a, b) => a - b)
    );
  };

  const addBlock = () => setBlocks((b) => [...b, { start: "12:00", end: "13:00" }]);
  const setBlock = (i: number, key: keyof TimeBlock, val: string) =>
    setBlocks((b) => b.map((t, idx) => (idx === i ? { ...t, [key]: val } : t)));
  const removeBlock = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i));

  const createAvailability = async () => {
    if (!user?.id) return Alert.alert("Ups", "No se encontró el usuario.");
    if (!weekdays.length) return Alert.alert("Campos", "Elegí al menos un día.");
    if (!blocks.length) return Alert.alert("Campos", "Agregá al menos un bloque horario.");
    try {
      setCreating(true);
      await fetchWithAuth("/availability", {
        method: "POST",
        body: JSON.stringify({ weekdays, timeBlocks: blocks }),
      });
      await refetchAvail();
      Alert.alert("Listo", "Disponibilidad creada.");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo crear la disponibilidad.");
    } finally {
      setCreating(false);
    }
  };

  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);
  const defaultMonday = useMemo(() => {
    const d = new Date();
    const day = d.getDay(); 
    const delta = (8 - day) % 7 || 7; // próximo lunes
    d.setDate(d.getDate() + delta);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);
  const [mondayDate, setMondayDate] = useState(defaultMonday);
  const [generating, setGenerating] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (availabilities.length && selectedAvailabilityId == null) {
      setSelectedAvailabilityId(availabilities[0].id);
    }
  }, [availabilities, selectedAvailabilityId]);

  const generateWeek = async () => {
    if (!selectedAvailabilityId) return Alert.alert("Campos", "Elegí una disponibilidad.");
    if (!mondayDate) return Alert.alert("Campos", "Ingresá la fecha del lunes (YYYY-MM-DD).");
    try {
      setGenerating(true);
      setResultMsg(null);
      const res = await fetchWithAuth<{ message: string; created: number; skippedDays: number[] }>(
        "/slots/generate-week",
        {
          method: "POST",
          body: JSON.stringify({ availabilityId: selectedAvailabilityId, mondayDate }),
        }
      );
      setResultMsg(`${res.message} (creados: ${res.created}, omitidos: ${res.skippedDays?.length ?? 0})`);
      // refrescá listados
      qc.invalidateQueries({ queryKey: ["slots"] });
      qc.invalidateQueries({ queryKey: ["lessons"] });
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo generar la semana.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Crear clases" }} />

      <Text style={styles.section}>Disponibilidad</Text>

      <Text style={styles.label}>Días</Text>
      <View style={styles.daysRow}>
        {WD.map((d) => (
          <Pressable
            key={d.n}
            style={[styles.dayPill, weekdays.includes(d.n) && styles.dayPillOn]}
            onPress={() => toggleDay(d.n)}
          >
            <Text style={[styles.dayText, weekdays.includes(d.n) && styles.dayTextOn]}>{d.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Bloques horarios</Text>
      <FlatList
        data={blocks}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item, index }) => (
          <View style={styles.blockRow}>
            <TextInput
              style={styles.input}
              value={item.start}
              onChangeText={(v) => setBlock(index, "start", v)}
              placeholder="HH:mm"
              placeholderTextColor="#6B7280"
            />
            <Text style={{ color: "#9CA3AF" }}>→</Text>
            <TextInput
              style={styles.input}
              value={item.end}
              onChangeText={(v) => setBlock(index, "end", v)}
              placeholder="HH:mm"
              placeholderTextColor="#6B7280"
            />
            <Pressable onPress={() => removeBlock(index)}>
              <Text style={styles.remove}>Quitar</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <Pressable onPress={addBlock}>
            <Text style={styles.add}>+ Agregar bloque</Text>
          </Pressable>
        }
      />

      <PrimaryButton
        label={creating ? "Creando..." : "Crear disponibilidad"}
        onPress={createAvailability}
        disabled={creating}
      />

      <Text style={styles.section}>Generar semana</Text>

      <Text style={styles.label}>Disponibilidad</Text>
      <View style={styles.selectBox}>
        {availabilities.length === 0 ? (
          <Text style={styles.muted}>No tenés disponibilidades. Creá una arriba.</Text>
        ) : (
          availabilities.map((a) => (
            <Pressable
              key={a.id}
              style={[styles.opt, selectedAvailabilityId === a.id && styles.optOn]}
              onPress={() => setSelectedAvailabilityId(a.id)}
            >
              <Text style={[styles.optText, selectedAvailabilityId === a.id && styles.optTextOn]}>
                #{a.id} • Días: {a.weekdays.join(", ")} • Bloques: {a.timeBlocks.length}
              </Text>
            </Pressable>
          ))
        )}
      </View>

      <Text style={styles.label}>Fecha del lunes (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={mondayDate}
        onChangeText={setMondayDate}
        placeholder="2025-11-10"
        placeholderTextColor="#6B7280"
      />

      <PrimaryButton
        label={generating ? "Generando..." : "Generar slots de la semana"}
        onPress={generateWeek}
        disabled={generating || !selectedAvailabilityId}
      />

      {!!resultMsg && <Text style={styles.success}>{resultMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 16, backgroundColor: "#0B0B0C" },
  section: { color: "white", fontWeight: "800", marginTop: 8, marginBottom: 4, fontSize: 16 },
  label: { color: "#9CA3AF", fontWeight: "600", marginTop: 6 },
  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayPill: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999,
    borderWidth: 1, borderColor: "#26282E", backgroundColor: "#17181C",
  },
  dayPillOn: { backgroundColor: "#1f2937", borderColor: "#374151" },
  dayText: { color: "#9CA3AF", fontWeight: "700" },
  dayTextOn: { color: "white" },
  blockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    backgroundColor: "#17181C", borderColor: "#26282E", borderWidth: 1, borderRadius: 12,
    color: "white", paddingHorizontal: 12, paddingVertical: 10, minWidth: 110,
  },
  add: { color: "#22C55E", fontWeight: "700", marginTop: 6 },
  remove: { color: "#ef4444", fontWeight: "700" },
  selectBox: { gap: 8, marginTop: 4 },
  opt: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#26282E", backgroundColor: "#17181C" },
  optOn: { borderColor: "#22C55E" },
  optText: { color: "#9CA3AF" },
  optTextOn: { color: "white", fontWeight: "700" },
  muted: { color: "#6B7280" },
  success: { color: "#22C55E", marginTop: 8, fontWeight: "700" },
});
