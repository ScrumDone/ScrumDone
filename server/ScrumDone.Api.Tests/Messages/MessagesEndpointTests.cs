using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Messages;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Messages;

public class MessagesEndpointTests
{
    private const string ValidPassword = "StrongPass_1!";

    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    private static async Task<User> SeedUser(
        ScrumDoneApiFactory app,
        string userName = "testuser",
        string email = "testuser@example.com",
        string password = ValidPassword)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Test User",
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
        string userName = "testuser",
        string password = ValidPassword)
    {
        var client = app.CreateClient(); // Zachowuje stan ciasteczek pomiędzy wywołaniami

        var loginDto = new LoginDto { UserName = userName, Password = password };
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginDto);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        return client;
    }

    private static Guid SeedAssignment(AppDbContext db)
    {
        var statusId = Guid.NewGuid();
        var projectId = Guid.NewGuid();
        var assignmentId = Guid.NewGuid();

        db.AssignmentStatuses.Add(new AssignmentStatus
        {
            Id = statusId,
            Name = "To Do",
            HexColor = "#808080",
            Order = 0
        });

        db.Projects.Add(new Project
        {
            Id = projectId,
            Name = "Test Project",
            Description = "Test description",
            HexColor = "#AAAAAA"
        });

        db.Assignment.Add(new Assignment
        {
            Id = assignmentId,
            Name = "Task for Messages",
            ProjectId = projectId,
            StatusId = statusId
        });

        return assignmentId;
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/messages/{id} (Messages for assignment)
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMessages_ValidQuery_ReturnsPagedMessages()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/messages/{assignmentId}?page=1&limit=20");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<MessageDto>>(response);
        Assert.NotNull(page);
    }

    [Fact]
    public async Task GetMessages_DefaultQueryParams_ReturnsOk()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/messages/{assignmentId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetMessages_PageLessThanOne_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();
        var assignmentId = Guid.NewGuid();

        var response = await client.GetAsync($"/api/messages/{assignmentId}?page=0&limit=50");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Page"));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(101)]
    public async Task GetMessages_LimitOutOfRange_ReturnsBadRequestProblem(int invalidLimit)
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();
        var assignmentId = Guid.NewGuid();

        var response = await client.GetAsync($"/api/messages/{assignmentId}?page=1&limit={invalidLimit}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Limit"));
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/messages/{id} (Create message for assignment)
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateMessage_Unauthenticated_ReturnsUnauthorized()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient(); // Brak zalogowania -> brak ciasteczka auth
        var assignmentId = Guid.NewGuid();

        var request = new MessageCreateDto
        {
            Text = "Unauthorized attempt"
        };

        var response = await client.PostAsJsonAsync($"/api/messages/{assignmentId}", request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateMessage_WithValidData_ReturnsCreatedMessage()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, "alice", "alice@example.com");
        var assignmentId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);
            return Task.CompletedTask;
        });

        using var client = await CreateAuthenticatedClient(app, "alice");

        var request = new MessageCreateDto
        {
            Text = "Here is the new update on task progress.",
            ParentMessageId = null
        };

        var response = await client.PostAsJsonAsync($"/api/messages/{assignmentId}", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await TestResponse.ReadJsonAsync<MessageDto>(response);
        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal(request.Text, created.Text);
        Assert.Null(created.ParentMessageId);
        Assert.False(created.IsEdited);
    }

    [Fact]
    public async Task CreateMessage_WithParentMessageId_ReturnsCreatedMessage()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, "alice", "alice@example.com");
        var assignmentId = Guid.Empty;
        var parentMessageId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);

            db.Set<Message>().Add(new Message
            {
                Id = parentMessageId,
                AssignmentId = assignmentId,
                AuthorId = user.Id,
                Text = "Original parent discussion message",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });

            return Task.CompletedTask;
        });

        using var client = await CreateAuthenticatedClient(app, "alice");

        var request = new MessageCreateDto
        {
            Text = "Replying directly to parent comment",
            ParentMessageId = parentMessageId
        };

        var response = await client.PostAsJsonAsync($"/api/messages/{assignmentId}", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await TestResponse.ReadJsonAsync<MessageDto>(response);
        Assert.Equal(parentMessageId, created.ParentMessageId);
        Assert.Equal(request.Text, created.Text);
    }

    [Fact]
    public async Task CreateMessage_WithEmptyText_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);
            return Task.CompletedTask;
        });

        await SeedUser(app, "alice", "alice@example.com");
        using var client = await CreateAuthenticatedClient(app, "alice");

        var request = new MessageCreateDto { Text = "" };

        var response = await client.PostAsJsonAsync($"/api/messages/{assignmentId}", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Text"));
    }

    [Fact]
    public async Task CreateMessage_WithTextExceeding1000Chars_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);
            return Task.CompletedTask;
        });

        await SeedUser(app, "alice", "alice@example.com");
        using var client = await CreateAuthenticatedClient(app, "alice");

        var request = new MessageCreateDto { Text = new string('A', 1001) };

        var response = await client.PostAsJsonAsync($"/api/messages/{assignmentId}", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Text"));
    }

    [Fact]
    public async Task CreateMessage_WithMaxLengthText_ReturnsCreated()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, "alice", "alice@example.com");
        var assignmentId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            assignmentId = SeedAssignment(db);
            return Task.CompletedTask;
        });

        using var client = await CreateAuthenticatedClient(app, "alice");

        var request = new MessageCreateDto { Text = new string('A', 1000) };

        var response = await client.PostAsJsonAsync($"/api/messages/{assignmentId}", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateMessage_NonExistentAssignmentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUser(app, "alice", "alice@example.com");
        using var client = await CreateAuthenticatedClient(app, "alice");

        var request = new MessageCreateDto { Text = "Message for missing assignment" };

        var response = await client.PostAsJsonAsync($"/api/messages/{Guid.NewGuid()}", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // PATCH /api/messages/{id} (Update message)
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateMessage_WithValidData_ReturnsUpdatedMessage()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, "alice", "alice@example.com");
        var messageId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var assignmentId = SeedAssignment(db);

            db.Set<Message>().Add(new Message
            {
                Id = messageId,
                AssignmentId = assignmentId,
                AuthorId = user.Id,
                Text = "Initial message content",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });

            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var request = new MessageUpdateDto
        {
            Text = "Content has been revised."
        };

        var response = await client.PatchAsJsonAsync($"/api/messages/{messageId}", request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await TestResponse.ReadJsonAsync<MessageDto>(response);
        Assert.Equal(request.Text, updated.Text);
    }

    [Fact]
    public async Task UpdateMessage_WithEmptyText_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();
        var messageId = Guid.NewGuid();

        var request = new MessageUpdateDto { Text = "" };

        var response = await client.PatchAsJsonAsync($"/api/messages/{messageId}", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.Equal(400, problem.Status);
        Assert.True(TestResponse.HasValidationError(problem, "Text"));
    }

    [Fact]
    public async Task UpdateMessage_WithTextExceeding1000Chars_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();
        var messageId = Guid.NewGuid();

        var request = new MessageUpdateDto { Text = new string('A', 1001) };

        var response = await client.PatchAsJsonAsync($"/api/messages/{messageId}", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Text"));
    }

    [Fact]
    public async Task UpdateMessage_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var request = new MessageUpdateDto { Text = "Valid update payload" };
        var response = await client.PatchAsJsonAsync($"/api/messages/{Guid.NewGuid()}", request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE /api/messages/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteMessage_ExistingId_ReturnsNoContent()
    {
        using var app = new ScrumDoneApiFactory();
        var user = await SeedUser(app, "alice", "alice@example.com");
        var messageId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var assignmentId = SeedAssignment(db);

            db.Set<Message>().Add(new Message
            {
                Id = messageId,
                AssignmentId = assignmentId,
                AuthorId = user.Id,
                Text = "Message to be deleted",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });

            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/messages/{messageId}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteMessage_NonExistentId_ReturnsNotFoundProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/messages/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }
}