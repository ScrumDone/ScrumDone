using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;

namespace ScrumDone.Api.Services
{
    public class CompaniesService
    {
        private readonly AppDbContext _context;

        public CompaniesService(AppDbContext context)
        {
            _context = context;
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
                Id = new Guid(),
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

        public async Task<bool> DeleteCompanyNote(Guid id, Guid noteId)
        {
            var affectedRows = await _context.CompanyNotes
            .Where(n => n.Id == noteId && n.CompanyId == id)
            .ExecuteUpdateAsync(n => n.SetProperty(e => e.IsDeleted, true));

            return affectedRows > 0;
        }

    }
}
