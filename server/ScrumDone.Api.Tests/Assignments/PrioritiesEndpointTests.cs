using System.Net;
using System.Net.Http.Json;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.Tests.Common;
using Xunit;

namespace ScrumDone.Api.Tests.Assignments;

public class PrioritiesEndpointTests
{
    [Fact]
    public async Task GetPriorities_EmptyDatabase_ReturnsEmptyList()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/assignments/priorities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var priorities = await TestResponse.ReadJsonAsync<List<AssignmentPriorityDto>>(response);
        Assert.NotNull(priorities);
        Assert.Empty(priorities);
    }

    [Fact]
    public async Task GetPriorities_MultiplePriorities_ReturnsOrderedByOrder()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            db.AssignmentPriorities.AddRange(
                new AssignmentPriority { Id = Guid.NewGuid(), Name = "Low", HexColor = "#cccccc", Order = 30 },
                new AssignmentPriority { Id = Guid.NewGuid(), Name = "High", HexColor = "#ff0000", Order = 10 },
                new AssignmentPriority { Id = Guid.NewGuid(), Name = "Medium", HexColor = "#ffa500", Order = 20 }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments/priorities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var priorities = await TestResponse.ReadJsonAsync<List<AssignmentPriorityDto>>(response);
        Assert.Equal(3, priorities.Count);

        Assert.Equal("High", priorities[0].Name);
        Assert.Equal("Medium", priorities[1].Name);
        Assert.Equal("Low", priorities[2].Name);
    }

    [Fact]
    public async Task GetPriorities_SinglePriority_ReturnsIt()
    {
        using var app = new ScrumDoneApiFactory();
        var priorityId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            db.AssignmentPriorities.Add(new AssignmentPriority
            {
                Id = priorityId,
                Name = "Urgent",
                HexColor = "#ff0000",
                Order = 1
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments/priorities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var priorities = await TestResponse.ReadJsonAsync<List<AssignmentPriorityDto>>(response);
        Assert.Single(priorities);
        Assert.Equal(priorityId, priorities[0].Id);
        Assert.Equal("Urgent", priorities[0].Name);
        Assert.Equal("#ff0000", priorities[0].HexColor);
        Assert.Equal(1, priorities[0].Order);
    }
}