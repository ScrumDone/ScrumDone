using Microsoft.EntityFrameworkCore;
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
    }
}
