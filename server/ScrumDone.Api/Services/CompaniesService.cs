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

        //notes
        public async Task<PagedResultDto<CompanyNoteDto>> GetCompanyNotesAsync(Guid id, CompanyNoteQueryDto query)
        {
            var baseQuery = _context.CompanyNotes.Where(n => n.CompanyId == id);
            var total = await baseQuery.CountAsync();

            var notesFromDb = await baseQuery
                .OrderByDescending(n => n.CreatedAt)
                .Skip((query.Page - 1) * query.Limit) 
                .Take(query.Limit)
                .Include(n => n.User)
                .ToListAsync();
            
            var notes = notesFromDb.Select(note => note.ToListItemDto());

            var  notesPaginated = new PagedResultDto<CompanyNoteDto>(notes, query.Page, query.Limit, total);
            return notesPaginated;
        }

        public async Task<CompanyNoteDto> CreateCompanyNoteAsync(Guid id, CompanyNoteCreateDto query)
        {
            var currentUser = await _context.Users.FirstAsync();

            var note = new CompanyNote
            {
                Id = Guid.NewGuid(),
                Content = query.Content,
                UserId = currentUser.Id,
                User = currentUser,
                CompanyId = id,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false,
            };

            _context.CompanyNotes.Add(note);
            await _context.SaveChangesAsync();

            return note.ToListItemDto(); 
        }

        public async Task<CompanyNoteDto> UpdateCompanyNoteAsync(Guid id, Guid noteId, CompanyNoteUpdateDto dto)
        {
            await _context.CompanyNotes
            .Where(n => n.Id == noteId && n.CompanyId == id)
            .ExecuteUpdateAsync(n => n.SetProperty(e => e.Content, dto.Content));

            var updatedNote = await _context.CompanyNotes.Include(n => n.User).FirstOrDefaultAsync(n => n.Id == noteId)
                ?? throw new NotFoundException(nameof(CompanyNote), noteId);

            return updatedNote.ToListItemDto();
        }

        public async Task DeleteCompanyNoteAsync(Guid id, Guid noteId)
        {
            var note = await _context.CompanyNotes.FirstOrDefaultAsync(n => n.CompanyId == id && n.Id == noteId)
                ?? throw new NotFoundException(nameof(CompanyNote), noteId);

            _context.Remove(note);
            await _context.SaveChangesAsync();
            return;
        }

        //Contacts

        public async Task<PagedResultDto<ContactPersonDto>> GetCompanyContactsAsync(Guid id, ContactPersonQueryDto query)
        {
            var baseQuery = _context.ContactPeople.Where(c => c.CompanyId == id);
            var total = await baseQuery.CountAsync();

            var contactsFromDb = await baseQuery
                .OrderByDescending(n => n.CreatedAt)
                .OrderByDescending(c => c.IsPrimary)
                .Skip(query.Page-1 * query.Limit)
                .Take(query.Limit)
                .ToListAsync();

            var contacts = contactsFromDb.Select(c => c.ToListItemDto());

            var contactsPaginated = new PagedResultDto<ContactPersonDto> (contacts, query.Page, query.Limit, total);
            return contactsPaginated;
        }

        public async Task<ContactPersonDto> CreateCompanyContactAsync(Guid id, ContactPersonCreateDto dto)
        {
            var contact = new ContactPerson{
                Id = Guid.NewGuid(),
                CompanyId = id,
                IsPrimary = dto.IsPrimary ?? false,
                Name = dto.Name,
                Role = dto.Role,
                Email = dto.Email,
                Phone = dto.Phone  
            };

            _context.ContactPeople.Add(contact);
            await _context.SaveChangesAsync();

            return contact.ToContactPersonDto();
        }

        public async Task<ContactPersonDto> UpdateCompanyContactAsync(Guid id, Guid contactId,  ContactPersonUpdateDto dto)
        {
            var contact = await _context.ContactPeople
                .FirstOrDefaultAsync(c => c.CompanyId == id && c.Id == contactId)
                ?? throw new NotFoundException(nameof(ContactPerson), contactId);

            if (dto.Name != null) contact.Name = dto.Name;
            if (dto.Role != null) contact.Role = dto.Role;
            if (dto.Email != null) contact.Email = dto.Email;
            if (dto.Phone != null) contact.Phone = dto.Phone;
            if (dto.IsPrimary != null) contact.IsPrimary = dto.IsPrimary.Value;

            _context.ContactPeople.Add(contact);
            await _context.SaveChangesAsync();

            return contact.ToContactPersonDto();
        }

        public async Task DeleteCompanyContactAsync(Guid id, Guid contactId)
        {
            var contact = await _context.ContactPeople
                .FirstOrDefaultAsync(c => c.CompanyId == id && c.Id == contactId)
                ??throw new NotFoundException(nameof(ContactPerson), contactId);

            _context.ContactPeople.Remove(contact);
            await _context.SaveChangesAsync();
        
            return;
        }
    }
}
