using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Exceptions;
using ScrumDone.Api.Mappers;

namespace ScrumDone.Api.Services
{
    public class CompaniesService : ICompaniesService
    {
        private readonly AppDbContext _context;

        public CompaniesService(AppDbContext context)
        {
            _context = context;
        }

        //companies
        public async Task<PagedResultDto<CompanyListItemDto>> GetCompaniesAsync(CompanyQueryDto query)
        {
            var total = await _context.Companies.CountAsync();
            var companies = await _context.Companies
                .Skip((query.Page - 1) * query.Limit)
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

        //notes
        public async Task<CompanyDetailDto> UpdateCompanyAsync(Guid id, CompanyUpdateDto dto)
        {
            var company = await _context.Companies
                .Include(c => c.ContactPeople)
                .Include(p => p.Projects)
                .FirstOrDefaultAsync(c => c.Id == id)
                ?? throw new NotFoundException(nameof(Company), id);

            if (dto.Name != null) company.Name = dto.Name;
            if (dto.Nip != null) company.Nip = dto.Nip;
            if (dto.Krs != null) company.Krs = dto.Krs;
            if (dto.Regon != null) company.Regon = dto.Regon;
            if (dto.Address != null) company.Address = dto.Address;

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

        public async Task<PagedResultDto<CompanyNoteDto>> GetCompanyNotes(Guid id, CompanyNoteQueryDto query)
        {
            var notes = await _context.CompanyNotes
            .Skip((query.Page - 1) * query.Limit) 
            .Take(query.Limit)
            .Where(n => n.CompanyId == id)
            .Select(n => new CompanyNoteDto
            (
                n.Id,
                n.Content,
                new DTOs.Users.UserSummaryDto(n.User.Id, n.User.Name,n.User.ProfilePictureUrl),
                n.CreatedAt,
                n.UpdatedAt
            ))
            .ToListAsync();
            
            var  notesPaginated = new PagedResultDto<CompanyNoteDto>(notes, query.Page, query.Limit, notes.Count());
            return notesPaginated;
        }

        public async Task<CompanyNoteDto> CreateCompanyNote(Guid id, CompanyNoteCreateDto query)
        {
            var note = new CompanyNote
            {
                Id = Guid.NewGuid(),
                Content = query.Content,
                UserId = _context.Users.First().Id, // TODO solve this issue
                CompanyId = id,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false,
            };
            _context.CompanyNotes.Add(note);
            await _context.SaveChangesAsync();


            return new CompanyNoteDto(note.Id, note.Content, new DTOs.Users.UserSummaryDto(note.User.Id, note.User.Name, note.User.ProfilePictureUrl), note.CreatedAt, note.UpdatedAt);  
        }

        public async Task<CompanyNoteDto> UpdateCompanyNote(Guid id, Guid noteId, CompanyNoteUpdateDto dto)
        {
            await _context.CompanyNotes
            .Where(n => n.Id == noteId && n.CompanyId == id)
            .ExecuteUpdateAsync(n => n.SetProperty(e => e.Content, dto.Content));

            var updatedNote = await _context.CompanyNotes
                .Where(n => n.Id == noteId)
                .Select(n => new CompanyNoteDto
                (
                    n.Id,
                    n.Content,
                    new DTOs.Users.UserSummaryDto(n.User.Id, n.User.Name, n.User.ProfilePictureUrl),
                    n.CreatedAt,
                    n.UpdatedAt
                ))
                .FirstAsync();

            return updatedNote;
        }

        public async Task DeleteCompanyNote(Guid id, Guid noteId)
        {
            var affectedRows = await _context.CompanyNotes
            .Where(n => n.Id == noteId && n.CompanyId == id)
            .ExecuteUpdateAsync(n => n.SetProperty(e => e.IsDeleted, true));

            return;
        } 
    }
}
