using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Companies;

public class CompaniesEndpointTests
{
    // POST /api/companies

    [Fact]
    public async Task CreateCompany_WithValidData_ReturnsCreatedCompany()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new CompanyCreateDto
        {
            Name = "ACME Software",
            Nip = "1234567890",
            Krs = "9876543210",
            Regon = "123456789",
            Address = "Main Street 1"
        };

        var response = await client.PostAsJsonAsync("/api/companies", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var company = await TestResponse.ReadJsonAsync<CompanyDetailDto>(response);
        Assert.NotEqual(Guid.Empty, company.Id);
        Assert.Equal(request.Name, company.Name);
        Assert.Equal(request.Nip, company.Nip);
        Assert.Equal(request.Krs, company.Krs);
        Assert.Equal(request.Regon, company.Regon);
        Assert.Equal(request.Address, company.Address);
        Assert.Equal(0, company.ContactPeopleCount);
        Assert.Equal(0, company.ProjectCount);
        Assert.Empty(company.Contacts);
    }

    [Fact]
    public async Task CreateCompany_WithNullOptionalFields_ReturnsCreatedCompany()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new CompanyCreateDto { Name = "Minimal Company" };

        var response = await client.PostAsJsonAsync("/api/companies", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var company = await TestResponse.ReadJsonAsync<CompanyDetailDto>(response);
        Assert.Equal(request.Name, company.Name);
        Assert.Null(company.Nip);
        Assert.Null(company.Krs);
        Assert.Null(company.Regon);
        Assert.Null(company.Address);
    }

    [Fact]
    public async Task CreateCompany_WithInvalidData_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new CompanyCreateDto { Name = "", Nip = "too-short" };

        var response = await client.PostAsJsonAsync("/api/companies", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
        Assert.True(TestResponse.HasValidationError(problem, "Nip"));
    }

    [Fact]
    public async Task CreateCompany_WithEmptyName_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateCompany_WithNameTooLong_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = new string('A', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateCompany_WithInvalidNip_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "Valid Name", Nip = "123" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Nip"));
    }

    [Fact]
    public async Task CreateCompany_WithInvalidKrs_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "Valid Name", Krs = "123" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Krs"));
    }

    [Fact]
    public async Task CreateCompany_WithInvalidRegon_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "Valid Name", Regon = "123" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Regon"));
    }

    [Fact]
    public async Task CreateCompany_WithValidNineCharRegon_ReturnsCreated()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "Valid Name", Regon = "123456789" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateCompany_WithValidFourteenCharRegon_ReturnsCreated()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "Valid Name", Regon = "12345678901234" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateCompany_WithAddressTooLong_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/companies",
            new CompanyCreateDto { Name = "Valid Name", Address = new string('A', 501) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Address"));
    }

    // GET /api/companies

    [Fact]
    public async Task GetCompanies_EmptyDatabase_ReturnsEmptyPagedResult()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/companies");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CompanyListItemDto>>(response);
        Assert.Empty(page.Items);
        Assert.Equal(0, page.TotalCount);
        Assert.False(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
    }

    [Fact]
    public async Task GetCompanies_WithPaging_ReturnsPagedCompanies()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.AddRange(
                new Company
                {
                    Name = "First Company",
                    ContactPeople =
                    [
                        new ContactPerson
                        {
                            Name = "Primary Contact",
                            Email = "primary@example.com",
                            IsPrimary = true
                        }
                    ]
                },
                new Company { Name = "Second Company" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/companies?page=1&limit=1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CompanyListItemDto>>(response);
        Assert.Equal(1, page.Page);
        Assert.Equal(1, page.PageSize);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.TotalPages);
        Assert.True(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
        Assert.Single(page.Items);
    }

    [Fact]
    public async Task GetCompanies_SecondPage_HasPreviousPage()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.AddRange(
                new Company { Name = "First Company" },
                new Company { Name = "Second Company" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/companies?page=2&limit=1");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CompanyListItemDto>>(response);
        Assert.True(page.HasPreviousPage);
        Assert.False(page.HasNextPage);
    }

    [Fact]
    public async Task GetCompanies_WithInvalidPaging_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/companies?page=0&limit=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(
            TestResponse.HasValidationError(problem, "Page") ||
            TestResponse.HasValidationError(problem, "Limit"));
    }

    // GET /api/companies/{id}

    [Fact]
    public async Task GetCompanyById_ExistingId_ReturnsCompanyDetails()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company
            {
                Id = companyId,
                Name = "Existing Company",
                Nip = "1234567890",
                Krs = "9876543210",
                Regon = "123456789",
                Address = "Seeded Address",
                ContactPeople =
                [
                    new ContactPerson
                    {
                        Name = "Alex Owner",
                        Email = "alex@example.com",
                        IsPrimary = true
                    }
                ]
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/companies/{companyId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var company = await TestResponse.ReadJsonAsync<CompanyDetailDto>(response);
        Assert.Equal(companyId, company.Id);
        Assert.Equal("Existing Company", company.Name);
        Assert.Equal(1, company.ContactPeopleCount);
        Assert.Single(company.Contacts);
    }

    [Fact]
    public async Task GetCompanyById_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/companies/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // PATCH /api/companies/{id}

    [Fact]
    public async Task UpdateCompany_WithValidData_UpdatesOnlyProvidedFields()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company
            {
                Id = companyId,
                Name = "Old Name",
                Nip = "1234567890",
                Address = "Old Address"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}",
            new { name = "New Name", address = "New Address" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var company = await TestResponse.ReadJsonAsync<CompanyDetailDto>(response);
        Assert.Equal("New Name", company.Name);
        Assert.Equal("1234567890", company.Nip); // unchanged — not in request body
        Assert.Equal("New Address", company.Address);
    }

    [Fact]
    public async Task UpdateCompany_OmittedField_IsNotUpdated()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company
            {
                Id = companyId,
                Name = "Original Name",
                Nip = "1234567890"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Only send Address — Nip and Name should be untouched
        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}",
            new { Address = "New Address" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var company = await TestResponse.ReadJsonAsync<CompanyDetailDto>(response);
        Assert.Equal("Original Name", company.Name);
        Assert.Equal("1234567890", company.Nip);
        Assert.Equal("New Address", company.Address);
    }

    [Fact]
    public async Task UpdateCompany_NullField_ClearsValue()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company
            {
                Id = companyId,
                Name = "Company",
                Nip = "1234567890"
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Explicitly send null for Nip — should clear it
        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}",
            new { nip = (string?)null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var company = await TestResponse.ReadJsonAsync<CompanyDetailDto>(response);
        Assert.Null(company.Nip);
        Assert.Equal("Company", company.Name); // unchanged
    }

    [Fact]
    public async Task UpdateCompany_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/companies/{Guid.NewGuid()}",
            new CompanyUpdateDto { Name = "New Name" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    [Fact]
    public async Task UpdateCompany_WithInvalidData_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Valid Company" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/companies/{companyId}",
            new CompanyUpdateDto { Name = new string('A', 201) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    // DELETE /api/companies/{id}

    [Fact]
    public async Task DeleteCompany_ExistingId_RemovesCompany()
    {
        using var app = new ScrumDoneApiFactory();
        var companyId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Companies.Add(new Company { Id = companyId, Name = "Company To Delete" });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/companies/{companyId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/companies/{companyId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

        var listResponse = await client.GetAsync("/api/companies");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<CompanyListItemDto>>(listResponse);
        Assert.Equal(0, page.TotalCount);
        Assert.Empty(page.Items);
    }

    [Fact]
    public async Task DeleteCompany_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/companies/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }
}