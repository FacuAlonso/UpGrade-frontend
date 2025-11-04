import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import type { ClassSlot, Subject, User } from "@/hooks/data";
import ConfirmationAnimation from "@/components/animations/confirmationAnimation";

type Props = {
  teacher: User | null;
  slots: ClassSlot[];
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: { slotIds: number[]; subjectId: number; modality: "ONLINE" | "ONSITE" }) => void;
};

const dfDate = new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "2-digit", month: "2-digit" });

function groupSlotsByDay(slots: ClassSlot[]) {
  const map = new Map<string, ClassSlot[]>();
  slots.forEach((s) => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  });
  return Array.from(map.entries())
    .map(([iso, items]) => ({
      iso,
      label: dfDate.format(new Date(iso)),
      items: items.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
    .sort((a, b) => a.iso.localeCompare(b.iso));
}

export default function LessonBookModal({ teacher, slots, open, onClose, onConfirm }: Props) {
  const [step, setStep] = useState<"slots" | "subject" | "confirm">("slots");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [modality, setModality] = useState<"ONLINE" | "ONSITE">("ONLINE");
  const [confirmed, setConfirmed] = useState(false);

  const days = useMemo(() => groupSlotsByDay(slots), [slots]);
  const subjects: Subject[] = useMemo(
    () => (teacher?.tutorSubjects ?? []).map((ts) => ts.subject).sort((a, b) => a.name.localeCompare(b.name)),
    [teacher]
  );

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setSubjectId(null);
      setStep("slots");
      setModality("ONLINE");
    }
  }, [open]);

  if (!teacher) return null;

  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Reservar con {teacher.firstName}</Text>

          {step === "slots" && (
            <>
              <Text style={styles.section}>Elegí uno o más horarios</Text>
              <ScrollView contentContainerStyle={{ gap: spacing.m }}>
                {days.map((d) => (
                  <View key={d.iso} style={{ gap: spacing.s }}>
                    <Text style={{ color: colors.muted, textTransform: "uppercase", fontWeight: "700" }}>{d.label}</Text>
                    <View style={styles.grid}>
                      {d.items.map((s) => {
                        const active = selected.has(s.id);
                        return (
                          <Pressable
                            key={s.id}
                            onPress={() => {
                              const next = new Set(selected);
                              active ? next.delete(s.id) : next.add(s.id);
                              setSelected(next);
                            }}
                            style={[
                              styles.pill,
                              {
                                borderColor: active ? colors.primary : colors.inputBorder,
                                backgroundColor: active ? "#E8F8EE" : colors.background,
                              },
                            ]}
                          >
                            <Text style={{ color: colors.text, fontWeight: "600" }}>
                              {s.startTime}–{s.endTime}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <Pressable
                disabled={selected.size === 0}
                style={[styles.cta, { opacity: selected.size === 0 ? 0.5 : 1 }]}
                onPress={() => setStep("subject")}
              >
                <Text style={styles.callToActionsText}>CONTINUAR</Text>
              </Pressable>
            </>
          )}

          {step === "subject" && (
            <>
              <Text style={styles.section}>Elegí la materia</Text>
              <View style={styles.grid}>
                {subjects.map((sub) => {
                  const active = subjectId === sub.id;
                  return (
                    <Pressable
                      key={sub.id}
                      onPress={() => setSubjectId(sub.id)}
                      style={[
                        styles.pill,
                        {
                          borderColor: active ? colors.primary : colors.inputBorder,
                          backgroundColor: active ? "#E8F8EE" : colors.background,
                        },
                      ]}
                    >
                      <Text style={{ color: colors.text, fontWeight: "600" }}>{sub.name}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.section, { marginTop: spacing.m }]}>Modalidad</Text>
              <View style={styles.grid}>
                {(["ONLINE", "ONSITE"] as const).map((m) => {
                  const active = modality === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setModality(m)}
                      style={[
                        styles.pill,
                        {
                          borderColor: active ? colors.primary : colors.inputBorder,
                          backgroundColor: active ? colors.surfaceGreen : colors.background,
                        },
                      ]}
                    >
                      <Text style={{ color: colors.text, fontWeight: "600" }}>
                        {m === "ONLINE" ? "Virtual" : "Presencial"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ height: spacing.l }} />
              <Pressable
                disabled={!subjectId}
                style={[styles.cta, { opacity: subjectId ? 1 : 0.5 }]}
                onPress={() => setStep("confirm")}
              >
                <Text style={styles.callToActionsText}>CONTINUAR</Text>
              </Pressable>
            </>
          )}

          {step === "confirm" && (
            <>
              <Text style={styles.section}>Confirmación</Text>
              <Text style={{ color: colors.text }}>
                Profesor: <Text style={{ fontWeight: "700" }}>{teacher.firstName} {teacher.lastName}</Text>
              </Text>
              <Text style={{ color: colors.text }}>
                Materia: <Text style={{ fontWeight: "700" }}>{subjects.find((s) => s.id === subjectId!)?.name}</Text>
              </Text>
              <Text style={{ color: colors.text }}>
                Modalidad: <Text style={{ fontWeight: "700" }}>{modality === "ONLINE" ? "Virtual" : "Presencial"}</Text>
              </Text>
              <Text style={{ color: colors.text, marginTop: spacing.s, fontWeight: "700" }}>Horarios:</Text>
              <View style={{ gap: 6, marginTop: 6 }}>
                {Array.from(selected).map((id) => {
                  const s = slots.find((x) => x.id === id)!;
                  const d = new Date(s.date);
                  const day = dfDate.format(d);
                  const dayCap = day.charAt(0).toUpperCase() + day.slice(1);
                  const label = `${dayCap} · ${s.startTime}-${s.endTime}`;
                  return (
                    <Text key={id} style={{ color: colors.text }}>
                      • {label}
                    </Text>
                  );
                })}
              </View>

              <View style={{ height: spacing.l }} />
              <Pressable
                style={styles.cta}
                onPress={() => {
                  onConfirm({ slotIds: Array.from(selected), subjectId: subjectId!, modality });
                  setConfirmed(true);
                }}
              >
                <Text style={styles.callToActionsText}>CONFIRMAR RESERVA</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>

      <ConfirmationAnimation
        visible={confirmed}
        onFinish={() => {
          onClose();
          setConfirmed(false);
        }}
      />
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
  title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.s },
  section: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", color: colors.muted, marginTop: spacing.s },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s },
  pill: { paddingVertical: 10, paddingHorizontal: spacing.m, borderRadius: 12, borderWidth: 1 },
  cta: { backgroundColor: colors.primary, paddingVertical: 12, alignItems: "center", borderRadius: 10, marginTop: spacing.m },
  callToActionsText: { color: "white", fontWeight: "700" },
});
