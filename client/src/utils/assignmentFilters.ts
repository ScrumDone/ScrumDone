import type { PersonFilter } from '../components/calendarPeopleFilter';
import { getInitialsFromName } from '../hooks/useCurrentUser';

export const mapTeamMembersToPersonFilters = (members: { id: string; name: string }[]): PersonFilter[] =>
  members.map((member) => ({
    id: member.id,
    initials: getInitialsFromName(member.name),
    fullName: member.name,
  }));

export const buildPeopleFilterOptions = (
  teamMembers: PersonFilter[],
  assignments: { assignees: { id: string; name: string }[] }[],
): PersonFilter[] => {
  const byId = new Map<string, PersonFilter>();

  for (const member of teamMembers) {
    byId.set(member.id, member);
  }

  for (const assignment of assignments) {
    for (const assignee of assignment.assignees) {
      if (!byId.has(assignee.id)) {
        byId.set(assignee.id, {
          id: assignee.id,
          initials: getInitialsFromName(assignee.name),
          fullName: assignee.name,
        });
      }
    }
  }

  return Array.from(byId.values());
};

export const matchesPeopleFilter = (
  assignees: { id: string }[],
  selectedAssigneeIds: string[],
) => {
  const primaryAssigneeId = assignees[0]?.id;
  return Boolean(primaryAssigneeId && selectedAssigneeIds.includes(primaryAssigneeId));
};
