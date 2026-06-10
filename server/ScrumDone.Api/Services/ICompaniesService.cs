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

        //Contacts
        Task<PagedResultDto<ContactPersonDto>> GetCompanyContactsAsync(Guid id, ContactPersonQueryDto query);

        Task<ContactPersonDto> CreateCompanyContactAsync(Guid id, ContactPersonCreateDto dto);

        Task<ContactPersonDto> UpdateCompanyContactAsync(Guid id, Guid contactId, ContactPersonUpdateDto dto);

        Task DeleteCompanyContactAsync(Guid id, Guid contactId);

        //Logs
        Task<PagedResultDto<CooperationLogDto>> GetCompanyLogsAsync(Guid id, CooperationLogQueryDto query);

        Task<CooperationLogDto> CreateCompanyLogAsync(Guid id, CooperationLogCreateDto dto);

        Task<CooperationLogDto> UpdateCompanyLogAsync(Guid id, Guid logId, CooperationLogUpdateDto dto);

        Task DeleteCompanyLogAsync(Guid id, Guid logId);
    }
}
