using System.Net;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Users;

public class UsersEndpointTests
{
    // GET /api/users

    [Fact]
    public async Task GetUsers_EmptyDatabase_ReturnsEmptyPagedResult()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<UserSummaryDto>>(response);
        Assert.Empty(page.Items);
        Assert.Equal(0, page.TotalCount);
        Assert.False(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
    }

    [Fact]
    public async Task GetUsers_WithPaging_ReturnsPagedUsers()
    {
        using var app = new ScrumDoneApiFactory();
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.AddRange(
                new User { Id = user1Id, Name = "Alice Developer" },
                new User { Id = user2Id, Name = "Bob ScrumMaster" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Pobieramy pierwszą stronę z limitem 1
        var response = await client.GetAsync("/api/users?page=1&limit=1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<UserSummaryDto>>(response);
        Assert.Equal(1, page.Page);
        Assert.Equal(1, page.PageSize);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.TotalPages);
        Assert.True(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
        
        // Weryfikacja mapowania DTO
        var user = Assert.Single(page.Items);
        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.False(string.IsNullOrEmpty(user.Name));
    }

    [Fact]
    public async Task GetUsers_SecondPage_HasPreviousPage()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.Users.AddRange(
                new User { Id = Guid.NewGuid(), Name = "Alice Developer" },
                new User { Id = Guid.NewGuid(), Name = "Bob ScrumMaster" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Pobieramy drugą stronę z limitem 1
        var response = await client.GetAsync("/api/users?page=2&limit=1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<UserSummaryDto>>(response);
        Assert.True(page.HasPreviousPage);
        Assert.False(page.HasNextPage);
        Assert.Single(page.Items);
    }

    [Fact]
    public async Task GetUsers_WithInvalidPaging_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        // Próba wysłania nieprawidłowych parametrów (strona 0 zazwyczaj nie przechodzi walidacji)
        var response = await client.GetAsync("/api/users?page=0&limit=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        
        // Zakładam, że Twój walidator wychwytuje ujemne/zerowe strony lub przekroczony limit
        Assert.True(
            TestResponse.HasValidationError(problem, "Page") ||
            TestResponse.HasValidationError(problem, "Limit"));
    }
}