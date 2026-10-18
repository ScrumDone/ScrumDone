using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.Tests.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace ScrumDone.Api.Tests.Auth;

public class AuthEndpointTests
{
    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    private const string ValidPassword = "StrongPass_1!";

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

    private static async Task<Guid> SeedInvitation(
        AppDbContext db,
        Guid roleId,
        string email = "new@example.com",
        string userName = "newuser",
        TimeSpan? age = null)
    {
        var invitation = new UserInvitation
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = userName,
            RoleIds = new List<Guid> { roleId }
        };
        db.Invitations.Add(invitation);
        await db.SaveChangesAsync();

        if (age is not null)
        {
            // SaveChanges overwrites CreatedAt on insert, so backdate with an update
            invitation.CreatedAt = DateTimeOffset.UtcNow - age.Value;
            await db.SaveChangesAsync();
        }

        return invitation.Id;
    }

    private static async Task SeedUserWithPassword(
        ScrumDoneApiFactory app, string userName, string email, string password)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var result = await userManager.CreateAsync(
            new User { Name = "Existing", UserName = userName, Email = email, EmailConfirmed = true },
            password);
        Assert.True(result.Succeeded, string.Join(" ", result.Errors.Select(e => e.Description)));
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/invite
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Invite_ValidRequest_ReturnsInvitationIdAndPersistsIt()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var dto = new UserInvitationDto
        {
            UserName = "newuser",
            Email = "new@example.com",
            Roles = new List<Guid> { roleId }
        };

        var response = await client.PostAsJsonAsync("/api/auth/invite", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var invitationId = await response.Content.ReadFromJsonAsync<Guid>();
        Assert.NotEqual(Guid.Empty, invitationId);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var saved = await db.Invitations.SingleAsync(i => i.Id == invitationId);
        Assert.Equal("new@example.com", saved.Email, ignoreCase: true);
        Assert.Equal(new List<Guid> { roleId }, saved.RoleIds);
    }

    [Fact]
    public async Task Invite_EmailAlreadyUsedByUser_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "Taken",
                UserName = "taken",
                NormalizedUserName = "TAKEN",
                Email = "taken@example.com",
                NormalizedEmail = "TAKEN@EXAMPLE.COM"
            });
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var dto = new UserInvitationDto
        {
            UserName = "someone",
            Email = "Taken@Example.com", // different casing on purpose
            Roles = new List<Guid> { roleId }
        };

        var response = await client.PostAsJsonAsync("/api/auth/invite", dto);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Invite_UnknownRole_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var dto = new UserInvitationDto
        {
            UserName = "newuser",
            Email = "new@example.com",
            Roles = new List<Guid> { Guid.NewGuid() }
        };

        var response = await client.PostAsJsonAsync("/api/auth/invite", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Invite_EmptyRoles_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var dto = new UserInvitationDto
        {
            UserName = "newuser",
            Email = "new@example.com",
            Roles = new List<Guid>()
        };

        var response = await client.PostAsJsonAsync("/api/auth/invite", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/register/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Register_ValidInvitation_CreatesUserWithRolesAndConsumesInvitation()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
            invitationId = await SeedInvitation(db, roleId);
        });

        using var client = app.CreateClient();
        var dto = new UserRegistrationDto { Name = "New Person", Password = ValidPassword };

        var response = await client.PostAsJsonAsync($"/api/auth/register/{invitationId}", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = await userManager.FindByNameAsync("newuser");
        Assert.NotNull(user);
        Assert.Equal("New Person", user!.Name);
        Assert.Equal("new@example.com", user.Email);
        Assert.True(user.EmailConfirmed);

        var roles = await userManager.GetRolesAsync(user);
        Assert.Single(roles);

        // invitation is soft-deleted
        Assert.False(await db.Invitations.AnyAsync(i => i.Id == invitationId));
        var raw = await db.Invitations.IgnoreQueryFilters().SingleAsync(i => i.Id == invitationId);
        Assert.True(raw.IsDeleted);
    }

    [Fact]
    public async Task Register_UnknownInvitation_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();
        var dto = new UserRegistrationDto { Name = "Nobody", Password = ValidPassword };

        var response = await client.PostAsJsonAsync($"/api/auth/register/{Guid.NewGuid()}", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_ExpiredInvitation_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            invitationId = await SeedInvitation(db, roleId, age: TimeSpan.FromDays(15));
        });

        using var client = app.CreateClient();
        var dto = new UserRegistrationDto { Name = "Late", Password = ValidPassword };

        var response = await client.PostAsJsonAsync($"/api/auth/register/{invitationId}", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        Assert.Null(await userManager.FindByNameAsync("newuser"));
    }

    [Fact]
    public async Task Register_WeakPassword_ReturnsBadRequestAndKeepsInvitation()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            invitationId = await SeedInvitation(db, roleId);
        });

        using var client = app.CreateClient();
        var dto = new UserRegistrationDto { Name = "Weak", Password = "a" };

        var response = await client.PostAsJsonAsync($"/api/auth/register/{invitationId}", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        Assert.True(await db.Invitations.AnyAsync(i => i.Id == invitationId)); // can retry
        Assert.Null(await userManager.FindByNameAsync("newuser"));
    }

    [Fact]
    public async Task Register_SameInvitationTwice_SecondAttemptFails()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            invitationId = await SeedInvitation(db, roleId);
        });

        using var client = app.CreateClient();
        var dto = new UserRegistrationDto { Name = "Once", Password = ValidPassword };

        var first = await client.PostAsJsonAsync($"/api/auth/register/{invitationId}", dto);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync($"/api/auth/register/{invitationId}", dto);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkAndSetsCookie()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", ValidPassword);

        using var client = app.CreateClient();
        var dto = new LoginDto { UserName = "alice", Password = ValidPassword };

        var response = await client.PostAsJsonAsync("/api/auth/login", dto);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("Set-Cookie"));
    }

    [Fact]
    public async Task Login_WrongPassword_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", ValidPassword);

        using var client = app.CreateClient();
        var dto = new LoginDto { UserName = "alice", Password = "WrongPass1!" };

        var response = await client.PostAsJsonAsync("/api/auth/login", dto);

        // TODO: should be 401 Unauthorized once the service is fixed
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_UnknownUser_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();
        var dto = new LoginDto { UserName = "ghost", Password = ValidPassword };

        var response = await client.PostAsJsonAsync("/api/auth/login", dto);

        // TODO: should be 401 Unauthorized once the service is fixed
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/logout
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Logout_WithoutSession_StillSucceeds()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode); // NoContent if you switch
    }

    [Fact]
    public async Task Logout_AfterLogin_Succeeds()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", ValidPassword);

        using var client = app.CreateClient(); // keeps cookies between calls
        await client.PostAsJsonAsync("/api/auth/login",
            new LoginDto { UserName = "alice", Password = ValidPassword });

        var response = await client.PostAsync("/api/auth/logout", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/auth/roles
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetRoles_ReturnsSeededRoles()
    {
        using var app = new ScrumDoneApiFactory();
        Guid roleA = Guid.Empty, roleB = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleA = AddRole(db);
            roleB = AddRole(db);
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/auth/roles");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var roles = await TestResponse.ReadJsonAsync<List<RoleDto>>(response);
        Assert.Contains(roles, r => r.Id == roleA);
        Assert.Contains(roles, r => r.Id == roleB);
    }
}