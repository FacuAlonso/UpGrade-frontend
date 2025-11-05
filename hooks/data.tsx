import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { store } from "../redux/store";

// -------------- Tipos -----------

export type ID = number;

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  xpLevel: number;
  rating?: number | null;
  profilePhoto?: string | null;
  contactData?: string | null;
  classroomAddress?: string | null;
  onlineClassroomLink?: string | null;
  tutorSubjects?: { subject: Subject }[];
  classSlots?: ClassSlot[];
};

export type Subject = {
  id: number;
  name: string;
  iconUrl?: string | null;
};

export type Modality = "ONLINE" | "ONSITE";

export type LessonStatus = "PENDING" | "DONE" | "CANCELLED";

export type Lesson = {
  id: number;
  slotId: number;
  studentId: number;
  tutorId: number;
  subjectId: number;
  modality: Modality;
  timestamp: string;
  status: LessonStatus;
  tutor?: User;
  student?: User;
  subject?: Subject;
};

export type SlotStatus = "AVAILABLE" | "RESERVED" | "CANCELLED";

export type ClassSlot = {
  id: number;
  tutorId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  deleted: boolean;
  tutor: User;
  reservedBy?: User | null;
};

export type TutorAvailability = {
  id: number;
  tutorId: number;
  weekdays: number[];
  timeBlocks: { start: string; end: string }[];
  active: boolean;
  tutor: User;
};

export type TutorWithData = User & {
  tutorSubjects: { subject: Subject }[];
  classSlots: ClassSlot[];
};

export async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_DB_API_URL;
  const state = store.getState();
  const token = state.user.token;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return res.json() as Promise<T>;
}

// ---------------------- Consultas ----------------------

export function useFetchSubjects() {
  const { fetchWithAuth } = useAuth();
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => fetchWithAuth<Subject[]>("/subjects"),
  });
}

export function useFetchLessons() {
  const { fetchWithAuth } = useAuth();
  return useQuery({
    queryKey: ["lessons"],
    queryFn: () => fetchWithAuth<Lesson[]>("/lessons"),
  });
}

export function useCreateLesson() {
  const qc = useQueryClient();
  const { fetchWithAuth } = useAuth();

  return useMutation({
    mutationFn: (data: {
      slotId: number;
      studentId: number;
      tutorId: number;
      subjectId: number;
      modality: Modality;
      timestamp: string;
    }) =>
      fetchWithAuth<Lesson>("/lessons", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useFetchTutors() {
  const { fetchWithAuth } = useAuth();

  return useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      const data = await fetchWithAuth<TutorWithData[]>("/users/tutors");
      return data.map((tutor) => ({
        ...tutor,
        tutorSubjects: tutor.tutorSubjects ?? [],
        classSlots: tutor.classSlots ?? [],
      }));
    },
  });
}

export function useCancelLesson() {
  const qc = useQueryClient();
  const { fetchWithAuth } = useAuth();

  return useMutation({
    mutationFn: async (data: { lessonId: number }) => {
      return fetchWithAuth<{ message: string }>("/lessons/cancel", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lessons"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useUpdateTutorSubjects() {
  const qc = useQueryClient();
  const { fetchWithAuth } = useAuth();

  return useMutation({
    mutationFn: async (subjectIds: number[]) => {
      return fetchWithAuth<{ message: string; tutorSubjects: { subject: Subject }[] }>(
        "/users/me/subjects",
        {
          method: "POST",
          body: JSON.stringify({ subjectIds }),
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tutors"] });
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
