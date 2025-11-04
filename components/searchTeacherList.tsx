import type { TutorAvailability, User } from "@/hooks/data";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import React from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

type Props = {
  tutors: { tutor: User; slots: TutorAvailability[] }[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelectTutor: (tutor: User) => void;
};

export default function SearchTeacherList({ tutors, refreshing, onRefresh, onSelectTutor }: Props) {
  return (
    <FlatList
      data={tutors}
      keyExtractor={(item) => item.tutor.id.toString()}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <Pressable style={[styles.card, { borderColor: colors.inputBorder }]}>
          <View style={styles.cardHeader}>
            {item.tutor.profilePhoto ? (
              <Image source={{ uri: item.tutor.profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>{item.tutor.firstName[0]}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.tutor.firstName} {item.tutor.lastName}
              </Text>
              <Text style={{ color: colors.muted }}>
                {item.slots
                  .map((s) => `${["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][s.weekday]} ${s.startTime}-${s.endTime}`)
                  .join(" · ")}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.rating, { color: colors.text }]}>{(item.tutor.rating ?? 5).toFixed(1)} ⭐</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={{ color: colors.muted }}>Disponible</Text>
            <Pressable style={styles.reserveButtonSmall} onPress={() => onSelectTutor(item.tutor)}>
              <Text style={styles.reserveButtonText}>RESERVAR</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderRadius: 16, padding: spacing.l, marginBottom: spacing.m, gap: spacing.m },
  cardHeader: { flexDirection: "row", gap: spacing.m, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#E5E7EB" },
  avatarImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#22C55E" },
  name: { fontSize: 16, fontWeight: "700" },
  rating: { fontWeight: "700" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reserveButtonSmall: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 24, borderRadius: 8 },
  reserveButtonText: { color: "#fff", fontWeight: "700" },
});