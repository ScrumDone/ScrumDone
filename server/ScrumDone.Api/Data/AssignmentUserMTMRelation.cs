using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class AssignmentUserMTMRelation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.Now;
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid AssignmentId { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Assignment Assignment { get; set; }
    }
}
