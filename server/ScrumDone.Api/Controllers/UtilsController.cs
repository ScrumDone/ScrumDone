using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Utilities;

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

        [HttpGet("default-colors")]
        public async Task<IActionResult> GetDefaultColors()
        {
            return Ok(ColorHelper.HighlyDistinctColors.ToList());
        }
    }
}
