using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class AssignmentAssignmentLabelMTMRelation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid AssignmentId { get; set; }
        public Guid AssignmentLabelId { get; set; }
        public Assignment Assignment { get; set; }
        public AssignmentLabel AssignmentLabel { get; set; }
    }
}
