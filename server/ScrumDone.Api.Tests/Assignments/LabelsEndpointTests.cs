using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.Tests.Common;
using ScrumDone.Api.Validators.Assignments;
using Xunit;

namespace ScrumDone.Api.Tests.Assignments;

public class LabelsEndpointTests
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
            Description = "Test description"
        });

        return new SeedData(projectId, statusId, priorityId);
    }

    private static async Task<(Guid Label1, Guid Label2)> SeedTwoLabels(AppDbContext db)
    {
        var label1 = new AssignmentLabel
        {
            Id = Guid.NewGuid(),
            Name = "Bug",
            HexColor = "#FF0000",
            ProjectId = Guid.NewGuid() // In tests we don't enforce the project FK for labels
        };
        var label2 = new AssignmentLabel
        {
            Id = Guid.NewGuid(),
            Name = "Feature",
            HexColor = "#00FF00",
            ProjectId = Guid.NewGuid()
        };
        db.AssignmentLabels.AddRange(label1, label2);
        await db.SaveChangesAsync();
        return (label1.Id, label2.Id);
    }

    // ─────────────────────────────────────────────────────────
    // PUT /api/assignments/{id}/labels
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateLabels_ValidList_ReplacesLabels()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid labelA = Guid.Empty, labelB = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            (labelA, labelB) = await SeedTwoLabels(db);

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                Labels = { new AssignmentAssignmentLabelMTMRelation { AssignmentLabelId = labelA } }
            });
        });

        using var client = app.CreateClient();
        var dto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid> { labelB } };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var labels = await TestResponse.ReadJsonAsync<List<AssignmentLabelDto>>(response);
        Assert.Single(labels);
        Assert.Equal(labelB, labels[0].Id);
        Assert.Equal("Feature", labels[0].Name);
    }

    [Fact]
    public async Task UpdateLabels_EmptyList_ClearsAllLabels()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid labelId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            labelId = (await SeedTwoLabels(db)).Label1;

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                Labels = { new AssignmentAssignmentLabelMTMRelation { AssignmentLabelId = labelId } }
            });
        });

        using var client = app.CreateClient();
        var dto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid>() };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", dto);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var labels = await TestResponse.ReadJsonAsync<List<AssignmentLabelDto>>(response);
        Assert.Empty(labels);
    }

    [Fact]
    public async Task UpdateLabels_NotFound_Returns404()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var dto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid> { Guid.NewGuid() } };
        var response = await client.PutAsJsonAsync($"/api/assignments/{Guid.NewGuid()}/labels", dto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateLabels_DuplicateIds_Returns400()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid labelId = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            labelId = (await SeedTwoLabels(db)).Label1;

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
        });

        using var client = app.CreateClient();
        var dto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid> { labelId, labelId } };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "LabelIds"));
    }

    [Fact]
    public async Task UpdateLabels_TooMany_Returns400()
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
        var dto = new AssignmentLabelsUpdateDto
        {
            LabelIds = Enumerable.Range(0, AssignmentLabelsUpdateDtoValidator.MaxLabels + 1)
                               .Select(_ => Guid.NewGuid())
                               .ToList()
        };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "LabelIds"));
    }

    [Fact]
    public async Task UpdateLabels_EmptyGuid_Returns400()
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
        var dto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid> { Guid.Empty } };

        var response = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", dto);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "LabelIds[0]"));
    }

    [Fact]
    public async Task UpdateLabels_ReAddPreviouslyRemovedLabel_CreatesNewActiveRecord()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();
        Guid labelA = Guid.Empty;

        await app.SeedDatabaseAsync(async db =>
        {
            var seed = SeedBase(db);
            labelA = (await SeedTwoLabels(db)).Label1;

            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Task",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                Labels = { new AssignmentAssignmentLabelMTMRelation { AssignmentLabelId = labelA } }
            });
        });

        using var client = app.CreateClient();

        // Remove the label (clear all)
        var removeDto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid>() };
        var removeResponse = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", removeDto);
        Assert.Equal(HttpStatusCode.OK, removeResponse.StatusCode);

        // Re-add the same label
        var addDto = new AssignmentLabelsUpdateDto { LabelIds = new List<Guid> { labelA } };
        var addResponse = await client.PutAsJsonAsync($"/api/assignments/{assignmentId}/labels", addDto);
        Assert.Equal(HttpStatusCode.OK, addResponse.StatusCode);

        var labels = await TestResponse.ReadJsonAsync<List<AssignmentLabelDto>>(addResponse);
        Assert.Single(labels);
        Assert.Equal(labelA, labels[0].Id);
        Assert.Equal("Bug", labels[0].Name);
    }
}