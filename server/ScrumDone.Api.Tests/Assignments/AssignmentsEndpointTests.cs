using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.Tests.Common;
using ScrumDone.Api.Validators.Assignments;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace ScrumDone.Api.Tests.Assignments;

public class AssignmentsEndpointTests
{
    // ─────────────────────────────────────────────────────────
    // Seed helper — every test that touches assignments needs
    // at least a project and a default status.
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
            IsDefault = true
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

    // ─────────────────────────────────────────────────────────
    // GET /api/assignments
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAssignments_EmptyDatabase_ReturnsEmptyPage()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/assignments");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Empty(page.Items);
        Assert.Equal(0, page.TotalCount);
        Assert.False(page.HasNextPage);
        Assert.False(page.HasPreviousPage);
    }

    [Fact]
    public async Task GetAssignments_NoFilters_ReturnsAllAssignments()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.AddRange(
                new Assignment { Name = "First", ProjectId = seed.ProjectId, StatusId = seed.StatusId },
                new Assignment { Name = "Second", ProjectId = seed.ProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(2, page.TotalCount);
    }

    [Fact]
    public async Task GetAssignments_FilterByProjectId_ReturnsOnlyMatchingAssignments()
    {
        using var app = new ScrumDoneApiFactory();
        Guid targetProjectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            targetProjectId = seed.ProjectId;

            var otherProjectId = Guid.NewGuid();
            db.Projects.Add(new Project { Id = otherProjectId, Name = "Other Project", Description = "Other" });

            db.Assignment.AddRange(
                new Assignment { Name = "Target Project Task", ProjectId = seed.ProjectId, StatusId = seed.StatusId },
                new Assignment { Name = "Other Project Task", ProjectId = otherProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync($"/api/assignments?projectIds={targetProjectId}");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.All(page.Items, a => Assert.Equal(targetProjectId, a.ProjectId));
    }

    [Fact]
    public async Task GetAssignments_FilterBySprintId_ReturnsOnlyAssignmentsInSprint()
    {
        using var app = new ScrumDoneApiFactory();
        Guid targetSprintId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            targetSprintId = Guid.NewGuid();
            db.Sprints.Add(new Sprint { Id = targetSprintId, ProjectId = seed.ProjectId });

            db.Assignment.AddRange(
                new Assignment { Name = "In Sprint", ProjectId = seed.ProjectId, StatusId = seed.StatusId, SprintId = targetSprintId },
                new Assignment { Name = "Not In Sprint", ProjectId = seed.ProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync($"/api/assignments?sprintIds={targetSprintId}");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.Equal(targetSprintId, page.Items.Single().SprintId);
    }

    [Fact]
    public async Task GetAssignments_BacklogFilter_ReturnsOnlyAssignmentsWithoutSprint()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            var sprintId = Guid.NewGuid();
            db.Sprints.Add(new Sprint { Id = sprintId, ProjectId = seed.ProjectId });

            db.Assignment.AddRange(
                new Assignment { Name = "In Sprint", ProjectId = seed.ProjectId, StatusId = seed.StatusId, SprintId = sprintId },
                new Assignment { Name = "Backlog Item", ProjectId = seed.ProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments?backlog=true");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.Equal("Backlog Item", page.Items.Single().Name);
    }

    [Fact]
    public async Task GetAssignments_FilterByStatusId_ReturnsOnlyMatchingAssignments()
    {
        using var app = new ScrumDoneApiFactory();
        Guid doneStatusId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            doneStatusId = Guid.NewGuid();
            db.AssignmentStatuses.Add(new AssignmentStatus
            {
                Id = doneStatusId,
                Name = "Done",
                HexColor = "#00FF00",
                IsDefault = false
            });

            db.Assignment.AddRange(
                new Assignment { Name = "To Do Task", ProjectId = seed.ProjectId, StatusId = seed.StatusId },
                new Assignment { Name = "Done Task", ProjectId = seed.ProjectId, StatusId = doneStatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync($"/api/assignments?statusIds={doneStatusId}");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.Equal("Done Task", page.Items.Single().Name);
    }

    [Fact]
    public async Task GetAssignments_DateRangeFilter_IncludesNullDeadlineByDefault()
    {
        using var app = new ScrumDoneApiFactory();
        var now = DateTimeOffset.UtcNow;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.AddRange(
                new Assignment { Name = "Due Tomorrow", ProjectId = seed.ProjectId, StatusId = seed.StatusId, DueDate = now.AddDays(1) },
                new Assignment { Name = "Due Next Month", ProjectId = seed.ProjectId, StatusId = seed.StatusId, DueDate = now.AddDays(30) },
                new Assignment { Name = "No Deadline", ProjectId = seed.ProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var from = Uri.EscapeDataString(now.ToString("o"));
        var to = Uri.EscapeDataString(now.AddDays(7).ToString("o"));
        var response = await client.GetAsync($"/api/assignments?dueOnOrAfter={from}&dueOnOrBefore={to}");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        // "Due Tomorrow" (in range) + "No Deadline" (included by default)
        Assert.Equal(2, page.TotalCount);
    }

    [Fact]
    public async Task GetAssignments_ExcludeNoDeadline_ReturnsOnlyAssignmentsWithDueDate()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.AddRange(
                new Assignment { Name = "Has Deadline", ProjectId = seed.ProjectId, StatusId = seed.StatusId, DueDate = DateTimeOffset.UtcNow.AddDays(1) },
                new Assignment { Name = "No Deadline", ProjectId = seed.ProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments?excludeNoDeadline=true");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.Equal("Has Deadline", page.Items.Single().Name);
    }

    [Fact]
    public async Task GetAssignments_Pagination_ReturnsCorrectPage()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            for (var i = 0; i < 5; i++)
                db.Assignment.Add(new Assignment { Name = $"Assignment {i}", ProjectId = seed.ProjectId, StatusId = seed.StatusId });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments?page=2&limit=2");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(5, page.TotalCount);
        Assert.Equal(2, page.Items.Count());
        Assert.True(page.HasPreviousPage);
        Assert.True(page.HasNextPage);
    }

    [Fact]
    public async Task GetAssignments_InvalidPagination_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/assignments?page=0&limit=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(
            TestResponse.HasValidationError(problem, "Page") ||
            TestResponse.HasValidationError(problem, "Limit"));
    }

    [Fact]
    public async Task GetAssignments_InvalidDateRange_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        // DueOnOrAfter > DueOnOrBefore is invalid
        var after = Uri.EscapeDataString(DateTimeOffset.UtcNow.AddDays(7).ToString("o"));
        var before = Uri.EscapeDataString(DateTimeOffset.UtcNow.ToString("o"));
        var response = await client.GetAsync($"/api/assignments?dueOnOrAfter={after}&dueOnOrBefore={before}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAssignments_SoftDeletedAssignment_NotReturned()
    {
        using var app = new ScrumDoneApiFactory();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.AddRange(
                new Assignment { Name = "Active", ProjectId = seed.ProjectId, StatusId = seed.StatusId },
                new Assignment { Name = "Deleted", ProjectId = seed.ProjectId, StatusId = seed.StatusId, IsDeleted = true, DeletedAt = DateTimeOffset.UtcNow }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync("/api/assignments");

        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(response);
        Assert.Equal(1, page.TotalCount);
        Assert.Equal("Active", page.Items.Single().Name);
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/assignments/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAssignmentById_ExistingId_ReturnsDetailDto()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Test Assignment",
                Description = "Some description",
                DueDate = DateTimeOffset.UtcNow.AddDays(7),
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                PriorityId = seed.PriorityId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync($"/api/assignments/{assignmentId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var assignment = await TestResponse.ReadJsonAsync<AssignmentDetailDto>(response);
        Assert.Equal(assignmentId, assignment.Id);
        Assert.Equal("Test Assignment", assignment.Name);
        Assert.Equal("Some description", assignment.Description);
        Assert.NotNull(assignment.Status);
        Assert.NotNull(assignment.Priority);
        Assert.Equal("Test Project", assignment.ProjectName);
    }

    [Fact]
    public async Task GetAssignmentById_NonExistentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync($"/api/assignments/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    [Fact]
    public async Task GetAssignmentById_SoftDeletedAssignment_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Deleted Assignment",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId,
                IsDeleted = true,
                DeletedAt = DateTimeOffset.UtcNow
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.GetAsync($"/api/assignments/{assignmentId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/assignments
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAssignment_WithValidData_Returns201WithBody()
    {
        using var app = new ScrumDoneApiFactory();
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments", new AssignmentCreateDto
        {
            Name = "New Assignment",
            Description = "Some work to do",
            ProjectId = projectId
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var assignment = await TestResponse.ReadJsonAsync<AssignmentDetailDto>(response);
        Assert.NotEqual(Guid.Empty, assignment.Id);
        Assert.Equal("New Assignment", assignment.Name);
        Assert.Equal("Some work to do", assignment.Description);
        Assert.Equal("Test Project", assignment.ProjectName);
        Assert.NotNull(assignment.Status); // default status assigned
    }

    [Fact]
    public async Task CreateAssignment_UsesDefaultStatus_WhenStatusNotProvided()
    {
        using var app = new ScrumDoneApiFactory();
        Guid defaultStatusId = Guid.Empty;
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            defaultStatusId = seed.StatusId;
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments",
            new AssignmentCreateDto { Name = "No Status", ProjectId = projectId });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var assignment = await TestResponse.ReadJsonAsync<AssignmentDetailDto>(response);
        Assert.Equal(defaultStatusId, assignment.Status.Id);
    }

    [Fact]
    public async Task CreateAssignment_EmptyName_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments",
            new AssignmentCreateDto { Name = "", ProjectId = projectId });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateAssignment_NameTooLong_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments",
            new AssignmentCreateDto { Name = new string('A', 101), ProjectId = projectId });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task CreateAssignment_PastDueDate_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments", new AssignmentCreateDto
        {
            Name = "Past Due",
            ProjectId = projectId,
            DueDate = DateTimeOffset.UtcNow.AddDays(-1)
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateAssignment_TooManyAssignees_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments", new AssignmentCreateDto
        {
            Name = "Overcrowded",
            ProjectId = projectId,
            AssigneeIds = Enumerable.Range(0, AssignmentAssigneesUpdateDtoValidator.MaxAssignees + 1)
                .Select(_ => Guid.NewGuid())
                .ToList()
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateAssignment_DuplicateAssigneeIds_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        Guid projectId = Guid.Empty;

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            projectId = seed.ProjectId;
            return Task.CompletedTask;
        });

        var duplicateUserId = Guid.NewGuid();
        using var client = app.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assignments", new AssignmentCreateDto
        {
            Name = "Duplicate Assignees",
            ProjectId = projectId,
            AssigneeIds = [duplicateUserId, duplicateUserId]
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─────────────────────────────────────────────────────────
    // PATCH /api/assignments/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAssignment_OnlyProvidedFieldsAreUpdated()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Original Name",
                Description = "Original Description",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Only send Name — Description should be unchanged
        var response = await client.PatchAsJsonAsync($"/api/assignments/{assignmentId}",
            new AssignmentUpdateDto { Name = "Updated Name" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var assignment = await TestResponse.ReadJsonAsync<AssignmentDetailDto>(response);
        Assert.Equal("Updated Name", assignment.Name);
        Assert.Equal("Original Description", assignment.Description); // unchanged
    }

    [Fact]
    public async Task UpdateAssignment_OmittedField_IsNotUpdated()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Stable Name",
                Description = "Original Description",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Send only Description as anonymous object — Name must not be touched
        // NOTE: This test will FAIL if AssignmentUpdateDtoValidator is missing
        // the When condition on the Name rule (current bug — see issue #2 above)
        var response = await client.PatchAsJsonAsync($"/api/assignments/{assignmentId}",
            new { description = "New Description" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var assignment = await TestResponse.ReadJsonAsync<AssignmentDetailDto>(response);
        Assert.Equal("Stable Name", assignment.Name);       // not in body, not changed
        Assert.Equal("New Description", assignment.Description);
    }

    [Fact]
    public async Task UpdateAssignment_NullField_ClearsValue()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Assignment With Due Date",
                DueDate = DateTimeOffset.UtcNow.AddDays(7),
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        // Explicitly send null for DueDate — should clear it
        var response = await client.PatchAsJsonAsync($"/api/assignments/{assignmentId}",
            new AssignmentUpdateDto { DueDate = null });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var assignment = await TestResponse.ReadJsonAsync<AssignmentDetailDto>(response);
        Assert.Null(assignment.DueDate);
        Assert.Equal("Assignment With Due Date", assignment.Name); // unchanged
    }

    [Fact]
    public async Task UpdateAssignment_NonExistentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/assignments/{Guid.NewGuid()}",
            new AssignmentUpdateDto { Name = "Anything" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }

    [Fact]
    public async Task UpdateAssignment_EmptyName_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Valid Name",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/assignments/{assignmentId}",
            new AssignmentUpdateDto { Name = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    [Fact]
    public async Task UpdateAssignment_NameTooLong_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "Valid Name",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var response = await client.PatchAsJsonAsync($"/api/assignments/{assignmentId}",
            new AssignmentUpdateDto { Name = new string('A', 101) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Name"));
    }

    // ─────────────────────────────────────────────────────────
    // DELETE /api/assignments/{id}
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAssignment_ExistingId_Returns204AndIsGone()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.Add(new Assignment
            {
                Id = assignmentId,
                Name = "To Delete",
                ProjectId = seed.ProjectId,
                StatusId = seed.StatusId
            });
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        var deleteResponse = await client.DeleteAsync($"/api/assignments/{assignmentId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/assignments/{assignmentId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteAssignment_SoftDelete_DoesNotAppearInList()
    {
        using var app = new ScrumDoneApiFactory();
        var assignmentId = Guid.NewGuid();

        await app.SeedDatabaseAsync(db =>
        {
            var seed = SeedBase(db);
            db.Assignment.AddRange(
                new Assignment { Id = assignmentId, Name = "To Delete", ProjectId = seed.ProjectId, StatusId = seed.StatusId },
                new Assignment { Name = "Stays", ProjectId = seed.ProjectId, StatusId = seed.StatusId }
            );
            return Task.CompletedTask;
        });

        using var client = app.CreateClient();

        await client.DeleteAsync($"/api/assignments/{assignmentId}");

        var listResponse = await client.GetAsync("/api/assignments");
        var page = await TestResponse.ReadJsonAsync<PagedResultDto<AssignmentListItemDto>>(listResponse);
        Assert.Equal(1, page.TotalCount);
        Assert.Equal("Stays", page.Items.Single().Name);
    }

    [Fact]
    public async Task DeleteAssignment_NonExistentId_ReturnsNotFound()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.DeleteAsync($"/api/assignments/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(404, problem.Status);
    }
}