public enum ClientInclude
{
    Projects,
    Files,
    Contacts
}
public class ClientQueryDto: IPagination, ISort, ISearch
{
    public string? Search { get; set; } = null;
    public Guid? Id { get; set; }
    public Guid? FileId { get; set; }
    public Guid? ProjectId { get; set; }
    public List<ClientInclude>? Includes { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 
}