using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class ContactPerson : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        // To validate on POST if atleast one field != null
        public Guid Id { get; set; }
        public bool IsPrimary { get; set; } = false;
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid CompanyId { get; set; }
    }
}
