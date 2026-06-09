using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Companies;

public class CompanyLogsEndpointTests
{
    // POST /api/companies/{id}/logs

    [Fact]
    public async Task CreateCompanyLog_WithValidData_ReturnsCreatedLog()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var authorId = Guid.NewGuid();

        // Seedujemy firmę oraz autora (User), aby klucze obce były poprawne
        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Test Company" });
            db.Users.Add(new User { Id = authorId, Name = "Log Author" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var request = new CooperationLogCreateDto
        {
            Title = "Zmiana statusu umowy",
            Description = "Opis modyfikacji warunków",
            OldValue = "Draft",
            NewValue = "Signed"
        };

        var response = await client.PostAsJsonAsync($"/api/companies/{companyId}/logs", request);

        // Kontroler deklaruje Status201Created
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var log = await TestResponse.ReadJsonAsync<CooperationLogDto>(response);
        Assert.NotEqual(Guid.Empty, log.Id);
        Assert.Equal(request.Title, log.Title);
        Assert.Equal(request.Description, log.Description);
        Assert.Equal(request.OldValue, log.OldValue);
        Assert.Equal(request.NewValue, log.NewValue);
    }

    [Fact]
    public async Task CreateCompanyLog_WithEmptyTitle_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        using var client = app.CreateClient();

        // Tytuł jest wymagany (required), więc pusta wartość powinna wywołać błąd walidacji
        var request = new CooperationLogCreateDto { Title = "" };

        var response = await client.PostAsJsonAsync($"/api/companies/{companyId}/logs", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Title"));
    }

    // GET /api/companies/{id}/logs

    [Fact]
    public async Task GetCompanyLogs_WithData_ReturnsPagedLogs()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var authorId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Company" });
            db.Users.Add(new User { Id = authorId, Name = "Author" });

            db.CooperationLogs.AddRange(
                new CooperationLog { Id = Guid.NewGuid(), CompanyId = companyId, AuthorId = authorId, Title = "Log 1" },
                new CooperationLog { Id = Guid.NewGuid(), CompanyId = companyId, AuthorId = authorId, Title = "Log 2" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/companies/{companyId}/logs?page=1&limit=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CooperationLogDto>>(response);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.Items.Count());
    }

    // PATCH /api/companies/{id}/logs/{logId}

    [Fact]
    public async Task UpdateCompanyLog_WithPartialData_UpdatesOnlyProvidedFields()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var logId = Guid.NewGuid();
        var authorId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.Users.Add(new User { Id = authorId, Name = "A" });
            db.CooperationLogs.Add(new CooperationLog
            {
                Id = logId,
                CompanyId = companyId,
                AuthorId = authorId,
                Title = "Old Title",
                Description = "Old Description",
                OldValue = "Old Value"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Wysyłamy obiekt anonimowy z częściowymi danymi, sprawdzając działanie mechanizmu SetProperties
        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}/logs/{logId}",
            new { title = "New Title", description = "New Description" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var log = await TestResponse.ReadJsonAsync<CooperationLogDto>(response);
        Assert.Equal("New Title", log.Title);
        Assert.Equal("New Description", log.Description);
        Assert.Equal("Old Value", log.OldValue); // Pole nienadesłane w żądaniu powinno pozostać bez zmian
    }

    [Fact]
    public async Task UpdateCompanyLog_ExplicitNullValue_ClearsField()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var logId = Guid.NewGuid();
        var authorId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.Users.Add(new User { Id = authorId, Name = "A" });
            db.CooperationLogs.Add(new CooperationLog
            {
                Id = logId,
                CompanyId = companyId,
                AuthorId = authorId,
                Title = "Title",
                Description = "Description to clear"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Jawne wysłanie null dla pola Description w celu wyczyszczenia wartości
        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}/logs/{logId}",
            new { title = "Title", description = (string?)null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var log = await TestResponse.ReadJsonAsync<CooperationLogDto>(response);
        Assert.Null(log.Description); // Wartość została wyczyszczona
        Assert.Equal("Title", log.Title);
    }

    // DELETE /api/companies/{id}/logs/{logId}

    [Fact]
    public async Task DeleteCompanyLog_ExistingId_RemovesLog()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var logId = Guid.NewGuid();
        var authorId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.Users.Add(new User { Id = authorId, Name = "A" });
            db.CooperationLogs.Add(new CooperationLog { Id = logId, CompanyId = companyId, AuthorId = authorId, Title = "To Delete" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/companies/{companyId}/logs/{logId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/companies/{companyId}/logs");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CooperationLogDto>>(getResponse);
        Assert.Empty(page.Items);
    }
}