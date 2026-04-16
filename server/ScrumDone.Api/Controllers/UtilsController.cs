using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UtilsController : ControllerBase
    {
        [HttpGet("health")]
        public async Task<IActionResult> GetHealth()
        {
            return Ok(new { status = "Healthy" });
        }
    }
}
