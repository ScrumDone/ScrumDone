using Bogus.DataSets;
using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Exceptions;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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
            var page = query.Page;// <= 0 ? 1 : query.Page;
            var limit = query.Limit;// <= 0 ? 10 : query.Limit;

            var companies = await _context.Companies
                .Skip((page - 1) * limit)
                .Take(limit)
                .Include(c => c.ContactPeople)
                .Include(c => c.Projects)
                .ToListAsync();

            var companyItems = new List<CompanyListItemDto>();
            foreach (var company in companies)
            {
                var mainContactPerson = company.ContactPeople.FirstOrDefault(cp => cp.IsPrimary);

                ContactPersonDto? mainContactDto = company.ContactPeople
                    .Where(cp => cp.IsPrimary)
                    .Select(cp => new ContactPersonDto(
                        cp.Id,
                        cp.Name,
                        cp.Role,
                        cp.Email,
                        cp.Phone,
                        cp.IsPrimary
                    ))
                    .FirstOrDefault();

                var companyItem = new CompanyListItemDto
                (
                    company.Id,
                    company.Name,
                    company.Nip,
                    company.CreatedAt,
                    company.UpdatedAt,
                    mainContactDto,
                    company.ContactPeople?.Count ?? 0,
                    company.Projects?.Count ?? 0
                );

                companyItems.Add(companyItem);
            }

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
            var company = await _context.Companies
                .Include(c => c.ContactPeople)
                .Include(c => c.Projects)
                .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException(nameof(Data.Company), id);

            var companyDetail = new CompanyDetailDto
            (
                company.Id,
                company.Name,
                company.Nip,
                company.Krs,
                company.Regon,
                company.Address,
                company.CreatedAt,
                company.UpdatedAt,
                company.ContactPeople.Count,
                company.Projects.Count,
                company.ContactPeople.Select(cp => new ContactPersonDto
                (
                    cp.Id,
                    cp.Name,
                    cp.Role,
                    cp.Email,
                    cp.Phone,
                    cp.IsPrimary
                ))
            );

            return companyDetail;
        }

        public async Task<CompanyDetailDto> CreateCompanyAsync(CompanyCreateDto dto)
        {
            var company = new Data.Company
            {
                Name = dto.Name,
                Nip = dto.Nip,
                Krs = dto.Krs,
                Regon = dto.Regon,
                Address = dto.Address
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var companyDetail = new CompanyDetailDto
            (
                company.Id,
                company.Name,
                company.Nip,
                company.Krs,
                company.Regon,
                company.Address,
                company.CreatedAt,
                company.UpdatedAt,
                company.ContactPeople.Count,
                company.Projects.Count,
                company.ContactPeople.Select(cp => new ContactPersonDto
                (
                    cp.Id,
                    cp.Name,
                    cp.Role,
                    cp.Email,
                    cp.Phone,
                    cp.IsPrimary
                ))
            );

            return companyDetail;
        }

        public async Task<CompanyDetailDto> UpdateCompanyAsync(Guid id, CompanyUpdateDto dto)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new NotFoundException(nameof(Data.Company), id);

            if (dto.Name != null) company.Name = dto.Name;
            if (dto.Nip != null) company.Nip = dto.Nip;
            if (dto.Krs != null) company.Krs = dto.Krs;
            if (dto.Regon != null) company.Regon = dto.Regon;
            if (dto.Address != null) company.Address = dto.Address;

            await _context.SaveChangesAsync();

            var companyDetail = new CompanyDetailDto
            (
                company.Id,
                company.Name,
                company.Nip,
                company.Krs,
                company.Regon,
                company.Address,
                company.CreatedAt,
                company.UpdatedAt,
                company.ContactPeople.Count,
                company.Projects.Count,
                company.ContactPeople.Select(cp => new ContactPersonDto
                (
                    cp.Id,
                    cp.Name,
                    cp.Role,
                    cp.Email,
                    cp.Phone,
                    cp.IsPrimary
                ))
            );

            return companyDetail;
        }

        public async Task DeleteCompanyAsync(Guid id)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new NotFoundException(nameof(Data.Company), id);

            _context.Remove(company);
            await _context.SaveChangesAsync();

            return;
        }

    }
}
