using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CooperationLogsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CooperationLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetCooperationLogs([FromQuery] CooperationLogQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CooperationLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetCooperationLogById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(CooperationLogDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateCooperationLog([FromBody] CooperationLogCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CooperationLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateCooperationLog([FromRoute] Guid id, [FromBody] CooperationLogUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteCooperationLog([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
