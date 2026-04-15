namespace ScrumDone.Api.Data
{
    public class Sprint
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public bool IsKanban { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid ProjectId { get; set; }
        public Project Project { get; set; }
        public List<Task> Tasks { get; set; } = new();
    }
}
