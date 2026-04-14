namespace ScrumDone.Api.Data
{
    public class CompanyNote
    {
        // Fields
        public Guid Id { get; set; }
        public string Content { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public Guid UserId { get; set; }
        public Guid CompanyId { get; set; }

        // Navigation properties

        public User User { get; set; }
        public Company Company { get; set; }
    }
}
