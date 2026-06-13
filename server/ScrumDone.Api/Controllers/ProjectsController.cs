using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Services;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        // assignments are created and listed via /projects/{id}/assignments
        // sprints are created via /projects/{id}/sprints
        // labels are scoped per project via /projects/{id}/assignment-labels
        // order by created date desc unless otherwise specified
        // client-side filters (priority, status, assignee, label) applied after load — not query params here //Why not?

        private readonly IProjectsService _projectsService;

        public ProjectsController(IProjectsService projectsService)
        {
            _projectsService = projectsService;
        }

        // /projects

        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<ProjectListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetProjects(
            [FromQuery] ProjectQueryDto query,
            [FromServices] IValidator<ProjectQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            return Ok(await _projectsService.GetProjectsAsync(query));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetProject([FromRoute] Guid id)
        {
            return Ok(await _projectsService.GetProjectByIdAsync(id));
        }

        [HttpPost]
        [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProject(
            [FromBody] ProjectCreateDto dto,
            [FromServices] IValidator<ProjectCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            var result = await _projectsService.CreateProjectAsync(dto);
            return CreatedAtAction(nameof(GetProject), new {id = result.Id}, result);
        }

        [HttpPatch("{id}")]
        [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProject(
            [FromRoute] Guid id,
            [FromBody] ProjectUpdateDto dto,
            [FromServices] IValidator<ProjectUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            var result = await _projectsService.UpdateProjectAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProject([FromRoute] Guid id)
        {
            await _projectsService.DeleteProjectAsync(id);
            return NoContent();
        }

        // /projects/{id}/members

        [HttpGet("{id}/members")]
        [ProducesResponseType(typeof(IEnumerable<UserSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMembers(
            [FromRoute] Guid id,
            [FromQuery] TeamMembersQueryDto query,
            [FromServices] IValidator<TeamMembersQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            var result = await _projectsService.GetProjectMembersAsync(id, query);
            return Ok(result);
        }

        [HttpPost("{id}/members/{userId}")]
        [ProducesResponseType(typeof(IEnumerable<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> AddMember(
            [FromRoute] Guid id,
            [FromRoute] Guid userId)
        {
            var user = await _projectsService.AddUserToProjectAsync(id, userId);
            return CreatedAtAction(nameof(AddMember), new {id = id, userId = userId}, user);
        }

        [HttpDelete("{id}/members/{userId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> RemoveMember(
            [FromRoute] Guid id,
            [FromRoute] Guid userId)
        {
            await _projectsService.RemoveUserFromProjectAsync(id, userId);
            return NoContent();
        }

        // /projects/{id}/sprints
        [HttpGet("{id}/sprints/current")]
        [ProducesResponseType(typeof(SprintDetailDto), StatusCodes.Status200OK)]  // ← Summary
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentSprint(
            [FromRoute] Guid id)
        {
            var result = await _projectsService.GetCurrentSprintAsync(id);
            return Ok(result);
        }


        [HttpGet("{id}/sprints")]
        [ProducesResponseType(typeof(PagedResultDto<SprintSummaryDto>), StatusCodes.Status200OK)]  // ← Summary
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetSprints(
            [FromRoute] Guid id,
            [FromQuery] SprintQueryDto query,
            [FromServices] IValidator<SprintQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            var result = await _projectsService.GetSprintsAsync(id, query);
            return Ok(result);
        }

        [HttpPost("{id}/sprints")]
        [ProducesResponseType(typeof(SprintSummaryDto), StatusCodes.Status201Created)]  // ← Summary
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateSprint(
            [FromRoute] Guid id,
            [FromBody] SprintCreateDto dto,
            [FromServices] IValidator<SprintCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            var result = await _projectsService.CreateSprintAsync(id, dto);
            return CreatedAtAction(nameof(GetSprints), new {id = result.Id}, result);
        }

        // /projects/{id}/assignment-labels
        // labels are scoped per project — not global

        [HttpGet("{id}/assignment-labels")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentLabelDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetAssignmentLabels([FromRoute] Guid id)
        {
            var result = await _projectsService.GetAssignmentLabelsAsync(id);
            return Ok(result);
        }

        [HttpPost("{id}/assignment-labels")]
        [ProducesResponseType(typeof(AssignmentLabelDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateAssignmentLabel(
            [FromRoute] Guid id,
            [FromBody] AssignmentLabelCreateDto dto,
            [FromServices] IValidator<AssignmentLabelCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            var result = await _projectsService.CreateAssignmentLabelAsync(id, dto);
            return CreatedAtAction(nameof(GetAssignmentLabels), new { id = result.Id }, result);
        }

        [HttpPatch("{id}/assignment-labels/{labelId}")]
        [ProducesResponseType(typeof(AssignmentLabelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateAssignmentLabel(
            [FromRoute] Guid id,
            [FromRoute] Guid labelId,
            [FromBody] AssignmentLabelUpdateDto dto,
            [FromServices] IValidator<AssignmentLabelUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            var result = await _projectsService.UpdateAssignmentLabelAsync(id, labelId, dto);
            return Ok(result);
        }

        [HttpDelete("{id}/assignment-labels/{labelId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteAssignmentLabel(
            [FromRoute] Guid id,
            [FromRoute] Guid labelId)
        {
            await _projectsService.DeleteAssignmentLabelAsync(id, labelId);
            return NoContent();
        }

        // /projects/{id}/statuses

        [HttpGet("{id}/statuses")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentStatusDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IEnumerable<AssignmentStatusDto>> GetUsers()
        {
            var result = await _projectsService.GetAssignmentStatuses();
            return result;
        }
    }

}
