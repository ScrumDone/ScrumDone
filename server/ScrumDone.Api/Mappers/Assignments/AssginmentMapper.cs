using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Users;
using System.Net.Mail;
using System.Net.NetworkInformation;

namespace ScrumDone.Api.Mappers.Assignments
{
    /*
    [Mapper]
    public static partial class AssginmentMapper
    {
        [MapProperty(nameof(Assignment.Status), nameof(AssignmentDetailDto.Status), Use = nameof(MapStatus))]
        [MapProperty(nameof(Assignment.Priority), nameof(AssignmentDetailDto.Priority), Use = nameof(MapPriority))]
        [MapProperty(nameof(Assignment.Project), nameof(AssignmentDetailDto.ProjectName), Use = nameof(GetProjectName))]
        [MapProperty(nameof(Assignment.Sprint), nameof(AssignmentDetailDto.SprintName), Use = nameof(GetSprintName))]
        [MapProperty(nameof(Assignment.Assignees), nameof(AssignmentDetailDto.Assignees), Use = nameof(MapAssignees))]
        [MapProperty(nameof(Assignment.Labels), nameof(AssignmentDetailDto.Labels), Use = nameof(MapLabels))]
        public static partial AssignmentDetailDto ToDetailDto(this Assignment assignment);

        private static AssignmentStatusDto MapStatus(AssignmentStatus s) =>
            new(s.Id, s.Name, s.HexColor, s.IsDefault);

        private static AssignmentPriorityDto? MapPriority(AssignmentPriority? p) =>
            p is null ? null : new(p.Id, p.Name, p.HexColor);

        private static string GetProjectName(Project p) => p.Name;

        private static string? GetSprintName(Sprint? s) => s?.Name;

        private static IEnumerable<UserSummaryDto> MapAssignees(
            ICollection<AssignmentUserMTMRelation> assignees) =>
            assignees.Select(a => new UserSummaryDto(a.User.Id, a.User.Name));

        private static IEnumerable<AssignmentLabelDto> MapLabels(
            ICollection<AssignmentAssignmentLabelMTMRelation> labels) =>
            labels.Select(l => new AssignmentLabelDto(
                l.AssignmentLabel.Id,
                l.AssignmentLabel.Name,
                l.AssignmentLabel.HexColor));
    }
    */
}
