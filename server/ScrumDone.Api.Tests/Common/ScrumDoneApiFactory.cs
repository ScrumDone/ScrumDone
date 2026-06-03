using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using ScrumDone.Api.Data;

namespace ScrumDone.Api.Tests.Common;

internal sealed class ScrumDoneApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"ScrumDoneTests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();

            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));
        });

        builder.ConfigureLogging(logging =>
        {
            logging.ClearProviders();
            logging.AddFilter("Microsoft", LogLevel.Warning);
            logging.AddFilter("ScrumDone.Api", LogLevel.Warning);
            logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.None);
        });
    }

    public async Task SeedDatabaseAsync(Func<AppDbContext, Task> seed)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();

        await seed(db);
        await db.SaveChangesAsync();
    }
}
