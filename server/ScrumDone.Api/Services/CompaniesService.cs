using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Exceptions;
using ScrumDone.Api.Mappers;
using System.Text.Json;

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
            var total = await _context.Companies.CountAsync();
            var companies = await _context.Companies
                .Skip((query.Page - 1) * (query.Limit))
                .Take(query.Limit)
                .Select(c => new CompanyListItemDto(
                    c.Id,
                    c.Name,
                    c.Nip,
                    c.CreatedAt,
                    c.UpdatedAt,
                    c.ContactPeople
                        .Where(cp => cp.IsPrimary)
                        .Select(cp => new ContactPersonDto(cp.Id, cp.Name, cp.Role, cp.Email, cp.Phone, cp.IsPrimary))
                        .FirstOrDefault(),
                    c.ContactPeople.Count,
                    c.Projects.Count
                ))
                .ToListAsync();

            return new PagedResultDto<CompanyListItemDto>(
                companies,
                query.Page,
                query.Limit,
                total
            );
        }

        public async Task<CompanyDetailDto> GetCompanyByIdAsync(Guid id)
        {
            var company = await _context.Companies
                .Include(c => c.ContactPeople)
                .Include(c => c.Projects)
                .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException(nameof(Company), id);

            return company.ToDetailDto();
        }

        public async Task<CompanyDetailDto> CreateCompanyAsync(CompanyCreateDto dto)
        {
            var company = new Company
            {
                Name = dto.Name,
                Nip = dto.Nip,
                Krs = dto.Krs,
                Regon = dto.Regon,
                Address = dto.Address
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return company.ToDetailDto();
        }

        public async Task<CompanyDetailDto> UpdateCompanyAsync(Guid id, CompanyUpdateDto dto)
        {
            var company = await _context.Companies
                .Include(c => c.ContactPeople)
                .Include(p => p.Projects)
                .FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new NotFoundException(nameof(Company), id);

            if (dto.SetProperties.Contains(nameof(dto.Name))) company.Name = dto.Name!;
            if (dto.SetProperties.Contains(nameof(dto.Nip))) company.Nip = dto.Nip;
            if (dto.SetProperties.Contains(nameof(dto.Krs))) company.Krs = dto.Krs;
            if (dto.SetProperties.Contains(nameof(dto.Regon))) company.Regon = dto.Regon;
            if (dto.SetProperties.Contains(nameof(dto.Address))) company.Address = dto.Address;

            await _context.SaveChangesAsync();

            return company.ToDetailDto();
        }

        public async Task DeleteCompanyAsync(Guid id)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new NotFoundException(nameof(Company), id);

            _context.Remove(company);
            await _context.SaveChangesAsync();

            return;
        }
    }
}
