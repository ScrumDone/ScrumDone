namespace ScrumDone.Api.Data
{
    public class Project
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset ExpectedFinishDate { get; set; } = DateTimeOffset.UtcNow;
        public List<Task> Tasks { get; set; } = new();
        public List<File> Files { get; set; } = new();
        public List<User> TeamMembers { get; set; } = new();
        public Company Company { get; set; }
    }
}
