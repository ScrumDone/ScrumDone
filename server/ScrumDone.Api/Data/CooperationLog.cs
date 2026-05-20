using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class CooperationLog : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        // no cooperation log type

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid AuthorId { get; set; }
        public Guid CompanyId { get; set; }
        public User Author { get; set; }
        public Company Company { get; set; }
    }
}
