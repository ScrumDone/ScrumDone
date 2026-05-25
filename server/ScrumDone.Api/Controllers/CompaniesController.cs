using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Services;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ScrumDone.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompaniesController : ControllerBase
    {
        // project linking in /projects/{id} and filtering for companies in /projects
        // for now we assume all users have access
        // order by may be added and automated later, but for now we just order by created date desc
        // search (filtering) to be implemented later too

        private readonly ICompaniesService _companiesService;

        public CompaniesController(ICompaniesService companiesService) 
        {
            _companiesService = companiesService;
        }

        // /companies
        [HttpGet]
        [ProducesResponseType(typeof(PagedResultDto<CompanyListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanies([FromQuery] CompanyQueryDto query)
        {
            return Ok(await _companiesService.GetCompaniesAsync(query));
        }

        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(CompanyDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyById([FromRoute] Guid id)
        {
            return Ok(await _companiesService.GetCompanyByIdAsync(id));
        }

        [HttpPost]
        [ProducesResponseType(typeof(CompanyDetailDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompany([FromBody] CompanyCreateDto dto)
        {
            return Ok(await _companiesService.CreateCompanyAsync(dto));
        }

        [HttpPatch("{id:guid}")]
        [ProducesResponseType(typeof(CompanyDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompany([FromRoute] Guid id, [FromBody] CompanyUpdateDto dto)
        {
            return Ok(await _companiesService.UpdateCompanyAsync(id, dto));
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompany([FromRoute] Guid id)
        {
            await _companiesService.DeleteCompanyAsync(id);
            return NoContent();
        }

        // /companies/{id}/notes

        [HttpGet("{id:guid}/notes")]
        [ProducesResponseType(typeof(PagedResultDto<CompanyNoteDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyNotes([FromRoute] Guid id, [FromQuery] CompanyNoteQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/notes")]
        [ProducesResponseType(typeof(CompanyNoteDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompanyNote([FromRoute] Guid id, [FromBody] CompanyNoteCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/notes/{noteId:guid}")]
        [ProducesResponseType(typeof(CompanyNoteDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompanyNote([FromRoute] Guid id, [FromRoute] Guid noteId, [FromBody] CompanyNoteUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/notes/{noteId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompanyNote([FromRoute] Guid id, [FromRoute] Guid noteId) => StatusCode(StatusCodes.Status501NotImplemented);

        // /companies/{id}/contacts

        [HttpGet("{id:guid}/contacts")]
        [ProducesResponseType(typeof(PagedResultDto<ContactPersonDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyContacts([FromRoute] Guid id, [FromQuery] ContactPersonQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/contacts")]
        [ProducesResponseType(typeof(ContactPersonDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompanyContact([FromRoute] Guid id, [FromBody] ContactPersonCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/contacts/{contactId:guid}")]
        [ProducesResponseType(typeof(ContactPersonDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompanyContact([FromRoute] Guid id, [FromRoute] Guid contactId, [FromBody] ContactPersonUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/contacts/{contactId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompanyContact([FromRoute] Guid id, [FromRoute] Guid contactId) => StatusCode(StatusCodes.Status501NotImplemented);


        // /companies/{id}/logs

        [HttpGet("{id:guid}/logs")]
        [ProducesResponseType(typeof(PagedResultDto<CooperationLogDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> GetCompanyLogs([FromRoute] Guid id, [FromQuery] CooperationLogQueryDto query) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPost("{id:guid}/logs")]
        [ProducesResponseType(typeof(CooperationLogDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> CreateCompanyLog([FromBody] CooperationLogCreateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpPatch("{id:guid}/logs/{logId:guid}")]
        [ProducesResponseType(typeof(CooperationLogDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> UpdateCompanyLog([FromRoute] Guid logId, [FromBody] CooperationLogUpdateDto dto) => StatusCode(StatusCodes.Status501NotImplemented);

        [HttpDelete("{id:guid}/logs/{logId:guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> DeleteCompanyLog([FromRoute] Guid logId) => StatusCode(StatusCodes.Status501NotImplemented);
    }
}
