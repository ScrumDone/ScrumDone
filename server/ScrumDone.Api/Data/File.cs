namespace ScrumDone.Api.Data
{
    public class File
    {
        public Guid Id { get; set; }
        public string OldFileName { get; set; }
        public string FilePath { get; set; }
        public bool IsPublic { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid AuthorId { get; set; }
        public Guid? TaskId { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? MessageId { get; set; }
        public User Author { get; set; }
        public Task? Task { get; set; }
        public Project? Project { get; set; }
        public Message? Message { get; set; }
        public List<FileAccessMTMRelation> PermitedUsers { get; set; } = new();
    }
}
