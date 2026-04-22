using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Notification : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public string RelevantUrl { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid? AuthorId { get; set; }
        public Guid NotifiedId { get; set; }
        public NotificationType NotificationType { get; set; }
        public User Author { get; set; }
        public User Notified { get; set; }
    }
}
