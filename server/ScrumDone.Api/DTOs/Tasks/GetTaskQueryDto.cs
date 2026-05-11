namespace ScrumDone.Api.DTOs.Tasks
{
    public class GetTaskByIdQueryDTO
    {
        public Guid Id { get; set; }
        public DateTimeOffset DeadlineBefore { get; set; }
        public DateTimeOffset DeadlineAfter { get; set; }
        public List<Guid> AssigneeIds { get; set; } 
    }
}
