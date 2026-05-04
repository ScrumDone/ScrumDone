export interface ProjectData {
  id: number;
  slug: string;
  name: string;
  clientName: string;
  description: string;
  startDate: string;
  endDate: string;
  membersCount: number;
  progress: number;
  status: string;
}

export const projects: ProjectData[] = [
  {
    id: 1,
    slug: "adoddle",
    name: "Adoddle",
    clientName: "Adoddle",
    description: "Development of mobile application for project management",
    startDate: "15.01.2026",
    endDate: "5.04.2026",
    membersCount: 3,
    progress: 65,
    status: "Aktywny",
  },
  {
    id: 2,
    slug: "nexus",
    name: "Nexus",
    clientName: "Nexus Tech",
    description: "E-commerce platform development",
    startDate: "1.02.2026",
    endDate: "6.04.2026",
    membersCount: 3,
    progress: 45,
    status: "Aktywny",
  },
  {
    id: 3,
    slug: "hadar",
    name: "Hadar",
    clientName: "Hadar Solutions",
    description: "Custom CRM system implementation",
    startDate: "20.01.2026",
    endDate: "5.04.2026",
    membersCount: 3,
    progress: 72,
    status: "Aktywny",
  },
];
