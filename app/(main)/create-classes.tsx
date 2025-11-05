import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAvailabilities } from "../../hooks/useTutorAvailability";
import { useAuth } from "../../hooks/useAuth";
import AvailabilityCard from "../../components/availabilityCard";
import CreateSlotsModal from "../../components/createSlotsModal";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import CreateAvailabilityModal from "../../components/createAvailabilityModal";

export default function CreateClassesScreen() {
  const qc = useQueryClient();
  const { availabilities, refetchAvail } = useAvailabilities();
  const [selectedAvailability, setSelectedAvailability] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);


  const { token } = useAuth();

  const handleDelete = async (availability: any) => {
    Alert.alert("Eliminar disponibilidad", "¿Seguro querés eliminar esta disponibilidad?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(
              `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}/availability/${availability.id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            await refetchAvail();
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar la disponibilidad.");
            console.log(e);
          }
        },
      },
    ]);
  };


  if (!availabilities) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mis Disponibilidades</Text>

      {availabilities.length === 0 ? (
        <Text style={styles.muted}>Aún no creaste disponibilidades.</Text>
      ) : (
        availabilities.map((av) => (
          <AvailabilityCard
            key={av.id}
            availability={av}
            onCreateSlots={() => {
              setSelectedAvailability(av);
              setModalOpen(true);
            }}
            onDelete={() => handleDelete(av)}
          />
        ))
      )}

      <Pressable
        onPress={() => setCreateModalOpen(true)}
        style={styles.newButton}
      >
        <Text style={styles.newButtonText}>+ Nueva disponibilidad</Text>
      </Pressable>

      {createModalOpen && (
        <CreateAvailabilityModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            refetchAvail();
          }}
        />
      )}

      {modalOpen && (
        <CreateSlotsModal
          open={modalOpen}
          availability={selectedAvailability}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            qc.invalidateQueries({ queryKey: ["slots"] });
            qc.invalidateQueries({ queryKey: ["availability"] });
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.l, gap: spacing.m },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginTop: 20 },
  muted: { color: colors.muted, marginTop: spacing.s },
  newButton: {
    backgroundColor: colors.primary,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    marginTop: spacing.l,
  },
  newButtonText: { color: "white", fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
