using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.Services;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SprintsController : ControllerBase
    {
                 // sprints are created via POST /projects/{id}/sprints
                 // this controller owns detail, update, delete, and assignment listing
                 // GET /sprints/{id}/assignments loads the full sprint dataset — no pagination
                 // client filters (priority, status, assignee, label) applied locally after load
                 // includeAssignments=true on /projects/{id}/sprints for expand-all

        private readonly ISprintsService _sprintsService;

        public SprintsController(ISprintsService sprintsService)
        {
            _sprintsService = sprintsService;
        }

        // /sprints/{id}

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(SprintDetailDto), StatusCodes.Status200OK)]  // ← Detail
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetSprint([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPatch("{id}")]
        [ProducesResponseType(typeof(SprintDetailDto), StatusCodes.Status200OK)]  // ← Detail
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateSprint(
            [FromRoute] Guid id,
            [FromBody] SprintUpdateDto dto,
            [FromServices] IValidator<SprintUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteSprint([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /sprints/{id}/assignments
        // returns all assignments for this sprint — no pagination, sprint is the natural bound
        // backlog handled via GET /projects/{id}/assignments?backlog=true instead

        [HttpGet("{id}/assignments")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetAssignments([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // add assignment to sprint and remove from sprint handled through UpdateAssignment
        
    }
}
