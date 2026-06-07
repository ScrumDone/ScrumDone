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

    // List item — home page projects, projects main screen

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
        string? ProfilePictureUrl,
        Guid? CompanyId,
        string? CompanyName,
        int TeamMemberCount,
        int AssignmentCount,
        IEnumerable<AssignmentStatusCountDto> AssignmentStatusCounts
    );

    // Full detail — project main screen

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
        string? ProfilePictureUrl,
        Guid? CompanyId,
        string? CompanyName,
        int TeamMemberCount,
        int AssignmentCount,
        IEnumerable<AssignmentStatusCountDto> AssignmentStatusCounts,
        IEnumerable<UserSummaryDto> TeamMembers,
        IEnumerable<SprintSummaryDto> Sprints
    );

    // Create

    public class ProjectCreateDto
    {
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsSetToScrum { get; set; } = false;
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? ExpectedFinishDate { get; set; }
        public Guid? CompanyId { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public IEnumerable<Guid> TeamMemberIds { get; set; }
    }

        // Update — PATCH partial update pattern

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

        private string? _name;
        private string? _description;
        private bool? _isActive;
        private bool? _isSetToScrum;
        private DateTimeOffset? _startDate;
        private DateTimeOffset? _expectedFinishDate;
        private Guid? _companyId;
        private string? _profilePictureUrl;

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
        public bool? IsActive
        {
            get => _isActive;
            set { _isActive = value; _setProperties.Add(nameof(IsActive)); }
        }
        public bool? IsSetToScrum
        {
            get => _isSetToScrum;
            set { _isSetToScrum = value; _setProperties.Add(nameof(IsSetToScrum)); }
        }
        public DateTimeOffset? StartDate
        {
            get => _startDate;
            set { _startDate = value; _setProperties.Add(nameof(StartDate)); }
        }
        public DateTimeOffset? ExpectedFinishDate
        {
            get => _expectedFinishDate;
            set { _expectedFinishDate = value; _setProperties.Add(nameof(ExpectedFinishDate)); }
        }
        public Guid? CompanyId
        {
            get => _companyId;
            set { _companyId = value; _setProperties.Add(nameof(CompanyId)); }
        }
        public string? ProfilePictureUrl
        {
            get => _profilePictureUrl;
            set { _profilePictureUrl = value; _setProperties.Add(nameof(ProfilePictureUrl)); }
        }
    }

    // Query

    public class ProjectQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        //public bool? OnlyMine { get; set; }    // scoped to X-User-Id
        public bool? IsActive { get; set; }
    }

    // Team member management

    //public record TeamMemberIdsDto(IEnumerable<Guid> UserIds);
}

