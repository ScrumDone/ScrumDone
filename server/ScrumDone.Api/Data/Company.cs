namespace ScrumDone.Api.Data
{
    public class Company
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Nip { get; set; }
        public string? Krs { get; set; }
        public string? Regon { get; set; }
        public string? Address { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;


        public List<ContactPerson> ContactPeople { get; set; } = new();
        public List<Project> Projects { get; set; } = new();
        public List<CompanyNote> Notes { get; set; } = new();
    }
}
