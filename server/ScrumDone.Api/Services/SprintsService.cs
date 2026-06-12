using System.Reflection.Metadata.Ecma335;
using Bogus.DataSets;
using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.Exceptions;
using ScrumDone.Api.Mappers;
using ScrumDone.Api.Services;

namespace Scrumdone.Api.Services
{
    public class SprintsService : ISprintsService
    {
        private readonly AppDbContext _context;
        public SprintsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SprintDetailDto> GetSprintByIdAsync(Guid id)
        {
            var sprint = await _context.Sprints
                .AsNoTracking()
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Status) 
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Priority)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Assignees)
                        .ThenInclude(r => r.User)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Labels)
                        .ThenInclude(l => l.AssignmentLabel)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.SubAssignments)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Project)
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new NotFoundException(nameof(Sprint), id);

            return sprint.ToDetailDto();
        }

        public async Task<SprintDetailDto> UpdateSprintAsync(Guid id, SprintUpdateDto dto)
        {
            var sprint = await _context.Sprints
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new NotFoundException(nameof(Sprint), id);

            if (dto.SetProperties.Contains(nameof(dto.Name))) sprint.Name = dto.Name;
            if (dto.SetProperties.Contains(nameof(dto.StartDate))) sprint.StartDate = dto.StartDate;
            if (dto.SetProperties.Contains(nameof(dto.EndDate))) sprint.EndDate = dto.EndDate;

            await _context.SaveChangesAsync();

            sprint = await _context.Sprints
                .AsNoTracking()
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Status) 
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Priority)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Assignees)
                        .ThenInclude(r => r.User)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Labels)
                        .ThenInclude(l => l.AssignmentLabel)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.SubAssignments)
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Project)
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new NotFoundException(nameof(Sprint), id);

            return sprint.ToDetailDto();
        }

        public async Task DeleteSprintAsync(Guid id)
        {
            var sprint = await _context.Sprints
                .FirstOrDefaultAsync(s => s.Id == id)
                ?? throw new NotFoundException(nameof(Sprint), id);

            _context.Sprints.Remove(sprint);
            await _context.SaveChangesAsync();

            return;
        }
    }
}