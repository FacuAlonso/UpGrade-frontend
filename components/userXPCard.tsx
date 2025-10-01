import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { getStudentById, levelStatsFromXp } from "../app/data";
import type { ID } from "../app/data";

type Props = {
  studentId: ID;
};

export default function UserXPCard({ studentId }: Props) {
  const student = getStudentById(studentId);
  if (!student) return null;

  const { level, currentInLevel, toNext, progress } = levelStatsFromXp(student.xp);
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <Image source={student.profilePic} style={styles.avatar} />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{student.firstName} {student.lastName}</Text>
          <Text style={styles.levelText}>Nivel {level}</Text>
        </View>

        <Text style={styles.xpText}>
          {currentInLevel}/{toNext} XP
        </Text>

        <View style={styles.bottomRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { flex: progress }]} />
              <View style={{ flex: 1 - progress }} />
            </View>
            <Text style={styles.remainingText}>Progreso: {percent}%</Text>
          </View>

          <TouchableOpacity style={styles.reviewButton} onPress={() => {}}>
            <Image
              source={require("../assets/images/icons/joystickISO.png")}
              style={styles.joystickIcon}
            />
            <Text style={styles.reviewButtonText}>REPASAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#042E52",
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  levelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  xpText: {
    color: "#CFE6FF",
    fontSize: 12,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  progressBg: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#444",
  },
  progressFill: {
    backgroundColor: "#22C55E",
  },
  remainingText: {
    marginTop: 4,
    color: "#9CA3AF",
    fontSize: 12,
    fontStyle: "italic",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  joystickIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    resizeMode: "contain",
  },
  reviewButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
