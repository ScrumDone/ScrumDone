namespace ScrumDone.Api.Data
{
    public class CompanyNote
    {
        public Guid Id { get; set; }
        public string Content { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid UserId { get; set; }
        public Guid CompanyId { get; set; }

        public User User { get; set; }
        public Company Company { get; set; }
    }
}
