import { useState } from "react";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useAvailabilities = () => {
  const { fetchWithAuth } = useAuth();
  const [creating, setCreating] = useState(false);

  const { data: availabilities = [], refetch: refetchAvail } = useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const res = await fetchWithAuth("/availability");
      return res ?? [];
    },
  });

  const createAvailability = async (user: any, weekdays: number[], blocks: any[], refetch: any) => {
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
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo crear la disponibilidad.");
    } finally {
      setCreating(false);
    }
  };

  return { availabilities, refetchAvail, createAvailability, creating };
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
        skippedDays: number[]; 
      }>("/slots/generate-week", {
        method: "POST",
        body: JSON.stringify({ selectedAvailabilityId, mondayDate }),
      });
      setResultMsg(`${res.message} (creados: ${res.created}, omitidos: ${res.skippedDays?.length ?? 0})`);
      qc.invalidateQueries({ queryKey: ["slots"] });
      qc.invalidateQueries({ queryKey: ["lessons"] });
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo generar la semana.");
    } finally {
      setGenerating(false);
    }
  };

  return { generateWeek, generating, resultMsg };
};
