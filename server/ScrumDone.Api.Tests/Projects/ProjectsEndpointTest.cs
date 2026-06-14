using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Tests.Common;
using ScrumDone.Api.Utilities;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using Xunit;

namespace ScrumDone.Api.Tests.Projects;

public class ProjectsEndpointTests
{
    // POST /api/projects

    [Fact]
    public async Task CreateProject_WithValidData_ReturnsCreatedProject()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var request = new ProjectCreateDto
        {
            Name = "Test Project",
            Description = "Test Description",
            IsSetToScrum = true,
            TeamMemberIds = new List<Guid> { userId }
        };

        var response = await client.PostAsJsonAsync("/api/projects", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.NotEqual(Guid.Empty, project.Id);
        Assert.Equal(request.Name, project.Name);
        Assert.Equal(request.Description, project.Description);
        Assert.Equal(request.IsSetToScrum, project.IsSetToScrum);
        Assert.True(project.IsActive);
        Assert.Equal(1, project.TeamMemberCount);
        Assert.NotNull(project.HexColor);
        Assert.Contains(project.HexColor, ColorHelper.HighlyDistinctColors);
    }

    [Fact]
    public async Task CreateProject_WithMinimalData_ReturnsCreatedProject()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "Minimal Project", TeamMemberIds = new List<Guid> { userId } });

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
        Assert.NotNull(project.HexColor);
        Assert.Equal(1, project.TeamMemberCount);
    }

    [Fact]
    public async Task CreateProject_WithEmptyTeamMembers_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "No Members Project", TeamMemberIds = new List<Guid>() });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "TeamMemberIds"));
    }

    [Fact]
    public async Task CreateProject_WithEmptyName_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "", TeamMemberIds = new List<Guid> { userId } });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateProject_WithNameTooLong_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = new string('A', 201), TeamMemberIds = new List<Guid> { userId } });

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

    // ── auto-color tests ──────────────────────────────────────────────────────

    [Fact]
    public async Task CreateProject_WithoutColor_AutoAssignsColor()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "No Color", TeamMemberIds = new List<Guid> { userId } });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.NotNull(project.HexColor);
        Assert.Contains(project.HexColor, ColorHelper.HighlyDistinctColors);
    }

    [Fact]
    public async Task CreateProject_AllColorsUsed_StillGetsAColor()
    {
        using var app = new ScrumDoneApiFactory();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            foreach (var color in ColorHelper.HighlyDistinctColors)
            {
                db.Projects.Add(new Project
                {
                    Id = Guid.NewGuid(),
                    Name = $"Project {color}",
                    Description = "",
                    HexColor = color
                });
            }
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/projects",
            new ProjectCreateDto { Name = "Overflow", TeamMemberIds = new List<Guid> { userId } });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.NotNull(project.HexColor);
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
                new Project { Name = "Project 1", Description = "", HexColor = "#0072B2" },
                new Project { Name = "Project 2", Description = "", HexColor = "#D55E00" }
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
                new Project { Name = "Project 1", Description = "", HexColor = "#0072B2" },
                new Project { Name = "Project 2", Description = "", HexColor = "#D55E00" }
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
                new Project { Name = "Active", Description = "", IsActive = true, HexColor = "#0072B2" },
                new Project { Name = "Inactive", Description = "", IsActive = false, HexColor = "#D55E00" }
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
                new Project { Name = "Company Project", Description = "", CompanyId = companyId, HexColor = "#0072B2" },
                new Project { Name = "Other Project", Description = "", HexColor = "#D55E00" }
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
                HexColor = "#0072B2",
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
                HexColor = "#0072B2",
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
        Assert.Equal("Old Description", project.Description);
        Assert.True(project.IsActive);
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
                Description = "Original Description",
                HexColor = "#0072B2"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new { isActive = false });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);
        Assert.Equal("Original Name", project.Name);
        Assert.Equal("Original Description", project.Description);
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
            db.Projects.Add(new Project { Id = projectId, Name = "Valid Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Valid Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "To Delete", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
                HexColor = "#0072B2",
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

    // DELETE /api/projects/{id}/members/{userId}

    [Fact]
    public async Task RemoveMember_MultipleMembers_ReturnsNoContentAndRemovesFromAssignments()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userToRemoveId = Guid.NewGuid();
        var userToKeepId = Guid.NewGuid();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(async db =>
        {
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Test Project",
                Description = "",
                HexColor = "#0072B2",
                TeamMembers = new List<ProjectUserMTMRelation>
                {
                    new() { UserId = userToRemoveId },
                    new() { UserId = userToKeepId }
                }
            });

            db.Users.AddRange(
                new User { Id = userToRemoveId, Name = "Alice (To Remove)" },
                new User { Id = userToKeepId, Name = "Bob (To Keep)" }
            );

            var statusId = Guid.NewGuid();
            db.AssignmentStatuses.Add(new AssignmentStatus
            {
                Id = statusId,
                Name = "To Do",
                HexColor = "#808080",
                Order = 0
            });

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Shared Task",
                ProjectId = projectId,
                StatusId = statusId,
                Assignees = new List<AssignmentUserMTMRelation>
                {
                    new() { UserId = userToRemoveId },
                    new() { UserId = userToKeepId }
                }
            });

            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/projects/{projectId}/members/{userToRemoveId}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var projectResponse = await client.GetAsync($"/api/projects/{projectId}");
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(projectResponse);

        Assert.DoesNotContain(project.TeamMembers, m => m.Id == userToRemoveId);
        Assert.Contains(project.TeamMembers, m => m.Id == userToKeepId);
        Assert.Equal(1, project.TeamMemberCount);

        var removedUserAssignmentsResponse = await client.GetAsync(
            $"/api/assignments?projectIds={projectId}&assigneeIds={userToRemoveId}");
        var removedUserPage = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(removedUserAssignmentsResponse);

        Assert.Equal(0, removedUserPage.TotalCount);

        var keptUserAssignmentsResponse = await client.GetAsync(
            $"/api/assignments?projectIds={projectId}&assigneeIds={userToKeepId}");
        var keptUserPage = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(keptUserAssignmentsResponse);

        Assert.Equal(1, keptUserPage.TotalCount);
    }

    [Fact]
    public async Task RemoveMember_ExistingMember_ReturnsNoContent()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            db.Users.Add(new User { Id = userId2, Name = "User2" });
            db.Projects.Add(new Project
            {
                Id = projectId,
                Name = "Project",
                Description = "",
                HexColor = "#0072B2",
                TeamMembers = new List<ProjectUserMTMRelation>
                {
                    new ProjectUserMTMRelation { UserId = userId },
                    new ProjectUserMTMRelation { UserId = userId2 }
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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
                new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true },
                new Project { Id = otherProjectId, Name = "Other", Description = "", HexColor = "#D55E00", IsSetToScrum = true }
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
                new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" },
                new Project { Id = otherProjectId, Name = "Other", Description = "", HexColor = "#D55E00" }
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "Bug", HexColor = "#FF0000" });

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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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

    [Fact]
    public async Task CreateAssignmentLabel_DuplicateName_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var existingLabelName = "Bug";

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            db.AssignmentLabels.Add(new AssignmentLabel
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Name = existingLabelName,
                HexColor = "#FF0000"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = existingLabelName, HexColor = "#00FF00" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CreateAssignmentLabel_MaxLabelsReached_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            for (int i = 0; i < 50; i++)
            {
                db.AssignmentLabels.Add(new AssignmentLabel
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    Name = $"Label {i}",
                    HexColor = "#FF0000"
                });
            }
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "Extra Label", HexColor = "#00FF00" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CreateAssignmentLabel_NameWithWhitespace_TrimsAndDetectsDuplicate()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            db.AssignmentLabels.Add(new AssignmentLabel
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                Name = "Bug",
                HexColor = "#FF0000"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "  Bug  ", HexColor = "#00FF00" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CreateAssignmentLabel_WhitespaceName_IsTrimmedAndStored()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "   Clean   ", HexColor = "#0000FF" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var label = await TestResponse.ReadJsonAsync<AssignmentLabelDto>(response);
        Assert.Equal("Clean", label.Name);
    }

    // ── auto-color for labels ─────────────────────────────────────────────────

    [Fact]
    public async Task CreateAssignmentLabel_WithoutColor_AutoAssignsColor()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "AutoColor" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var label = await TestResponse.ReadJsonAsync<AssignmentLabelDto>(response);
        Assert.NotNull(label.HexColor);
        Assert.Contains(label.HexColor, ColorHelper.HighlyDistinctColors);
    }

    [Fact]
    public async Task CreateAssignmentLabel_AllColorsUsed_StillGetsAColor()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            foreach (var color in ColorHelper.HighlyDistinctColors)
            {
                db.AssignmentLabels.Add(new AssignmentLabel
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    Name = $"Label {color}",
                    HexColor = color
                });
            }
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync($"/api/projects/{projectId}/assignment-labels",
            new AssignmentLabelCreateDto { Name = "Overflow" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var label = await TestResponse.ReadJsonAsync<AssignmentLabelDto>(response);
        Assert.NotNull(label.HexColor);
    }

    [Fact]
    public async Task UpdateAssignmentLabel_NonExistentLabel_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
                new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" },
                new Project { Id = otherProjectId, Name = "Other", Description = "", HexColor = "#D55E00" }
            );
            db.AssignmentLabels.Add(new AssignmentLabel
            {
                Id = labelId,
                ProjectId = otherProjectId,
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
                HexColor = "#0072B2",
                IsSetToScrum = true
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var patchResponse = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new { isSetToScrum = false });

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
            db.Sprints.AddRange(
                new Sprint { Id = oldSprintId, ProjectId = projectId, Name = "Stary", StartDate = DateTimeOffset.UtcNow.AddDays(-30), EndDate = DateTimeOffset.UtcNow.AddDays(-16), IsKanban = true },
                new Sprint { Id = currentSprintId, ProjectId = projectId, Name = "Obecny", StartDate = DateTimeOffset.UtcNow.AddDays(-2), EndDate = DateTimeOffset.UtcNow.AddDays(12), IsKanban = false }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var patchResponse = await client.PatchAsJsonAsync($"/api/projects/{projectId}",
            new { IsSetToScrum = false });

        if (!patchResponse.IsSuccessStatusCode)
        {
            var errorBody = await patchResponse.Content.ReadAsStringAsync();
            throw new Exception($"API zwróciło kod {patchResponse.StatusCode}. Treść: {errorBody}");
        }

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

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
            db.Projects.Add(new Project { Id = projectId, Name = "Kanban Project", Description = "", HexColor = "#0072B2", IsSetToScrum = false });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, IsKanban = true });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, Name = "Scrum Sprint 1", IsKanban = false },
                new Sprint { ProjectId = projectId, Name = "Ghost Kanban", IsKanban = true }
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = false });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = false });
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, StartDate = DateTimeOffset.UtcNow.AddDays(-20), EndDate = DateTimeOffset.UtcNow.AddDays(-6) },
                new Sprint { Id = activeSprintId, ProjectId = projectId, StartDate = DateTimeOffset.UtcNow.AddDays(-2), EndDate = DateTimeOffset.UtcNow.AddDays(12), IsKanban = true },
                new Sprint { ProjectId = projectId, StartDate = DateTimeOffset.UtcNow.AddDays(15), EndDate = DateTimeOffset.UtcNow.AddDays(29) }
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
            db.Projects.Add(new Project { Id = projectId, Name = "Empty Project", Description = "", HexColor = "#0072B2" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/projects/{projectId}/sprints/current");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task AddMember_SameUserTwice_ReturnsConflictOnSecondRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            db.Users.Add(new User { Id = userId, Name = "Alice" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var first = await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        var second = await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task AddMember_SameUserTwice_ProjectHasOnlyOneMember()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
            db.Users.Add(new User { Id = userId, Name = "Alice" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);
        await client.PostAsync($"/api/projects/{projectId}/members/{userId}", null);

        var response = await client.GetAsync($"/api/projects/{projectId}");
        var project = await TestResponse.ReadJsonAsync<ProjectDetailDto>(response);

        Assert.Equal(1, project.TeamMemberCount);
        Assert.Single(project.TeamMembers);
    }

    [Fact]
    public async Task GetProject_ScrumProject_SprintsFieldContainsOnlyScrumSprints()
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
                Name = "Scrum Project",
                Description = "",
                HexColor = "#0072B2",
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
                HexColor = "#0072B2",
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

        Assert.DoesNotContain(project.Sprints, s => s.Id == scrumSprintId);
        Assert.Contains(project.Sprints, s => s.Id == kanbanSprintId);
    }

    [Fact]
    public async Task GetProject_SprintList_MatchesGetSprintsEndpoint()
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
                HexColor = "#0072B2",
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

        Assert.Equal(listIds, detailIds);
    }

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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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
        Assert.Equal(2, sprint.CompletedCount);
    }

    [Fact]
    public async Task GetSprints_WithNoCompletedAssignments_CompletedCountIsZero()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var statusId = Guid.NewGuid();

        await app.SeedDatabaseAsync(async db =>
        {
            db.AssignmentStatuses.Add(
                new AssignmentStatus { Id = statusId, Name = "To Do", HexColor = "#808080", Order = 0 }
            );
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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

    [Fact]
    public async Task CreateSprint_OverlapsExistingFromRight_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
                StartDate = baseDate.AddDays(10),
                EndDate = baseDate.AddDays(20)
            });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task CreateSprint_NewSprintContainsExistingCompletely_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2" });
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
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var baseDate = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero);

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "", HexColor = "#0072B2", IsSetToScrum = true });
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