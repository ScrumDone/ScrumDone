using ScrumDone.Api.DTOs.Assignments;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Sprints
{
    // Summary — sprint list in sprints screen, kanban sprint selector

    public record SprintSummaryDto(
        Guid Id,
        string? Name,
        DateTimeOffset CreatedAt,
        DateTimeOffset? StartDate,
        DateTimeOffset? EndDate,
        bool IsKanban,
        int AssignmentCount,
        int CompletedCount,       // frontend calculates percentage and planned/active/finished
        IEnumerable<AssignmentListItemDto>? Assignments
    );

    // Full detail — kanban selected sprint, sprint expanded with assignments

    public record SprintDetailDto(
        Guid Id,
        string? Name,
        DateTimeOffset CreatedAt,
        DateTimeOffset? StartDate,
        DateTimeOffset? EndDate,
        bool IsKanban,
        int AssignmentCount,
        int CompletedCount,
        IEnumerable<AssignmentListItemDto> Assignments
    );

    // Create

    public class SprintCreateDto
    {
        public string? Name { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public bool IsKanban { get; set; } = false;
    }

    // Update — PATCH partial update pattern

    public class SprintUpdateDto
    {
        private readonly HashSet<string> _setProperties = new();
        [JsonIgnore]
        public IReadOnlySet<string> SetProperties => _setProperties;

        // adds property when declared in body
        // helps support the PATCH partial update logic
        //    - omission in body -> no update, don't add to set properties
        //    - null -> set to empty, add to set properties
        //    - value -> set to value, add to set properties

        private string? _name;
        private DateTimeOffset? _startDate;
        private DateTimeOffset? _endDate;

        public string? Name
        {
            get => _name;
            set { _name = value; _setProperties.Add(nameof(Name)); }
        }
        public DateTimeOffset? StartDate
        {
            get => _startDate;
            set { _startDate = value; _setProperties.Add(nameof(StartDate)); }
        }
        public DateTimeOffset? EndDate
        {
            get => _endDate;
            set { _endDate = value; _setProperties.Add(nameof(EndDate)); }
        }
    }

    public class SprintQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        public bool IncludeAssignments { get; set; } = false;
    }

}
