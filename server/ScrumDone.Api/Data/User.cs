namespace ScrumDone.Api.Data
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? ProfilePictureUrl { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid UserPermissionsTypeId { get; set; }
        public List<ProjectUserMTMRelation> Projects { get; set; } = new();
        public List<Message> Comments { get; set; } = new();
        public List<Task> AssignedTasks { get; set; } = new();
        public List<Raport> CreatedRaports { get; set; } = new();
        public UserPermissionsType UserPermissionsType { get; set; }
        public List<CompanyNote> CreatedCompanyNotes { get; set; } = new();
        public List<CooperationLog> CreatedCooperationLogs { get; set; } = new();
        public List<Notification> AuthoredNotifications { get; set; } = new();
        public List<Notification> ReceivedNotifications { get; set; } = new();
        public List<File> AuthoredFiles { get; set; } = new();
        public List<FileAccessMTMRelation> FileAccesses { get; set; } = new();
    }
}
