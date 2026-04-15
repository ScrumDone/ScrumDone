namespace ScrumDone.Api.Data
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public string RelevantUrl { get; set; }


        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid? AuthorId { get; set; }
        public Guid NotifiedId { get; set; }
        public NotificationType NotificationType { get; set; }
        public User Author { get; set; }
        public User Notified { get; set; }
    }
}
