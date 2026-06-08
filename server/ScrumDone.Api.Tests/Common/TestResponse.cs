using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Xunit;

public static class TestResponse
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault
    };

    public static async Task<T> ReadJsonAsync<T>(HttpResponseMessage response)
        where T : class
    {
        var result = await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        Assert.NotNull(result);
        return result;
    }

    public static bool HasValidationError(ValidationProblemDetails problem, string field) =>
        problem.Errors.Keys.Any(k => k.Equals(field, StringComparison.OrdinalIgnoreCase));
}