using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReactionsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ReactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetReactions([FromQuery] ReactionQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetReactionById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(ReactionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateReaction([FromBody] ReactionCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ReactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateReaction([FromRoute] Guid id, [FromBody] ReactionUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteReaction([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);
}
