using ScrumDone.Api.DTOs.Assignments;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Sprints
{
    public record SprintSummaryDto(
        Guid Id,
        string? Name,
        DateTimeOffset CreatedAt,
        DateTimeOffset? StartDate,
        DateTimeOffset? EndDate,
        bool IsKanban,
        int AssignmentCount,
        int CompletedCount      // frontend calculates percentage and planned/active/finished
    );


    public record SprintDetailDto(
        Guid Id,
        string? Name,
        DateTimeOffset CreatedAt,
        DateTimeOffset? StartDate,
        DateTimeOffset? EndDate,
        bool IsKanban,
        int AssignmentCount,
        int CompletedCount
    );

    public class SprintCreateDto
    {
        public string? Name { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
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

        public string? Name
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Name)); }
        }
        public DateTimeOffset? StartDate
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(StartDate)); }
        }
        public DateTimeOffset? EndDate
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(EndDate)); }
        }
    }

    public class SprintQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        // public bool IncludeAssignments { get; set; } = false;
    }

}
