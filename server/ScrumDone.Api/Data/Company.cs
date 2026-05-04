using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Company : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Nip { get; set; }
        public string? Krs { get; set; }
        public string? Regon { get; set; }
        public string? Address { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public List<ContactPerson> ContactPeople { get; set; } = new();
        public List<Project> Projects { get; set; } = new();
        public List<CompanyNote> Notes { get; set; } = new();
    }
}
