using ScrumDone.Api.Tests.Common;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace ScrumDone.Api.Tests.Utils;

public class UtilsEndpointTests
{
    [Fact]
    public async Task GetHealth_ReturnsHealthyStatus()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/api/utils/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Healthy", body.GetProperty("status").GetString());
    }
}
