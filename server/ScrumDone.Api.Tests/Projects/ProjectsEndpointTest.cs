using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Tests.Common;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ScrumDone.Api.Tests.Projects;

public class ProjectsEndpointTests
{
    // POST /api/projects

    [Fact]
    public async Task CreateProject_WithValidData_ReturnsCreatedProject()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new ProjectCreateDto
        {
            Name = "Test Project",
            Description = "Test Description",
            IsSetToScrum = true,
            TeamMemberIds = new List<Guid>()
        };

        var response = await client.PostAsJsonAsync("/api/projects", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.NotEqual(Guid.Empty, project.Id);
        Assert.Equal(request.Name, project.Name);
        Assert.Equal(request.Description, project.Description);
        Assert.Equal(request.IsSetToScrum, project.IsSetToScrum);
        Assert.True(project.IsActive);
        Assert.Equal(0, project.TeamMemberCount);
    }

    [Fact]
    public async Task CreateProject_WithMinimalData_ReturnsCreatedProject()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "Minimal Project", TeamMemberIds = new List<Guid>() });

        if (response.StatusCode == HttpStatusCode.InternalServerError)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"API exploded with 500! Response body: {errorContent}");
        }

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.Equal("Minimal Project", project.Name);
        Assert.False(project.IsSetToScrum);
        Assert.Null(project.CompanyId);
    }

    [Fact]
    public async Task CreateProject_WithEmptyName_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "", TeamMemberIds = new List<Guid>() });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateProject_WithNameTooLong_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = new string('A', 201), TeamMemberIds = new List<Guid>() });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateProject_WithNonExistentTeamMember_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto
            {
                Name = "Test Project",
                TeamMemberIds = new List<Guid> { Guid.NewGuid() }
            });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateProject_WithExistingTeamMembers_ReturnsCorrectMemberCount()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto
            {
                Name = "Team Project",
                TeamMemberIds = new List<Guid> { userId }
            });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.Equal(1, project.TeamMemberCount);
    }

    // GET /api/projects

    [Fact]
    public async Task GetProjects_EmptyDatabase_ReturnsEmptyPagedResult()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/projects");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ProjectListItemDto>>(response);
        Assert.Empty(page.Items);
        Assert.Equal(0, page.TotalCount);
        Assert.False(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
    }

    [Fact]
    public async Task GetProjects_WithPaging_ReturnsPagedProjects()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.AddRange(
                new Project { Name = "Project 1", Description = "" },
                new Project { Name = "Project 2", Description = "" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/projects?page=1&limit=1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ProjectListItemDto>>(response);
        Assert.Equal(1, page.Page);
        Assert.Equal(1, page.PageSize);
        Assert.Equal(2, page.TotalCount);
        Assert.True(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
        Assert.Single(page.Items);
    }

    [Fact]
    public async Task GetProjects_SecondPage_HasPreviousPage()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.AddRange(
                new Project { Name = "Project 1", Description = "" },
                new Project { Name = "Project 2", Description = "" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/projects?page=2&limit=1");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ProjectListItemDto>>(response);
        Assert.True(page.HasPreviousPage);
        Assert.False(page.HasNextPage);
    }

    [Fact]
    public async Task GetProjects_FilterByIsActive_ReturnsOnlyActiveProjects()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.AddRange(
                new Project { Name = "Active", Description = "", IsActive = true },
                new Project { Name = "Inactive", Description = "", IsActive = false }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/projects?isActive=true");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ProjectListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.All(page.Items, p => Assert.True(p.IsActive));
    }

    [Fact]
    public async Task GetProjects_FilterByCompanyId_ReturnsOnlyCompanyProjects()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Company" });
            db.Projects.AddRange(
                new Project { Name = "Company Project", Description = "", CompanyId = companyId },
                new Project { Name = "Other Project", Description = "" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects?companyId={companyId}");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ProjectListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.All(page.Items, p => Assert.Equal(companyId, p.CompanyId));
    }

    [Fact]
    public async Task GetProjects_FilterByNonExistentCompany_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects?companyId={Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetProjects_WithInvalidPaging_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/projects?page=0&limit=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(
            TestResponse.HasValidationError(problem, "Page") ||
            TestResponse.HasValidationError(problem, "Limit"));
    }

    // GET /api/projects/{id}

    [Fact]
    public async Task GetProject_ExistingId_ReturnsProjectDetails()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Existing Project",
                Description = "Some description",
                IsActive = true,
                IsSetToScrum = false
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.Equal(projectId, project.Id);
        Assert.Equal("Existing Project", project.Name);
        Assert.Equal("Some description", project.Description);
        Assert.Equal(0, project.TeamMemberCount);
        Assert.Empty(project.TeamMembers);
        Assert.Empty(project.Sprints);
    }

    [Fact]
    public async Task GetProject_NonExistentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // PATCH /api/projects/{id}

    [Fact]
    public async Task UpdateProject_WithValidData_UpdatesOnlyProvidedFields()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Old Name",
                Description = "Old Description",
                IsActive = true
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new { name = "New Name" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.Equal("New Name", project.Name);
        Assert.Equal("Old Description", project.Description); // unchanged
        Assert.True(project.IsActive); // unchanged
    }

    [Fact]
    public async Task UpdateProject_OmittedField_IsNotUpdated()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Original Name",
                Description = "Original Description"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new { isActive = false });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.Equal("Original Name", project.Name);      // unchanged
        Assert.Equal("Original Description", project.Description); // unchanged
        Assert.False(project.IsActive);
    }

    [Fact]
    public async Task UpdateProject_NonExistentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/projects/{Guid.NewGuid()}",
            new { name = "New Name" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    [Fact]
    public async Task UpdateProject_WithNameTooLong_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Valid Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new ProjectUpdateDto { Name = new string('A', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task UpdateProject_WithEmptyName_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Valid Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new ProjectUpdateDto { Name = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    // DELETE /api/projects/{id}

    [Fact]
    public async Task DeleteProject_ExistingId_RemovesProject()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "To Delete", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/projects/{projectId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/projects/{projectId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteProject_NonExistentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/projects/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // POST /api/projects/{id}/members/{userId}

[Fact]
public async Task AddMember_ValidUserAndProject_ReturnsCreatedUserSummaryDto()
{
    using var app = new ScrumDoneApiFactory();
    var projectId = Guid.NewGuid();
    var userId = Guid.NewGuid();
    var userName = "Test User";

    await app.SeedDatabaseAsync(db =>
    {
        db.Projects.Add(new Project { Id = projectId, Name = "Test Project", Description = "" });
        db.Users.Add(new User { Id = userId, Name = userName });
        return Task.CompletedTask;
    });

    using var client = app.CreateClient();

    var response = await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);

    var returnedUser = await response.Content.ReadFromJsonAsync<UserSummaryDto>();

    Assert.NotNull(returnedUser);
    Assert.Equal(userId, returnedUser.Id);
    Assert.Equal(userName, returnedUser.Name);
}

    [Fact]
    public async Task AddMember_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsync($"/api/projects/{Guid.NewGuid()}/members/{userId}", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddMember_NonExistentUser_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsync($"/api/projects/{projectId}/members/{Guid.NewGuid()}", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddMember_AlreadyMember_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Project",
                Description = "",
                TeamMembers = new List<ProjectUserMTMRelation>
                {
                    new ProjectUserMTMRelation { UserId = userId }
                }
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task RemoveMember_ExistingMember_AlsoRemovesFromAllProjectAssignments()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var assignment1Id = Guid.NewGuid();
        var assignment2Id = Guid.NewGuid();

        // Seed project, users, and assignments with the user as assignee
        await app.SeedDatabaseAsync(async db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Test Project",
                Description = "",
                TeamMembers = new List<ProjectUserMTMRelation>
            {
                new() { UserId = userId }
            }
            });
            db.Users.AddRange(
                new User { Id = userId, Name = "Alice" },
                new User { Id = otherUserId, Name = "Bob" }
            );

            // Need a valid status and priority for Assignment seeding
            var statusId = Guid.NewGuid();
            db.AssignmentStatuses.Add(new AssignmentStatus
            {
                Id = statusId,
                Name = "To Do",
                HexColor = "#808080",
                Order = 0
            });

            // Two assignments: one with only the target user, one with both users
            db.Assignment.AddRange(
                new Assignment
                {
                    Id = assignment1Id,
                    Name = "Task 1",
                    ProjectId = projectId,
                    StatusId = statusId,
                    Assignees = new List<AssignmentUserMTMRelation>
                    {
                    new() { UserId = userId }
                    }
                },
                new Assignment
                {
                    Id = assignment2Id,
                    Name = "Task 2",
                    ProjectId = projectId,
                    StatusId = statusId,
                    Assignees = new List<AssignmentUserMTMRelation>
                    {
                    new() { UserId = userId },
                    new() { UserId = otherUserId }
                    }
                }
            );

            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();

        // Act: remove the member
        var deleteResponse = await client.DeleteAsync($"/api/projects/{projectId}/members/{userId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Assert: user is no longer a project member
        var projectResponse = await client.GetAsync($"/api/projects/{projectId}");
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(projectResponse);
        Assert.DoesNotContain(project.TeamMembers, m => m.Id == userId);

        // Assert: user is no longer assigned to any assignment in that project
        var assignmentsResponse = await client.GetAsync(
            $"/api/assignments?projectIds={projectId}&assigneeIds={userId}");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(assignmentsResponse);
        Assert.Equal(0, page.TotalCount);

        // Optional sanity: the other user's assignment still exists
        var otherAssignmentsResponse = await client.GetAsync(
            $"/api/assignments?projectIds={projectId}&assigneeIds={otherUserId}");
        var otherPage = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(otherAssignmentsResponse);
        Assert.Equal(1, otherPage.TotalCount);
    }

    // DELETE /api/projects/{id}/members/{userId}

    [Fact]
    public async Task RemoveMember_ExistingMember_ReturnsNoContent()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Project",
                Description = "",
                TeamMembers = new List<ProjectUserMTMRelation>
                {
                    new ProjectUserMTMRelation { UserId = userId }
                }
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/projects/{projectId}/members/{userId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task RemoveMember_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/projects/{Guid.NewGuid()}/members/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RemoveMember_UserNotInProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/projects/{projectId}/members/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // GET /api/projects/{id}/sprints

    [Fact]
    public async Task GetSprints_ExistingProject_ReturnsSprints()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true});
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, IsKanban = false },
                new Sprint { ProjectId = projectId, IsKanban = false }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);
        Assert.Equal(2, page.TotalCount);
    }

    [Fact]
    public async Task GetSprints_ReturnsOnlySprintsForProject()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var otherProjectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.AddRange(
                new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true },
                new Project { Id = otherProjectId, Name = "Other", Description = "", IsSetToScrum = true }
            );
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, IsKanban = false },
                new Sprint { ProjectId = otherProjectId, IsKanban = false }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);
        Assert.Equal(1, page.TotalCount);
    }

    [Fact]
    public async Task GetSprints_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{Guid.NewGuid()}/sprints");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // POST /api/projects/{id}/sprints

    [Fact]
    public async Task CreateSprint_WithValidData_ReturnsSprint()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto { Name = "Sprint 1", StartDate = DateTimeOffset.UtcNow, EndDate = DateTimeOffset.UtcNow.AddDays(14) });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var sprint = await TestResponse.ReadJsonAsync<SprintSummaryDto>(response);
        Assert.Equal("Sprint 1", sprint.Name);
        Assert.False(sprint.IsKanban);
        Assert.Equal(0, sprint.AssignmentCount);
    }

    [Fact]
    public async Task CreateSprint_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{Guid.NewGuid()}/sprints",
            new SprintCreateDto { Name = "Sprint 1", StartDate = DateTimeOffset.UtcNow, EndDate = DateTimeOffset.UtcNow.AddDays(14) });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateSprint_WithEndDateBeforeStartDate_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "Sprint 1",
                StartDate = DateTimeOffset.UtcNow.AddDays(5),
                EndDate = DateTimeOffset.UtcNow.AddDays(1)
            });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "StartDate") ||
                    TestResponse.HasValidationError(problem, "EndDate"));
    }

    // GET /api/projects/{id}/assignment-labels

    [Fact]
    public async Task GetAssignmentLabels_ExistingProject_ReturnsLabels()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.AssignmentLabels.AddRange(
                new AssignmentLabel { ProjectId = projectId, Name = "Frontend", HexColor = "#FF0000" },
                new AssignmentLabel { ProjectId = projectId, Name = "Backend", HexColor = "#0000FF" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/assignment-labels");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var labels = await TestResponse.ReadJsonAsync<IEnumerable<AssignmentLabelDto>>(response);
        Assert.Equal(2, labels.Count());
    }

    [Fact]
    public async Task GetAssignmentLabels_ReturnsOnlyLabelsForProject()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var otherProjectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.AddRange(
                new Project { Id = projectId, Name = "Project", Description = "" },
                new Project { Id = otherProjectId, Name = "Other", Description = "" }
            );
            db.AssignmentLabels.AddRange(
                new AssignmentLabel { ProjectId = projectId, Name = "My Label", HexColor = "#FF0000" },
                new AssignmentLabel { ProjectId = otherProjectId, Name = "Other Label", HexColor = "#00FF00" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/assignment-labels");

        var labels = await TestResponse.ReadJsonAsync<IEnumerable<AssignmentLabelDto>>(response);
        Assert.Single(labels);
        Assert.Equal("My Label", labels.First().Name);
    }

    [Fact]
    public async Task GetAssignmentLabels_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{Guid.NewGuid()}/assignment-labels");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // POST /api/projects/{id}/assignment-labels

    [Fact]
    public async Task CreateAssignmentLabel_WithValidData_ReturnsCreatedLabel()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto{ Name = "Bug", HexColor = "#FF0000" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var label = await TestResponse.ReadJsonAsync<AssignmentLabelDto>(response);
        Assert.NotEqual(Guid.Empty, label.Id);
        Assert.Equal("Bug", label.Name);
        Assert.Equal("#FF0000", label.HexColor);
    }

    [Fact]
    public async Task CreateAssignmentLabel_WithShortHexColor_ReturnsCreatedLabel()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "Bug", HexColor = "#F00" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateAssignmentLabel_InvalidHexColor_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "Bug", HexColor = "not-a-color" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "HexColor"));
    }

    [Fact]
    public async Task CreateAssignmentLabel_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{Guid.NewGuid()}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "Bug", HexColor = "#FF0000" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // PATCH /api/projects/{id}/assignment-labels/{labelId}

    [Fact]
    public async Task UpdateAssignmentLabel_WithValidData_UpdatesOnlyProvidedFields()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var labelId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.AssignmentLabels.Add(new AssignmentLabel
            {
                Id = labelId,
                ProjectId = projectId,
                Name = "Old Name",
                HexColor = "#FF0000"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync(
            $"/api/projects/{projectId}/assignment-labels/{labelId}",
            new { name = "New Name" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var label = await TestResponse.ReadJsonAsync<AssignmentLabelDto>(response);
        Assert.Equal("New Name", label.Name);
        Assert.Equal("#FF0000", label.HexColor); // unchanged
    }

    [Fact]
    public async Task UpdateAssignmentLabel_NonExistentLabel_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync(
            $"/api/projects/{projectId}/assignment-labels/{Guid.NewGuid()}",
            new { name = "New Name" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateAssignmentLabel_LabelFromOtherProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var otherProjectId = Guid.NewGuid();
        var labelId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.AddRange(
                new Project { Id = projectId, Name = "Project", Description = "" },
                new Project { Id = otherProjectId, Name = "Other", Description = "" }
            );
            db.AssignmentLabels.Add(new AssignmentLabel
            {
                Id = labelId,
                ProjectId = otherProjectId, // należy do innego projektu
                Name = "Label",
                HexColor = "#FF0000"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync(
            $"/api/projects/{projectId}/assignment-labels/{labelId}",
            new { name = "Hacked" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // DELETE /api/projects/{id}/assignment-labels/{labelId}

    [Fact]
    public async Task DeleteAssignmentLabel_ExistingLabel_RemovesLabel()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var labelId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.AssignmentLabels.Add(new AssignmentLabel
            {
                Id = labelId,
                ProjectId = projectId,
                Name = "To Delete",
                HexColor = "#FF0000"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync(
            $"/api/projects/{projectId}/assignment-labels/{labelId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/projects/{projectId}/assignment-labels");
        var labels = await TestResponse.ReadJsonAsync<IEnumerable<AssignmentLabelDto>>(getResponse);
        Assert.Empty(labels);
    }

    [Fact]
    public async Task DeleteAssignmentLabel_NonExistentLabel_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.DeleteAsync(
            $"/api/projects/{projectId}/assignment-labels/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteAssignmentLabel_NonExistentProject_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync(
            $"/api/projects/{Guid.NewGuid()}/assignment-labels/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
        [Fact]
    public async Task UpdateProject_ChangeToKanbanWithNoSprints_CreatesNewKanbanSprint()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project 
            { 
                Id = projectId, 
                Name = "Scrum Project", 
                Description = "", 
                IsSetToScrum = true 
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Przejście na Kanban
        var patchResponse = await client.PatchAsJsonAsync($"/api/projects/{projectId}", 
            new { isSetToScrum = false });
            
        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        // Sprawdzamy czy API automatycznie wygenerowało nowy sprint dla Kanbana
        var sprintsResponse = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var sprintsPage = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(sprintsResponse);
        
        Assert.Equal(1, sprintsPage.TotalCount);
        Assert.True(sprintsPage.Items.First().IsKanban);
    }

    [Fact]
    public async Task UpdateProject_ChangeToKanbanWithExistingSprints_SetsOnlyOneToKanban()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var oldSprintId = Guid.NewGuid();
        var currentSprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true });
            
            // DODANE: Uzupełniłem pole Name. Jeśli encja Sprint wymaga Name,
            // EF Core mógł rzucać cichy błąd walidacji podczas zapisu!
            db.Sprints.AddRange(
                new Sprint { Id = oldSprintId, ProjectId = projectId, Name = "Stary", StartDate = DateTimeOffset.UtcNow.AddDays(-30), EndDate = DateTimeOffset.UtcNow.AddDays(-16), IsKanban = true }, 
                new Sprint { Id = currentSprintId, ProjectId = projectId, Name = "Obecny", StartDate = DateTimeOffset.UtcNow.AddDays(-2), EndDate = DateTimeOffset.UtcNow.AddDays(12), IsKanban = false }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // DODANE: Zmiana z isSetToScrum (mała litera) na IsSetToScrum (wielka litera). 
        // Jeśli Twój mechanizm SetProperties zależy od dokładnej nazwy (nameof), 
        // mała litera sprawiała, że logika zmiany całkowicie się pomijała!
        var patchResponse = await client.PatchAsJsonAsync($"/api/projects/{projectId}", 
            new { IsSetToScrum = false });
        
        // DODANE: Zrzut błędu do konsoli. Jeśli API wybuchnie, test Ci to pokaże!
        if (!patchResponse.IsSuccessStatusCode)
        {
            var errorBody = await patchResponse.Content.ReadAsStringAsync();
            throw new Exception($"API zwróciło kod {patchResponse.StatusCode}. Treść: {errorBody}");
        }

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>(); // Upewnij się, że tu jest właściwa nazwa kontekstu
        
        var oldSprint = await dbContext.Sprints.FindAsync(oldSprintId);
        var currentSprint = await dbContext.Sprints.FindAsync(currentSprintId);

        Assert.False(oldSprint!.IsKanban);
        Assert.True(currentSprint!.IsKanban);
    }

    [Fact]
    public async Task UpdateProject_ChangeToScrum_RemovesAllKanbanFlags()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Kanban Project", Description = "", IsSetToScrum = false });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, IsKanban = true });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Powrót na Scrum
        var patchResponse = await client.PatchAsJsonAsync($"/api/projects/{projectId}", 
            new { isSetToScrum = true });
            
        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var sprint = await dbContext.Sprints.FindAsync(sprintId);

        Assert.False(sprint!.IsKanban);
    }

    [Fact]
    public async Task GetSprints_ProjectIsScrum_ReturnsOnlyScrumSprints()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            // Projekt w trybie SCRUM
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true });
            
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, Name = "Scrum Sprint 1", IsKanban = false },
                new Sprint { ProjectId = projectId, Name = "Ghost Kanban", IsKanban = true } // Teoretycznie zepsuty rekord, nie powinien zostać zwrócony
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);

        Assert.Equal(1, page.TotalCount);
        Assert.False(page.Items.First().IsKanban);
        Assert.Equal("Scrum Sprint 1", page.Items.First().Name);
    }

    [Fact]
    public async Task GetSprints_ProjectIsKanban_ReturnsOnlyKanbanSprint()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            // Projekt w trybie KANBAN
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = false });
            
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, Name = "Old Scrum Sprint", IsKanban = false },
                new Sprint { ProjectId = projectId, Name = "Current Board", IsKanban = true }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);

        Assert.Equal(1, page.TotalCount);
        Assert.True(page.Items.First().IsKanban);
        Assert.Equal("Current Board", page.Items.First().Name);
    }

    [Fact]
    public async Task GetCurrentSprint_WhenActiveSprintExists_ReturnsActiveSprint()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var activeSprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = false });
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, StartDate = DateTimeOffset.UtcNow.AddDays(-20), EndDate = DateTimeOffset.UtcNow.AddDays(-6) }, // Zakończony
                new Sprint { Id = activeSprintId, ProjectId = projectId, StartDate = DateTimeOffset.UtcNow.AddDays(-2), EndDate = DateTimeOffset.UtcNow.AddDays(12), IsKanban = true }, // Aktywny
                new Sprint { ProjectId = projectId, StartDate = DateTimeOffset.UtcNow.AddDays(15), EndDate = DateTimeOffset.UtcNow.AddDays(29) } // Przyszły
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints/current");
        
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        
        var sprint = await TestResponse.ReadJsonAsync<SprintDetailDto>(response);
        Assert.Equal(activeSprintId, sprint.Id);
    }

    [Fact]
    public async Task GetCurrentSprint_NoSprintsExist_ReturnsNoContent()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Empty Project", Description = "" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints/current");
        
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode); 
    }

        [Fact]
    public async Task AddMember_SameUserTwice_ReturnsConflictOnSecondRequest()
    {
        // Ten test ujawnia buga: dwa sekwencyjne requesty z tym samym userId
        // powinny zwrócić 409 Conflict przy drugim, a nie 201 Created.
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Users.Add(new User { Id = userId, Name = "Alice" });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var first = await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
 
        // BUG: bez unique constraintu na bazie drugi request może przejść
        var second = await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }
 
    [Fact]
    public async Task AddMember_SameUserTwice_ProjectHasOnlyOneMember()
    {
        // Dodatkowe sprawdzenie: nawet jeśli endpoint zwróci błąd,
        // upewniamy się że w bazie nie ma duplikatu.
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Users.Add(new User { Id = userId, Name = "Alice" });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
        await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
 
        var response = await client.GetAsync($"/api/projects/{projectId}");
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
 
        // BUG: bez constraintu TeamMemberCount może wynosić 2
        Assert.Equal(1, project.TeamMemberCount);
        Assert.Single(project.TeamMembers);
    }
 
    // ─────────────────────────────────────────────────────────────────
    // BUG 2: GET /projects/{id} nie filtruje sprintów po IsKanban
    //        (zwraca inne sprinty niż GET /projects/{id}/sprints)
    // ─────────────────────────────────────────────────────────────────
 
    [Fact]
    public async Task GetProject_ScrumProject_SprintsFieldContainsOnlyScrumSprints()
    {
        // GET /projects/{id} powinien w polu Sprints zwracać tylko
        // sprinty zgodne z trybem projektu (IsKanban == false dla Scrum).
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var scrumSprintId = Guid.NewGuid();
        var kanbanSprintId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Scrum Project",
                Description = "",
                IsSetToScrum = true
            });
            db.Sprints.AddRange(
                new Sprint { Id = scrumSprintId, ProjectId = projectId, Name = "Scrum Sprint", IsKanban = false },
                new Sprint { Id = kanbanSprintId, ProjectId = projectId, Name = "Ghost Kanban", IsKanban = true }
            );
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.GetAsync($"/api/projects/{projectId}");
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
 
        // BUG: jeśli GET /projects/{id} nie filtruje po IsKanban, zwróci oba sprinty
        Assert.DoesNotContain(project.Sprints, s => s.Id == kanbanSprintId);
        Assert.Contains(project.Sprints, s => s.Id == scrumSprintId);
    }
 
    [Fact]
    public async Task GetProject_KanbanProject_SprintsFieldContainsOnlyKanbanSprints()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var scrumSprintId = Guid.NewGuid();
        var kanbanSprintId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Kanban Project",
                Description = "",
                IsSetToScrum = false
            });
            db.Sprints.AddRange(
                new Sprint { Id = scrumSprintId, ProjectId = projectId, Name = "Old Scrum Sprint", IsKanban = false },
                new Sprint { Id = kanbanSprintId, ProjectId = projectId, Name = "Current Board", IsKanban = true }
            );
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.GetAsync($"/api/projects/{projectId}");
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
 
        // BUG: bez filtra GET /projects/{id} może zwrócić też stary scrum sprint
        Assert.DoesNotContain(project.Sprints, s => s.Id == scrumSprintId);
        Assert.Contains(project.Sprints, s => s.Id == kanbanSprintId);
    }
 
    [Fact]
    public async Task GetProject_SprintList_MatchesGetSprintsEndpoint()
    {
        // Spójność: oba endpointy muszą zwrócić te same sprinty.
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Scrum Project",
                Description = "",
                IsSetToScrum = true
            });
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, Name = "Sprint 1", IsKanban = false },
                new Sprint { ProjectId = projectId, Name = "Ghost Kanban", IsKanban = true }
            );
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var detailResponse = await client.GetAsync($"/api/projects/{projectId}");
        var detail = await TestResponse.ReadJsonAsync<ProjectDetailDto>(detailResponse);
 
        var sprintsResponse = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var sprintsPage = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(sprintsResponse);
 
        var detailIds = detail.Sprints.Select(s => s.Id).OrderBy(x => x).ToList();
        var listIds = sprintsPage.Items.Select(s => s.Id).OrderBy(x => x).ToList();
 
        // BUG: jeśli GET /projects/{id} nie filtruje, detailIds będzie miał więcej elementów
        Assert.Equal(listIds, detailIds);
    }
 
    // ─────────────────────────────────────────────────────────────────
    // BUG 3: CompletedCount zawsze wynosi 0 (AsNoTracking + AsSplitQuery
    //        nie ładuje poprawnie Status przez ThenInclude)
    // ─────────────────────────────────────────────────────────────────
 
    [Fact]
    public async Task GetSprints_WithCompletedAssignments_CompletedCountIsNotZero()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var completedStatusId = Guid.NewGuid();
        var otherStatusId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(async db =>
        {
            db.AssignmentStatuses.AddRange(
                new AssignmentStatus { Id = completedStatusId, Name = "Done", HexColor = "#00FF00", Order = 2 },
                new AssignmentStatus { Id = otherStatusId, Name = "In Progress", HexColor = "#FFFF00", Order = 1 }
            );
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, Name = "Sprint 1", IsKanban = false });
            db.Assignment.AddRange(
                new Assignment { Name = "Done 1", ProjectId = projectId, SprintId = sprintId, StatusId = completedStatusId },
                new Assignment { Name = "Done 2", ProjectId = projectId, SprintId = sprintId, StatusId = completedStatusId },
                new Assignment { Name = "In prog", ProjectId = projectId, SprintId = sprintId, StatusId = otherStatusId }
            );
            await db.SaveChangesAsync();
        });
 
        using var client = app.CreateClient();
 
        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);
 
        var sprint = page.Items.Single();
        Assert.Equal(3, sprint.AssignmentCount);
 
        // BUG: AsNoTracking + AsSplitQuery powoduje że Status jest null,
        // więc CountCompleted zawsze zwraca 0
        Assert.Equal(2, sprint.CompletedCount);
    }
 
    [Fact]
    public async Task GetSprints_WithNoCompletedAssignments_CompletedCountIsZero()
    {
        // Przypadek bazowy — upewniamy się że 0 to poprawna wartość gdy nic nie ukończono,
        // a nie efekt buga.
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var statusId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(async db =>
        {
            db.AssignmentStatuses.Add(
                new AssignmentStatus { Id = statusId, Name = "To Do", HexColor = "#808080", Order = 0 }
            );
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, Name = "Sprint 1", IsKanban = false });
            db.Assignment.Add(new Assignment { Name = "Task", ProjectId = projectId, SprintId = sprintId, StatusId = statusId });
            await db.SaveChangesAsync();
        });
 
        using var client = app.CreateClient();
 
        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);
 
        Assert.Equal(0, page.Items.Single().CompletedCount);
    }
 
    [Fact]
    public async Task GetSprints_AllAssignmentsCompleted_CompletedCountEqualsAssignmentCount()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var completedStatusId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(async db =>
        {
            db.AssignmentStatuses.Add(
                new AssignmentStatus { Id = completedStatusId, Name = "Done", HexColor = "#00FF00", Order = 2 }
            );
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", IsSetToScrum = true });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, Name = "Sprint 1", IsKanban = false });
            db.Assignment.AddRange(
                new Assignment { Name = "Task A", ProjectId = projectId, SprintId = sprintId, StatusId = completedStatusId },
                new Assignment { Name = "Task B", ProjectId = projectId, SprintId = sprintId, StatusId = completedStatusId }
            );
            await db.SaveChangesAsync();
        });
 
        using var client = app.CreateClient();
 
        var response = await client.GetAsync($"/api/projects/{projectId}/sprints");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<SprintSummaryDto>>(response);
 
        var sprint = page.Items.Single();
        Assert.Equal(sprint.AssignmentCount, sprint.CompletedCount);
    }
 
    // ─────────────────────────────────────────────────────────────────
    // BUG 4: Tworzenie sprintu nie sprawdza nakładania się dat
    //        (sprawdza tylko s.EndDate > dto.StartDate, brakuje drugiej strony)
    // ─────────────────────────────────────────────────────────────────
 
    [Fact]
    public async Task CreateSprint_OverlapsExistingFromRight_ReturnsConflict()
    {
        // Istniejący: 1–15 stycznia
        // Nowy:      10–20 stycznia  ← zaczyna się w środku istniejącego
        // BUG: warunek (EndDate > StartDate) wykrywa to, ale brakuje odwrotnej strony
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Sprints.Add(new Sprint
            {
                ProjectId = projectId,
                Name = "Existing Sprint",
                StartDate = baseDate,
                EndDate = baseDate.AddDays(14)
            });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "Overlapping Sprint",
                StartDate = baseDate.AddDays(10),  // zaczyna się w środku istniejącego
                EndDate = baseDate.AddDays(20)
            });
 
        // BUG: brakuje warunku s.StartDate < dto.EndDate, więc ten overlap nie jest wykrywany
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
 
    [Fact]
    public async Task CreateSprint_NewSprintContainsExistingCompletely_ReturnsConflict()
    {
        // Istniejący: 5–10 stycznia
        // Nowy:       1–15 stycznia  ← całkowicie ogarnia istniejący
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Sprints.Add(new Sprint
            {
                ProjectId = projectId,
                Name = "Existing Sprint",
                StartDate = baseDate.AddDays(5),
                EndDate = baseDate.AddDays(10)
            });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "Wrapping Sprint",
                StartDate = baseDate,
                EndDate = baseDate.AddDays(15)
            });
 
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
 
    [Fact]
    public async Task CreateSprint_ExistingContainsNewCompletely_ReturnsConflict()
    {
        // Istniejący: 1–20 stycznia
        // Nowy:       5–10 stycznia  ← mieści się w środku istniejącego
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Sprints.Add(new Sprint
            {
                ProjectId = projectId,
                Name = "Big Existing Sprint",
                StartDate = baseDate,
                EndDate = baseDate.AddDays(20)
            });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "Small Sprint Inside",
                StartDate = baseDate.AddDays(5),
                EndDate = baseDate.AddDays(10)
            });
 
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
 
    [Fact]
    public async Task CreateSprint_OverlapsFromLeft_ReturnsConflict()
    {
        // Istniejący: 10–20 stycznia
        // Nowy:        5–12 stycznia  ← kończy się w środku istniejącego
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Sprints.Add(new Sprint
            {
                ProjectId = projectId,
                Name = "Existing Sprint",
                StartDate = baseDate.AddDays(10),
                EndDate = baseDate.AddDays(20)
            });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "Left Overlap Sprint",
                StartDate = baseDate.AddDays(5),
                EndDate = baseDate.AddDays(12)
            });
 
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
 
    [Fact]
    public async Task CreateSprint_AdjacentToExisting_IsAllowed()
    {
        // Istniejący: 1–14 stycznia
        // Nowy:       15–28 stycznia  ← styka się, ale nie nakłada
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Sprints.Add(new Sprint
            {
                ProjectId = projectId,
                Name = "Sprint 1",
                StartDate = baseDate,
                EndDate = baseDate.AddDays(14)
            });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "Sprint 2",
                StartDate = baseDate.AddDays(14),
                EndDate = baseDate.AddDays(28)
            });
 
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
 
    [Fact]
    public async Task CreateSprint_NoExistingSprints_IsAllowed()
    {
        // Przypadek bazowy — upewniamy się że sprawdzanie nakładania nie blokuje pierwszego sprintu
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
 
        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            return Task.CompletedTask;
        });
 
        using var client = app.CreateClient();
 
        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/sprints",
            new SprintCreateDto
            {
                Name = "First Sprint",
                StartDate = DateTimeOffset.UtcNow,
                EndDate = DateTimeOffset.UtcNow.AddDays(14)
            });
 
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

}