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

    private static Guid AddRole(AppDbContext db)
    {
        var id = Guid.NewGuid();
        var name = $"Role-{id:N}";
        db.Roles.Add(new IdentityRole<Guid>
        {
            Id = id,
            Name = name,
            NormalizedName = name.ToUpperInvariant()
        });
        return id;
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
    // GET /api/users/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetUser_ExistingId_ReturnsUserSummaryDto()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, userName: "targetuser", email: "target@example.com", name: "Target User");
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/users/{user.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await TestResponse.ReadJsonAsync<UserSummaryDto>(response);
        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal("Target User", result.Name);
    }

    [Fact]
    public async Task GetUser_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/users/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
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
        Assert.Equal("Charlie Chaplin", updated.Name);

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

    // ─────────────────────────────────────────────────────────
    // PATCH /api/users/{id}/admin
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task AdminEditUser_WithValidData_UpdatesSpecifiedUser()
    {
        using var app = new ScrumDoneApiFactory();
        var targetUser = await SeedUser(app, userName: "employee", email: "emp@example.com", name: "Old Name");
        using var client = app.CreateClient();

        var payload = new StringContent("{\"Name\":\"Admin Updated Name\"}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync($"/api/users/{targetUser.Id}/admin", payload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await TestResponse.ReadJsonAsync<UserSummaryDto>(response);
        Assert.Equal(targetUser.Id, updated.Id);
        Assert.Equal("Admin Updated Name", updated.Name);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var dbUser = await userManager.FindByIdAsync(targetUser.Id.ToString());
        Assert.Equal("Admin Updated Name", dbUser!.Name);
    }

    [Fact]
    public async Task AdminEditUser_WithEmptyName_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var targetUser = await SeedUser(app, userName: "employee2", email: "emp2@example.com", name: "Valid Name");
        using var client = app.CreateClient();

        var payload = new StringContent("{\"Name\":\"\"}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync($"/api/users/{targetUser.Id}/admin", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task AdminEditUser_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var payload = new StringContent("{\"Name\":\"Ghost User\"}", Encoding.UTF8, "application/json");
        var response = await client.PatchAsync($"/api/users/{Guid.NewGuid()}/admin", payload);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // ─────────────────────────────────────────────────────────
    // PATCH /api/users/remove/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoveUser_ExistingId_RemovesUserAndReturnsOk()
    {
        using var app = new ScrumDoneApiFactory();
        var targetUser = await SeedUser(app, userName: "toremove", email: "remove@example.com", name: "To Remove");
        using var client = app.CreateClient();

        var response = await client.PatchAsync($"/api/users/remove/{targetUser.Id}", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var getResponse = await client.GetAsync($"/api/users/{targetUser.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task RemoveUser_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PatchAsync($"/api/users/remove/{Guid.NewGuid()}", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // ─────────────────────────────────────────────────────────
    // PUT /api/users/{id}/roles
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task PutRoles_ValidRoles_AssignsRolesAndReturnsOk()
    {
        using var app = new ScrumDoneApiFactory();
        var targetUser = await SeedUser(app, userName: "roleuser", email: "roles@example.com");
        Guid roleA = Guid.Empty;
        Guid roleB = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleA = AddRole(db);
            roleB = AddRole(db);
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var dto = new UserAddRolesDto
        {
            RolesIds = new List<Guid> { roleA, roleB }
        };

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/roles", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var dbUser = await userManager.FindByIdAsync(targetUser.Id.ToString());
        var roles = await userManager.GetRolesAsync(dbUser!);

        Assert.Equal(2, roles.Count);
    }

    [Fact]
    public async Task PutRoles_TogglesRoles_AddsMissingAndRemovesExisting()
    {
        using var app = new ScrumDoneApiFactory();
        var targetUser = await SeedUser(app, userName: "toggleuser", email: "toggle@example.com");
        Guid roleToKeepId = Guid.Empty;
        Guid roleToRemoveId = Guid.Empty;
        Guid roleToAddId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleToKeepId = AddRole(db);
            roleToRemoveId = AddRole(db);
            roleToAddId = AddRole(db);
            await db.SaveChangesAsync();
        });

        string keepRoleName = "";
        string addRoleName = "";

        // Stan początkowy: użytkownik ma roleToKeep oraz roleToRemove
        using (var scope = app.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var dbUser = await userManager.FindByIdAsync(targetUser.Id.ToString());

            var roleKeep = await db.Roles.FindAsync(roleToKeepId);
            var roleRemove = await db.Roles.FindAsync(roleToRemoveId);
            var roleAdd = await db.Roles.FindAsync(roleToAddId);

            keepRoleName = roleKeep!.Name!;
            addRoleName = roleAdd!.Name!;

            await userManager.AddToRolesAsync(dbUser!, new[] { keepRoleName, roleRemove!.Name! });
        }

        using var client = app.CreateClient();

        // Wysyłamy roleToRemove (już ma -> zostanie usunięta) oraz roleToAdd (nie ma -> zostanie dodana)
        // roleToKeep nie wysyłamy -> powinna pozostać nietknięta
        var dto = new UserAddRolesDto
        {
            RolesIds = new List<Guid> { roleToRemoveId, roleToAddId }
        };

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/roles", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // Stan końcowy: użytkownik powinien mieć roleToKeep oraz roleToAdd (bez roleToRemove)
        using (var scope = app.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var dbUser = await userManager.FindByIdAsync(targetUser.Id.ToString());
            var currentRoles = await userManager.GetRolesAsync(dbUser!);

            Assert.Equal(2, currentRoles.Count);
            Assert.Contains(keepRoleName, currentRoles);
            Assert.Contains(addRoleName, currentRoles);
        }
    }

    [Fact]
    public async Task PutRoles_NonExistentUser_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        Guid roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var dto = new UserAddRolesDto
        {
            RolesIds = new List<Guid> { roleId }
        };

        var response = await client.PutAsJsonAsync($"/api/users/{Guid.NewGuid()}/roles", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    [Fact]
    public async Task PutRoles_NonExistentRole_ReturnsNotFoundOrBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var targetUser = await SeedUser(app, userName: "badroleuser", email: "badrole@example.com");
        using var client = app.CreateClient();

        var dto = new UserAddRolesDto
        {
            RolesIds = new List<Guid> { Guid.NewGuid() }
        };

        var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}/roles", dto);

        Assert.True(
            response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.BadRequest,
            $"Expected 404 or 400, but got {response.StatusCode}");
    }
}