public enum ProjectInclude
{
    Users,
    Tasks,
    Files,
    Company
}

public class ProjectQueryDto : IPagination, ISort, ISearch
{
    public string? Search { get; set; }
    public List<Guid>? ProjectIds { get; set; }
    public List<Guid>? ClientIds { get; set; }
    public List<Guid>? UsersIds { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? ExpectedFinishDate { get; set; }
    public List<ProjectInclude>? Includes { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 
}