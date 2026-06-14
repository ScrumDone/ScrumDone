using FluentValidation;
using MicroElements.AspNetCore.OpenApi.FluentValidation;
using MicroElements.OpenApi.FluentValidation;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Scrumdone.Api.Services;
using ScrumDone.Api.Data;
using ScrumDone.Api.Middleware;
using ScrumDone.Api.Services;
using ScrumDone.Api.Validators;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("LocalConnection")));

builder.Services.AddControllers();

builder.Services.Configure<SchemaGenerationOptions>(o =>
{
    o.SetNotNullableIfMinLengthGreaterThenZero = false;
    //o.RuleFilter = rule => !rule.HasCondition; // <- uncomment this
});

builder.Services.AddValidatorsFromAssemblyContaining<ValidatorAssemblyMarker>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddScoped<IValidatorRegistry, ServiceProviderValidatorRegistry>();

builder.Services.AddOpenApi(options =>
{
    options.AddFluentValidationRules();
});

builder.Services.AddRouting(options => 
{
    options.LowercaseUrls = true;
});

builder.Services.AddTransient<ICompaniesService, CompaniesService>();
builder.Services.AddTransient<IProjectsService, ProjectsService>();
builder.Services.AddTransient<IAssignmentsService, AssignmentsService>();
builder.Services.AddTransient<ISprintsService, SprintsService>();
builder.Services.AddTransient<IUsersService, UsersService>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetService<AppDbContext>();
        db.Database.Migrate();
        if (app.Environment.IsDevelopment())
        {
            DatabaseSeeder.Seed(db);
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseExceptionHandler();
app.UseStatusCodePages();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
