namespace ScrumDone.Api.Data
{
    public class Task
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }  

        public Project Project { get; set; }
    }
}
