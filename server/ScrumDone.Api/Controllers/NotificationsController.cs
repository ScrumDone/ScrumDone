using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs;

namespace ScrumDone.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationsController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<NotificationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetNotifications([FromQuery] NotificationQueryDto query)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult GetNotificationById([FromRoute] Guid id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpPost]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult CreateNotification([FromBody] NotificationCreateDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult UpdateNotification([FromRoute] Guid id, [FromBody] NotificationUpdateDto dto)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status501NotImplemented)]
    public IActionResult DeleteNotification([FromRoute] Guid id)
    {
        return StatusCode(StatusCodes.Status501NotImplemented);
    }
}
