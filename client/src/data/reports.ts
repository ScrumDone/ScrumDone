export interface ReportsQuickStats {
  activeProjectsCount: number;
  completedProjectsCount: number;
  atRiskProjects: string[];
  tasksCompletedThisMonth: number;
  topUserThisMonth: {
    name: string;
    initials: string;
    hours: number;
  };
}

export interface GeneratedReport {
  id: number;
  name: string;
  type: string;
  project: string;
  period: string;
  author: string;
  createdAt: string;
}

export const reportsQuickStats: ReportsQuickStats = {
  activeProjectsCount: 8,
  completedProjectsCount: 4,
  atRiskProjects: ["Portal klienta", "Nexus"],
  tasksCompletedThisMonth: 46,
  topUserThisMonth: {
    name: "Eryk Baczyński",
    initials: "EB",
    hours: 52,
  },
};

export const generatedReports: GeneratedReport[] = [
  {
    id: 1,
    name: "Raport zadań – Projekt1",
    type: "Raport zadań",
    project: "Projekt1",
    period: "02.01.2024 – 03.04.2025",
    author: "Jan Baczyński",
    createdAt: "03.04.2025",
  },
  {
    id: 2,
    name: "Sprint 7 – Adoddle",
    type: "Podsumowanie sprintu",
    project: "Adoddle",
    period: "06.10 – 20.10.2026",
    author: "Jan Baczyński",
    createdAt: "21.10.2026",
  },
  {
    id: 3,
    name: "Obciążenie – październik",
    type: "Obciążenie zespołu",
    project: "Wszystkie",
    period: "01.10 – 31.10.2026",
    author: "Eryk Baczyński",
    createdAt: "31.10.2026",
  },
  {
    id: 4,
    name: "Velocity – Portal klienta",
    type: "Velocity i prognoza",
    project: "Portal klienta",
    period: "Sprinty 2–7",
    author: "Jan Baczyński",
    createdAt: "08.10.2026",
  },
  {
    id: 5,
    name: "Projekty zagrożone – Q3",
    type: "Projekty zagrożone",
    project: "Wszystkie",
    period: "01.07 – 30.09.2026",
    author: "Eryk Baczyński",
    createdAt: "01.10.2026",
  },
];

export const reportTypeOptions: string[] = [
  "Podsumowanie sprintu",
  "Raport zadań",
  "Obciążenie zespołu",
  "Velocity i prognoza",
  "Projekty zagrożone",
];

export const reportProjectOptions: string[] = [
  "Adoddle",
  "Portal klienta",
  "Nexus",
  "Projekt1",
  "Wszystkie",
];

export const reportGenerateDefaults = {
  namePlaceholder: "Sprint 8 – Adoddle",
  type: "Podsumowanie sprintu",
  project: "Adoddle",
  dateFrom: "2026-10-20",
  dateTo: "2026-11-02",
};

export type ReportPreviewTaskTone = "overdue" | "inProgress" | "inReview";

export interface ReportPreviewSample {
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  taskCounts: { done: number; inProgress: number; inReview: number; todo: number };
  burnup: {
    /** Współrzędne punktów w układzie viewBox wykresu (270 × 115). */
    scopeLine: string;
    doneLine: string;
    baselineY: number;
    firstDayLabel: string;
    lastDayLabel: string;
  };
  unfinishedCount: number;
  unfinishedTasks: { title: string; status: string; tone: ReportPreviewTaskTone }[];
}

export const reportPreviewSample: ReportPreviewSample = {
  title: "Podsumowanie sprintu – Sprint 8",
  subtitle: "Adoddle • 20.10 – 02.11.2026",
  stats: [
    { label: "Zaplanowano", value: "22 zad. • 48 h" },
    { label: "Zrobiono", value: "17 zad. • 39 h" },
    { label: "Realizacja", value: "81%" },
  ],
  taskCounts: { done: 17, inProgress: 2, inReview: 2, todo: 1 },
  burnup: {
    scopeLine: "0,22 91,22 91,11 270,11",
    doneLine: "0,114 33,107 68,93 103,80 137,63 172,52 206,41 241,34 270,29",
    baselineY: 114,
    firstDayLabel: "dz. 1",
    lastDayLabel: "dz. 10",
  },
  unfinishedCount: 5,
  unfinishedTasks: [
    { title: "Integracja z płatnościami", status: "po terminie", tone: "overdue" },
    { title: "Eksport faktur do CSV", status: "In Progress", tone: "inProgress" },
    { title: "Testy formularza", status: "In Review", tone: "inReview" },
  ],
};
