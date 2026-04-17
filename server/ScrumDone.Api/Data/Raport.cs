namespace ScrumDone.Api.Data
{
    public class Raport
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid AuthorId { get; set; }
        public User Author { get; set; }
    }
}
