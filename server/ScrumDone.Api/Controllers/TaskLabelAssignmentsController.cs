using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/task-label-assignments")]
[ApiController]
public class TaskLabelAssignmentsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskLabelAssignmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetTaskLabelAssignments([FromQuery] PagedQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(TaskLabelAssignmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult AddTaskLabelAssignment([FromBody] TaskLabelAssignmentCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult RemoveTaskLabelAssignment([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
