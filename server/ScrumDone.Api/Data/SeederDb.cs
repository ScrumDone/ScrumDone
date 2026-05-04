using Bogus;
using ScrumDone.Api.Data;
using Task = ScrumDone.Api.Data.Task;
using TaskStatus = ScrumDone.Api.Data.TaskStatus;
public class DatabaseSeeder
{
    public static void Seed(AppDbContext context)
    {
        if(context.Companies.Any())
        {
            return;
        }

        var permissions = new List<UserPermissionsType>
        {
            new UserPermissionsType { Id = Guid.NewGuid(), Name = "Admin", CreatedAt = DateTimeOffset.UtcNow },
            new UserPermissionsType { Id = Guid.NewGuid(), Name = "ProjectManager", CreatedAt = DateTimeOffset.UtcNow },
            new UserPermissionsType { Id = Guid.NewGuid(), Name = "StandardUser", CreatedAt = DateTimeOffset.UtcNow }
        };
        context.UserPermissionsTypes.AddRange(permissions);

        var statuses = new List<TaskStatus>
        {
            new TaskStatus { Id = Guid.NewGuid(), Name = "To Do", HexColor = "#E2E8F0", CreatedAt = DateTimeOffset.UtcNow },
            new TaskStatus { Id = Guid.NewGuid(), Name = "In Progress", HexColor = "#3B82F6", CreatedAt = DateTimeOffset.UtcNow },
            new TaskStatus { Id = Guid.NewGuid(), Name = "Done", HexColor = "#22C55E", CreatedAt = DateTimeOffset.UtcNow }
        };
        context.TaskStatuses.AddRange(statuses);

        var priorities = new List<TaskPriority>
        {
            new TaskPriority { Id = Guid.NewGuid(), Name = "Low", HexColor = "#34D399", CreatedAt = DateTimeOffset.UtcNow },
            new TaskPriority { Id = Guid.NewGuid(), Name = "Medium", HexColor = "#ff7d13", CreatedAt = DateTimeOffset.UtcNow },
            new TaskPriority { Id = Guid.NewGuid(), Name = "High", HexColor = "#EF4444", CreatedAt = DateTimeOffset.UtcNow }
        };
        context.TaskPriorities.AddRange(priorities);

        context.SaveChanges();

        var companyFaker = new Faker<Company>("pl")
            .RuleFor(c => c.Id, f => Guid.NewGuid())
            .RuleFor(c => c.Name, f => f.Company.CompanyName())
            .RuleFor(c => c.Address, f => f.Address.FullAddress())
            .RuleFor(c => c.Nip, f => f.Company.CompanySuffix())
            .RuleFor(c => c.CreatedAt, f => DateTimeOffset.UtcNow);

        var companies = companyFaker.Generate(3);
        context.Companies.AddRange(companies);

        var userFaker = new Faker<User>("pl")
            .RuleFor(u => u.Id, f => Guid.NewGuid())
            .RuleFor(u => u.Name, f => f.Name.FullName())
            .RuleFor(u => u.ProfilePictureUrl, f => f.Internet.Avatar())
            .RuleFor(u => u.UserPermissionsTypeId, f => f.PickRandom(permissions).Id)
            .RuleFor(u => u.CreatedAt, f => DateTimeOffset.UtcNow);

        var users = userFaker.Generate(15);
        context.Users.AddRange(users);
        context.SaveChanges();

        var projectFaker = new Faker<Project>("pl")
            .RuleFor(p => p.Id, f => Guid.NewGuid())
            .RuleFor(p => p.Name, f => f.Commerce.ProductName() + " Project")
            .RuleFor(p => p.Description, f => f.Lorem.Paragraph())
            .RuleFor(p => p.Company, f => f.PickRandom(companies))
            .RuleFor(p => p.IsSetToScrum, f => f.Random.Bool())
            .RuleFor(p => p.CreatedAt, f => DateTimeOffset.UtcNow);

        var projects = projectFaker.Generate(5);
        context.Projects.AddRange(projects);
        context.SaveChanges();    

        var taskFaker = new Faker<Task>("pl")
            .RuleFor(t => t.Id, f => Guid.NewGuid())
            .RuleFor(t => t.Name, f => f.Hacker.Verb() + " " + f.Hacker.Noun())
            .RuleFor(t => t.Description, f => f.Lorem.Sentence())
            .RuleFor(t => t.ProjectId, f => f.PickRandom(projects).Id)
            .RuleFor(t => t.StatusId, f => f.PickRandom(statuses).Id)
            .RuleFor(t => t.PriorityId, f => f.PickRandom(priorities).Id)
            .RuleFor(t => t.TimeEstimate, f => f.Random.Decimal(1, 20))
            .RuleFor(t => t.CreatedAt, f => DateTimeOffset.UtcNow);

        var tasks = taskFaker.Generate(50);
        context.Tasks.AddRange(tasks);
        context.SaveChanges();


        var companyNoteFaker = new Faker<CompanyNote>("pl")
            .RuleFor(n => n.Id, f => Guid.NewGuid())
            .RuleFor(n => n.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(n => n.UserId, f => f.PickRandom(users).Id)
            .RuleFor(n => n.Content, f => f.Lorem.Sentence())
            .RuleFor(n => n.IsDeleted, f => f.Random.Bool())
            .RuleFor(n => n.CreatedAt, f => DateTimeOffset.UtcNow);

        var notes = companyNoteFaker.Generate(10);
        context.CompanyNotes.AddRange(notes);

        var messageFaker = new Faker<Message>("pl")
            .RuleFor(m => m.Id, f => Guid.NewGuid())
            .RuleFor(m => m.TaskId, f => f.PickRandom(tasks).Id)
            .RuleFor(m => m.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(m => m.Text, f => f.Lorem.Sentence())
            .RuleFor(m => m.IsEdited, f => f.Random.Bool())
            .RuleFor(m => m.IsDeleted, f => f.Random.Bool())
            .RuleFor(m => m.CreatedAt, f => DateTimeOffset.UtcNow);

        var messages = messageFaker.Generate(10);
        context.Messages.AddRange(messages);
        context.SaveChanges();


        var childMessageFaker = new Faker<Message>("pl")
            .RuleFor(m => m.Id, f => Guid.NewGuid())
            .RuleFor(m => m.TaskId, f => f.PickRandom(tasks).Id)
            .RuleFor(m => m.ParentMessageId, f => f.PickRandom(messages).Id)
            .RuleFor(m => m.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(m => m.Text, f => f.Lorem.Sentence())
            .RuleFor(m => m.IsEdited, f => f.Random.Bool())
            .RuleFor(m => m.IsDeleted, f => f.Random.Bool())
            .RuleFor(m => m.CreatedAt, f => DateTimeOffset.UtcNow);

        var childMessages = messageFaker.Generate(5);
        context.Messages.AddRange(childMessages);

        context.SaveChanges();
    }
}