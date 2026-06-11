
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ScrumDone.Api.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ScrumDone.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    //private readonly IProblemDetailsService _problemDetailsService;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)//,
                                               //IProblemDetailsService problemDetailsService)
    {
        _logger = logger;
        //_problemDetailsService = problemDetailsService;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            ValidationException => (400, "Bad Request"),
            BadRequestException => (400, "Bad Request"),
            NotFoundException => (404, "Not Found"),
            ConflictException => (409, "Conflict"),
            _ => (500, "Internal Server Error")
        };

        if (status >= 500)
            _logger.LogError(exception, "Unhandled exception {Status} on {Path}", status, context.Request.Path);
        else
            _logger.LogInformation("Client error {Status} on {Path}: {Message}", status, context.Request.Path, exception.Message);

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";

        if (exception is ValidationException ve)
        {
            // Group errors by property name into the standard errors dictionary
            var errors = ve.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );

            var validationProblem = new ValidationProblemDetails(errors)
            {
                Status = status,
                Title = title,
                Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
            };

            await Results.Problem(validationProblem).ExecuteAsync(context);
        }
        else
        {
            var problemDetails = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = status < 500 ? exception.Message : "An unexpected error occurred.",
                Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"
            };

            await Results.Problem(
                statusCode: problemDetails.Status,
                title: problemDetails.Title,
                detail: problemDetails.Detail
            ).ExecuteAsync(context);
        }

        return true;

    // use the block below instead to match ProblemDetails in model binding
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