using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Services;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;



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
        private readonly UserManager<User> _userManager;

        public UsersController(IUsersService usersService, UserManager<User> userManager)
        {
            _usersService = usersService;
            _userManager = userManager;
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<UserSummaryDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] UserQueryDto query,
            [FromServices] IValidator<UserQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            return Ok(await _usersService.GetUsersAsync(query));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUser(
            [FromRoute] Guid id)
        {
            return Ok(await _usersService.GetUserAsync(id));
        }

        [HttpGet("current")]
        [ProducesResponseType(typeof(PagedResultDto<UserSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdString = _userManager.GetUserId(User);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            return Ok(await _usersService.GetUserAsync(userId));
        }

        [HttpPatch("current")]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> EditCurrentUser(
            [FromBody] UserUpdateDto dto,
            [FromServices] IValidator<UserUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);

            var userIdString = _userManager.GetUserId(User);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            return Ok(await _usersService.EditUserAsync(userId, dto));
        }

        // Admin
        [HttpPatch("{id}/admin")]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AdminEditUser(
            [FromRoute] Guid id,
            [FromBody] UserUpdateDto dto,
            [FromServices] IValidator<UserUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);

            return Ok(await _usersService.EditUserAsync(id, dto));
        }

        // Admin
        [HttpPatch("remove/{id}")]
        [ProducesResponseType(typeof(PagedResultDto<UserSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveUser(
            [FromRoute] Guid id)
        {
            await _usersService.RemoveUserAsync(id);
            return Ok();
        }

        [HttpPut("{id}/roles")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddRoles(
            [FromRoute] Guid id,
            [FromBody] UserAddRolesDto dto,
            [FromServices] IValidator<UserAddRolesDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            await _usersService.ModifyRolesAsync(id, dto);

            return Ok();
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
