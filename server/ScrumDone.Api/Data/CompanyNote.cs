using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class CompanyNote : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Content { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid UserId { get; set; }
        public Guid CompanyId { get; set; }

        public User User { get; set; }
        public Company Company { get; set; }
    }
}
