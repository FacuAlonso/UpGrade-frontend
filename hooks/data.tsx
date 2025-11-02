import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, TEST_USER_ID } from "../config";

// -------------------- Tipos --------------------

export type ID = number;

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  xpLevel: number;
  rating?: number | null;
  profilePhoto?: string | null;
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
  slot?: ClassSlot;
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
  subject?: Subject | null;
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
  tutor: User & {
    tutorSubjects?: {
      subject: { id: number; name: string; iconUrl?: string | null };
    }[];
  };
};

// -------------------- Config --------------------

export const getCurrentUserId = () => TEST_USER_ID;

export async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return res.json();
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

export function useFetchAvailableSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: () => fetchJSON<ClassSlot[]>("/availability"),
  });
}

type ExtendedTutorAvailability = TutorAvailability & {
  classSlots?: {
    id: number;
    tutorId: number;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }[];
  tutor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    rating?: number;
    profilePhoto?: string | null;
    tutorSubjects?: {
      subject: { id: number; name: string; iconUrl?: string | null };
    }[];
  };
};

export function useFetchTutorAvailability() {
  return useQuery<ExtendedTutorAvailability[]>({
    queryKey: ["tutorAvailability"],
    queryFn: () => fetchJSON<ExtendedTutorAvailability[]>("/availability"),
  });
}


// -------------------- Mutations --------------------

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string }) =>
      fetchJSON<User>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; iconUrl?: string }) =>
      fetchJSON<Subject>("/subjects", {
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

// -------------------- Helpers --------------------

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

// -------------------- Lógica de filtrado local --------------------

export function filterSlotsBySubjectAndTutor(
  slots: ClassSlot[],
  subjects: Subject[],
  searchSubjectId?: number,
  searchTutorName?: string
) {
  return slots.filter((slot) => {
    const tutorName = `${slot.tutor.firstName} ${slot.tutor.lastName}`.toLowerCase();
    const matchesTutor = searchTutorName
      ? tutorName.includes(searchTutorName.toLowerCase())
      : true;
    const matchesSubject =
      searchSubjectId && slot.subject
        ? slot.subject.id === searchSubjectId
        : true;
    return matchesTutor && matchesSubject && slot.status === "AVAILABLE";
  });
}

export default {
  useFetchUsers,
  useFetchSubjects,
  useFetchLessons,
  useFetchAvailableSlots,
  useFetchTutorAvailability,
  useCreateUser,
  useCreateSubject,
  useCreateLesson,
  filterSlotsBySubjectAndTutor,
  levelStatsFromXp,
  formatDateTimeISO,
};
