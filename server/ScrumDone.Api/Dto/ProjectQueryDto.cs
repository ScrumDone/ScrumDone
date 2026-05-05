using ScrumDone.Api.Data;

public class ProjectQueryDto : IPagination, ISort, ISearch
{
    public string? Search { get; set; }
    public Guid? CompanyId { get; set; }
    public Guid? ProjectId { get; set; }
    public DateTimeOffset? ExpectedFinishDate;

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 

    // optional includes, heavy data that may benefit some views
    // ensure clients know what possible includes there are
    // consider using enums on the backend
    // public List<string>? Include { get; set; } or some other structure
}