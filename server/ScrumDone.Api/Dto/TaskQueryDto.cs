public enum TaskPriority
{
    High,
    Medium,
    Low
}
public enum TaskInclude
{
    Users,
    Messages,
    ChildrenTasks,
    Project
}
public class TaskQueryDto: IPagination, ISort, ISearch
{
    public string? Search { get; set; } = null;
    public List<string>? Status { get; set; }
    public Guid? Id { get; set; }
    public List<Guid>? UserIds { get; set; }
    public Guid? ParentTaskId { get; set; }
    public List<Guid>? ProjectIds { get; set; }
    public List<TaskPriority>? TaskPriorities { get; set; }
    public List<TaskInclude>? Includes { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? SortBy { get; set; }
    public string? SortOrder { get; set; } 
}