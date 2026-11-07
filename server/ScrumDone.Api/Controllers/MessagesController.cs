using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Messages;
using ScrumDone.Api.Services;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IMessagesService _messagesService;

        public MessagesController(UserManager<User> userManager, IMessagesService messagesService)
        {
            _userManager = userManager;
            _messagesService = messagesService;
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PagedResultDto<MessageDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetMessages(
            [FromRoute] Guid id,
            [FromQuery] MessagesQueryDto query,
            [FromServices] IValidator<MessagesQueryDto> validator)
        {
            await validator.ValidateAndThrowAsync(query);
            return Ok(await _messagesService.GetMessagesForAssignmentAsync(id, query));
        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(MessageDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateMessage(
            [FromRoute] Guid id,
            [FromBody] MessageCreateDto dto,
            [FromServices] IValidator<MessageCreateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);

            var userIdString = _userManager.GetUserId(User);
            if (!Guid.TryParse(userIdString, out var authorId))
            {
                return Unauthorized();
            }

            var result = await _messagesService.CreateMessageForAssignmentAsync(id, dto, authorId);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPatch("{id}")]
        [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMessage(
            [FromRoute] Guid id,
            [FromBody] MessageUpdateDto dto,
            [FromServices] IValidator<MessageUpdateDto> validator)
        {
            await validator.ValidateAndThrowAsync(dto);
            return Ok(await _messagesService.UpdateMessageAsync(id, dto));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMessage([FromRoute] Guid id)
        {
            await _messagesService.DeleteMessageAsync(id);
            return NoContent();
        }
    }
}
