using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Projects
{
    public record AssignmentStatusCountDto(
        Guid StatusId,
        string StatusName,
        string StatusHexColor,
        int Count
    );

    public record ProjectListItemDto(
        Guid Id,
        string Name,
        string Description,
        bool IsActive,
        bool IsSetToScrum,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset? StartDate,
        DateTimeOffset? ExpectedFinishDate,
        //string? ProfilePictureUrl,
        Guid? CompanyId,
        string? CompanyName,
        int TeamMemberCount,
        int AssignmentCount,
        IEnumerable<AssignmentStatusCountDto> AssignmentStatusCounts
    );

    public record ProjectDetailDto(
        Guid Id,
        string Name,
        string Description,
        bool IsActive,
        bool IsSetToScrum,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        DateTimeOffset StartDate,
        DateTimeOffset? ExpectedFinishDate,
        //string? ProfilePictureUrl,
        Guid? CompanyId,
        string? CompanyName,
        int TeamMemberCount,
        int AssignmentCount,
        IEnumerable<AssignmentStatusCountDto> AssignmentStatusCounts,
        IEnumerable<UserSummaryDto> TeamMembers,
        IEnumerable<SprintSummaryDto> Sprints
    );

    public class ProjectCreateDto
    {
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsSetToScrum { get; set; } = false;
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? ExpectedFinishDate { get; set; }
        public Guid? CompanyId { get; set; }
        // public string? ProfilePictureUrl { get; set; }
        public IEnumerable<Guid> TeamMemberIds { get; set; }
    }


    public class ProjectUpdateDto
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
        public bool? IsActive
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(IsActive)); }
        }
        public bool? IsSetToScrum
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(IsSetToScrum)); }
        }
        public DateTimeOffset? StartDate
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(StartDate)); }
        }
        public DateTimeOffset? ExpectedFinishDate
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(ExpectedFinishDate)); }
        }
        public Guid? CompanyId
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(CompanyId)); }
        }
        //not yet time for this
        //public string? ProfilePictureUrl
        //{
        //    get => field;
        //    set { field = value; _setProperties.Add(nameof(ProfilePictureUrl)); }
        //}
    }

    public class ProjectQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        public Guid? CompanyId { get; set; }
        public Guid? UserId { get; set; }
        //public bool? OnlyMine { get; set; }    // scoped to X-User-Id
        public bool? IsActive { get; set; }
    }

    public class LabelCreateDto
    {
        public required string Name { get; set; }
        public required string HexColor { get; set; }
    }

    public class LabelUpdateDto
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

    public class ProjectMembersUpdateDto
    {
        public IEnumerable<Guid> UserIds { get; set; } = [];
    }

}

