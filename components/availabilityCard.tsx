import React from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import { useAvailabilities } from "../hooks/useTutorAvailability";

type Props = {
  availability: {
    id: number;
    weekdays: number[];
    timeBlocks: { start: string; end: string }[];
  };
  onCreateSlots: () => void;
};

const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function AvailabilityCard({ availability, onCreateSlots }: Props) {
  const { deleteAvailability, refetchAvail, deleting } = useAvailabilities();

  const dayLabels = availability.weekdays.map((n) => DAY_NAMES[n - 1]).join(", ");
  const hours = availability.timeBlocks.map((b) => `${b.start}–${b.end}`).join(", ");

  return (
    <View style={styles.card}>
      <Text style={styles.days}>{dayLabels}</Text>
      <Text style={styles.hours}>{hours}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.createBtn} onPress={onCreateSlots}>
          <Text style={styles.createText}>CREAR CUPOS</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
          onPress={() => deleteAvailability(availability.id, refetchAvail)}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteText}>ELIMINAR</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: spacing.m,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: spacing.m,
  },
  days: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  hours: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.m,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  createBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  createText: { color: "white", fontWeight: "700" },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: { color: "white", fontWeight: "700" },
});
