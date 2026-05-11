namespace ScrumDone.Api.DTOs.Tasks
{
    public class GetTasksDTO
    {
        public Guid Id { get; set; }

        public string Name { get; set; }
        public string Priority { get; set; }

        public Guid ProjectId { get; set; }
        public string Project { get; set; }

        public Guid ProjectAuthorId { get; set; }
        public string ProjectAuthor { get; set; }

        public Guid DueDate { get; set; }
    }
}
