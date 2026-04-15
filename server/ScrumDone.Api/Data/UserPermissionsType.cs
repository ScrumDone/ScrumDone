namespace ScrumDone.Api.Data
{
    public class UserPermissionsType
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public List<User> Users { get; set; } = new();
    }
}
