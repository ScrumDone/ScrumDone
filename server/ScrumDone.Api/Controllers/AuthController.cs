using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.Services;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("invite")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create(
            [FromBody] UserInvitationDto dto,
            [FromServices] IValidator<UserInvitationDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            var results = await _authService.InviteUser(dto);
            // Adding return until email is implemented
            return Ok(results);
        }

        // register actually
        [HttpPost("register/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Register(
            [FromRoute] Guid id,
            [FromBody] UserRegistrationDto dto,
            [FromServices] IValidator<UserRegistrationDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            await _authService.RegisterUser(id, dto);

            return Ok();
        } 

        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ForgotPassword(
            [FromBody] ForgotPasswordDto dto,
            [FromServices] IValidator<ForgotPasswordDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            await _authService.ForgotPassword(dto);

            return Ok();
        }

        [HttpPost("reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ResetPassword(
            [FromBody] ResetPasswordDto dto,
            [FromServices] IValidator<ResetPasswordDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            await _authService.ResetPassword(dto);

            return Ok();
        } 

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Login(
            [FromBody] LoginDto dto)
        {
            await _authService.Login(dto);

            return Ok();
        }  

        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout()
        {
            await _authService.Logout();

            return Ok();
        }

        [HttpGet("roles")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _authService.GetRoles();
            return Ok(roles);
        }
    }
}
