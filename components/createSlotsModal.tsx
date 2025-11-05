import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  View,
  Platform,
} from "react-native";
import { addWeeks, startOfWeek, format } from "date-fns";
import { es } from "date-fns/locale";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import { Availability } from "../hooks/useTutorAvailability";
import { useAuth } from "../hooks/useAuth";

type Props = {
  open: boolean;
  availability: Availability | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateSlotsModal({ open, availability, onClose, onSuccess }: Props) {
  const { fetchWithAuth } = useAuth();
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const weeks = useMemo(() => {
    const list = [];
    const today = new Date();
    const firstMonday = startOfWeek(today, { weekStartsOn: 1 });
    for (let i = 0; i < 24; i++) {
      const monday = addWeeks(firstMonday, i);
      const iso = monday.toISOString().split("T")[0];
      const label = `Semana del ${format(monday, "EEEE dd/MM", { locale: es })}`;
      list.push({ iso, label });
    }
    return list;
  }, []);

  useEffect(() => {
    if (!open) setSelectedWeeks(new Set());
  }, [open]);

  const toggleWeek = (iso: string) => {
    const next = new Set(selectedWeeks);
    if (next.has(iso)) next.delete(iso);
    else next.add(iso);
    setSelectedWeeks(next);
  };

  const handleConfirm = async () => {
    if (!availability?.id)
      return Alert.alert("Error", "No se seleccionó disponibilidad.");
    if (selectedWeeks.size === 0)
      return Alert.alert("Campos", "Seleccioná al menos una semana.");

    try {
      setLoading(true);
      const res = await fetchWithAuth<{
        message: string;
        created: number;
        skippedDays: string[];
      }>("/slots/generate-week", {
        method: "POST",
        body: JSON.stringify({
          availabilityId: availability.id,
          mondayDates: Array.from(selectedWeeks),
        }),
      });

      Alert.alert("Listo", res.message || "Cupos generados correctamente.");
      onSuccess?.();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudieron crear los cupos.");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Crear cupos</Text>
          <Text style={styles.subtitle}>
            {availability
              ? `Disponibilidad: ${availability.weekdays.join(", ")}`
              : "Seleccioná una disponibilidad"}
          </Text>

          <ScrollView style={{ marginTop: spacing.m }}>
            {weeks.map((w) => {
              const active = selectedWeeks.has(w.iso);
              return (
                <Pressable
                  key={w.iso}
                  style={[
                    styles.weekItem,
                    active && { backgroundColor: "#DCFCE7", borderColor: colors.primary },
                  ]}
                  onPress={() => toggleWeek(w.iso)}
                >
                  <Text
                    style={[
                      styles.weekText,
                      active && { color: colors.primary, fontWeight: "700" },
                    ]}
                  >
                    {w.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            style={[
              styles.confirmBtn,
              { opacity: selectedWeeks.size === 0 || loading ? 0.6 : 1 },
            ]}
            disabled={selectedWeeks.size === 0 || loading}
            onPress={handleConfirm}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmText}>CONFIRMAR</Text>
            )}
          </Pressable>
        </View>
      </View>
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
    maxHeight: "80%",
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.s, marginTop: 4 },
  weekItem: {
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    marginBottom: spacing.s,
    backgroundColor: "white",
  },
  weekText: { color: colors.text },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
    marginTop: spacing.m,
  },
  confirmText: { color: "white", fontWeight: "700" },
});
