using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Task : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public decimal? TimeEstimate { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid ProjectId { get; set; } 
        public Guid? SprintId { get; set; }
        public Guid StatusId { get; set; }
        public Guid PriorityId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public List<File> Attachments { get; set; } = new();
        public Project Project { get; set; }
        public Sprint? Sprint { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public List<TaskUserMTMRelation> Assignees { get; set; } = new();
        public List<TaskTaskLabelMTMRelation> Labels { get; set; } = new();
        public List<Message> Comments { get; set; } = new();
        public Task? ParentTask { get; set; }
        public List<Task> SubTasks { get; set; } = new();
    }
}
