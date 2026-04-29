using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class TaskTaskLabelMTMRelation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid TaskId { get; set; }
        public Guid TaskLabelId { get; set; }
        public Task Task { get; set; }
        public TaskLabel TaskLabel { get; set; }
    }
}
