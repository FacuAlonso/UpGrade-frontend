import type { User } from "@/hooks/data";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

const HOURS = Array.from({ length: 10 }).map((_, i) => `${String(9 + i).padStart(2, "0")}:00`);
const weekdayFmt = new Intl.DateTimeFormat("es-AR", { weekday: "short" });
const dayFmt = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" });

function getNextDays(n = 14) {
  const today = new Date();
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      dow: weekdayFmt.format(d),
      dlabel: dayFmt.format(d),
    };
  });
}

type Props = {
  teacher: User | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { teacherId: number; isoDate: string; startTime: string }) => void;
};

export default function LessonBookModal({ teacher, open, onClose, onConfirm }: Props) {
  const days = useMemo(() => getNextDays(14), []);
  const [selectedDay, setSelectedDay] = useState(days[0]?.iso ?? "");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setSelectedHour(null);
  }, [open]);

  if (!teacher) return null;

  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.sheetTitle}>Reservar con {teacher.firstName}</Text>
          <Text style={{ color: colors.muted, marginBottom: spacing.s }}>
            Seleccioná día y horario
          </Text>

          <Text style={styles.sectionTitle}>Día</Text>
          <View style={styles.calendarGrid}>
            {days.map((d) => {
              const active = selectedDay === d.iso;
              return (
                <Pressable
                  key={d.iso}
                  style={[
                    styles.dayCell,
                    {
                      borderColor: active ? colors.primary : colors.inputBorder,
                      backgroundColor: active ? "#E8F8EE" : colors.background,
                    },
                  ]}
                  onPress={() => setSelectedDay(d.iso)}
                >
                  <Text style={{ fontSize: 12, color: colors.muted, textTransform: "uppercase" }}>
                    {d.dow}
                  </Text>
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
                    {
                      borderColor: active ? colors.primary : colors.inputBorder,
                      backgroundColor: active ? "#E8F8EE" : colors.background,
                    },
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

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, gap: spacing.s, maxHeight: "80%" },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: spacing.s, color: colors.text },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.s, color: colors.muted },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s, marginBottom: spacing.s },
  dayCell: { width: "23%", aspectRatio: 1, borderWidth: 1, borderRadius: 12, padding: spacing.s, alignItems: "center", justifyContent: "center" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s, marginTop: spacing.s },
  timeCell: { paddingVertical: 10, paddingHorizontal: spacing.m, borderRadius: 12, borderWidth: 1 },
  reserveButton: { backgroundColor: "#22C55E", paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  reserveButtonText: { color: "#fff", fontWeight: "700" },
});
