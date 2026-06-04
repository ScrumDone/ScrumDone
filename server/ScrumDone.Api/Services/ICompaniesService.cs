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
        Task<PagedResultDto<CompanyNoteDto>> GetCompanyNotesAsync(Guid id, CompanyNoteQueryDto query);

        Task<CompanyNoteDto> CreateCompanyNoteAsync(Guid id, CompanyNoteCreateDto query);

        Task<CompanyNoteDto> UpdateCompanyNoteAsync(Guid id, Guid noteId, CompanyNoteUpdateDto query);

        Task DeleteCompanyNoteAsync(Guid id, Guid noteId);
    }
}
