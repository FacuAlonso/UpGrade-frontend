import React, { useMemo, useState } from "react";
import { Modal, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import { format, addWeeks, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../hooks/useAuth";

export default function CreateSlotsModal({ open, availability, onClose, onSuccess }: any) {
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
  const { fetchWithAuth } = useAuth();

  const weeks = useMemo(() => {
    const baseMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 24 }, (_, i) => {
      const monday = addWeeks(baseMonday, i);
      return {
        iso: format(monday, "yyyy-MM-dd"),
        label: `Semana del ${format(monday, "EEEE dd/MM", { locale: es })}`,
      };
    });
  }, []);

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
    } catch (e: unknown) {
        const err = e as { message?: string };
        Alert.alert("Error", err.message ?? "No se pudieron crear los cupos.");
    }
    };


  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Crear cupos</Text>
          <Text style={styles.subtitle}>
            {availability ? `Disponibilidad #${availability.id}` : ""}
          </Text>

          <ScrollView contentContainerStyle={{ gap: spacing.s }}>
            {weeks.map((w) => {
              const active = selectedWeeks.has(w.iso);
              return (
                <Pressable
                  key={w.iso}
                  onPress={() => toggleWeek(w.iso)}
                  style={[
                    styles.weekPill,
                    {
                      borderColor: active ? colors.primary : colors.inputBorder,
                      backgroundColor: active ? "#E8F8EE" : colors.background,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text }}>{w.label}</Text>
                  {active && <Text style={{ color: colors.primary, fontWeight: "700" }}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={handleConfirm}
            style={[styles.cta, { opacity: selectedWeeks.size === 0 ? 0.5 : 1 }]}
            disabled={selectedWeeks.size === 0}
          >
            <Text style={styles.ctaText}>CREAR CUPOS</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.xl,
    gap: spacing.s,
    maxHeight: "85%",
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.s },
  weekPill: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cta: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginTop: spacing.m,
  },
  ctaText: { color: "white", fontWeight: "700" },
});
