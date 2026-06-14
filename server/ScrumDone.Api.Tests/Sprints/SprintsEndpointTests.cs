using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Sprints;

public class SprintsEndpointTests
{
    // Uwaga: Zgodnie z komentarzami w kontrolerze, tworzenie (POST) 
    // odbywa się przez /projects/{id}/sprints, więc nie testujemy go tutaj.

    // GET /api/sprints/{id}

    [Fact]
    public async Task GetSprintById_ExistingId_ReturnsSprintDetails()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var startDate = DateTimeOffset.UtcNow;
        var endDate = startDate.AddDays(14);

        await app.SeedDatabaseAsync(db =>
        {
            // Sprint wymaga powiązania z projektem
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project" });
            db.Sprints.Add(new Sprint
            {
                Id = sprintId,
                ProjectId = projectId,
                Name = "Sprint 1",
                StartDate = startDate,
                EndDate = endDate,
                IsKanban = false
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/sprints/{sprintId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var sprint = await TestResponse.ReadJsonAsync<SprintDetailDto>(response);
        Assert.Equal(sprintId, sprint.Id);
        Assert.Equal("Sprint 1", sprint.Name);
        Assert.Equal(startDate, sprint.StartDate);
        Assert.Equal(endDate, sprint.EndDate);
        Assert.False(sprint.IsKanban);
    }

    [Fact]
    public async Task GetSprintById_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/sprints/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // PATCH /api/sprints/{id}

    [Fact]
    public async Task UpdateSprint_WithValidData_UpdatesOnlyProvidedFields()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var originalStartDate = DateTimeOffset.UtcNow;

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project" });
            db.Sprints.Add(new Sprint
            {
                Id = sprintId,
                ProjectId = projectId,
                Name = "Old Name",
                StartDate = originalStartDate,
                EndDate = originalStartDate.AddDays(7)
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var newEndDate = originalStartDate.AddDays(14);
        
        // Zmieniamy tylko nazwę i datę zakończenia
        var response = await client.PatchAsJsonAsync($"/api/sprints/{sprintId}",
            new { name = "New Name", endDate = newEndDate });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var sprint = await TestResponse.ReadJsonAsync<SprintDetailDto>(response);
        Assert.Equal("New Name", sprint.Name);
        Assert.Equal(originalStartDate, sprint.StartDate); // Niezmienione
        Assert.Equal(newEndDate, sprint.EndDate); // Zmienione
    }

    [Fact]
    public async Task UpdateSprint_OmittedField_IsNotUpdated()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project" });
            db.Sprints.Add(new Sprint
            {
                Id = sprintId,
                ProjectId = projectId,
                Name = "Original Name"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Wysyłamy pusty obiekt, nic nie powinno się zmienić
        var response = await client.PatchAsJsonAsync($"/api/sprints/{sprintId}", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var sprint = await TestResponse.ReadJsonAsync<SprintDetailDto>(response);
        Assert.Equal("Original Name", sprint.Name);
    }

    [Fact]
    public async Task UpdateSprint_NullForRequiredField_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project" });
            db.Sprints.Add(new Sprint
            {
                Id = sprintId,
                ProjectId = projectId,
                Name = "Sprint",
                StartDate = DateTimeOffset.UtcNow,
                EndDate = DateTimeOffset.UtcNow.AddDays(14)
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Jawnie wysyłamy null dla wymaganego pola StartDate
        var response = await client.PatchAsJsonAsync($"/api/sprints/{sprintId}",
            new { startDate = (DateTimeOffset?)null });

        // Oczekujemy błędu walidacji, a nie sukcesu!
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        // Weryfikujemy, czy błąd dotyczy konkretnie pola StartDate
        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "StartDate"));
    }

    [Fact]
    public async Task UpdateSprint_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/sprints/{Guid.NewGuid()}",
            new { name = "New Name" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    [Fact]
    public async Task UpdateSprint_WithNameTooLong_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project" });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, Name = "Valid Name" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/sprints/{sprintId}",
            new { name = new string('A', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task UpdateSprint_WithEndDateBeforeStartDate_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();
        var startDate = DateTimeOffset.UtcNow;

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project" });
            db.Sprints.Add(new Sprint 
            { 
                Id = sprintId, 
                ProjectId = projectId, 
                Name = "Valid Name",
                StartDate = startDate
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Próba ustawienia EndDate przed StartDate
        var response = await client.PatchAsJsonAsync($"/api/sprints/{sprintId}",
            new { startDate = startDate, endDate = startDate.AddDays(-1) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "EndDate"));
    }

    // DELETE /api/sprints/{id}

    [Fact]
    public async Task DeleteSprint_ExistingId_RemovesSprint()
    {
        using var app = new ScrumDoneApiFactory();
        var projectId = Guid.NewGuid();
        var sprintId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Projects.Add(new Project { Id = projectId, Name = "Test Project", IsSetToScrum = true });
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = projectId, Name = "Sprint To Delete" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/sprints/{sprintId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/sprints/{sprintId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteSprint_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/sprints/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }
}