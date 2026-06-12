using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.Data;
using Riok.Mapperly.Abstractions;


namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class SprintMapper
    {
        [MapProperty(nameof(Sprint.Assignments), nameof(SprintSummaryDto.AssignmentCount), Use = nameof(CountAssignments))]
        [MapProperty(nameof(Sprint.Assignments), nameof(SprintSummaryDto.CompletedCount), Use = nameof(CountCompleted))]
        // [MapProperty(nameof(Sprint.Assignments), nameof(SprintSummaryDto.Assignments), Use = nameof(MapAssignments))]
        public static partial SprintSummaryDto ToSummaryDto(this Sprint sprint);

        [MapProperty(nameof(Sprint.Assignments), nameof(SprintSummaryDto.AssignmentCount), Use = nameof(CountAssignments))]
        [MapProperty(nameof(Sprint.Assignments), nameof(SprintSummaryDto.CompletedCount), Use = nameof(CountCompleted))]
        // [MapProperty(nameof(Sprint.Assignments), nameof(SprintSummaryDto.Assignments), Use = nameof(MapAssignments))]
        public static partial SprintDetailDto ToDetailDto(this Sprint sprint);

        private static int CountAssignments(ICollection<Assignment> assignments) => assignments.Count();
        private static int CountCompleted(ICollection<Assignment> assignments) => assignments.Count(a => a.Status?.Name == "Completed");

        private static IEnumerable<AssignmentListItemDto> MapAssignments(ICollection<Assignment>? assignments) 
        {
            if (assignments == null) return Array.Empty<AssignmentListItemDto>();

            return assignments.Select(a => a.ToListItemDto()).ToArray(); 
        }
    }
}