using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RaportsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RaportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetRaports([FromQuery] RaportQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RaportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetRaportById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(RaportDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateRaport([FromBody] RaportCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(RaportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateRaport([FromRoute] Guid id, [FromBody] RaportUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteRaport([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
