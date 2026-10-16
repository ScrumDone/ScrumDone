using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Services;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

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
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create(
            [FromBody] UserInvitationDto dto)
        {
            await _authService.InviteUser(dto);
            return NoContent();
        }

        // register actually
        [HttpPost("register/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Register(
            [FromRoute] Guid id,
            [FromBody] UserRegistrationDto dto)
        {
            await _authService.RegisterUser(id, dto);

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
    }
}
