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
