using Bogus.Extensions.UnitedKingdom;
using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Mappers;
using ScrumDone.Api.Exceptions;
using Bogus.DataSets;

namespace ScrumDone.Api.Services
{
    public class ProjectsService : IProjectsService
    {
        private readonly AppDbContext _context;

        public ProjectsService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<PagedResultDto<ProjectListItemDto>> GetProjectsAsync(ProjectQueryDto query)
        {
            var baseQuery = _context.Projects
                .Include(p => p.TeamMembers)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.Status)
                .Include(p => p.Company)
                .AsQueryable();

            if (query.CompanyId.HasValue)
            {
                var companyExists = await _context.Companies.AnyAsync(c => c.Id == query.CompanyId);
                if (!companyExists)
                    throw new NotFoundException(nameof(Data.Company), query.CompanyId.Value);

                baseQuery = baseQuery.Where(p => p.CompanyId == query.CompanyId);
            }
                
            if (query.UserId.HasValue)
            {
                var userExists = await _context.Users.AnyAsync(c => c.Id == query.UserId);
                if (!userExists)
                    throw new NotFoundException(nameof(User), query.UserId.Value);

                baseQuery = baseQuery.Where(p => p.TeamMembers.Any(user => user.UserId == query.UserId));
            }
                
            if (query.IsActive.HasValue)
                baseQuery = baseQuery.Where(p => p.IsActive == query.IsActive);

            var total = await baseQuery.CountAsync();

            var ProjectsFromDb = await baseQuery
                .OrderByDescending(p => p.Name)
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToArrayAsync();

            var Projects = ProjectsFromDb.Select(p => p.ToListItemDto());

            var ProjectsPaginated = new PagedResultDto<ProjectListItemDto>(Projects, query.Page, query.Limit, total);
        
            return ProjectsPaginated;
        }

        public async Task<ProjectDetailDto> GetProjectByIdAsync(Guid id)
        {
            var project = await _context.Projects
                .Include(p => p.Sprints)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.Status)
                .Include(p => p.TeamMembers)
                    .ThenInclude(tm => tm.User)
                .Include(p => p.Company)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new NotFoundException(nameof(Project), id);

            return project.ToDetailDto();
        }
    
        public async Task<ProjectDetailDto> CreateProjectAsync(ProjectCreateDto dto)
        {       
            foreach(var userId in dto.TeamMemberIds)
            {
                if (!await _context.Users.AnyAsync(u => u.Id == userId))
                    throw new NotFoundException(nameof(User), userId);
            }

            var newProject = new Project
            {
                Id = Guid.NewGuid(),
                CompanyId = dto.CompanyId,
                Name = dto.Name,
                Description = dto.Description,
                IsActive = true,
                IsSetToScrum = dto.IsSetToScrum,
                ExpectedFinishDate = dto.ExpectedFinishDate,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            newProject.TeamMembers = dto.TeamMemberIds.Select(id => new ProjectUserMTMRelation
            {
                ProjectId = newProject.Id,
                UserId = id
            }).ToList();

            await _context.Projects.AddAsync(newProject);
            await _context.SaveChangesAsync();

            var createdProject = await _context.Projects
                .Include(p => p.Company)
                .Include(p => p.Sprints)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.Status)
                .Include(p => p.TeamMembers)
                    .ThenInclude(tm => tm.User)
                .FirstAsync(p => p.Id == newProject.Id);

            return createdProject.ToDetailDto();
        }

        public async Task<ProjectDetailDto> UpdateProjectAsync(Guid id, ProjectUpdateDto dto)
        {
            var projectToUpdate = await _context.Projects
                .Include(p => p.Company)
                .Include(p => p.Sprints)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.Status)
                .Include(p => p.TeamMembers)
                    .ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new NotFoundException(nameof(Project), id);

            if(dto.SetProperties.Contains(nameof(dto.Name))) projectToUpdate.Name = dto.Name!;
            if(dto.SetProperties.Contains(nameof(dto.Description))) projectToUpdate.Description = dto.Description;
            if(dto.SetProperties.Contains(nameof(dto.IsActive))) projectToUpdate.IsActive = dto.IsActive.Value!;
            if(dto.SetProperties.Contains(nameof(dto.IsSetToScrum))) projectToUpdate.IsSetToScrum = dto.IsSetToScrum.Value!;
            if(dto.SetProperties.Contains(nameof(dto.StartDate))) projectToUpdate.CreatedAt = dto.StartDate.Value; // there is no start date field
            if(dto.SetProperties.Contains(nameof(dto.ExpectedFinishDate))) projectToUpdate.ExpectedFinishDate = dto.ExpectedFinishDate;
            if(dto.SetProperties.Contains(nameof(dto.CompanyId))) projectToUpdate.CompanyId = dto.CompanyId;
            projectToUpdate.UpdatedAt = DateTimeOffset.UtcNow; // or does it update automatically?

            await _context.SaveChangesAsync();

            return projectToUpdate.ToDetailDto();
        }

        public async Task DeleteProjectAsync(Guid id)
        {
            var projectToDelete = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new NotFoundException(nameof(Project), id);

            _context.Projects.Remove(projectToDelete);
            await _context.SaveChangesAsync();

            return;
        }

        // team members
        public async Task<PagedResultDto<UserSummaryDto>> GetProjectMembersAsync(Guid id, TeamMembersQueryDto query)
        {
            var project = await _context.Projects
                .Include(p => p.TeamMembers)
                    .ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new NotFoundException(nameof(Project), id);

            var total = project.TeamMembers.Count();

            var team = project.TeamMembers
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .Select(tm => tm.User.ToSummaryDto())
                .ToList();

            return new PagedResultDto<UserSummaryDto>(team, query.Page, query.Limit, total);

        }
        public async Task AddUserToProjectAsync(Guid id, Guid userId)
        {
            var project = await _context.Projects
                .Include(p => p.TeamMembers)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new NotFoundException(nameof(Project), id);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new NotFoundException(nameof(User), userId);

            if (project.TeamMembers.Any(tm => tm.UserId == userId))
                throw new ConflictException("User is already a member of this project");

            project.TeamMembers.Add(new ProjectUserMTMRelation {User = user});
            await _context.SaveChangesAsync();

            return;
        }

        public async Task RemoveUserFromProjectAsync(Guid id, Guid userId)
        {
            var project = await _context.Projects
                .Include(p => p.TeamMembers)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new NotFoundException(nameof(Project), id);

            if (! await _context.Users.AnyAsync(u => u.Id == userId))
                throw new NotFoundException(nameof(User), userId);

            if (!project.TeamMembers.Any(tm => tm.UserId == userId))
                throw new ConflictException("User is not a member of this project");

            var member = project.TeamMembers.FirstOrDefault(m => m.UserId == userId)
                ?? throw new NotFoundException(nameof(User), userId);

            project.TeamMembers.Remove(member);
            await _context.SaveChangesAsync();

            return;
        }

        // sprints
        public async Task<PagedResultDto<SprintSummaryDto>> GetSprintsAsync(Guid id, SprintQueryDto query)
        {
            if (! await _context.Projects.AnyAsync(p => p.Id == id))
                throw new NotFoundException(nameof(Project), id);

            var baseQuery = _context.Sprints
                .Include(s => s.Assignments)
                    .ThenInclude(a => a.Status)
                .Where(s => s.ProjectId == id);
            
            var total = await baseQuery.CountAsync();

            var sprintsFromDb = await baseQuery

                .OrderByDescending(s => s.CreatedAt)
                .Skip((query.Page - 1) * query.Limit)
                .Take(query.Limit)
                .ToListAsync();

            var sprints = sprintsFromDb.Select(s => s.ToSummaryDto());

            return new PagedResultDto<SprintSummaryDto>(sprints, query.Page, query.Limit, total);
        }
        public async Task<SprintSummaryDto> CreateSprintAsync(Guid id, SprintCreateDto dto)
        {
            if (! await _context.Projects.AnyAsync(p => p.Id == id))
                throw new NotFoundException(nameof(Project), id);

            var sprint = new Sprint
            {
                Id = Guid.NewGuid(),
                ProjectId = id,
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsKanban = dto.IsKanban,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            await _context.Sprints.AddAsync(sprint);
            await _context.SaveChangesAsync();

            return sprint.ToSummaryDto();
        }

        // assignments-labels
        public async Task<IEnumerable<AssignmentLabelDto>> GetAssignmentLabelsAsync(Guid id)
        {
           if (! await _context.Projects.AnyAsync(p => p.Id == id))
                throw new NotFoundException(nameof(Project), id); 

            var labels = await _context.AssignmentLabels
                .Where(al => al.ProjectId == id)
                .ToListAsync();

            return labels.Select(l => l.ToDto());
        }
        public async Task<AssignmentLabelDto> CreateAssignmentLabelAsync(Guid id, AssignmentLabelCreateDto dto)
        {
            if (! await _context.Projects.AnyAsync(p => p.Id == id))
                throw new NotFoundException(nameof(Project), id); 

            var label = new AssignmentLabel
            {
                Id = Guid.NewGuid(),
                ProjectId = id,
                Name = dto.Name,
                HexColor = dto.HexColor,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            await _context.AssignmentLabels.AddAsync(label);
            await _context.SaveChangesAsync();

            return label.ToDto();
        }
        public async Task<AssignmentLabelDto> UpdateAssignmentLabelAsync(Guid id, Guid labelId, AssignmentLabelUpdateDto dto)
        {
            if (! await _context.Projects.AnyAsync(p => p.Id == id))
                throw new NotFoundException(nameof(Project), id); 
            
            var label = await _context.AssignmentLabels.FirstOrDefaultAsync(l => l.Id == labelId && l.ProjectId == id)
                ?? throw new NotFoundException(nameof(AssignmentLabel), labelId);

            if(dto.SetProperties.Contains(nameof(dto.Name))) label.Name = dto.Name!;
            if(dto.SetProperties.Contains(nameof(dto.HexColor))) label.HexColor = dto.HexColor!;
            label.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
        
            return label.ToDto();
        }
        public async Task DeleteAssignmentLabelAsync(Guid id, Guid labelId)
        {
            if (! await _context.Projects.AnyAsync(p => p.Id == id))
                throw new NotFoundException(nameof(Project), id); 
            
            var label = await _context.AssignmentLabels.FirstOrDefaultAsync(l => l.Id == labelId && l.ProjectId == id)
                ?? throw new NotFoundException(nameof(AssignmentLabel), labelId);

            _context.AssignmentLabels.Remove(label);
            await _context.SaveChangesAsync();

            return;
        }

        // statuses

        public async Task<IEnumerable<AssignmentStatusDto>> GetAssignmentStatuses()
        {
            var statuses = await _context.AssignmentStatuses.ToListAsync();
            var total = statuses.Count();
            return statuses.Select(a => a.ToDto());
        }
    }
}
