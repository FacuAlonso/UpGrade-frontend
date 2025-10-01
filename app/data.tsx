export type ID = string;

export type Student = {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  xp: number;
  profilePic: any;
};

export type Professor = {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
};

export type Subject = {
  id: ID;
  name: string;
  icon: any;
};

export type Modality = 'virtual' | 'presential';

export type ClassSession = {
  id: ID;
  studentId: ID;
  professorId: ID;
  subjectId: ID;
  modality: Modality;
  dateTime: string; 
};

// -------------------- DATA estática de ejemplo  --------------------

export const students: Student[] = [
  {
    id: 's1',
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juanperez@gmail.com',
    xp: 800,
    profilePic: require("../assets/images/userProfiles/student1.jpeg"),
  },
  {
    id: 's2',
    firstName: 'María',
    lastName: 'Fernandez',
    email: 'maria.fernandez@gmail.com',
    xp: 2200,
    profilePic: require("../assets/images/userProfiles/student2.jpeg"),
  },
];

export const professors: Professor[] = [
  { id: 'p1', firstName: 'Damián', lastName: 'Pedraza', email: 'damian@school.com' },
  { id: 'p2', firstName: 'Stella', lastName: 'Boutet', email: 'stella@school.com' },
  { id: 'p3', firstName: 'William', lastName: 'Orwell', email: 'william@school.com' },
  { id: 'p4', firstName: 'Mariano', lastName: 'Berners', email: 'mariano@school.com' },
  { id: 'p5', firstName: 'Walter', lastName: 'Whitepetta', email: 'wwpetta@school.com' },
];

export const subjects: Subject[] = [
  { id: "sub1", name: "Física I", icon: require("../assets/images/subjectIcons/fisicauno.png") },
  { id: "sub2", name: "Álgebra y Geometría", icon: require("../assets/images/subjectIcons/algebra.png") },
  { id: "sub3", name: "Inglés avanzado", icon: require("../assets/images/subjectIcons/inglesAvanzado.jpeg") },
  { id: "sub4", name: "Programación Web", icon: require("../assets/images/subjectIcons/progWeb.png") },
  { id: "sub5", name: "Química General", icon: require("../assets/images/subjectIcons/quimicaGeneral.png") },
];


export const classes: ClassSession[] = [
  {
    id: 'c1',
    studentId: 's2',
    professorId: 'p1',
    subjectId: 'sub1',
    modality: 'virtual',
    dateTime: '2025-10-01T11:10:00.000Z',
  },
  {
    id: 'c2',
    studentId: 's2',
    professorId: 'p2',
    subjectId: 'sub2',
    modality: 'presential',
    dateTime: '2025-10-02T15:00:00.000Z',
  },
  {
    id: 'c3',
    studentId: 's2',
    professorId: 'p3',
    subjectId: 'sub3',
    modality: 'virtual',
    dateTime: '2025-10-03T20:00:00.000Z',
  },
  {
    id: 'c4',
    studentId: 's2',
    professorId: 'p5',
    subjectId: 'sub5',
    modality: 'presential',
    dateTime: '2025-10-04T12:30:00.000Z',
  },
  {
    id: 'c5',
    studentId: 's2',
    professorId: 'p4',
    subjectId: 'sub4',
    modality: 'virtual',
    dateTime: '2025-10-04T16:30:00.000Z',
  },
  {
    id: 'c6',
    studentId: 's2',
    professorId: 'p1',
    subjectId: 'sub1',
    modality: 'virtual',
    dateTime: '2025-10-04T19:30:00.000Z',
  },
  
];

// -------------------- Funciones auxiliares --------------------

export function getStudentById(id: ID) {
  return students.find((u) => u.id === id) || null;
}
export function getProfessorById(id: ID) {
  return professors.find((p) => p.id === id) || null;
}
export function getSubjectById(id: ID) {
  return subjects.find((m) => m.id === id) || null;
}
export function getClassesByStudentId(studentId: ID) {
  return classes
    .filter((c) => c.studentId === studentId)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}

export function levelStatsFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currStart = (level - 1) * (level - 1) * 100;
  const nextStart = level * level * 100;
  const currentInLevel = Math.max(0, xp - currStart);
  const toNext = Math.max(1, nextStart - currStart);
  const progress = Math.min(1, currentInLevel / toNext);
  return { level, currStart, nextStart, currentInLevel, toNext, progress };
}

export function formatDateTimeISO(iso: string, locale: string = 'en-US') {
  const dt = new Date(iso);
  const date = new Intl.DateTimeFormat(locale, { weekday: 'short', day: '2-digit', month: 'short' }).format(dt);
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dt);
  return `${date} · ${time}`;
}

// -------------------- Export default --------------------

export default {
  students,
  professors,
  subjects,
  classes,
  getStudentById,
  getProfessorById,
  getSubjectById,
  getClassesByStudentId,
  levelStatsFromXp,
  formatDateTimeISO,
};
