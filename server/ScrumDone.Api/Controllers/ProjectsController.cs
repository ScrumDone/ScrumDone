using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProjectsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetProjects([FromQuery] ProjectQueryDto query)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetProjectById([FromRoute] Guid id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateProject([FromBody] ProjectCreateDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateProject([FromRoute] Guid id, [FromBody] ProjectUpdateDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteProject([FromRoute] Guid id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }
}
