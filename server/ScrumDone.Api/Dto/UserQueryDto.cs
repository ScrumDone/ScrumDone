using ScrumDone.Api.Data;

public class UserQueryDto: IPagination, ISort, ISearch
{
    public Guid? Id { get; set; }

    public string? Search { get; set; } = null;

    public Guid? CompanyId { get; set; }
    
    public Guid? ProjectId { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 
}