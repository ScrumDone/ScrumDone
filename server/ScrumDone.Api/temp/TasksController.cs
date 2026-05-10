using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetFiles([FromQuery] TaskQueryDto query)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }
    }
}