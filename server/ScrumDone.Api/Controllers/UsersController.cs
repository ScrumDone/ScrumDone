using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Services;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using FluentValidation;



namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // We don't have login yet, I propose only listing preseeded users
        // As of now we don't log authors anyways (asside from company notes)
        // If time allows we can persue it further with artifitial sessions
        // I would leave ony GET users for now

        private readonly IUsersService _usersService;

        public UsersController(IUsersService usersService)
        {
            _usersService = usersService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<UserSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] UserQueryDto query,
            [FromServices] IValidator<UserQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            return Ok(await _usersService.GetUsersAsync(query));
        }
        /*
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetUserById([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
            return Ok(await _usersService.GetUserByIdAsync(id));
        }

        [HttpPost]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // idk, what happens if role id is not found
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateUser(
            [FromBody] UserCreateDto dto,
            [FromServices] IValidator<UserCreateDto> validator
        )
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
            await validator.ValidateAndThrowAsync(dto);
            var result = await _usersService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUserById), new { id = result.Id }, result);
        }

        [HttpPatch("{id}")]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateUser(
            [FromRoute] Guid id,
            [FromBody] UserUpdateDto dto,
            [FromServices] IValidator<UserUpdateDto> validator
        )
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
            await validator.ValidateAndThrowAsync(dto);
            return Ok(await _usersService.UpdateUserAsync(id, dto));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteUser([FromRoute] Guid id)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
            await _usersService.DeleteUserAsync(id);
            return NoContent();
        }

        // special
        [HttpGet("/permissions")]
        [ProducesResponseType(typeof(IEnumerable<UserPermissionDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetUserRoles()
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
            return Ok(await _usersService.GetUserRolesAsync());
        }
        */
    }
}
