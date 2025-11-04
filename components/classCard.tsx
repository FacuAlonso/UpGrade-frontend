import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Lesson } from "../hooks/data";
import { formatDateTimeISO } from "../hooks/data";

type Props = { lesson: Lesson };

export function ClassCard({ lesson }: Props) {
  const subjectName = lesson.subject?.name ?? "Materia";
  const tutorName = `${lesson.tutor?.firstName ?? ""} ${lesson.tutor?.lastName ?? ""}`.trim();
  const subjectIcon = lesson.subject?.iconUrl
    ? { uri: lesson.subject.iconUrl }
    : require("../assets/images/subjectIcons/defaultNoImage.png")

  return (
    <View style={cardStyles.card}>
      {subjectIcon ? (
        <Image source={subjectIcon} style={cardStyles.icon} />
      ) : (
        <View style={[cardStyles.icon, { backgroundColor: "#e5e7eb" }]} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={cardStyles.title}>{subjectName}</Text>
        <Text style={cardStyles.subtitle}>{tutorName || "Profesor"}</Text>

        <View style={cardStyles.row}>
          <Text style={chipStyles.chip}>
            {lesson.modality === "ONLINE" ? "Virtual" : "Presencial"}
          </Text>
          <Text style={cardStyles.date}>
            {formatDateTimeISO(lesson.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
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
  date: { color: "#374151", fontSize: 12 },
});

const chipStyles = StyleSheet.create({
  chip: {
    fontSize: 12,
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
});
