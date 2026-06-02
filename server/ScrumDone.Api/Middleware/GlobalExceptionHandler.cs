using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Exceptions;

namespace ScrumDone.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IProblemDetailsService _problemDetailsService;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IProblemDetailsService problemDetailsService)
    {
        _logger = logger;
        _problemDetailsService = problemDetailsService;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            BadRequestException => (400, "Bad Request"),
            NotFoundException => (404, "Not Found"),
            _ => (500, "Internal Server Error")
        };

        if (status >= 500)
        {
            _logger.LogError(exception,
                "Unhandled exception {Status} on {Path}",
                status,
                context.Request.Path);
        }
        else
        {
            _logger.LogWarning(exception,
                "Client error {Status} on {Path}",
                status,
                context.Request.Path);
        }
        //context.Response.StatusCode = status;


        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status == 500
                ? "An unexpected error occurred."
                : exception.Message
        };

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(problemDetails, ct);

        return true;

        /*
        var result = await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            Exception = exception,
            ProblemDetails = new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["general"] = [status < 500 ? exception.Message : "An unexpected error occurred."]
                })
                    {
                        Status = status,
                        Title = title,
                    }
        });

        return result;
        */
    }
}