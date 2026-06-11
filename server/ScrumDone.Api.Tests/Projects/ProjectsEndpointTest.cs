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
            db.Projects.Add(new Project { Id = projectId, Name = "Project", Description = "" });
            db.Sprints.AddRange(
                new Sprint { ProjectId = projectId, IsKanban = false },
                new Sprint { ProjectId = projectId, IsKanban = true }
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
                new Project { Id = projectId, Name = "Project", Description = "" },
                new Project { Id = otherProjectId, Name = "Other", Description = "" }
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
            new SprintCreateDto { Name = "Sprint 1", IsKanban = false });

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
            new SprintCreateDto { Name = "Sprint 1" });

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
}