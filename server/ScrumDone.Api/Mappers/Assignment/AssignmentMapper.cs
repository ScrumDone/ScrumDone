using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Users;
using System.Reflection.Emit;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class AssignmentMapper
    {
        // [MapProperty(nameof(Assignment.SubAssignments), nameof(AssignmentListItemDto.SubtaskIds), Use=nameof(GetSubtasksIds))]
        [MapProperty(nameof(Assignment.Assignees), nameof(AssignmentListItemDto.Assignees), Use=nameof(MapUsers))]
        [MapProperty(nameof(Assignment.Labels), nameof(AssignmentListItemDto.Labels), Use=nameof(MapLabels))]
        public static partial AssignmentListItemDto ToListItemDto(this Assignment assignment);

        public static IEnumerable<Guid> GetSubtasksIds(ICollection<Assignment> assignment) => assignment.Select(a => a.Id);
        public static IEnumerable<UserSummaryDto> MapUsers(ICollection<AssignmentUserMTMRelation> asignees) => asignees.Select(a => a.User.ToSummaryDto());
        public static IEnumerable<AssignmentLabelDto> MapLabels(ICollection<AssignmentAssignmentLabelMTMRelation> labels) => labels.Select(l => l.AssignmentLabel.ToDto());

    }
}
