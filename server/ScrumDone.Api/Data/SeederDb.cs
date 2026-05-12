using System.Reflection.Emit;
using Bogus;
using ScrumDone.Api.Data;
using Task = ScrumDone.Api.Data.Task;
using TaskStatus = ScrumDone.Api.Data.TaskStatus;
using File = ScrumDone.Api.Data.File;
using Company = ScrumDone.Api.Data.Company;
using Bogus.DataSets;
using Microsoft.EntityFrameworkCore.Infrastructure.Internal;
public class DatabaseSeeder
{
    public static void Seed(AppDbContext context)
    {
        if(context.UserPermissionsTypes.Any())
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

        var labels = new List<TaskLabel>
        {
            new TaskLabel { Id = Guid.NewGuid(), Name = "Frontend", HexColor = "#20b828", CreatedAt = DateTimeOffset.UtcNow },
            new TaskLabel { Id = Guid.NewGuid(), Name = "Backend", HexColor = "#3B82F6", CreatedAt = DateTimeOffset.UtcNow },
            new TaskLabel { Id = Guid.NewGuid(), Name = "Documentation", HexColor = "#a82993", CreatedAt = DateTimeOffset.UtcNow }
        };
        context.TaskLabels.AddRange(labels);

        var priorities = new List<TaskPriority>
        {
            new TaskPriority { Id = Guid.NewGuid(), Name = "Low", HexColor = "#34D399", CreatedAt = DateTimeOffset.UtcNow },
            new TaskPriority { Id = Guid.NewGuid(), Name = "Medium", HexColor = "#ff7d13", CreatedAt = DateTimeOffset.UtcNow },
            new TaskPriority { Id = Guid.NewGuid(), Name = "High", HexColor = "#EF4444", CreatedAt = DateTimeOffset.UtcNow }
        };
        context.TaskPriorities.AddRange(priorities);

        var notificationTypes = new List<NotificationType>
        {
            new NotificationType { Id = Guid.NewGuid(), Name = "Message", HexColor = "#2045ac", CreatedAt = DateTimeOffset.UtcNow, IsDeleted=false },
            new NotificationType { Id = Guid.NewGuid(), Name = "Task", HexColor = "#0b7880", CreatedAt = DateTimeOffset.UtcNow, IsDeleted=false },
            new NotificationType { Id = Guid.NewGuid(), Name = "Deadline", HexColor = "#2357b8", CreatedAt = DateTimeOffset.UtcNow, IsDeleted=false }
        };
        context.NotificationTypes.AddRange(notificationTypes);

        var companyFaker = new Faker<Company>("pl")
            .RuleFor(c => c.Id, f => Guid.NewGuid())
            .RuleFor(c => c.Name, f => f.Company.CompanyName())
            .RuleFor(c => c.Address, f => f.Address.FullAddress())
            .RuleFor(c => c.Nip, f => 
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return f.Commerce.Ean8();
                }
            })
            .RuleFor(c => c.Krs, f => 
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return f.Commerce.Ean8();
                }
            })
            .RuleFor(c => c.Regon, f =>
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return f.Commerce.Ean8();
                }
            })
            .RuleFor(c => c.CreatedAt, f => DateTimeOffset.UtcNow);

        var companies = companyFaker.Generate(5);
        context.Companies.AddRange(companies);

        var userFaker = new Faker<User>("pl")
            .RuleFor(u => u.Id, f => Guid.NewGuid())
            .RuleFor(u => u.Name, f => f.Name.FullName())
            .RuleFor(u => u.ProfilePictureUrl, f => f.Internet.Avatar())
            .RuleFor(u => u.UserPermissionsTypeId, f => f.PickRandom(permissions).Id)
            .RuleFor(u => u.CreatedAt, f => DateTimeOffset.UtcNow);

        var users = userFaker.Generate(15);
        context.Users.AddRange(users);

        var projectFaker = new Faker<Project>("pl")
            .RuleFor(p => p.Id, f => Guid.NewGuid())
            .RuleFor(p => p.Name, f => f.Commerce.ProductName() + " Project")
            .RuleFor(p => p.Description, f => f.Lorem.Paragraph())
            .RuleFor(p => p.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(p => p.ProfilePictureUrl, f => f.Image.PicsumUrl())
            .RuleFor(p => p.IsSetToScrum, f => f.Random.Bool())
            .RuleFor(p => p.TeamMembers, (f, CurrentProject) =>
            {
                var SelectedMembers = f.PickRandom(users, f.Random.Int(3,6));

                return SelectedMembers.Select(member => new ProjectUserMTMRelation
                {
                    UserId = member.Id,
                    ProjectId = CurrentProject.Id
                }).ToList();
            })
            .RuleFor(p => p.CreatedAt, f => DateTimeOffset.UtcNow);

        var projects = projectFaker.Generate(5);
        context.Projects.AddRange(projects);

        var taskFaker = new Faker<Task>("pl")
            .RuleFor(t => t.Id, f => Guid.NewGuid())
            .RuleFor(t => t.Name, f => f.Hacker.Verb() + " " + f.Hacker.Noun())
            .RuleFor(t => t.Description, f => f.Lorem.Sentence())
            .RuleFor(t => t.ProjectId, f => f.PickRandom(projects).Id)
            .RuleFor(t => t.StatusId, f => f.PickRandom(statuses).Id)
            .RuleFor(t => t.PriorityId, f => f.PickRandom(priorities).Id)
            .RuleFor(t => t.DueDate, f =>
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return DateTimeOffset.UtcNow.AddDays(f.Random.Int(0,4));
                }
            })
            .RuleFor(t => t.Labels, (f, currentTask) =>
            {
               var SelectedLabels = f.PickRandom(labels, f.Random.Int(0,3));

               return SelectedLabels.Select(label => new TaskTaskLabelMTMRelation
               {
                   TaskId = currentTask.Id,
                   TaskLabelId = label.Id
               }).ToList();
            })
            .RuleFor(t => t.Assignees, (f, currentTask) =>
            {
                var CurrentProject = projects.First(p => p.Id == currentTask.ProjectId);
                var CurrentTeamIds = CurrentProject.TeamMembers.Select(tm => tm.UserId).ToList();
                var NumberOfAssignees = f.Random.Int(0, Math.Min(2, CurrentTeamIds.Count()));

                var SelectedUsersIds = f.PickRandom(CurrentTeamIds, NumberOfAssignees);
                
                return SelectedUsersIds.Select(SelectedUserId => new TaskUserMTMRelation
                {
                    TaskId = currentTask.Id,
                    UserId = SelectedUserId
                }).ToList();
            })
            .RuleFor(t => t.TimeEstimate, f => 
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return f.Random.Decimal();
                }
            })
            .RuleFor(t => t.CreatedAt, f => DateTimeOffset.UtcNow);

        var tasks = taskFaker.Generate(50);
        context.Tasks.AddRange(tasks);

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
            .RuleFor(m => m.IsDeleted, f => false)
            .RuleFor(m => m.CreatedAt, f => DateTimeOffset.UtcNow);

        var messages = messageFaker.Generate(20);
        context.Messages.AddRange(messages);

        var childMessageFaker = new Faker<Message>("pl")
            .RuleFor(m => m.Id, f => Guid.NewGuid())
            .RuleFor(m => m.ParentMessageId, f => f.PickRandom(messages).Id)
            .RuleFor(m => m.TaskId, (f, currentMessage) => 
            {
                return messages.First(p => p.Id == currentMessage.ParentMessageId).TaskId;
            })
            .RuleFor(m => m.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(m => m.Text, f => f.Lorem.Sentence())
            .RuleFor(m => m.IsEdited, f => f.Random.Bool())
            .RuleFor(m => m.IsDeleted, f => false)
            .RuleFor(m => m.CreatedAt, f => DateTimeOffset.UtcNow);

        var childMessages = childMessageFaker.Generate(10);
        context.Messages.AddRange(childMessages);

        var contactPersonFaker = new Faker<ContactPerson>("pl")
            .RuleFor(p => p.Id, f => Guid.NewGuid())
            .RuleFor(p => p.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(p => p.Name, f => f.Name.FullName())
            .RuleFor(p => p.Email, f => f.Internet.Email())
            .RuleFor(p => p.Role, f => f.Name.JobTitle())
            .RuleFor(p => p.Phone, f => f.Phone.PhoneNumber())
            .RuleFor(p => p.IsDeleted, f => false)
            .RuleFor(p => p.CreatedAt, f => DateTimeOffset.UtcNow);

        var contactPeople = contactPersonFaker.Generate(15);
        context.ContactPeople.AddRange(contactPeople);

        var cooperationLogsFaker = new Faker<CooperationLog>("pl")
            .RuleFor(l => l.Id, f => Guid.NewGuid())
            .RuleFor(l => l.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(l => l.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(l => l.Title, f => f.Company.CatchPhrase())
            .RuleFor(l => l.Description, f => f.Lorem.Sentence())
            .RuleFor(l => l.IsDeleted, f => false)
            .RuleFor(l => l.CreatedAt, f => DateTimeOffset.UtcNow);

        var CooperationLogs = cooperationLogsFaker.Generate(10);
        context.CooperationLogs.AddRange(CooperationLogs);

        var sprintsFaker = new Faker<Sprint>("pl")
            .RuleFor(s => s.Id, f => Guid.NewGuid())
            .RuleFor(s => s.ProjectId, f => f.PickRandom(projects).Id)
            .RuleFor(s => s.Name, f => f.Company.CatchPhrase())
            .RuleFor(s => s.IsDeleted, f => false)
            .RuleFor(s => s.StartDate, f => DateTimeOffset.UtcNow)
            .RuleFor(s => s.EndDate, f => DateTimeOffset.UtcNow.AddDays(14))
            .RuleFor(s => s.CreatedAt, f => DateTimeOffset.UtcNow)
            .RuleFor(s =>s.IsKanban, f => f.Random.Bool())
            .RuleFor(s => s.Tasks, (f, l) => 
            {
                var tasksFromThisProject = tasks.Where(t => t.ProjectId == l.ProjectId).ToList();
                return f.PickRandom(tasksFromThisProject, f.Random.Int(2, 5)).ToList();
            });

        var sprints = sprintsFaker.Generate(6);
        context.Sprints.AddRange(sprints);

        var filesBaseFaker = new Faker<File>("pl")
            .RuleFor(f => f.Id, f => Guid.NewGuid())
            .RuleFor(f => f.Description, f => f.Lorem.Sentence())
            .RuleFor(f => f.OldFileName, f => f.Lorem.Word())
            .RuleFor(f => f.FilePath, f => f.Image.PicsumUrl())
            .RuleFor(f => f.IsPublic, f => true);

        var filesGeneralFaker = filesBaseFaker.Clone()
            .RuleFor(f => f.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(f => f.IsPublic, f => f.Random.Bool())
            .RuleFor(f => f.PermitedUsers, (f, currentFile) =>
            {
                if(currentFile.IsPublic) 
                    return new List<FileAccessMTMRelation>();

                var SelectedUsers = f.PickRandom(users, f.Random.Int(3,6)).ToList();
                if(!SelectedUsers.Any(u => u.Id == currentFile.AuthorId))
                {
                    var author = users.First(u => u.Id == currentFile.AuthorId);
                    SelectedUsers.Add(author);
                }

                return SelectedUsers.Select(member => new FileAccessMTMRelation
                {
                    UserId = member.Id,
                    FileId = currentFile.Id
                }).ToList();
            });
        var general_files = filesGeneralFaker.Generate(10);
        context.Files.AddRange(general_files);

        var fileTasksFaker = filesBaseFaker.Clone();
        fileTasksFaker.RuleFor(f => f.TaskId, f => f.PickRandom(tasks).Id)
        .RuleFor(f => f.ProjectId, (f, current) =>
        {
            return tasks.First(t => t.Id ==current.TaskId).ProjectId;
        })
        .RuleFor(f => f.AuthorId, (f, currentFile) => 
            {
                var selectedTeam = projects.First(p => p.Id == currentFile.ProjectId).TeamMembers.ToList();
                return f.PickRandom(selectedTeam).UserId;
            });
        var tasksFiles = fileTasksFaker.Generate(4);
        context.Files.AddRange(tasksFiles);

        var fileProjectFaker = filesBaseFaker.Clone();
        fileProjectFaker
            .RuleFor(f => f.ProjectId, f => f.PickRandom(projects).Id)
            .RuleFor(f => f.AuthorId, (f, currentFile) => 
            {
                var selectedTeam = projects.First(p => p.Id == currentFile.ProjectId).TeamMembers.ToList();
                return f.PickRandom(selectedTeam).UserId;
            });
        var projectFiles = fileProjectFaker.Generate(4);
        context.Files.AddRange(projectFiles);

        var fileMessageFaker = filesBaseFaker.Clone();
        fileMessageFaker
            .RuleFor(f => f.MessageId, f => f.PickRandom(messages).Id)
            .RuleFor(f => f.AuthorId, (f, currentFile) => 
            {
                return messages.First(m => m.Id == currentFile.MessageId).AuthorId;
            });
        var messageFiles = fileMessageFaker.Generate(4);
        context.Files.AddRange(messageFiles);

        var notificationFaker = new Faker<Notification>("pl")
            .RuleFor(n => n.Id, f => Guid.NewGuid())
            .RuleFor(n => n.Message, f => f.Lorem.Sentence(3, 5))
            .RuleFor(n => n.IsRead, f => f.Random.Bool(0.3f))
            .RuleFor(n => n.RelevantUrl, f => f.Internet.UrlRootedPath())
            .RuleFor(n => n.NotificationTypeId, f => f.PickRandom(notificationTypes).Id)

            .RuleFor(n => n.AuthorId, f => 
            {
                if (f.Random.Int(1, 10) <= 2) return null; 
                return f.PickRandom(users).Id;             
            })
            .RuleFor(n => n.NotifiedId, (f, current) => 
            {
                var availableUsers = current.AuthorId.HasValue 
                    ? users.Where(u => u.Id != current.AuthorId.Value).ToList() 
                    : users;

                return f.PickRandom(availableUsers).Id;
            })
            
            .RuleFor(n => n.CreatedAt, f => DateTimeOffset.UtcNow)
            .RuleFor(n => n.IsDeleted, f => false);

        var notifications = notificationFaker.Generate(30);
        context.Notifications.AddRange(notifications);

        var raportFaker = new Faker<Raport>("pl")
            .RuleFor(r => r.Id, f => Guid.NewGuid())
            .RuleFor(r => r.Name, f => f.PickRandom("Raport: ", "Podsumowanie: ", "Analiza: ") + f.Commerce.ProductName())
            .RuleFor(r => r.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(r => r.CreatedAt, f => DateTimeOffset.UtcNow)
            .RuleFor(r => r.IsDeleted, f => false);

        var raports = raportFaker.Generate(10);
        context.Raports.AddRange(raports);

        context.SaveChanges();
    }
}