using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Companies;

public class CompanyNotesEndpointTests
{
    // POST /api/companies/{id}/notes

    [Fact]
    public async Task CreateCompanyNote_WithValidData_ReturnsCreatedNote()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            db.Companies.Add(new Company { Id = companyId, Name = "Target Company" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var request = new CompanyNoteCreateDto { Content = "This is a test note." };

        var response = await client.PostAsJsonAsync($"/api/companies/{companyId}/notes", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var note = await TestResponse.ReadJsonAsync<CompanyNoteDto>(response);
        Assert.NotEqual(Guid.Empty, note.Id);
        Assert.Equal(request.Content, note.Content);
    }

    [Fact]
    public async Task CreateCompanyNote_WithEmptyContent_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Target Company" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var request = new CompanyNoteCreateDto { Content = "" };

        var response = await client.PostAsJsonAsync($"/api/companies/{companyId}/notes", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateCompanyNote_NonExistentCompany_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new CompanyNoteCreateDto { Content = "Note for missing company" };
        var response = await client.PostAsJsonAsync($"/api/companies/{Guid.NewGuid()}/notes", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // GET /api/companies/{id}/notes

    [Fact]
    public async Task GetCompanyNotes_WithData_ReturnsPagedNotes()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "Test User" });
            db.Companies.Add(new Company { Id = companyId, Name = "Company" });

            db.CompanyNotes.AddRange(
                new CompanyNote { Id = Guid.NewGuid(), CompanyId = companyId, UserId = userId, Content = "Note 1" },
                new CompanyNote { Id = Guid.NewGuid(), CompanyId = companyId, UserId = userId, Content = "Note 2" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/companies/{companyId}/notes?page=1&limit=10");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CompanyNoteDto>>(response);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.Items.Count());
    }

    // PATCH /api/companies/{id}/notes/{noteId}

    [Fact]
    public async Task UpdateCompanyNote_WithValidData_UpdatesContent()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var noteId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.CompanyNotes.Add(new CompanyNote { Id = noteId, CompanyId = companyId, UserId = userId, Content = "Old Content" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}/notes/{noteId}", 
            new CompanyNoteUpdateDto { Content = "New Content" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var note = await TestResponse.ReadJsonAsync<CompanyNoteDto>(response);
        Assert.Equal("New Content", note.Content);
    }

    // DELETE /api/companies/{id}/notes/{noteId}

    [Fact]
    public async Task DeleteCompanyNote_ExistingId_RemovesNote()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var noteId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.Add(new User { Id = userId, Name = "User" });
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.CompanyNotes.Add(new CompanyNote { Id = noteId, CompanyId = companyId, UserId = userId, Content = "To Delete" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/companies/{companyId}/notes/{noteId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/companies/{companyId}/notes");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CompanyNoteDto>>(getResponse);
        Assert.Empty(page.Items);
    }
}