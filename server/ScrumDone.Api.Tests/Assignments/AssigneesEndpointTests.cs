using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Tests.Common;
using ScrumDone.Api.Validators.Assignments;
using Xunit;

namespace ScrumDone.Api.Tests.Assignments;

public class AssigneesEndpointTests
{
    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    private record SeedData(Guid ProjectId, Guid StatusId, Guid PriorityId);

    private static SeedData SeedBase(AppDbContext db)
    {
        var statusId = Guid.NewGuid();
        var priorityId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        db.AssignmentStatuses.Add(new AssignmentStatus
        {
            Id = statusId,
            Name = "To Do",
            HexColor = "#808080",
            Order = 0
        });

        db.AssignmentPriorities.Add(new AssignmentPriority
        {
            Id = priorityId,
            Name = "Medium",
            HexColor = "#FFA500"
        });

        db.Projects.Add(new Project
        {
            Id = projectId,
            Name = "Test Project",
            Description = "Test description",
            HexColor = "#AAAAAA"
        });

        return new SeedData(projectId, statusId, priorityId);
    }

    private static async Task<(Guid User1, Guid User2)> SeedTwoUsers(AppDbContext db)
    {
        var user1 = new User { Id = Guid.NewGuid(), Name = "Alice" };
        var user2 = new User { Id = Guid.NewGuid(), Name = "Bob" };
        db.Users.AddRange(user1, user2);
        await db.SaveChangesAsync();
        return (user1.Id, user2.Id);
    }

    // ─────────────────────────────────────────────────────────
    // PUT /api/assignments/{id}/assignees
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAssignees_ValidList_ReplacesAssignees()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid userA = Guid.Empty, userB = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            (userA, userB) = await SeedTwoUsers(db);

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Team Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                Assignees = { new AssignmentUserMTMRelation { UserId = userA } }
            });
        });

        using var client = app.CreateClient();
        var dto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid> { userB } };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var users = await TestResponse.ReadJsonAsync<List<UserSummaryDto>>(response);
        Assert.Single(users);
        Assert.Equal(userB, users[0].Id);
        Assert.Equal("Bob", users[0].Name);
    }

    [Fact]
    public async Task UpdateAssignees_EmptyList_ClearsAllAssignees()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid userId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            userId = (await SeedTwoUsers(db)).User1;

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Solo Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                Assignees = { new AssignmentUserMTMRelation { UserId = userId } }
            });
        });

        using var client = app.CreateClient();
        var dto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid>() };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var users = await TestResponse.ReadJsonAsync<List<UserSummaryDto>>(response);
        Assert.Empty(users);
    }

    [Fact]
    public async Task UpdateAssignees_NotFound_Returns404()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var dto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid> { Guid.NewGuid() } };
        var response = await client.PutAsJsonAsync($"/api/assignments/{Guid.NewGuid()}/assignees", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateAssignees_DuplicateIds_Returns400()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid userId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            userId = (await SeedTwoUsers(db)).User1;

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
        });

        using var client = app.CreateClient();
        var dto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid> { userId, userId } };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "UserIds"));
    }

    [Fact]
    public async Task UpdateAssignees_TooMany_Returns400()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var dto = new AssignmentAssigneesUpdateDto
        {
            UserIds = Enumerable.Range(0, AssignmentAssigneesUpdateDtoValidator.MaxAssignees + 1)
                               .Select(_ => Guid.NewGuid())
                               .ToList()
        };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "UserIds"));
    }

    [Fact]
    public async Task UpdateAssignees_EmptyGuid_Returns400()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var dto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid> { Guid.Empty } };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "UserIds[0]"));
    }

    [Fact]
    public async Task UpdateAssignees_ReAddPreviouslyRemovedUser_CreatesNewActiveRecord()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid userA = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            userA = (await SeedTwoUsers(db)).User1;

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                Assignees = { new AssignmentUserMTMRelation { UserId = userA } }
            });
        });

        using var client = app.CreateClient();

        // Remove the user (clear all)
        var removeDto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid>() };
        var removeResponse = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", removeDto);
        Assert.Equal(HttpStatusCode.OK, removeResponse.StatusCode);

        // Re-add the same user
        var addDto = new AssignmentAssigneesUpdateDto { UserIds = new List<Guid> { userA } };
        var addResponse = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/assignees", addDto);
        Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

        var users = await TestResponse.ReadJsonAsync<List<UserSummaryDto>>(addResponse);
        Assert.Single(users);
        Assert.Equal(userA, users[0].Id);
        Assert.Equal("Alice", users[0].Name);
    }
}