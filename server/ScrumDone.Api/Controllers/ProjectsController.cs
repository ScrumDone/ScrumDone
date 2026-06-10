using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetProject([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateProject(
            [FromBody] ProjectCreateDto dto,
            [FromServices] IValidator<ProjectCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPatch("{id}")]
        [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateProject(
            [FromRoute] Guid id,
            [FromBody] ProjectUpdateDto dto,
            [FromServices] IValidator<ProjectUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteProject([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /projects/{id}/members

        [HttpGet("{id}/members")]
        [ProducesResponseType(typeof(IEnumerable<UserSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetMembers([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPut("{id}/members")]
        [ProducesResponseType(typeof(IEnumerable<Guid>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateMembers(
            [FromRoute] Guid id,
            [FromBody] ProjectMembersUpdateDto dto,
            [FromServices] IValidator<ProjectMembersUpdateDto> validator) // add limit on allowed team members
        {
            await validator.ValidateAndThrowAsync(dto);

            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /projects/{id}/sprints

        [HttpGet("{id}/sprints")]
        [ProducesResponseType(typeof(PagedResultDto<SprintSummaryDto>), StatusCodes.Status200OK)]  // ← Summary
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetSprints(
            [FromRoute] Guid id,
            [FromQuery] SprintQueryDto query)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
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
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /projects/{id}/assignments
        // loads full dataset for the project — client filters by priority, status, assignee, label locally
        // backlog=true returns assignments with no sprint assigned

        // /projects/{id}/assignment-labels
        // labels are scoped per project — not global

        [HttpGet("{id}/assignment-labels")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentLabelDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetAssignmentLabels([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPost("{id}/assignment-labels")]
        [ProducesResponseType(typeof(AssignmentLabelDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateAssignmentLabel(
            [FromRoute] Guid id,
            [FromBody] LabelCreateDto dto,
            [FromServices] IValidator<LabelCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPatch("{id}/assignment-labels/{labelId}")]
        [ProducesResponseType(typeof(AssignmentLabelDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateAssignmentLabel(
            [FromRoute] Guid id,
            [FromRoute] Guid labelId,
            [FromBody] LabelUpdateDto dto,
            [FromServices] IValidator<LabelUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpDelete("{id:guid}/assignment-labels/{labelId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteAssignmentLabel(
            [FromRoute] Guid id,
            [FromRoute] Guid labelId)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }
    }

}
