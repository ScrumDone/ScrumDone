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
        [ProducesResponseType(typeof(IEnumerable<CompanyListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanies([FromQuery] CompanyQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CompanyDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyById([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost]
        [ProducesResponseType(typeof(CompanyDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}")]
        [ProducesResponseType(typeof(CompanyDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompany([FromRoute] Guid id, [FromBody] CompanyUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompany([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        // /companies/{id}/notes

        [HttpGet("{id:guid}/notes")]
        [ProducesResponseType(typeof(PagedResultDto<CompanyNoteDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyNotes([FromRoute] Guid id, [FromQuery] PaginationQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/notes")]
        [ProducesResponseType(typeof(CompanyNoteDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompanyNote([FromRoute] Guid id, [FromBody] CompanyNoteCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/notes/{NotesId:guid}")]
        [ProducesResponseType(typeof(CompanyNoteDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompanyNote([FromRoute] Guid id, [FromRoute] Guid noteId, [FromBody] CompanyNoteUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/notes/{NotesId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompanyNote([FromRoute] Guid id, [FromRoute] Guid noteId) => StatusCode(StatusCodes.Status501NotImplemented);

        // /companies/{id}/contacts

        [HttpGet("{id:guid}/contacts")]
        [ProducesResponseType(typeof(IEnumerable<ContactPersonDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyContacts([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/contacts")]
        [ProducesResponseType(typeof(ContactPersonDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompanyContact([FromRoute] Guid id, [FromBody] ContactPersonCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/contacts/{ContactId:guid}")]
        [ProducesResponseType(typeof(ContactPersonDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompanyContact([FromRoute] Guid id, [FromRoute] Guid contactId, [FromBody] ContactPersonUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/contacts/{ContactId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompanyContact([FromRoute] Guid id, [FromRoute] Guid contactId) => StatusCode(StatusCodes.Status501NotImplemented);


        // /companies/{id}/logs

        [HttpGet("{id:guid}/logs")]
        [ProducesResponseType(typeof(IEnumerable<CompanyLogDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyLogs([FromRoute] Guid id) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/logs")]
        [ProducesResponseType(typeof(CompanyLogDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompanyLog([FromBody] CompanyCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/logs/{LogId:guid}")]
        [ProducesResponseType(typeof(CompanyLogDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompanyLog([FromRoute] Guid LogId, [FromBody] CompanyUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/logs/{LogId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompanyLog([FromRoute] Guid LogId) => StatusCode(StatusCodes.Status501NotImplemented);
    }
}
