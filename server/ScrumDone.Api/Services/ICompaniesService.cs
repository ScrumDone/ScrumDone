using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Services
{
    public interface ICompaniesService
    {
        Task<PagedResultDto<CompanyListItemDto>> GetCompaniesAsync(CompanyQueryDto query);

        Task<CompanyDetailDto> GetCompanyByIdAsync(Guid id);


        Task<CompanyDetailDto> CreateCompanyAsync(CompanyCreateDto dto);

        Task<CompanyDetailDto> UpdateCompanyAsync(Guid id, CompanyUpdateDto dto);

        Task DeleteCompanyAsync(Guid id);
    }
}
