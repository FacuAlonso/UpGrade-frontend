import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TEST_USER_ID } from "../config";

export type ID = number;

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  xpLevel: number;
  rating?: number | null;
  profilePhoto?: string | null;
  tutorSubjects?: { subject: Subject }[];
};

export type Subject = {
  id: number;
  name: string;
  iconUrl?: string | null;
};

export type Modality = "ONLINE" | "ONSITE";

export type Lesson = {
  id: number;
  slotId: number;
  studentId: number;
  tutorId: number;
  subjectId: number;
  modality: Modality;
  timestamp: string;
  status: "PENDING" | "DONE" | "CANCELLED";
  tutor?: User;
  student?: User;
  subject?: Subject;
};

export type ClassSlot = {
  id: number;
  tutorId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "RESERVED" | "CANCELLED";
  deleted: boolean;
  tutor: User;
};

export type TutorAvailability = {
  id: number;
  tutorId: number;
  weekday: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  active: boolean;
  tutor: User;
};

// -------------------- Config --------------------

export const getCurrentUserId = () => TEST_USER_ID;

export async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_DB_API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const msg = typeof data === "object" && data.error ? data.error : res.statusText;
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }

    return data as T;
  } catch (error) {
    console.error("❌ fetchJSON error:", error);
    throw error;
  }
}


// -------------------- Consultas --------------------

export function useFetchUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => fetchJSON<User[]>("/users"),
  });
}

export function useFetchSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => fetchJSON<Subject[]>("/subjects"),
  });
}

export function useFetchLessons() {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: () => fetchJSON<Lesson[]>("/lessons"),
  });
}

export function useFetchTutorAvailability() {
  return useQuery({
    queryKey: ["availability"],
    queryFn: () => fetchJSON<TutorAvailability[]>("/availability"),
  });
}

export function useFetchSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: () => fetchJSON<ClassSlot[]>("/slots"),
  });
}

// -------------------- Escrituras --------------------

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string }) =>
      fetchJSON<User>("/users/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User> & { id: number }) =>
      fetchJSON<User>("/users/update", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchJSON<{ message: string }>("/users/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; iconUrl?: string }) =>
      fetchJSON<Subject>("/subjects/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      slotId: number;
      studentId: number;
      tutorId: number;
      subjectId: number;
      modality: Modality;
      timestamp: string;
    }) =>
      fetchJSON<Lesson>("/lessons", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useCreateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      tutorId: number;
      weekday: number;
      startTime: string;
      endTime: string;
      startDate: string;
      endDate: string;
    }) =>
      fetchJSON("/availability/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });
}

// -------------------- Auxiliares --------------------

export function levelStatsFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currStart = (level - 1) * (level - 1) * 100;
  const nextStart = level * level * 100;
  const currentInLevel = Math.max(0, xp - currStart);
  const toNext = Math.max(1, nextStart - currStart);
  const progress = Math.min(1, currentInLevel / toNext);
  return { level, currStart, nextStart, currentInLevel, toNext, progress };
}

export function formatDateTimeISO(iso: string, locale: string = "es-AR") {
  const dt = new Date(iso);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(dt);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
  return `${date} · ${time}`;
}