using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Services
{
    public class CompaniesService : ICompaniesService
    {
        private readonly AppDbContext _context;

        public CompaniesService(AppDbContext context)
        {
            _context = context;
        }

        // companies

        public async Task<PagedResultDto<CompanyListItemDto>> GetCompaniesAsync(CompanyQueryDto query)
        {
            var companies = await _context.Companies
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .Include(c => c.ContactPeople)
                .Include(c => c.Projects)
                .ToListAsync();

            var companyItems = new List<CompanyListItemDto>();
            foreach (var company in companies)
            {
                var mainContactPerson = company.ContactPeople.FirstOrDefault(cp => cp.IsPrimary);

                var companyItem = new CompanyListItemDto
                (
                    company.Id,
                    company.Name,
                    company.Nip,
                    company.CreatedAt,
                    company.UpdatedAt,
                    new ContactPersonDto
                    (
                        mainContactPerson.Id,
                        mainContactPerson.Name,
                        mainContactPerson.Role,
                        mainContactPerson.Email,
                        mainContactPerson.Phone,
                        mainContactPerson.IsPrimary
                    ),
                    company.ContactPeople.Count,
                    company.Projects.Count
                );

                companyItems.Add(companyItem);
            }

            Console.WriteLine(companyItems);

            var result = new PagedResultDto<CompanyListItemDto>
            (
                companyItems,
                query.Page,
                query.Limit,
                await _context.Companies.CountAsync()
            );

            return result;
        }

        public async Task<CompanyDetailDto> GetCompanyByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<CompanyDetailDto> CreateCompanyAsync(CompanyCreateDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task<CompanyDetailDto> UpdateCompanyAsync(CompanyUpdateDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteCompanyAsync(Guid id)
        {
            throw new NotImplementedException();
        }

    }
}
