using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetFiles([FromQuery] ClientQueryDto query)
        {
            return StatusCode(StatusCodes.Status501NotImplemented);
        }
    }
}