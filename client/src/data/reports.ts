import type { ReportTypeId } from "../components/reports/previews/reportTypes";

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
  /** Typ raportu – wybiera podgląd pokazywany po otwarciu raportu. */
  typeId: ReportTypeId;
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
    name: "Status – Portal klienta",
    typeId: "ProjectStatus",
    type: "Status projektu",
    project: "Portal klienta",
    period: "01.09.2026 – 20.01.2027",
    author: "Jan Baczyński",
    createdAt: "17.11.2026",
  },
  {
    id: 2,
    name: "Sprint 7 – Adoddle",
    typeId: "SprintSummary",
    type: "Podsumowanie sprintu",
    project: "Adoddle",
    period: "06.10 – 20.10.2026",
    author: "Jan Baczyński",
    createdAt: "21.10.2026",
  },
  {
    id: 3,
    name: "Obciążenie – październik",
    typeId: "TeamWorkload",
    type: "Zaangażowanie zespołu",
    project: "Wszystkie",
    period: "01.10 – 31.10.2026",
    author: "Eryk Baczyński",
    createdAt: "31.10.2026",
  },
  {
    id: 4,
    name: "Terminy – Q4",
    typeId: "Deadlines",
    type: "Terminy",
    project: "Wszystkie",
    period: "06.10 – 29.12.2026",
    author: "Jan Baczyński",
    createdAt: "08.10.2026",
  },
  {
    id: 5,
    name: "Portfel projektów – Q3",
    typeId: "ProjectPortfolio",
    type: "Portfel projektów",
    project: "Wszystkie",
    period: "stan na 01.10.2026",
    author: "Eryk Baczyński",
    createdAt: "01.10.2026",
  },
];

/** Wartość „Projekt” oznaczająca wszystkie projekty (dla raportów, które jej nie dopuszczają, jest ukrywana). */
export const ALL_PROJECTS_OPTION = "Wszystkie";

export const reportProjectOptions: string[] = [
  "Adoddle",
  "Portal klienta",
  "Nexus",
  "Projekt1",
  ALL_PROJECTS_OPTION,
];

export const reportSprintOptions: string[] = ["Sprint 9", "Sprint 8", "Sprint 7", "Sprint 6"];

export const reportGenerateDefaults = {
  namePlaceholder: "Sprint 8 – Adoddle",
  project: "Adoddle",
  sprint: "Sprint 8",
  onlyMine: false,
  dateFrom: "2026-10-20",
  dateTo: "2026-11-02",
};
