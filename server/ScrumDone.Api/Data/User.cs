namespace ScrumDone.Api.Data
{
    public class User
    {
        public Guid Id { get; set; }
        public bool IsManager { get; set; }
        public bool IsAdmin { get; set; }

        public List<Project> Projects { get; set; }
        public List<CompanyNote> CreatedCompanyNotes { get; set; }
        public List<CooperationLog> CreatedCooperationLogs { get; set; }
    }
}
