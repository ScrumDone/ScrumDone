using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    [HttpGet("self")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetSelf()
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetUsers([FromQuery] UserQueryDto query)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetUserById([FromRoute] Guid id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateUser([FromBody] UserCreateDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateUser([FromRoute] Guid id, [FromBody] UserUpdateDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteUser([FromRoute] Guid id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }
}
