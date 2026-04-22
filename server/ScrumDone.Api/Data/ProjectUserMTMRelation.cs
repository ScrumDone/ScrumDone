using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class ProjectUserMTMRelation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid ProjectId { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Project Project { get; set; }
    }
}
