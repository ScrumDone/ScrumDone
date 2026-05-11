using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/task-assignees")]
[ApiController]
public class TaskAssigneesController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskAssigneeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetTaskAssignees([FromQuery] PagedQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(TaskAssigneeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult AddTaskAssignee([FromBody] TaskAssigneeCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult RemoveTaskAssignee([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
