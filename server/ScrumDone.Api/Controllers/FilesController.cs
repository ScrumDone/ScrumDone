using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<FileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetFiles([FromQuery] FileQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetFileById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost]
    [ProducesResponseType(typeof(FileDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateFile([FromBody] FileCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(FileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateFile([FromRoute] Guid id, [FromBody] FileUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteFile([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpGet("{fileId:guid}/access")]
    [ProducesResponseType(typeof(IEnumerable<FileAccessDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetFileAccess([FromRoute] Guid fileId) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpPost("{fileId:guid}/access")]
    [ProducesResponseType(typeof(FileAccessDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GrantFileAccess([FromRoute] Guid fileId, [FromBody] FileAccessCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

    [HttpDelete("{fileId:guid}/access/{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult RevokeFileAccess([FromRoute] Guid fileId, [FromRoute] Guid userId) => StatusCode(StatusCodes.Status501NotImplemented);
}
