using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.Tests.Common;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace ScrumDone.Api.Tests.Auth;

public class PasswordResetEndpointTests
{
    // ─────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────

    private const string OldPassword = "OldPass_1!";
    private const string NewPassword = "NewPass_2!";
    private const string InvalidLinkMessage = "This reset link is invalid or has expired.";

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

    // Generates a real reset token and encodes it the same way AuthService does
    private static async Task<string> GenerateEncodedResetToken(ScrumDoneApiFactory app, string email)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByEmailAsync(email);
        Assert.NotNull(user);

        var rawToken = await userManager.GeneratePasswordResetTokenAsync(user!);
        return WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));
    }

    private static Task<HttpResponseMessage> PostReset(
        HttpClient client, string email, string token, string newPassword)
    {
        var dto = new ResetPasswordDto { Email = email, Token = token, NewPassword = newPassword };
        return client.PostAsJsonAsync("/api/auth/reset-password", dto);
    }

    private static Task<HttpResponseMessage> PostLogin(HttpClient client, string userName, string password)
    {
        return client.PostAsJsonAsync("/api/auth/login",
            new LoginDto { UserName = userName, Password = password });
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/forgot-password
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ForgotPassword_ExistingEmail_ReturnsOk()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);

        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "alice@example.com" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_UnknownEmail_ReturnsOk()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "ghost@example.com" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_KnownAndUnknownEmail_ProduceIdenticalResponses()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);

        using var client = app.CreateClient();

        var known = await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "alice@example.com" });
        var unknown = await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "ghost@example.com" });

        // an attacker must not be able to tell which emails have accounts
        Assert.Equal(known.StatusCode, unknown.StatusCode);
        Assert.Equal(
            await known.Content.ReadAsStringAsync(),
            await unknown.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task ForgotPassword_DoesNotChangePassword()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);

        using var client = app.CreateClient();
        await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "alice@example.com" });

        var login = await PostLogin(client, "alice", OldPassword);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_InvalidEmailFormat_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "not-an-email" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Email"));
    }

    [Fact]
    public async Task ForgotPassword_EmptyEmail_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/forgot-password",
            new ForgotPasswordDto { Email = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Email"));
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/auth/reset-password
    // ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ResetPassword_ValidToken_ChangesPassword()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);
        var token = await GenerateEncodedResetToken(app, "alice@example.com");

        using var client = app.CreateClient();

        var response = await PostReset(client, "alice@example.com", token, NewPassword);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // TODO: should be 401 Unauthorized once login is fixed
        var oldLogin = await PostLogin(client, "alice", OldPassword);
        Assert.Equal(HttpStatusCode.BadRequest, oldLogin.StatusCode);

        var newLogin = await PostLogin(client, "alice", NewPassword);
        Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_MalformedToken_ReturnsBadRequestNotServerError()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);

        using var client = app.CreateClient();

        // '!' is not valid Base64Url, so decoding throws FormatException
        var response = await PostReset(client, "alice@example.com", "abc!", NewPassword);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(InvalidLinkMessage, problem.Detail);
    }

    [Fact]
    public async Task ResetPassword_WellFormedButWrongToken_ReturnsGenericMessage()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);

        using var client = app.CreateClient();

        // valid Base64Url, but not a token Identity ever issued
        var fakeToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes("this-is-not-a-real-token"));
        var response = await PostReset(client, "alice@example.com", fakeToken, NewPassword);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(response);
        Assert.Equal(InvalidLinkMessage, problem.Detail);
    }

    [Fact]
    public async Task ResetPassword_UnknownEmail_ReturnsSameMessageAsBadToken()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);

        using var client = app.CreateClient();
        var token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes("whatever"));

        var unknownEmail = await PostReset(client, "ghost@example.com", token, NewPassword);
        var badToken = await PostReset(client, "alice@example.com", token, NewPassword);

        Assert.Equal(HttpStatusCode.BadRequest, unknownEmail.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, badToken.StatusCode);

        var unknownProblem = await TestResponse.ReadJsonAsync<ProblemDetails>(unknownEmail);
        var badTokenProblem = await TestResponse.ReadJsonAsync<ProblemDetails>(badToken);

        // no way to tell "no such account" from "bad token"
        Assert.Equal(unknownProblem.Detail, badTokenProblem.Detail);
    }

    [Fact]
    public async Task ResetPassword_TokenIssuedForAnotherUser_ReturnsBadRequest()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);
        await SeedUserWithPassword(app, "bob", "bob@example.com", OldPassword);
        var aliceToken = await GenerateEncodedResetToken(app, "alice@example.com");

        using var client = app.CreateClient();

        var response = await PostReset(client, "bob@example.com", aliceToken, NewPassword);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        // bob's password is unchanged
        var login = await PostLogin(client, "bob", OldPassword);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_ValidTokenWeakPassword_ReturnsPolicyErrorAndTokenStaysUsable()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);
        var token = await GenerateEncodedResetToken(app, "alice@example.com");

        using var client = app.CreateClient();

        var weak = await PostReset(client, "alice@example.com", token, "a");
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);

        // a weak password is a policy error, not an invalid link
        var problem = await TestResponse.ReadJsonAsync<ProblemDetails>(weak);
        Assert.NotEqual(InvalidLinkMessage, problem.Detail);

        // the failed attempt must not burn the token
        var retry = await PostReset(client, "alice@example.com", token, NewPassword);
        Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_TokenReused_SecondAttemptFails()
    {
        using var app = new ScrumDoneApiFactory();
        await SeedUserWithPassword(app, "alice", "alice@example.com", OldPassword);
        var token = await GenerateEncodedResetToken(app, "alice@example.com");

        using var client = app.CreateClient();

        var first = await PostReset(client, "alice@example.com", token, NewPassword);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        // the security stamp changed, so the same token is now invalid
        var second = await PostReset(client, "alice@example.com", token, "AnotherPass_3!");
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);

        var login = await PostLogin(client, "alice", NewPassword);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task ResetPassword_EmptyToken_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await PostReset(client, "alice@example.com", "", NewPassword);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Token"));
    }

    [Fact]
    public async Task ResetPassword_TokenTooLong_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await PostReset(client, "alice@example.com", new string('A', 1025), NewPassword);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "Token"));
    }

    [Fact]
    public async Task ResetPassword_PasswordTooLong_ReturnsBadRequestProblem()
    {
        using var app = new ScrumDoneApiFactory();
        using var client = app.CreateClient();

        var response = await PostReset(client, "alice@example.com", "abcd", new string('A', 129));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await TestResponse.ReadJsonAsync<ValidationProblemDetails>(response);
        Assert.True(TestResponse.HasValidationError(problem, "NewPassword"));
    }
}