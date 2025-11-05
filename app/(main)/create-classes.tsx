import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable, FlatList } from "react-native";
import { Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import PrimaryButton from "../../components/primaryButton";
import { useAuth } from "../../hooks/useAuth";
import { useAvailabilities, useGenerateWeek } from "../../hooks/useTutorAvailability";

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
  const { user } = useAuth();
  const qc = useQueryClient();
  const { availabilities, refetchAvail, createAvailability, creating } = useAvailabilities();
  const { generateWeek, generating, resultMsg } = useGenerateWeek(qc);

  const [weekdays, setWeekdays] = useState<number[]>([1, 3]);
  const [blocks, setBlocks] = useState([{ start: "10:00", end: "11:00" }]);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);
  const defaultMonday = useMemo(() => {
    const d = new Date();
    const delta = (8 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + delta);
    return d.toISOString().split("T")[0];
  }, []);
  const [mondayDate, setMondayDate] = useState(defaultMonday);

  useEffect(() => {
    if (availabilities.length && selectedAvailabilityId == null)
      setSelectedAvailabilityId(availabilities[0].id);
  }, [availabilities, selectedAvailabilityId]);

  const toggleDay = (n: number) =>
    setWeekdays((p) => (p.includes(n) ? p.filter((d) => d !== n) : [...p, n].sort((a, b) => a - b)));

  const addBlock = () => setBlocks((b) => [...b, { start: "12:00", end: "13:00" }]);
  const setBlock = (i: number, k: "start" | "end", v: string) =>
    setBlocks((b) => b.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));
  const removeBlock = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Clases (Tutor)" }} />
      <Text style={styles.section}>Disponibilidad</Text>

      <Text style={styles.label}>Días</Text>
      <View style={styles.daysRow}>
        {WD.map((d) => (
          <Pressable
            key={d.n}
            style={[styles.dayPill, weekdays.includes(d.n) && styles.dayPillOn]}
            onPress={() => toggleDay(d.n)}
          >
            <Text style={[styles.dayText, weekdays.includes(d.n) && styles.dayTextOn]}>
              {d.label}
            </Text>
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
        onPress={() => createAvailability(user, weekdays, blocks, refetchAvail)}
        disabled={creating}
      />

      <Text style={styles.section}>Generar semana</Text>

      <Text style={styles.label}>Disponibilidad</Text>
      <View style={styles.selectBox}>
        {availabilities.length === 0 ? (
          <Text style={styles.muted}>No tenés disponibilidades creadas.</Text>
        ) : (
          availabilities.map((a) => (
            <Pressable
              key={a.id}
              style={[styles.opt, selectedAvailabilityId === a.id && styles.optOn]}
              onPress={() => setSelectedAvailabilityId(a.id)}
            >
              <Text
                style={[styles.optText, selectedAvailabilityId === a.id && styles.optTextOn]}
              >
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
        label={generating ? "Generando..." : "Generar slots semanales"}
        onPress={() => generateWeek(selectedAvailabilityId, mondayDate)}
        disabled={generating || !selectedAvailabilityId}
      />

      {!!resultMsg && <Text style={styles.success}>{resultMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 16, backgroundColor: "#0D0D10" },
  section: { color: "#F5F5F5", fontWeight: "800", marginTop: 8, marginBottom: 4, fontSize: 16 },
  label: { color: "#A1A1AA", fontWeight: "600", marginTop: 6 },
  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#2C2F38",
    backgroundColor: "#17191E",
  },
  dayPillOn: { backgroundColor: "#2E3748", borderColor: "#3F4D63" },
  dayText: { color: "#A1A1AA", fontWeight: "700" },
  dayTextOn: { color: "#F4D35E" },
  blockRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    backgroundColor: "#17191E",
    borderColor: "#2C2F38",
    borderWidth: 1,
    borderRadius: 12,
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 110,
  },
  add: { color: "#58A6FF", fontWeight: "700", marginTop: 6 },
  remove: { color: "#F87171", fontWeight: "700" },
  selectBox: { gap: 8, marginTop: 4 },
  opt: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2C2F38",
    backgroundColor: "#17191E",
  },
  optOn: { borderColor: "#58A6FF" },
  optText: { color: "#A1A1AA" },
  optTextOn: { color: "#F4D35E", fontWeight: "700" },
  muted: { color: "#6B7280" },
  success: { color: "#58A6FF", marginTop: 8, fontWeight: "700" },
});
