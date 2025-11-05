import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Lesson } from "@/hooks/data";
import { formatDateTimeISO } from "@/utils/formatDate";
import ClassDetailsModal from "./classDetailsModal";

type Props = {
  lesson: Lesson;
  onCancelled?: () => void;
};

export default function ClassCard({ lesson, onCancelled }: Props) {
  const [open, setOpen] = useState(false);

  const subjectName = lesson.subject?.name ?? "Materia";
  const tutorName = `${lesson.tutor?.firstName ?? ""} ${lesson.tutor?.lastName ?? ""}`.trim();
  const subjectIcon = lesson.subject?.iconUrl
    ? { uri: lesson.subject.iconUrl }
    : require("../assets/images/subjectIcons/defaultNoImage.png");

  return (
    <>
      <Pressable style={styles.card} onPress={() => setOpen(true)}>
        <Image source={subjectIcon} style={styles.icon} />

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{subjectName}</Text>
          <Text style={styles.subtitle}>{tutorName || "Profesor"}</Text>

          <View style={styles.row}>
            <Text style={styles.chip}>
              {lesson.modality === "ONLINE" ? "Virtual" : "Presencial"}
            </Text>
            <Text style={styles.date}>{formatDateTimeISO(lesson.timestamp)}</Text>
          </View>
        </View>
      </Pressable>

      {/* Modal de detalle */}
      <ClassDetailsModal
        lesson={lesson}
        open={open}
        onClose={() => setOpen(false)}
        onCancelled={onCancelled}
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
});
