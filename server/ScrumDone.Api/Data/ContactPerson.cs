namespace ScrumDone.Api.Data
{
    public class ContactPerson
    {
        // To validate on POST if atleast one field != null
        public Guid Id { get; set; }
        public bool isPrimary { get; set; }
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
    }
}
