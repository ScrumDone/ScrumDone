import type { ProjectListItem } from '../types/project';

export type ProjectCardViewModel = {
  id: string;
  name: string;
  clientName: string;
  description: string;
  startDate: string;
  endDate: string;
  membersCount: number;
  progress: number;
  status: string;
};

export const formatProjectDateForDisplay = (dateValue: string | null): string => {
  if (!dateValue) {
    return '—';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const day = date.getDate();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

export const computeProjectProgress = (project: ProjectListItem): number => {
  if (project.assignmentCount === 0) {
    return 0;
  }

  const doneCount =
    project.assignmentStatusCounts.find((status) => status.statusName.toLowerCase() === 'done')?.count ?? 0;

  return Math.round((doneCount / project.assignmentCount) * 100);
};

export const mapProjectListItemToCard = (project: ProjectListItem): ProjectCardViewModel => ({
  id: project.id,
  name: project.name,
  clientName: project.companyName?.trim() || '—',
  description: project.description?.trim() || '—',
  startDate: formatProjectDateForDisplay(project.startDate),
  endDate: formatProjectDateForDisplay(project.expectedFinishDate),
  membersCount: project.teamMemberCount,
  progress: computeProjectProgress(project),
  status: project.isActive ? 'Aktywny' : 'Nieaktywny',
});
