using Microsoft.AspNetCore.WebUtilities;
using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class ProjectMapper
    {
        [MapProperty(nameof(Project.CreatedAt), nameof(ProjectListItemDto.StartDate))]
        [MapProperty(nameof(Project.TeamMembers), nameof(ProjectListItemDto.TeamMemberCount), Use = nameof(CountTeam))]
        [MapProperty(nameof(Project.Assignments), nameof(ProjectListItemDto.AssignmentCount), Use = nameof(CountAssignments))]
        [MapProperty(nameof(Project.Assignments), nameof(ProjectListItemDto.AssignmentStatusCounts), Use = nameof(CountStatus))]

        public static partial ProjectListItemDto ToListItemDto(this Project project);


        [MapProperty(nameof(Project.CreatedAt), nameof(ProjectDetailDto.StartDate))]
        [MapProperty(nameof(Project.TeamMembers), nameof(ProjectDetailDto.TeamMemberCount), Use = nameof(CountTeam))]
        [MapProperty(nameof(Project.TeamMembers), nameof(ProjectDetailDto.TeamMembers), Use = nameof(MapTeam))]
        [MapProperty(nameof(Project), nameof(ProjectDetailDto.Sprints), Use = nameof(MapSprints))]
        [MapProperty(nameof(Project.Assignments), nameof(ProjectDetailDto.AssignmentCount), Use = nameof(CountAssignments))]
        [MapProperty(nameof(Project.Assignments), nameof(ProjectDetailDto.AssignmentStatusCounts), Use = nameof(CountStatus))]
        public static partial ProjectDetailDto ToDetailDto(this Project project);

        private static int CountTeam(ICollection<ProjectUserMTMRelation>? teamMembers) => teamMembers?.Count ?? 0;
        private static int CountAssignments(ICollection<Assignment>? assignments) => assignments?.Count ?? 0;
        private static IEnumerable<SprintSummaryDto> MapSprints(Project project) => project.Sprints?.Where(s => s.IsKanban == !project.IsSetToScrum).Select(s => s.ToSummaryDto()).ToArray() ?? Array.Empty<SprintSummaryDto>();

        private static IEnumerable<UserSummaryDto> MapTeam(ICollection<ProjectUserMTMRelation>? teamMembers)
        {
            if (teamMembers == null) return Array.Empty<UserSummaryDto>();

            return teamMembers
                .Where(tm => tm.User != null)
                .Select(tm => tm.User.ToSummaryDto())
                .ToArray();
        }
        private static IEnumerable<AssignmentStatusCountDto> CountStatus(ICollection<Assignment>? assignments)
        {
            if (assignments == null) return Array.Empty<AssignmentStatusCountDto>();

            return assignments
                .Where(a => a.Status != null)
                // ZMIANA TUTAJ: Grupujemy po anonimowym obiekcie z konkretnymi właściwościami
                .GroupBy(a => new { a.Status.Id, a.Status.Name, a.Status.HexColor })
                .Select(g => new AssignmentStatusCountDto(
                    StatusId: g.Key.Id,
                    StatusName: g.Key.Name,
                    StatusHexColor: g.Key.HexColor,
                    Count: g.Count()
                )).ToArray();
        }
    }
}
