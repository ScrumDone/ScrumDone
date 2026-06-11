using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Services
{
    public interface IProjectsService
    {
        Task<PagedResultDto<ProjectListItemDto>> GetProjectsAsync(ProjectQueryDto query);

        Task<ProjectDetailDto> GetProjectByIdAsync(Guid id);
    
        Task<ProjectDetailDto> CreateProjectAsync(ProjectCreateDto dto);

        Task<ProjectDetailDto> UpdateProjectAsync(Guid id, ProjectUpdateDto dto);

        Task DeleteProjectAsync(Guid id);

        // team members
        Task<PagedResultDto<UserSummaryDto>> GetProjectMembersAsync(Guid id, TeamMembersQueryDto query);
    
        Task AddUserToProjectAsync(Guid id, Guid userId);

        Task RemoveUserFromProjectAsync(Guid id, Guid userId);

        // sprints
        Task<PagedResultDto<SprintSummaryDto>> GetSprintsAsync(Guid id, SprintQueryDto query);
        Task<SprintDetailDto> CreateSprintAsync(Guid id, SprintCreateDto dto);

        // assignments-labels
        Task<IEnumerable<AssignmentLabelDto>> GetAssignmentLabelsAsync(Guid id);
        Task<AssignmentLabelDto> CreateAssignmentLabelAsync(Guid id, AssignmentLabelCreateDto dto);
        Task<AssignmentLabelDto> UpdateAssignmentLabelAsync(Guid id, Guid labelId, AssignmentLabelUpdateDto dto);
        Task DeleteAssignmentLabelAsync(Guid id, Guid labelId);
    }
}
