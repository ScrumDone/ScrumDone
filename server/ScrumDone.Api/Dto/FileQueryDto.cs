public enum FileInclude
{
    UsersWithAccess,
    Project,
    Company
}

public class FileQueryDto : IPagination, ISort, ISearch
{
    public string? Search { get; set; } = null;
    public List<string>? Labels { get; set; }
    public List<string>? FileType { get; set; }

    public Guid? ProjectId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? AuthorId { get; set; }
    public List<FileInclude>? Includes { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 
}