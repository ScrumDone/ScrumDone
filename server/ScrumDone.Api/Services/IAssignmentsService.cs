using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;

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
    }
}
