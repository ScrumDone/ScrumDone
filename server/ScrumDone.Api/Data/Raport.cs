using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Raport : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid AuthorId { get; set; }
        public User Author { get; set; }
    }
}
