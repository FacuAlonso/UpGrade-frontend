import { useState } from "react";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

type TimeBlock = { start: string; end: string };

export type Availability = {
  id: number;
  tutorId: number;
  weekdays: number[];
  timeBlocks: TimeBlock[];
  active?: boolean;
};

export const useAvailabilities = () => {
  const { fetchWithAuth } = useAuth();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: availabilities = [], refetch: refetchAvail } = useQuery<Availability[]>({
    queryKey: ["availability"],
    queryFn: async () => {
      const res = await fetchWithAuth<Availability[]>("/availability");
      return res ?? [];
    },
  });

  const createAvailability = async (
    user: any,
    weekdays: number[],
    blocks: TimeBlock[],
    refetch: () => Promise<any>
  ) => {
    if (!user?.id) return Alert.alert("Ups", "No se encontró el usuario.");
    if (!weekdays.length) return Alert.alert("Campos", "Elegí al menos un día.");
    if (!blocks.length) return Alert.alert("Campos", "Agregá un bloque horario.");

    try {
      setCreating(true);
      await fetchWithAuth("/availability", {
        method: "POST",
        body: JSON.stringify({ weekdays, timeBlocks: blocks }),
      });
      await refetch();
      Alert.alert("Listo", "Disponibilidad creada.");
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert("Error", err.message ?? "No se pudo crear la disponibilidad.");
    } finally {
      setCreating(false);
    }
  };

  const deleteAvailability = async (availabilityId: number, refetch: () => Promise<any>) => {
    if (!availabilityId) return Alert.alert("Error", "Falta el ID de la disponibilidad.");

    Alert.alert("Eliminar disponibilidad", "¿Seguro querés eliminar esta disponibilidad?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            const res = await fetchWithAuth<{ message: string }>("/availability/delete", {
              method: "POST",
              body: JSON.stringify({ id: availabilityId }),
            });
            Alert.alert("Listo", res.message || "Disponibilidad eliminada correctamente.");
            await refetch();
          } catch (e: unknown) {
            const err = e as { message?: string };
            Alert.alert("Error", err.message ?? "No se pudo eliminar la disponibilidad.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return {
    availabilities,
    refetchAvail,
    createAvailability,
    deleteAvailability,
    creating,
    deleting,
  };
};

export const useGenerateWeek = (qc: any) => {
  const { fetchWithAuth } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const generateWeek = async (selectedAvailabilityId: number | null, mondayDate: string) => {
    if (!selectedAvailabilityId) return Alert.alert("Campos", "Elegí una disponibilidad.");
    if (!mondayDate) return Alert.alert("Campos", "Ingresá la fecha del lunes.");

    try {
      setGenerating(true);
      setResultMsg(null);
      const res = await fetchWithAuth<{
        message: string;
        created: number;
        skippedDays: string[];
      }>("/slots/generate-week", {
        method: "POST",
        body: JSON.stringify({ availabilityId: selectedAvailabilityId, mondayDate }),
      });

      setResultMsg(
        `${res.message} (creados: ${res.created}, omitidos: ${res.skippedDays?.length ?? 0})`
      );

      qc.invalidateQueries({ queryKey: ["slots"] });
      qc.invalidateQueries({ queryKey: ["lessons"] });
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert("Error", err.message ?? "No se pudo generar la semana.");
    } finally {
      setGenerating(false);
    }
  };

  return { generateWeek, generating, resultMsg };
};
