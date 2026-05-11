using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SprintsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SprintDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetSprints([FromQuery] SprintQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetSprintById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateSprint([FromBody] SprintCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SprintDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateSprint([FromRoute] Guid id, [FromBody] SprintUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteSprint([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
