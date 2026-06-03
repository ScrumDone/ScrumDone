using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Services
{
    public interface ICompaniesService
    {
        //Companies
        Task<PagedResultDto<CompanyListItemDto>> GetCompaniesAsync(CompanyQueryDto query);

        Task<CompanyDetailDto> GetCompanyByIdAsync(Guid id);


        Task<CompanyDetailDto> CreateCompanyAsync(CompanyCreateDto dto);

        Task<CompanyDetailDto> UpdateCompanyAsync(Guid id, CompanyUpdateDto dto);

        Task DeleteCompanyAsync(Guid id);

        //Notes
        Task<PagedResultDto<CompanyNoteDto>> GetCompanyNotes(Guid id, CompanyNoteQueryDto query);

        Task<CompanyNoteDto> CreateCompanyNote(Guid id, CompanyNoteCreateDto query);

        Task<CompanyNoteDto> UpdateCompanyNote(Guid id, Guid noteId, CompanyNoteUpdateDto query);

        Task DeleteCompanyNote(Guid id, Guid noteId);
    }
}
