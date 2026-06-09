using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Companies;

public class CompanyContactsEndpointTests
{
    // POST /api/companies/{id}/contacts

    [Fact]
    public async Task CreateCompanyContact_WithValidData_ReturnsCreatedContact()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Target Company" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var request = new ContactPersonCreateDto
        {
            Name = "John Doe",
            Email = "john@example.com",
            Phone = "123456789",
            Role = "Manager",
            IsPrimary = true
        };

        var response = await client.PostAsJsonAsync($"/api/companies/{companyId}/contacts", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var contact = await TestResponse.ReadJsonAsync<ContactPersonDto>(response);
        Assert.NotEqual(Guid.Empty, contact.Id);
        Assert.Equal(request.Name, contact.Name);
        Assert.Equal(request.Email, contact.Email);
        Assert.True(contact.IsPrimary);
    }

    [Fact]
    public async Task CreateCompanyContact_NonExistentCompany_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new ContactPersonCreateDto { Name = "Jane Doe" };
        var response = await client.PostAsJsonAsync($"/api/companies/{Guid.NewGuid()}/contacts", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // GET /api/companies/{id}/contacts

    [Fact]
    public async Task GetCompanyContacts_WithData_ReturnsPagedContacts()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Company" });
            db.ContactPeople.AddRange(
                new ContactPerson { Id = Guid.NewGuid(), CompanyId = companyId, Name = "Contact 1" },
                new ContactPerson { Id = Guid.NewGuid(), CompanyId = companyId, Name = "Contact 2" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/companies/{companyId}/contacts?page=1&limit=5");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ContactPersonDto>>(response);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.Items.Count());
    }

    // PATCH /api/companies/{id}/contacts/{contactId}

    [Fact]
    public async Task UpdateCompanyContact_WithPartialData_UpdatesOnlyProvidedFields()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var contactId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Company" });
            db.ContactPeople.Add(new ContactPerson 
            { 
                Id = contactId, 
                CompanyId = companyId, 
                Name = "Old Name", 
                Email = "old@example.com",
                Role = "Old Role"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Wysyłamy tylko Name i Email (Role powinno zostać nieruszone)
        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}/contacts/{contactId}", 
            new { name = "New Name", email = "new@example.com" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var contact = await TestResponse.ReadJsonAsync<ContactPersonDto>(response);
        Assert.Equal("New Name", contact.Name);
        Assert.Equal("new@example.com", contact.Email);
        Assert.Equal("Old Role", contact.Role); // Nie zostało nadpisane nullem
    }

    [Fact]
    public async Task UpdateCompanyContact_ExplicitNullValue_ClearsField()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var contactId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.ContactPeople.Add(new ContactPerson { Id = contactId, CompanyId = companyId, Name = "Name", Email = "email@example.com" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Wysyłamy nulla jawnie dla pola Email, aby upewnić się, że zostanie wyczyszczone
        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}/contacts/{contactId}", 
            new { email = (string?)null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var contact = await TestResponse.ReadJsonAsync<ContactPersonDto>(response);
        Assert.Null(contact.Email);
        Assert.Equal("Name", contact.Name);
    }

    // DELETE /api/companies/{id}/contacts/{contactId}

    [Fact]
    public async Task DeleteCompanyContact_ExistingId_RemovesContact()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();
        var contactId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "C" });
            db.ContactPeople.Add(new ContactPerson { Id = contactId, CompanyId = companyId, Name = "To Delete" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/companies/{companyId}/contacts/{contactId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/companies/{companyId}/contacts");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<ContactPersonDto>>(getResponse);
        Assert.Empty(page.Items);
    }
}