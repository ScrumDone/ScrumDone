using Bogus;
using ScrumDone.Api.Data;
using AssignmentStatus = ScrumDone.Api.Data.AssignmentStatus;
using Microsoft.AspNetCore.Identity;
public class DatabaseProdSeeder
{
    public static async Task Seed(AppDbContext context, UserManager<User> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        var hasher = new PasswordHasher<User>();

        foreach (var roleName in new[] { "Admin", "ProjectManager", "StandardUser" })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid> { Name = roleName });
            }
        }

        if(context.AssignmentStatuses.Any())
        {
            return;
        }

        Randomizer.Seed = new Random(123);
        Random rnd = new Random(123);
        var now = DateTimeOffset.UtcNow;
        
        var statuses = new List<AssignmentStatus>
        {
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "To Do", HexColor = "#D1D5DB", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 0 },
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "In Progress", HexColor = "#3B82F6", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 1 },
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "In Review", HexColor = "#EAB308", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 2 },
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "Done", HexColor = "#22C55E", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 3 },
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "Blocked", HexColor = "#EF4444", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 4 }
        };
        context.AssignmentStatuses.AddRange(statuses);

        var priorities = new List<AssignmentPriority>
        {
            new AssignmentPriority { Id = Guid.NewGuid(), Name = "Low", HexColor = "#00C950", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 0 },
            new AssignmentPriority { Id = Guid.NewGuid(), Name = "Medium", HexColor = "#F0B100", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 1 },
            new AssignmentPriority { Id = Guid.NewGuid(), Name = "High", HexColor = "#FB2C36", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now, Order = 2 }
        };
        context.AssignmentPriorities.AddRange(priorities);

        var notificationTypes = new List<NotificationType>
        {
            new NotificationType { Id = Guid.NewGuid(), Name = "Message", HexColor = "#2045ac", CreatedAt = now, IsDeleted=false, UpdatedAt = now },
            new NotificationType { Id = Guid.NewGuid(), Name = "Assignment", HexColor = "#0b7880", CreatedAt = now, IsDeleted=false, UpdatedAt = now },
            new NotificationType { Id = Guid.NewGuid(), Name = "Deadline", HexColor = "#2357b8", CreatedAt = now, IsDeleted=false, UpdatedAt = now }
        };
        context.NotificationTypes.AddRange(notificationTypes);

        var fileLabels = new List<FileLabel>
        {
            new FileLabel { Id = Guid.NewGuid(), Name = "Contract", HexColor = "#8965dd", CreatedAt = now, IsDeleted=false, UpdatedAt = now },
            new FileLabel { Id = Guid.NewGuid(), Name = "Bill", HexColor = "#4d10af", CreatedAt = now, IsDeleted=false, UpdatedAt = now },
            new FileLabel { Id = Guid.NewGuid(), Name = "Photo", HexColor = "#9c10dd", CreatedAt = now, IsDeleted=false, UpdatedAt = now }
        };
        context.FileLabels.AddRange(fileLabels);        


        await context.SaveChangesAsync();

        var user = new User{
            UserName = "Admin",
            Name = "Admin",
            Email = "admin@admin.com",
            EmailConfirmed = true
        };

        await userManager.CreateAsync(user, "Haslo_123");
        await userManager.AddToRoleAsync(user, "Admin");

        context.SaveChanges();
    }
}
