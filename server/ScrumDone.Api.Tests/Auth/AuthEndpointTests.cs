using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
using System.Security.Cryptography;
using System.Text;
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

    // Creates an invitation with a known raw token and returns both
    private static async Task<(Guid Id, string Token)> SeedInvitation(
        AppDbContext db,
        IEnumerable<Guid> roleIds,
        string email = "new@example.com",
        string userName = "newuser",
        TimeSpan? expiresIn = null)
    {
        var token = $"test-token-{Guid.NewGuid():N}";
        var invitation = new UserInvitation
        {
            Id = Guid.NewGuid(),
            Email = email,
            UserName = userName,
            RoleIds = roleIds.ToList(),
            TokenHash = SHA256.HashData(Encoding.UTF8.GetBytes(token)),
            ExpiresAt = DateTimeOffset.UtcNow + (expiresIn ?? TimeSpan.FromDays(14))
        };
        db.Invitations.Add(invitation);
        await db.SaveChangesAsync();
        return (invitation.Id, token);
    }

    private static void AddUser(AppDbContext db, string userName, string email)
    {
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Name = "Seeded",
            UserName = userName,
            NormalizedUserName = userName.ToUpperInvariant(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant()
        });
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

    private static Task<HttpResponseMessage> PostRegister(
        HttpClient client, Guid invitationId, string token,
        string name = "New Person", string password = ValidPassword)
    {
        var dto = new UserRegistrationDto { Name = name, Password = password, Token = token };
        return client.PostAsJsonAsync($"/api/auth/register/{invitationId}", dto);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/invite
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task Invite_ValidRequest_PersistsInvitationWithHashedToken()
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

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var saved = await db.Invitations.SingleAsync();

        Assert.Equal("new@example.com", saved.Email, ignoreCase: true);
        Assert.Equal("newuser", saved.UserName);
        Assert.Equal(new List<Guid> { roleId }, saved.RoleIds);
        Assert.Equal(32, saved.TokenHash.Length);              // SHA-256, never the raw token
        Assert.True(saved.ExpiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task Invite_ValidRequest_ResponseDoesNotLeakInvitationId()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/invite", new UserInvitationDto
        {
            UserName = "newuser",
            Email = "new@example.com",
            Roles = new List<Guid> { roleId }
        });

        var body = await response.Content.ReadAsStringAsync();

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var saved = await db.Invitations.SingleAsync();

        // the caller must not receive a working registration link
        Assert.DoesNotContain(saved.Id.ToString(), body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Invite_EmailAlreadyUsedByUser_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            AddUser(db, "taken", "taken@example.com");
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
    public async Task Invite_UserNameAlreadyUsedByUser_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            AddUser(db, "taken", "taken@example.com");
            await db.SaveChangesAsync();
        });

        using var client = app.CreateClient();
        var dto = new UserInvitationDto
        {
            UserName = "Taken", // different casing on purpose
            Email = "someone@example.com",
            Roles = new List<Guid> { roleId }
        };

        var response = await client.PostAsJsonAsync("/api/auth/invite", dto);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Invite_UserNameReservedByPendingInvitation_ReturnsConflict()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
            await SeedInvitation(db, new[] { roleId }, email: "first@example.com", userName: "reserved");
        });

        using var client = app.CreateClient();
        var dto = new UserInvitationDto
        {
            UserName = "Reserved",
            Email = "second@example.com", // a different person wants the same username
            Roles = new List<Guid> { roleId }
        };

        var response = await client.PostAsJsonAsync("/api/auth/invite", dto);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Invite_SameEmailTwice_ReplacesPreviousInvitation()
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

        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/auth/invite", dto)).StatusCode);

        // resend, with different casing of the same address
        dto.Email = "New@Example.com";
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/auth/invite", dto)).StatusCode);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(1, await db.Invitations.CountAsync());                          // one pending
        Assert.Equal(2, await db.Invitations.IgnoreQueryFilters().CountAsync());     // old one soft-deleted
    }

    [Fact]
    public async Task Invite_Resend_OldLinkStopsWorking()
    {
        using var app = new ScrumDoneApiFactory();
        var roleId = Guid.Empty;
        var oldId = Guid.Empty;
        var oldToken = "";

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
            (oldId, oldToken) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();
        var invite = await client.PostAsJsonAsync("/api/auth/invite", new UserInvitationDto
        {
            UserName = "newuser",
            Email = "new@example.com",
            Roles = new List<Guid> { roleId }
        });
        Assert.Equal(HttpStatusCode.OK, invite.StatusCode);

        var response = await PostRegister(client, oldId, oldToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        Assert.Null(await userManager.FindByNameAsync("newuser"));
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
        var token = "";
        var roleId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, token) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, token, name: "New Person");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = await userManager.FindByNameAsync("newuser");
        Assert.NotNull(user);
        Assert.Equal("New Person", user!.Name);          // display name from the request
        Assert.Equal("newuser", user.UserName);          // username from the invitation
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
    public async Task Register_InvitationWithMultipleRoles_AssignsAllRoles()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;
        var token = "";

        await app.SeedDatabaseAsync(async db =>
        {
            var roleA = AddRole(db);
            var roleB = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, token) = await SeedInvitation(db, new[] { roleA, roleB });
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, token);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByNameAsync("newuser");
        Assert.NotNull(user);
        Assert.Equal(2, (await userManager.GetRolesAsync(user!)).Count);
    }

    [Fact]
    public async Task Register_UnknownInvitation_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await PostRegister(client, Guid.NewGuid(), "whatever");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WrongToken_ReturnsBadRequestAndKeepsInvitation()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, _) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, "wrong-token");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        Assert.True(await db.Invitations.AnyAsync(i => i.Id == invitationId)); // the real invitee can still use it
        Assert.Null(await userManager.FindByNameAsync("newuser"));
    }

    [Fact]
    public async Task Register_WrongTokenAndUnknownId_ProduceSameMessage()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, _) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();

        var wrongToken = await PostRegister(client, invitationId, "wrong-token");
        var unknownId = await PostRegister(client, Guid.NewGuid(), "wrong-token");

        var a = await TestResponse.ReadJsonAsync<ProblemDetails>(wrongToken);
        var b = await TestResponse.ReadJsonAsync<ProblemDetails>(unknownId);

        // a caller without the real token cannot tell whether an invitation exists
        Assert.Equal(b.Detail, a.Detail);
    }

    [Fact]
    public async Task Register_ExpiredInvitation_ReturnsBadRequestWithExpiredMessage()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;
        var token = "";

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, token) = await SeedInvitation(db, new[] { roleId }, expiresIn: TimeSpan.FromDays(-1));
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, token);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        // the holder of a valid link is told what happened
        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Contains("expired", problem.Detail, StringComparison.OrdinalIgnoreCase);

        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        Assert.Null(await userManager.FindByNameAsync("newuser"));
    }

    [Fact]
    public async Task Register_ExpiredInvitationWithWrongToken_DoesNotRevealExpiry()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, _) = await SeedInvitation(db, new[] { roleId }, expiresIn: TimeSpan.FromDays(-1));
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, "wrong-token");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.DoesNotContain("expired", problem.Detail, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Register_WeakPassword_ReturnsBadRequestAndKeepsInvitation()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;
        var token = "";

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, token) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, token, password: "a");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        Assert.True(await db.Invitations.AnyAsync(i => i.Id == invitationId)); // can retry
        Assert.Null(await userManager.FindByNameAsync("newuser"));
    }

    [Fact]
    public async Task Register_UserNameTakenSinceInvite_ReturnsBadRequestAndKeepsInvitation()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;
        var token = "";

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            // someone took the username after the invitation was sent
            AddUser(db, "newuser", "other@example.com");
            await db.SaveChangesAsync();
            (invitationId, token) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();

        var response = await PostRegister(client, invitationId, token);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.True(await db.Invitations.AnyAsync(i => i.Id == invitationId));
    }

    [Fact]
    public async Task Register_SameInvitationTwice_SecondAttemptFails()
    {
        using var app = new ScrumDoneApiFactory();
        var invitationId = Guid.Empty;
        var token = "";

        await app.SeedDatabaseAsync(async db =>
        {
            var roleId = AddRole(db);
            await db.SaveChangesAsync();
            (invitationId, token) = await SeedInvitation(db, new[] { roleId });
        });

        using var client = app.CreateClient();

        var first = await PostRegister(client, invitationId, token);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await PostRegister(client, invitationId, token);
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