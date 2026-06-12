using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Services
{
    public interface IAssignmentsService
    {
        //Assignments
        Task<PagedResultDto<AssignmentListItemDto>> GetAssignmentsAsync(AssignmentQueryDto query);

        Task<AssignmentDetailDto> GetAssignmentByIdAsync(Guid id);


        Task<AssignmentDetailDto> CreateAssignmentAsync(AssignmentCreateDto dto);

        Task<AssignmentDetailDto> UpdateAssignmentAsync(Guid id, AssignmentUpdateDto dto);

        Task DeleteAssignmentAsync(Guid id);

        Task<IEnumerable<UserSummaryDto>> UpdateAssigneesAsync(Guid id, AssignmentAssigneesUpdateDto dto);
        Task<IEnumerable<AssignmentLabelDto>> UpdateLabelsAsync(Guid id, AssignmentLabelsUpdateDto dto);
        // Task<IEnumerable<AssignmentStatusDto>> GetStatusesAsync();
        Task<IEnumerable<AssignmentPriorityDto>> GetPrioritiesAsync();
    }
}
