using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Users;

public class UsersEndpointTests
{
    private const string ValidPassword = "StrongPass_1!";

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    private static async Task<User> SeedUser(
        ScrumDoneApiFactory app,
        string userName = "johndoe",
        string email = "johndoe@example.com",
        string name = "John Doe",
        string password = ValidPassword)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = name,
            UserName = userName,
            Email = email,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, password);
        Assert.True(result.Succeeded, string.Join(" ", result.Errors.Select(e => e.Description)));

        return user;
    }

    private static async Task<HttpClient> CreateAuthenticatedClient(
        ScrumDoneApiFactory app,
        string userName = "johndoe",
        string password = ValidPassword)
    {
        var client = app.CreateClient();

        var loginDto = new LoginDto { UserName = userName, Password = password };
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginDto);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        return client;
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/users
    // ─────────────────────────────────────────────────────────

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
                new User { Id = user1Id, Name = "Alice Developer", Email = "test1@example.com", UserName = "test1@example.com" },
                new User { Id = user2Id, Name = "Bob ScrumMaster", Email = "test2@example.com", UserName = "test2example.com" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/users?page=1&limit=1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<UserSummaryDto>>(response);
        Assert.Equal(1, page.Page);
        Assert.Equal(1, page.PageSize);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.TotalPages);
        Assert.True(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
        
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
                new User { Id = Guid.NewGuid(), Name = "Alice Developer", Email = "test1@example.com", UserName = "test1@example.com" },
                new User { Id = Guid.NewGuid(), Name = "Bob ScrumMaster", Email = "test2@example.com", UserName = "test2example.com" }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

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

        var response = await client.GetAsync("/api/users?page=0&limit=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        
        Assert.True(
            TestResponse.HasValidationError(problem, "Page") ||
            TestResponse.HasValidationError(problem, "Limit"));
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/users/current
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetCurrentUser_Unauthenticated_ReturnsUnauthorized()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/users/current");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentUser_AuthenticatedUser_ReturnsUserDetails()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, userName: "alice", email: "alice@example.com", name: "Alice Wonderland");
        using var client = await CreateAuthenticatedClient(app, "alice");

        var response = await client.GetAsync("/api/users/current");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await TestResponse.ReadJsonAsync<UserSummaryDto>(response);
        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal("Alice Wonderland", result.Name);
    }

    // ─────────────────────────────────────────────────────────
    // PATCH /api/users/current
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task EditCurrentUser_Unauthenticated_ReturnsUnauthorized()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var payload = new StringContent("{\"Name\":\"New Name\"}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync("/api/users/current", payload);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task EditCurrentUser_UpdateNameOnly_UpdatesNameAndPreservesOtherFields()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, userName: "bob", name: "Original Bob");
        using var client = await CreateAuthenticatedClient(app, "bob");

        var payload = new StringContent("{\"Name\":\"Updated Bob\"}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync("/api/users/current", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await TestResponse.ReadJsonAsync<UserSummaryDto>(response);
        Assert.Equal("Updated Bob", updated.Name);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var dbUser = await userManager.FindByIdAsync(user.Id.ToString());
        Assert.NotNull(dbUser);
        Assert.Equal("Updated Bob", dbUser!.Name);
    }

    [Fact]
    public async Task EditCurrentUser_UpdateProfilePictureUrlOnly_UpdatesUrlAndLeavesNameUntouched()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, userName: "charlie", name: "Charlie Chaplin");
        using var client = await CreateAuthenticatedClient(app, "charlie");

        var payload = new StringContent(
            "{\"ProfilePictureUrl\":\"https://example.com/avatar.png\"}", 
            Encoding.UTF8, 
            "application/json");

        var response = await client.PatchAsync("/api/users/current", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await TestResponse.ReadJsonAsync<UserSummaryDto>(response);
        Assert.Equal("Charlie Chaplin", updated.Name); // Imię pozostało bez zmian

        // Weryfikacja zmiany ProfilePictureUrl bezpośrednio na encji w bazie
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var dbUser = await userManager.FindByIdAsync(user.Id.ToString());
        Assert.NotNull(dbUser);
        Assert.Equal("https://example.com/avatar.png", dbUser!.ProfilePictureUrl);
    }

    [Fact]
    public async Task EditCurrentUser_ExplicitNullProfilePictureUrl_ClearsField()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, userName: "david", name: "David");

        await app.SeedDatabaseAsync(async db =>
        {
            var u = await db.Users.FindAsync(user.Id);
            if (u != null)
            {
                u.ProfilePictureUrl = "https://example.com/old-avatar.png";
            }
        });

        using var client = await CreateAuthenticatedClient(app, "david");

        var payload = new StringContent("{\"ProfilePictureUrl\":null}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync("/api/users/current", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // Weryfikacja wyczyszczenia URL w bazie
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var dbUser = await userManager.FindByIdAsync(user.Id.ToString());
        Assert.NotNull(dbUser);
        Assert.Null(dbUser!.ProfilePictureUrl);
    }

    [Fact]
    public async Task EditCurrentUser_EmptyName_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, userName: "eve", name: "Eve");
        using var client = await CreateAuthenticatedClient(app, "eve");

        var payload = new StringContent("{\"Name\":\"\"}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync("/api/users/current", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }
}