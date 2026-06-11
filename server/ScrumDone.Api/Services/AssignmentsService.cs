using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using System.Net.NetworkInformation;
using System.Reflection.Emit;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ScrumDone.Api.Services
{
    public class AssignmentsService : IAssignmentsService
    {
        private readonly AppDbContext _context;

        public AssignmentsService(AppDbContext context)
        {
            _context = context;
        }


        public async Task<PagedResultDto<AssignmentListItemDto>> GetAssignmentsAsync(AssignmentQueryDto dto)
        {
            var q = _context.Assignment
                .AsNoTracking()
                .AsQueryable();

            if (dto.ProjectIds?.Any() == true)
            {
                q = q.Where(t =>
                    dto.ProjectIds.Contains(t.ProjectId));
            }

            if (dto.SprintIds?.Any() == true)
            {
                q = q.Where(t =>
                    t.SprintId.HasValue &&
                    dto.SprintIds.Contains(t.SprintId.Value));
            }

            if (dto.Backlog == true)
            {
                q = q.Where(t =>
                    t.SprintId == null);
            }

            if (dto.AssigneeIds?.Any() == true)
            {
                q = q.Where(t =>
                    t.Assignees.Any(a =>
                        dto.AssigneeIds.Contains(a.User.Id)));
            }

            if (dto.PriorityIds?.Any() == true)
            {
                q = q.Where(t =>
                    t.PriorityId.HasValue &&
                    dto.PriorityIds.Contains(t.PriorityId.Value));
            }

            if (dto.StatusIds?.Any() == true)
            {
                q = q.Where(t =>
                    dto.StatusIds.Contains(t.StatusId));
            }

            if (dto.LabelIds?.Any() == true)
            {
                q = q.Where(t =>
                    t.Labels.Any(l =>
                        dto.LabelIds.Contains(l.AssignmentLabel.Id)));
            }

            if (dto.ExcludeNoDeadline == true && (!dto.DueOnOrAfter.HasValue && !dto.DueOnOrBefore.HasValue))
            {
                q = q.Where(t =>
                    t.DueDate != null);
            }
            else
            {
                if (dto.DueOnOrAfter.HasValue)
                {
                    q = dto.ExcludeNoDeadline == true
                        ? q.Where(t => t.DueDate >= dto.DueOnOrAfter.Value)
                        : q.Where(t => t.DueDate >= dto.DueOnOrAfter.Value || t.DueDate == null);
                }

                if (dto.DueOnOrBefore.HasValue)
                {
                    q = dto.ExcludeNoDeadline == true
                        ? q.Where(t => t.DueDate <= dto.DueOnOrBefore.Value)
                        : q.Where(t => t.DueDate <= dto.DueOnOrBefore.Value || t.DueDate == null);
                }
            }

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(t => t.CreatedAt)
                .Skip((dto.Page - 1) * dto.Limit)
                .Take(dto.Limit)
                .Select(t => new AssignmentListItemDto(  
                    t.Id,
                    t.Name,
                    t.Description,
                    t.CreatedAt,
                    t.UpdatedAt,
                    t.DueDate,
                    t.TimeEstimate,
                    new AssignmentStatusDto(t.Status.Id, t.Status.Name, t.Status.HexColor),
                    t.Priority != null
                        ? new AssignmentPriorityDto(t.Priority.Id, t.Priority.Name, t.Priority.HexColor)
                        : null,
                    t.Assignees.Select(a => new UserSummaryDto(a.User.Id, a.User.Name)),
                    t.Labels.Select(l => new AssignmentLabelDto(
                        l.AssignmentLabel.Id, 
                        l.AssignmentLabel.Name,
                        l.AssignmentLabel.HexColor)),
                    //t.Subtasks.Select(s => s.Id).ToList(),
                    t.ProjectId,
                    t.Project.Name,
                    t.SprintId
                //t.ParentAssignmentId
                ))
                .ToListAsync();

            var results = new PagedResultDto<AssignmentListItemDto>
            (
                items,
                dto.Page,
                dto.Limit,
                totalCount
            );

            return results;
        }

        public async Task<AssignmentDetailDto> GetAssignmentByIdAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<AssignmentDetailDto> CreateAssignmentAsync(AssignmentCreateDto dto)
        {
            throw new NotImplementedException();
        }

        public async Task DeleteAssignmentAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<AssignmentDetailDto> UpdateAssignmentAsync(Guid id, AssignmentUpdateDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
