namespace ScrumDone.Api.Data
{
    public class ProjectUserMTMRelation
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid ProjectId { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Project Project { get; set; }
    }
}
