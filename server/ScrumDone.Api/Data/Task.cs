namespace ScrumDone.Api.Data
{
    public class Task
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public decimal? TimeEstimate { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid ProjectId { get; set; } 
        public Guid? SprintId { get; set; }
        public Guid StatusId { get; set; }
        public Guid PriorityId { get; set; }
        public List<File> Attachments { get; set; }
        public Project Project { get; set; }
        public Sprint? Sprint { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public List<User> Assignee { get; set; }
        public List<TaskLabel> Labels { get; set; }
        public List<Message> Comments { get; set; }
    }
}
