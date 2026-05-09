public enum UserType
{
    Developer,
    Manager,
    Admin
}

public enum UserInclude
{
    Tasks,
    Projects,
    Messages,
    Files,
    Companies
}
public class UserQueryDto: IPagination, ISort, ISearch
{
    public string? Search { get; set; } = null;
    public List<Guid>? Ids { get; set; }
    public List<Guid>? ClientIds { get; set; } //mam  wątpliwości
    public List<Guid>? ProjectIds { get; set; }
    public List<UserType>? UserTypes { get; set; }
    public List<UserInclude>? Includes { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 
}