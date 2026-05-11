using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TaskStatusesController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskStatusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetTaskStatuses([FromQuery] PagedQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetTaskStatusById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(TaskStatusDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateTaskStatus([FromBody] TaskStatusCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateTaskStatus([FromRoute] Guid id, [FromBody] TaskStatusUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteTaskStatus([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
