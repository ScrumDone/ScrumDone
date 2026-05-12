using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class NotificationType : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string HexColor { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public List<Notification> Notifications { get; set; } = new();
    }
}
