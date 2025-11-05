import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { levelStatsFromXp } from "../utils/xpUtils";

export default function UserXPCard() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#22C55E" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );

  if (!user)
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>No se encontró el usuario</Text>
      </View>
    );

  const xp = user.xpLevel ?? 0;
  const { level, currentInLevel, toNext, progress } = levelStatsFromXp(xp);
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <Image
        source={
          user.profilePhoto
            ? { uri: user.profilePhoto }
            : require("../assets/images/userProfiles/defaultNoImage.png")
        }
        style={styles.avatar}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>
            {user.firstName} {user.lastName}
          </Text>
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
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#042E52", borderRadius: 12, padding: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#22C55E" },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nameText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  levelText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  xpText: { color: "#CFE6FF", fontSize: 12, marginVertical: 4 },
  bottomRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  progressBg: { flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "#444" },
  progressFill: { backgroundColor: "#22C55E" },
  remainingText: { marginTop: 4, color: "#9CA3AF", fontSize: 12, fontStyle: "italic" },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#525252ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    display: "none",
  },
  joystickIcon: { width: 16, height: 16, marginRight: 6, resizeMode: "contain" },
  reviewButtonText: { color: "#fff", fontWeight: "700" },
  loadingWrap: { alignItems: "center", justifyContent: "center", padding: 16 },
  loadingText: { color: "#CFE6FF", fontSize: 14, marginTop: 6 },
});