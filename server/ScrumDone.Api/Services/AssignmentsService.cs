using Bogus.DataSets;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Exceptions;
using System.ComponentModel;
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

            if (dto.Backlog == true)
            {
                q = q.Where(t =>
                    t.SprintId == null);
            }
            else if (dto.SprintIds?.Any() == true)
            {
                q = q.Where(t =>
                    t.SprintId.HasValue &&
                    dto.SprintIds.Contains(t.SprintId.Value));
            }

            if (dto.AssigneeIds?.Any() == true)
            {
                q = q.Where(t =>
                    t.Assignees.Any(a =>
                        dto.AssigneeIds.Contains(a.UserId)));
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
                        dto.LabelIds.Contains(l.AssignmentLabelId)));
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
                    new AssignmentStatusDto(t.Status.Id, t.Status.Name, t.Status.HexColor, t.Status.IsDefault),
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
            var assignment = await _context.Assignment
                .Where(t => t.Id == id)
                .Select(t => new AssignmentDetailDto
                (
                    t.Id,
                    t.Name,
                    t.Description,
                    t.CreatedAt,
                    t.UpdatedAt,
                    t.DueDate,
                    t.TimeEstimate,
                    new AssignmentStatusDto(t.Status.Id, t.Status.Name, t.Status.HexColor, t.Status.IsDefault),
                    t.Priority != null
                        ? new AssignmentPriorityDto(t.Priority.Id, t.Priority.Name, t.Priority.HexColor)
                        : null,
                    t.Assignees.Select(a => new UserSummaryDto(a.User.Id, a.User.Name)),
                    t.Labels.Select(l => new AssignmentLabelDto(
                        l.AssignmentLabel.Id,
                        l.AssignmentLabel.Name,
                        l.AssignmentLabel.HexColor)),
                    t.Project.Name,
                    t.ProjectId,
                    t.Sprint != null ? t.Sprint.Name : null,
                    t.SprintId
                ))
                .FirstOrDefaultAsync()
                ?? throw new NotFoundException(nameof(Assignment), id);

            return assignment;
        }

        public async Task<AssignmentDetailDto> CreateAssignmentAsync(AssignmentCreateDto dto)
        {
            var defaultStatusId = await _context.AssignmentStatuses
                .Where(s => s.IsDefault)
                .Select(s => s.Id)
                .FirstOrDefaultAsync();

            if (defaultStatusId == Guid.Empty)
                throw new InvalidOperationException("Default assignment status is not configured.");

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                DueDate = dto.DueDate,
                TimeEstimate = dto.TimeEstimate,
                ProjectId = dto.ProjectId,
                SprintId = dto.SprintId,
                StatusId = dto.StatusId ?? defaultStatusId,
                PriorityId = dto.PriorityId,
                Assignees = dto.AssigneeIds?.Select(aId => new AssignmentUserMTMRelation
                {
                    UserId = aId
                    //AssignmentId = Id
                }).ToList() ?? [],
                Labels = dto.LabelIds?.Select(lId => new AssignmentAssignmentLabelMTMRelation
                {
                    AssignmentLabelId = lId
                    //AssignmentId = Id
                }).ToList() ?? []
            };

            _context.Assignment.Add(assignment);
            await _context.SaveChangesAsync();

            // I think extra roundtrip justified here bacause of many relationships created
            // Side benefit is adding fault tolerance
            // Eliminate this db hit by calling all needed data right away in case of performance issues
            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task<AssignmentDetailDto> UpdateAssignmentAsync(Guid id, AssignmentUpdateDto dto)
        {
            var assignment = await _context.Assignment
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new NotFoundException(nameof(Assignment), id);

            if (dto.SetProperties.Contains(nameof(dto.Name))) assignment.Name = dto.Name!;
            if (dto.SetProperties.Contains(nameof(dto.Description))) assignment.Description = dto.Description;
            if (dto.SetProperties.Contains(nameof(dto.DueDate))) assignment.DueDate = dto.DueDate;
            if (dto.SetProperties.Contains(nameof(dto.TimeEstimate))) assignment.TimeEstimate = dto.TimeEstimate;
            if (dto.SetProperties.Contains(nameof(dto.StatusId))) assignment.StatusId = dto.StatusId!.Value;
            if (dto.SetProperties.Contains(nameof(dto.PriorityId))) assignment.PriorityId = dto.PriorityId;
            if (dto.SetProperties.Contains(nameof(dto.SprintId))) assignment.SprintId = dto.SprintId;
            if (dto.SetProperties.Contains(nameof(dto.ProjectId))) assignment.ProjectId = dto.ProjectId!.Value;

            await _context.SaveChangesAsync();

            return await GetAssignmentByIdAsync(assignment.Id);
        }
        public async Task DeleteAssignmentAsync(Guid id)
        {
            var assignment = await _context.Assignment
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new NotFoundException(nameof(Assignment), id);

            _context.Assignment.Remove(assignment);
            await _context.SaveChangesAsync();

            return;
        }
    }
}
