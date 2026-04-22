using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class TaskUserMTMRelation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Task Task { get; set; }
    }
}
