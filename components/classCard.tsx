import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Lesson } from "../hooks/data";
import { formatDateTimeISO } from "../utils/formatDate";
import ClassDetailsModal from "./classDetailsModal";

type Props = {
  lesson: Lesson;
  role: "TUTOR" | "STUDENT";
  onCancelled?: () => void;
};

export function ClassCard({ lesson, role, onCancelled }: Props) {
  const [open, setOpen] = useState(false);

  const subjectName = lesson.subject?.name ?? "Materia";
  const counterpart =
    role === "TUTOR"
      ? `${lesson.student?.firstName ?? ""} ${lesson.student?.lastName ?? ""}`.trim()
      : `${lesson.tutor?.firstName ?? ""} ${lesson.tutor?.lastName ?? ""}`.trim();

  const counterpartLabel = role === "TUTOR" ? "Alumno" : "Profesor";

  const subjectIcon = lesson.subject?.iconUrl
    ? { uri: lesson.subject.iconUrl }
    : require("../assets/images/subjectIcons/defaultNoImage.png");

  return (
    <>
      <Pressable style={styles.card} onPress={() => setOpen(true)}>
        <Image source={subjectIcon} style={styles.icon} />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{subjectName}</Text>
          <Text style={styles.subtitle}>
            {counterpartLabel}: {counterpart || "No asignado"}
          </Text>

          <View style={styles.row}>
            <Text style={styles.chip}>
              {lesson.modality === "ONLINE" ? "Virtual" : "Presencial"}
            </Text>
            <Text style={styles.date}>{formatDateTimeISO(lesson.timestamp)}</Text>
          </View>
        </View>

        <View
          style={[
            styles.roleChip,
            role === "TUTOR" ? styles.roleTutor : styles.roleStudent,
          ]}
        >
          <Text style={styles.roleText}>
            {role === "TUTOR" ? "Tutor" : "Estudiante"}
          </Text>
        </View>
      </Pressable>

      <ClassDetailsModal
        lesson={lesson}
        open={open}
        onClose={() => setOpen(false)}
        onCancelled={onCancelled} // ✅ Propagamos callback
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
  },
  icon: { width: 52, height: 52, borderRadius: 10 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, color: "#6b7280" },
  row: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 },
  chip: {
    fontSize: 12,
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  date: { color: "#374151", fontSize: 12 },
  roleChip: {
    position: "absolute",
    top: 8,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleTutor: { backgroundColor: "#2563EB" },
  roleStudent: { backgroundColor: "#16A34A" },
  roleText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
});