using ScrumDone.Api.DTOs.Users;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Assignments
{
    public record AssignmentStatusDto(
        Guid Id,
        string Name,
        string HexColor
    );

    public record AssignmentPriorityDto(
        Guid Id,
        string Name,
        string HexColor
    );

    public record AssignmentLabelDto(
        Guid Id,
        string Name,
        string HexColor
    );

    // List item — home page, calendar, kanban, sprint expanded view

    public record AssignmentListItemDto(
        Guid Id,
        string Name,
        string Description,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? DueDate,
        decimal? TimeEstimate,
        AssignmentStatusDto Status,
        AssignmentPriorityDto Priority,
        IEnumerable<UserSummaryDto> Assignees,
        IEnumerable<AssignmentLabelDto> Labels,
        IEnumerable<Guid> SubtaskIds,
        Guid ProjectId,
        string ProjectName,
        Guid? SprintId,
        Guid? ParentAssignmentId
    );

    // Full detail — assignment detail view

    public record AssignmentDetailDto(
        Guid Id,
        string Name,
        string Description,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? DueDate,
        decimal? TimeEstimate,
        AssignmentStatusDto Status,
        AssignmentPriorityDto Priority,
        IEnumerable<UserSummaryDto> Assignees,
        IEnumerable<AssignmentLabelDto> Labels,
        IEnumerable<Guid> SubtaskIds,
        Guid ProjectId,
        string ProjectName,
        Guid? SprintId,
        Guid? ParentAssignmentId
    );

    // Create

    public class AssignmentCreateDto
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required Guid ProjectId { get; set; }
        public required Guid StatusId { get; set; }
        public Guid? PriorityId { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public decimal? TimeEstimate { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? ParentAssignmentId { get; set; }
        public IEnumerable<Guid> AssigneeIds { get; set; } = [];
        public IEnumerable<Guid> LabelIds { get; set; } = [];
    }

    // Update — PATCH partial update pattern

    public class AssignmentUpdateDto
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
        public string? Description
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Description)); }
        }
        public Guid? StatusId
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(StatusId)); }
        }
        public Guid? PriorityId
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(PriorityId)); }
        }
        public DateTimeOffset? DueDate
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(DueDate)); }
        }
        public decimal? TimeEstimate
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(TimeEstimate)); }
        }
        public Guid? SprintId
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(SprintId)); }
        }
        public Guid? ParentAssignmentId
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(ParentAssignmentId)); }
        }
    }

    // Assignees and labels managed via dedicated endpoints — not in update DTO

    //public record AssigneeIdsDto(IEnumerable<Guid> UserIds);
    //public record LabelIdsDto(IEnumerable<Guid> LabelIds);

    // Query
    // to check

    public class AssignmentQueryDto
    {
        // these queries can be absolutely massive if no filters
        // need a way to limit the size
        public Guid? SprintId { get; set; }
        public bool? Backlog { get; set; }           // true = no sprint assigned
        public Guid? AssigneeId { get; set; }
        public Guid? PriorityId { get; set; }
        public Guid? StatusId { get; set; }
        public Guid? LabelId { get; set; }
        public DateTimeOffset? DueFrom { get; set; } // calendar range
        public DateTimeOffset? DueTo { get; set; }
        //public bool? OnlyMine { get; set; }          // scoped to X-User-Id
        public DateTimeOffset? DueOn { get; set; }   // home page: specific day
        public int Page { get; set; } = 1;
        public int LimitPerStatus { get; set; } = 10;
    }

    public class AssignmentLabelCreateDto
    {
        public required string Name { get; set; }
        public required string HexColor { get; set; }
    }

    public class AssignmentLabelUpdateDto
    {
        private readonly HashSet<string> _setProperties = new();
        [JsonIgnore] public IReadOnlySet<string> SetProperties => _setProperties;

        public string? Name
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Name)); }
        }
        public string? HexColor
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(HexColor)); }
        }
    }
}
