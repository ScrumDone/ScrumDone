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
        public required Guid PriorityId { get; set; }
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

        private string? _name;
        private string? _description;
        private Guid? _statusId;
        private Guid? _priorityId;
        private DateTimeOffset? _dueDate;
        private decimal? _timeEstimate;
        private Guid? _sprintId;
        private Guid? _parentAssignmentId;

        public string? Name
        {
            get => _name;
            set { _name = value; _setProperties.Add(nameof(Name)); }
        }
        public string? Description
        {
            get => _description;
            set { _description = value; _setProperties.Add(nameof(Description)); }
        }
        public Guid? StatusId
        {
            get => _statusId;
            set { _statusId = value; _setProperties.Add(nameof(StatusId)); }
        }
        public Guid? PriorityId
        {
            get => _priorityId;
            set { _priorityId = value; _setProperties.Add(nameof(PriorityId)); }
        }
        public DateTimeOffset? DueDate
        {
            get => _dueDate;
            set { _dueDate = value; _setProperties.Add(nameof(DueDate)); }
        }
        public decimal? TimeEstimate
        {
            get => _timeEstimate;
            set { _timeEstimate = value; _setProperties.Add(nameof(TimeEstimate)); }
        }
        public Guid? SprintId
        {
            get => _sprintId;
            set { _sprintId = value; _setProperties.Add(nameof(SprintId)); }
        }
        public Guid? ParentAssignmentId
        {
            get => _parentAssignmentId;
            set { _parentAssignmentId = value; _setProperties.Add(nameof(ParentAssignmentId)); }
        }
    }

    // Assignees and labels managed via dedicated endpoints — not in update DTO

    //public record AssigneeIdsDto(IEnumerable<Guid> UserIds);
    //public record LabelIdsDto(IEnumerable<Guid> LabelIds);

    // Query
    // to check

    public class AssignmentQueryDto
    {
        // thse queries can be absolutely massive if no filters
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

        private string? _name;
        private string? _hexColor;

        public string? Name
        {
            get => _name;
            set { _name = value; _setProperties.Add(nameof(Name)); }
        }
        public string? HexColor
        {
            get => _hexColor;
            set { _hexColor = value; _setProperties.Add(nameof(HexColor)); }
        }
    }
}
