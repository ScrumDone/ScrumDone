namespace ScrumDone.Api.Data
{
    public class TaskTaskLabelMTMRelation
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid TaskId { get; set; }
        public Guid TaskLabelId { get; set; }
        public Task Task { get; set; }
        public TaskLabel TaskLabel { get; set; }
    }
}
