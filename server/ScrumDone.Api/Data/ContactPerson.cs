namespace ScrumDone.Api.Data
{
    public class ContactPerson
    {
        // To validate on POST if atleast one field != null
        public Guid Id { get; set; }
        public bool IsPrimary { get; set; } = false;
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
