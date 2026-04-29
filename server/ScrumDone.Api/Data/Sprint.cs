using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Sprint : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public bool IsKanban { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid ProjectId { get; set; }
        public Project Project { get; set; }
        public List<Task> Tasks { get; set; } = new();
    }
}
