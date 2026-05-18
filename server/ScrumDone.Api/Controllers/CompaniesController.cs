using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        // project linking in /projects/{id} and filtering for companies in /projects
        // for now we assume all users have access

        // /companies
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CompanyDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanies([FromQuery] CompanyQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompany([FromRoute] Guid id, [FromBody] CompanyUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompany([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        // /companies/{id}/notes

        [HttpGet("{id:guid}/notes")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/notes")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/notes/{NotesId:guid}")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompany([FromRoute] Guid NoteId, [FromBody] CompanyUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/notes/{NotesId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompany([FromRoute] Guid NoteId) => StatusCode(StatusCodes.Status501NotImplemented);

        // /companies/{id}/contacts

        [HttpGet("{id:guid}/contacts")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/contacts")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/contacts/{ContactId:guid}")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompany([FromRoute] Guid ContactId, [FromBody] CompanyUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/contacts/{ContactId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompany([FromRoute] Guid ContactId) => StatusCode(StatusCodes.Status501NotImplemented);


        // /companies/{id}/logs

        [HttpGet("{id:guid}/logs")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/logs")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/logs/{LogId:guid}")]
        [ProducesResponseType(typeof(CompanyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompany([FromRoute] Guid LogId, [FromBody] CompanyUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/logs/{LogId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompany([FromRoute] Guid LogId) => StatusCode(StatusCodes.Status501NotImplemented);
    }
}
