using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Services;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssignmentsController : ControllerBase
    {
        // assignments are created via POST /projects/{id}/assignments
        // GET /assignments is for cross-project views only: home page and calendar
        //   requires onlyMine=true OR (dueFrom + dueTo) to prevent unbounded queries
        // GET /projects/{id}/assignments and GET /sprints/{id}/assignments are the scoped versions
        // subtasks are created via POST /projects/{id}/assignments with parentAssignmentId in body
        // assignees and labels managed via dedicated sub-routes (MTM attach/detach)

        private readonly IAssignmentsService _assignmentsService;

        public AssignmentsController(IAssignmentsService assignmentsService)
        {
            _assignmentsService = assignmentsService;
        }

        // /assignments
        // cross-project: home page (onlyMine=true&dueOn=today) and calendar (dueFrom+dueTo)
        // requires at least one scope filter — returns 400 if neither onlyMine nor date range provided

        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<AssignmentListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetAssignments(
            [FromQuery] AssignmentQueryDto query,
            [FromServices] IValidator<AssignmentQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(AssignmentDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetAssignment([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPost]
        [ProducesResponseType(typeof(AssignmentDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateAssignment(
            [FromBody] AssignmentCreateDto dto,
            [FromServices] IValidator<AssignmentCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpPatch("{id:guid}")]
        [ProducesResponseType(typeof(AssignmentDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateAssignment(
            [FromRoute] Guid id,
            [FromBody] AssignmentUpdateDto dto,
            [FromServices] IValidator<AssignmentUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteAssignment([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /assignments/{id}/subtasks
        // read-only convenience view — subtasks created via POST /projects/{id}/assignments with parentAssignmentId
        // returns AssignmentListItemDto[] which includes SubtaskIds for hover-highlight chaining

        //[HttpGet("{id:guid}/subtasks")]
        //[ProducesResponseType(typeof(IEnumerable<AssignmentListItemDto>), StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //[ProducesResponseType(StatusCodes.Status501NotImplemented)]
        //public async Task<IActionResult> GetSubtasks([FromRoute] Guid id)
        //{
        //    return StatusCode(StatusCodes.Status501NotImplemented);
        //}

        // /assignments/{id}/assignees
        // attach/detach users — TaskUserMTMTable
        // no GET: current assignees are embedded in AssignmentListItemDto and AssignmentDetailDto

        [HttpPut("{id:guid}/assignees")]
        [ProducesResponseType(typeof(IEnumerable<UserSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateAssignees(
            [FromRoute] Guid id,
            [FromBody] AssignmentAssigneesUpdateDto dto,
            [FromServices] IValidator<AssignmentAssigneesUpdateDto> validator) // add limit on allowed team members
        {
            await validator.ValidateAndThrowAsync(dto);

            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /assignments/{id}/labels
        // attach/detach project-scoped labels — TaskTaskLabelMTMTable
        // no GET: current labels embedded in AssignmentListItemDto and AssignmentDetailDto

        [HttpPut("{id:guid}/labels")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentLabelDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateLabels(
            [FromRoute] Guid id,
            [FromBody] AssignmentLabelsUpdateDto dto,
            [FromServices] IValidator<AssignmentLabelsUpdateDto> validator) // add limit on allowed team members
        {
            await validator.ValidateAndThrowAsync(dto);

            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /assignment-statuses

        [HttpGet("statuses")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentStatusDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetStatuses()
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }

        // /assignment-priorities

        [HttpGet("priorities")]
        [ProducesResponseType(typeof(IEnumerable<AssignmentPriorityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetPriorities()
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }
    }
}
