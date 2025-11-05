import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import { useAuth } from "../hooks/useAuth";

const DAYS = [
  { n: 1, label: "Lun" },
  { n: 2, label: "Mar" },
  { n: 3, label: "Mié" },
  { n: 4, label: "Jue" },
  { n: 5, label: "Vie" },
  { n: 6, label: "Sáb" },
  { n: 7, label: "Dom" },
];

type TimeBlock = { start: number; end: number }; 

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateAvailabilityModal({ open, onClose, onSuccess }: Props) {
  const { fetchWithAuth, user } = useAuth();
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([{ start: 9 * 60, end: 10 * 60 }]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ index: number; field: "start" | "end" } | null>(null);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    if (!open) {
      setWeekdays([]);
      setBlocks([{ start: 9 * 60, end: 10 * 60 }]);
    }
  }, [open]);

  const toggleDay = (n: number) => {
    setWeekdays((prev) =>
      prev.includes(n)
        ? prev.filter((d) => d !== n)
        : [...prev, n].sort((a, b) => a - b)
    );
  };

  const formatTime = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };

  const handleManualInput = () => {
    const [hh, mm] = inputVal.split(":").map(Number);
    if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59)
      return Alert.alert("Formato inválido", "Usá el formato HH:mm (ej: 09:30).");

    const total = hh * 60 + mm;
    if (editing) {
      const { index, field } = editing;
      const updated = [...blocks];
      updated[index][field] = total;
      setBlocks(updated);
    }
    setEditing(null);
    setInputVal("");
  };

  const validateBlocks = () => {
    for (const { start, end } of blocks) {
      if (end <= start) return "La hora de fin debe ser mayor a la de inicio.";
    }
    return null;
  };

  const handleSave = async () => {
    if (!user?.id) return Alert.alert("Error", "No se encontró el usuario.");
    if (!weekdays.length) return Alert.alert("Campos", "Seleccioná al menos un día.");
    const error = validateBlocks();
    if (error) return Alert.alert("Error", error);

    try {
      setLoading(true);
      const timeBlocks = blocks.map((b) => ({
        start: formatTime(b.start),
        end: formatTime(b.end),
      }));
      await fetchWithAuth("/availability", {
        method: "POST",
        body: JSON.stringify({ weekdays, timeBlocks }),
      });
      Alert.alert("Listo", "Disponibilidad creada correctamente.");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo crear la disponibilidad.");
    } finally {
      setLoading(false);
    }
  };

  const addBlock = () => setBlocks((p) => [...p, { start: 9 * 60, end: 10 * 60 }]);
  const removeBlock = (i: number) => setBlocks((p) => p.filter((_, idx) => idx !== i));

  if (!open) return null;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={Platform.OS === "android"}
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "overFullScreen"}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Nueva disponibilidad</Text>
          <Text style={styles.subtitle}>Seleccioná tus días</Text>

          <View style={styles.daysRow}>
            {DAYS.map((d) => {
              const active = weekdays.includes(d.n);
              return (
                <Pressable
                  key={d.n}
                  style={[styles.dayPill, active && styles.dayPillOn]}
                  onPress={() => toggleDay(d.n)}
                >
                  <Text style={[styles.dayText, active && styles.dayTextOn]}>{d.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.subtitle, { marginTop: spacing.m }]}>Bloques horarios</Text>
          <ScrollView contentContainerStyle={{ gap: spacing.s }}>
            {blocks.map((b, i) => (
              <View key={i} style={styles.blockContainer}>
                <View style={styles.timeRow}>
                  <Pressable onPress={() => setEditing({ index: i, field: "start" })}>
                    <Text style={styles.timeText}>{formatTime(b.start)}</Text>
                  </Pressable>
                  <Text style={styles.arrow}>→</Text>
                  <Pressable onPress={() => setEditing({ index: i, field: "end" })}>
                    <Text style={styles.timeText}>{formatTime(b.end)}</Text>
                  </Pressable>
                  {blocks.length > 1 && (
                    <Pressable onPress={() => removeBlock(i)}>
                      <Text style={styles.remove}>Quitar</Text>
                    </Pressable>
                  )}
                </View>

                <Text style={styles.sliderLabel}>Inicio</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={23 * 60 + 59}
                  step={15}
                  value={b.start}
                  onValueChange={(v) =>
                    setBlocks((prev) =>
                      prev.map((blk, idx) =>
                        idx === i ? { ...blk, start: Math.round(v) } : blk
                      )
                    )
                  }
                  minimumTrackTintColor={colors.primary}
                  thumbTintColor={colors.primary}
                />

                <Text style={styles.sliderLabel}>Fin</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={23 * 60 + 59}
                  step={15}
                  value={b.end}
                  onValueChange={(v) =>
                    setBlocks((prev) =>
                      prev.map((blk, idx) =>
                        idx === i ? { ...blk, end: Math.round(v) } : blk
                      )
                    )
                  }
                  minimumTrackTintColor={colors.primary}
                  thumbTintColor={colors.primary}
                />
              </View>
            ))}
            <Pressable onPress={addBlock}>
              <Text style={styles.add}>+ Agregar bloque</Text>
            </Pressable>
          </ScrollView>

          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveBtn, loading && { opacity: 0.5 }]}
          >
            <Text style={styles.saveText}>{loading ? "Guardando..." : "GUARDAR"}</Text>
          </Pressable>
        </View>
      </View>

      {editing && (
        <Modal transparent animationType="fade">
          <View style={styles.inputOverlay}>
            <View style={styles.inputBox}>
              <Text style={styles.inputTitle}>Ingresar hora (HH:mm)</Text>
              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                placeholder="09:30"
                keyboardType="numeric"
                style={styles.input}
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
                <Pressable onPress={() => setEditing(null)}>
                  <Text style={styles.cancel}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={handleManualInput}>
                  <Text style={styles.confirm}>Aceptar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.xl,
    maxHeight: "85%",
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginVertical: spacing.s },
  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  dayPillOn: { backgroundColor: "#DCFCE7", borderColor: colors.primary },
  dayText: { color: colors.text, fontWeight: "700" },
  dayTextOn: { color: colors.primary },
  blockContainer: {
    backgroundColor: "#F9FAFB",
    padding: spacing.m,
    borderRadius: 10,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timeText: { fontSize: 16, fontWeight: "700", color: colors.text },
  arrow: { color: colors.muted },
  sliderLabel: { color: colors.muted, fontSize: 12, marginTop: 6 },
  add: { color: colors.primary, fontWeight: "700", marginTop: 8 },
  remove: { color: "#DC2626", fontWeight: "700" },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
    marginTop: spacing.m,
  },
  saveText: { color: "white", fontWeight: "700" },
  inputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  inputBox: {
    backgroundColor: "white",
    padding: spacing.l,
    borderRadius: 10,
    width: "80%",
    gap: spacing.s,
  },
  inputTitle: { fontWeight: "700", color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
  },
  cancel: { color: colors.muted, fontWeight: "700" },
  confirm: { color: colors.primary, fontWeight: "700" },
});
