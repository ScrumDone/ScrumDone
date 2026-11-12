using FluentValidation;
using MicroElements.AspNetCore.OpenApi.FluentValidation;
using MicroElements.OpenApi.FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
            policy.WithOrigins(builder.Configuration["Frontend:BaseUrl"]
                ?? throw new InvalidOperationException("Frontend:BaseUrl is not configured."))
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

builder.Services.AddIdentityCore<User>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
})
.AddRoles<IdentityRole<Guid>>()
.AddEntityFrameworkStores<AppDbContext>()
.AddSignInManager<SignInManager<User>>()
.AddDefaultTokenProviders()
.AddApiEndpoints();

builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme)
    .AddCookie(IdentityConstants.ApplicationScheme, options =>
    {
        options.Events.OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync;

        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.TryAddScoped<ISecurityStampValidator, SecurityStampValidator<User>>();
builder.Services.Configure<SecurityStampValidatorOptions>(o =>
    o.ValidationInterval = TimeSpan.Zero);

builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
{
    options.TokenLifespan = TimeSpan.FromHours(2);
});

builder.Services.AddAuthorization();

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
builder.Services.AddTransient<IAuthService, AuthService>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// for localhost development
var isDevelopment = app.Environment.IsDevelopment();
// for automated tests
var isTesting = app.Environment.IsEnvironment("Testing");
// for committee, usability testing and QA testing
var isStaging = app.Environment.IsStaging();
// for production deployment
var isProduction = app.Environment.IsProduction();

if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        var startAdmin = new User
        {
            UserName = builder.Configuration["AdminCredentials:Username"] 
            ?? throw new InvalidOperationException("Missing initial admin username."),
            Name = builder.Configuration["AdminCredentials:Name"] 
            ?? throw new InvalidOperationException("Missing initial admin name."),
            Email = builder.Configuration["AdminCredentials:Email"] 
            ?? throw new InvalidOperationException("Missing initial admin email."),
            EmailConfirmed = true
        };

        await DatabaseProdSeeder.Seed(
            db, 
            userManager, 
            roleManager, 
            startAdmin, 
            builder.Configuration["AdminCredentials:Password"]
            ?? throw new InvalidOperationException("Missing initial admin password.")
        );

        if (isDevelopment || isStaging)
        {   
            await DatabaseSeeder.Seed(db, userManager, roleManager);
        }
    }
}

// Configure the HTTP request pipeline.
if (isDevelopment || isStaging)
{
    if (isDevelopment)
    {
        app.UseDeveloperExceptionPage();
    }
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
