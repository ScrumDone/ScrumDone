using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Assignment : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
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
        public Guid? ParentAssignmentId { get; set; }
        public List<File> Attachments { get; set; } = new();
        public Project Project { get; set; }
        public Sprint? Sprint { get; set; }
        public AssignmentStatus Status { get; set; }
        public AssignmentPriority Priority { get; set; }
        public List<AssignmentUserMTMRelation> Assignees { get; set; } = new();
        public List<AssignmentAssignmentLabelMTMRelation> Labels { get; set; } = new();
        public List<Message> Comments { get; set; } = new();
        public Assignment? ParentAssignment { get; set; }
        public List<Assignment> SubAssignments { get; set; } = new();
    }
}
