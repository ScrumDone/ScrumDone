namespace ScrumDone.Api.Data
{
    public class Project
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsSetToScrum { get; set; } = false;
        public DateTimeOffset? ExpectedFinishDate { get; set; } = DateTimeOffset.UtcNow;

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public List<Task> Tasks { get; set; } = new();
        public List<File> Files { get; set; } = new();
        public List<ProjectUserMTMRelation> TeamMembers { get; set; } = new();
        public Company Company { get; set; }
        public List<Sprint> Sprints { get; set; } = new();
    }
}
