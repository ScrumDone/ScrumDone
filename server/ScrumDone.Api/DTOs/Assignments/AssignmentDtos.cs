using ScrumDone.Api.DTOs.Users;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Assignments
{
    public record AssignmentStatusDto(
        Guid Id,
        string Name,
        string HexColor,
        int Order
    );

    public record AssignmentPriorityDto(
        Guid Id,
        string Name,
        string HexColor,
        int Order
    );

    public record AssignmentLabelDto(
        Guid Id,
        string Name,
        string HexColor
    );

    public class AssignmentLabelCreateDto
    {
        public string Name { get; set; }
        public string HexColor { get; set; }
    };

    public class AssignmentLabelUpdateDto
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
        public string? HexColor
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(HexColor)); }
        }
    }

    public record AssignmentListItemDto(
        Guid Id,
        string Name,
        string? Description,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? DueDate,
        decimal? TimeEstimate,
        AssignmentStatusDto Status,
        AssignmentPriorityDto? Priority,
        IEnumerable<UserSummaryDto> Assignees,
        IEnumerable<AssignmentLabelDto> Labels,
        // flat list, frontend can compute tree with ParentAssignmentId if needed
        //IEnumerable<Guid> SubtaskIds,
        Guid ProjectId,
        string ProjectName,
        Guid? SprintId
        //Guid? ParentAssignmentId
    );

    public record AssignmentDetailDto(
        Guid Id,
        string Name,
        string? Description,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? DueDate,
        decimal? TimeEstimate,
        AssignmentStatusDto Status,
        AssignmentPriorityDto? Priority,
        IEnumerable<UserSummaryDto> Assignees,
        IEnumerable<AssignmentLabelDto> Labels,
        //IEnumerable<AssignmentListItemDto> Subtask,
        // All tasks in a tree
        //IEnumerable<AssignmentListItemDto> ConnectedTasks,
        string ProjectName,
        Guid ProjectId,
        string? SprintName,
        Guid? SprintId
        //string? ParentAssignmentName,
        //Guid? ParentAssignmentId
    );

    public class AssignmentCreateDto
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required Guid ProjectId { get; set; }
        public Guid? StatusId { get; set; }
        public Guid? PriorityId { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public decimal? TimeEstimate { get; set; }
        public Guid? SprintId { get; set; }
        //public Guid? ParentAssignmentId { get; set; }
        public IEnumerable<Guid> AssigneeIds { get; set; } = [];
        public IEnumerable<Guid> LabelIds { get; set; } = [];
    }

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
        //public Guid? ProjectId
        //{
        //    get => field;
        //    set { field = value; _setProperties.Add(nameof(ProjectId)); }
        //}
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
        //public Guid? ParentAssignmentId
        //{
        //    get => field;
        //    set { field = value; _setProperties.Add(nameof(ParentAssignmentId)); }
        //}
    }

    public class AssignmentQueryDto
    {
        // these queries can be absolutely massive if no filters
        // need a way to limit the size
        public IEnumerable<Guid>? SprintIds { get; set; }
        public IEnumerable<Guid>? ProjectIds { get; set; }
        public bool? Backlog { get; set; }           // true = no sprint assigned
        public IEnumerable<Guid>? AssigneeIds { get; set; }
        public IEnumerable<Guid>? PriorityIds { get; set; }
        public IEnumerable<Guid>? StatusIds { get; set; }
        public IEnumerable<Guid>? LabelIds { get; set; }
        public DateTimeOffset? DueOnOrAfter { get; set; } // calendar range
        public DateTimeOffset? DueOnOrBefore { get; set; }
        //public bool? OnlyMine { get; set; }          // scoped to X-User-Id

        public bool? ExcludeNoDeadline { get; set; } = false; // for calendar view to include backlog items with no deadline
                                                     
        
        // pagination doesn't work for kanban view
        // I think we will need to validate it manually to warn if it gets too big
        public int Page { get; set; } = 1; 
        public int Limit { get; set; } = 10; 
    }

    public class AssignmentLabelsUpdateDto
    {
        public List<Guid> LabelIds { get; set; } = [];
    }

    public class AssignmentAssigneesUpdateDto
    {
        public List<Guid> UserIds { get; set; } = [];
    }
}
