import React from "react";
import {FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View} from "react-native";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import type { User, ClassSlot } from "@/hooks/data";
import { levelStatsFromXp } from "@/utils/xpUtils";


type Props = {
  tutors: { tutor: User; slots: ClassSlot[] }[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelectTutor: (tutor: User) => void;
};

export default function SearchTeacherList({
  tutors,
  refreshing,
  onRefresh,
  onSelectTutor,
}: Props) {
  return (
    <FlatList
      data={tutors}
      keyExtractor={(item) => item.tutor.id.toString()}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <Pressable
          style={[styles.card, { borderColor: colors.inputBorder }]}
          onPress={() => onSelectTutor(item.tutor)}
        >
          <View style={styles.cardHeader}>
            {item.tutor.profilePhoto ? (
              <Image
                source={{ uri: item.tutor.profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {item.tutor.firstName[0]}
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.tutor.firstName} {item.tutor.lastName}
              </Text>

              <Text style={{ color: colors.muted }}>
                {item.slots
                  .slice(0, 4) 
                  .map((s) => {
                    const d = new Date(s.date);
                    const day =
                      ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
                        d.getDay()
                      ];
                    return `${day}`;
                  })
                  .join(" · ") + "..."}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.rating, { color: colors.text }]}>
                Nivel {levelStatsFromXp(item.tutor.xpLevel ?? 0).level}
              </Text>
            </View>
          </View>

          {item.tutor.tutorSubjects && item.tutor.tutorSubjects.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {item.tutor.tutorSubjects.map((ts, i) => (
                <View key={i} style={styles.subjectChip}>
                  {ts.subject.iconUrl && (
                    <Image
                      source={{ uri: ts.subject.iconUrl }}
                      style={styles.subjectIcon}
                    />
                  )}
                  <Text style={styles.subjectText}>{ts.subject.name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <Text style={{ color: colors.muted }}>
              {item.slots.length} horarios disponibles
            </Text>

            <Pressable
              style={styles.reserveButtonSmall}
              onPress={() => onSelectTutor(item.tutor)}
            >
              <Text style={styles.reserveButtonText}>RESERVAR</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
    gap: spacing.m,
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.m,
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  rating: {
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reserveButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  subjectIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    resizeMode: "contain",
  },
  subjectText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12,
  },
});
