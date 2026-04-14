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


        public List<ContactPerson> ContactPeople { get; set; }
        public List<Project> Projects { get; set; }
        public List<CompanyNote> Notes { get; set; }
    }
}
