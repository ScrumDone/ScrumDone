using System.Reflection.Emit;
using Bogus;
using ScrumDone.Api.Data;
using Assignment = ScrumDone.Api.Data.Assignment;
using AssignmentStatus = ScrumDone.Api.Data.AssignmentStatus;
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

        Randomizer.Seed = new Random(123);
        Random rnd = new Random(123);
        var now = DateTimeOffset.UtcNow;

        var permissions = new List<UserPermissionsType>
        {
            new UserPermissionsType { Id = Guid.NewGuid(), Name = "Admin", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
            new UserPermissionsType { Id = Guid.NewGuid(), Name = "ProjectManager", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
            new UserPermissionsType { Id = Guid.NewGuid(), Name = "StandardUser", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now }
        };
        context.UserPermissionsTypes.AddRange(permissions);

        var statuses = new List<AssignmentStatus>
        {
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "To Do", HexColor = "#E2E8F0", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "In Progress", HexColor = "#3B82F6", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
            new AssignmentStatus { Id = Guid.NewGuid(), Name = "Done", HexColor = "#22C55E", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now }
        };
        context.AssignmentStatuses.AddRange(statuses);

        var priorities = new List<AssignmentPriority>
        {
            new AssignmentPriority { Id = Guid.NewGuid(), Name = "Low", HexColor = "#34D399", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
            new AssignmentPriority { Id = Guid.NewGuid(), Name = "Medium", HexColor = "#ff7d13", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
            new AssignmentPriority { Id = Guid.NewGuid(), Name = "High", HexColor = "#EF4444", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now }
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

        var companyFaker = new Faker<Company>("pl")
            .RuleFor(c => c.Id, f => f.Random.Guid())
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
            .RuleFor(c => c.CreatedAt, f => now.AddDays(-rnd.Next(15,30)))
            .RuleFor(l => l.UpdatedAt, (f, currentCompany) => 
            {
                if (f.Random.Bool())
                    return currentCompany.CreatedAt;
                else
                    return now;
            });;

        var companies = companyFaker.Generate(5);
        context.Companies.AddRange(companies);

        var userFaker = new Faker<User>("pl")
            .RuleFor(u => u.Id, f => f.Random.Guid())
            .RuleFor(u => u.Name, f => f.Name.FullName())
            .RuleFor(u => u.ProfilePictureUrl, f => f.Internet.Avatar())
            .RuleFor(u => u.UserPermissionsTypeId, f => f.PickRandom(permissions).Id)
            .RuleFor(u => u.CreatedAt, f => now.AddDays(-rnd.Next(14)))
            .RuleFor(l => l.UpdatedAt, (f, currentUser) => 
            {
                if (f.Random.Bool())
                    return currentUser.CreatedAt;
                else
                    return now;
            });

        var users = userFaker.Generate(15);
        context.Users.AddRange(users);

        var projectFaker = new Faker<Project>("pl")
            .RuleFor(p => p.Id, f => f.Random.Guid())
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
            .RuleFor(p => p.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });;

        var projects = projectFaker.Generate(5);
        context.Projects.AddRange(projects);

        var labels = new List<AssignmentLabel>();
        foreach (var project in projects)
        {
            labels.AddRange(new List<AssignmentLabel>
            {
                new AssignmentLabel { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Frontend", HexColor = "#20b828", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
                new AssignmentLabel { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Backend", HexColor = "#3B82F6", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now },
                new AssignmentLabel { Id = Guid.NewGuid(), ProjectId = project.Id, Name = "Documentation", HexColor = "#a82993", CreatedAt = now.AddDays(-rnd.Next(14)), UpdatedAt = now }
            });
        }     
            context.AssignmentLabels.AddRange(labels);


        var assignmentFaker = new Faker<Assignment>("pl")
            .RuleFor(a => a.Id, f => f.Random.Guid())
            .RuleFor(a => a.ParentAssignmentId, f => null)
            .RuleFor(a => a.Name, f => f.Hacker.Verb() + " " + f.Hacker.Noun())
            .RuleFor(a => a.Description, f => f.Lorem.Sentence())
            .RuleFor(a => a.ProjectId, f => f.PickRandom(projects).Id)
            .RuleFor(a => a.StatusId, f => f.PickRandom(statuses).Id)
            .RuleFor(a => a.PriorityId, f => f.PickRandom(priorities).Id)
            .RuleFor(a => a.DueDate, f =>
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return now.AddDays(f.Random.Int(0,4));
                }
            })
            .RuleFor(a => a.Labels, (f, currentAssignment) =>
            {
               var SelectedLabels = f.PickRandom(labels.Where(l => l.ProjectId == currentAssignment.ProjectId), f.Random.Int(0,Math.Min(3, labels.Count())));

               return SelectedLabels.Select(label => new AssignmentAssignmentLabelMTMRelation
               {
                   AssignmentId = currentAssignment.Id,
                   AssignmentLabelId = label.Id
               }).ToList();
            })
            .RuleFor(a => a.Assignees, (f, currentAssignment) =>
            {
                var CurrentProject = projects.First(p => p.Id == currentAssignment.ProjectId);
                var CurrentTeamIds = CurrentProject.TeamMembers.Select(tm => tm.UserId).ToList();
                var NumberOfAssignees = f.Random.Int(0, Math.Min(2, CurrentTeamIds.Count()));

                var SelectedUsersIds = f.PickRandom(CurrentTeamIds, NumberOfAssignees);
                
                return SelectedUsersIds.Select(SelectedUserId => new AssignmentUserMTMRelation
                {
                    AssignmentId = currentAssignment.Id,
                    UserId = SelectedUserId
                }).ToList();
            })
            .RuleFor(t => t.TimeEstimate, f => 
            {
                if (f.Random.Int(0,1) == 0)
                    return null;
                else
                {
                    return f.Random.Decimal(0.5m, 20m);
                }
            })
            .RuleFor(t => t.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });;

        var assignments = assignmentFaker.Generate(50);
        context.Assignment.AddRange(assignments);

        var childAssignmentFaker = assignmentFaker.Clone()
            .RuleFor(a => a.ParentAssignmentId, f => f.PickRandom(assignments).Id)
            .RuleFor(a => a.ProjectId, (f, current) =>
            {
                return assignments.First(a => a.Id == current.ParentAssignmentId).ProjectId;
            })
            .RuleFor(a => a.CreatedAt, (f, currentAssignment) =>
            {
                return assignments.First(a => a.Id == currentAssignment.ParentAssignmentId).CreatedAt;
            })
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });;

        var childAssignments = childAssignmentFaker.Generate(20);
        context.Assignment.AddRange(childAssignments);


        var companyNoteFaker = new Faker<CompanyNote>("pl")
            .RuleFor(n => n.Id, f => f.Random.Guid())
            .RuleFor(n => n.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(n => n.UserId, f => f.PickRandom(users).Id)
            .RuleFor(n => n.Content, f => f.Lorem.Sentence())
            .RuleFor(n => n.IsDeleted, f => false)
            .RuleFor(n => n.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });;

        var notes = companyNoteFaker.Generate(10);
        context.CompanyNotes.AddRange(notes);

        var messageFaker = new Faker<Message>("pl")
            .RuleFor(m => m.Id, f => f.Random.Guid())
            .RuleFor(m => m.AssignmentId, f => f.PickRandom(assignments).Id)
            .RuleFor(m => m.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(m => m.Text, f => f.Lorem.Sentence())
            .RuleFor(m => m.IsEdited, f => f.Random.Bool())
            .RuleFor(m => m.IsDeleted, f => false)
            .RuleFor(m => m.CreatedAt, (f, currentMessage) =>
            {
                return assignments.First(a => a.Id == currentMessage.AssignmentId).CreatedAt;
            })
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });

        var messages = messageFaker.Generate(20);
        context.Messages.AddRange(messages);

        var childMessageFaker = new Faker<Message>("pl")
            .RuleFor(m => m.Id, f => f.Random.Guid())
            .RuleFor(m => m.ParentMessageId, f => f.PickRandom(messages).Id)
            .RuleFor(m => m.AssignmentId, (f, currentMessage) => 
            {
                return messages.First(p => p.Id == currentMessage.ParentMessageId).AssignmentId;
            })
            .RuleFor(m => m.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(m => m.Text, f => f.Lorem.Sentence())
            .RuleFor(m => m.IsEdited, f => f.Random.Bool())
            .RuleFor(m => m.IsDeleted, f => false)
            .RuleFor(m => m.CreatedAt, (f, currentMessage) =>
            {
                return messages.First(m => m.Id == currentMessage.ParentMessageId).CreatedAt;
            })
            .RuleFor(l => l.UpdatedAt, (f,currentMessage) => 
            {
                if (f.Random.Bool())
                    return currentMessage.CreatedAt;
                else
                    return now;
            });

        var childMessages = childMessageFaker.Generate(10);
        context.Messages.AddRange(childMessages);

        var emojis = new[] { "👍", "❤️", "😂", "😮", "😢", "👏", "🎉", "🔥", "👀", "🚀" };

        var reactionFaker = new Faker<Reaction>("pl")
            .RuleFor(r => r.Id, f => f.Random.Guid())
            .RuleFor(r => r.Emoji, f => f.PickRandom(emojis))
            .RuleFor(r => r.CommentId, f => f.PickRandom(messages).Id)
            .RuleFor(r => r.CreatedAt, (f, currentReaction) =>
            {
                return messages.First(m => m.Id == currentReaction.CommentId).CreatedAt;
            })
            .RuleFor(r => r.AuthorId, (f, current) =>
            {
                var currentAssignment = assignments.First(a => a.Id == messages.First(m => m.Id == current.CommentId).AssignmentId);
                var currentUsers = projects.First(p => p.Id == currentAssignment.ProjectId).TeamMembers;
                return f.PickRandom(currentUsers).Id;
            }) ;
        
        var reactions = reactionFaker.Generate(30);
        context.Reactions.AddRange(reactions);

        var contactPersonFaker = new Faker<ContactPerson>("pl")
            .RuleFor(p => p.Id, f => f.Random.Guid())
            .RuleFor(p => p.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(p => p.Name, f => f.Name.FullName())
            .RuleFor(p => p.Email, f => f.Internet.Email())
            .RuleFor(p => p.Role, f => f.Name.JobTitle())
            .RuleFor(p => p.Phone, f => f.Phone.PhoneNumber())
            .RuleFor(p => p.IsDeleted, f => false)
            .RuleFor(p => p.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });

        var contactPeople = contactPersonFaker.Generate(15);

        //Mark one person for each company as isPrimary
        foreach (var companyGroup in contactPeople.GroupBy(c => c.CompanyId))
        {
            var primaryContact = companyGroup.First();
            primaryContact.IsPrimary = true;
        }

        context.ContactPeople.AddRange(contactPeople);

        var cooperationLogsFaker = new Faker<CooperationLog>("pl")
            .RuleFor(l => l.Id, f => f.Random.Guid())
            .RuleFor(l => l.CompanyId, f => f.PickRandom(companies).Id)
            .RuleFor(l => l.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(l => l.Title, f => f.Company.CatchPhrase())
            .RuleFor(l => l.Description, f => f.Lorem.Sentence())
            .RuleFor(l => l.OldValue, (f, currentLog) =>
            {
                if(f.Random.Bool())
                    return f.Lorem.Sentence();
                else
                    return null;
            })
            .RuleFor(l => l.NewValue, (f, currentLog) =>
            {
                if(currentLog.OldValue != null)
                    return f.Lorem.Sentence();
                else
                    return null;
            })
            .RuleFor(l => l.IsDeleted, f => false)
            .RuleFor(l => l.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });

        var CooperationLogs = cooperationLogsFaker.Generate(10);
        context.CooperationLogs.AddRange(CooperationLogs);

        var sprintsFaker = new Faker<Sprint>("pl")
            .RuleFor(s => s.Id, f => f.Random.Guid())
            .RuleFor(s => s.ProjectId, f => f.PickRandom(projects).Id)
            .RuleFor(s => s.Name, f => f.Company.CatchPhrase())
            .RuleFor(s => s.IsDeleted, f => false)
            .RuleFor(s => s.StartDate, f => now)
            .RuleFor(s => s.EndDate, f => now.AddDays(14))
            .RuleFor(s => s.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            })
            .RuleFor(s =>s.IsKanban, f => f.Random.Bool())
            .RuleFor(s => s.Assignments, (f, l) => 
            {
                var assignmentsFromThisProject = assignments.Where(t => t.ProjectId == l.ProjectId).ToList();
                return f.PickRandom(assignmentsFromThisProject, f.Random.Int(2, 5)).ToList();
            });

        var sprints = sprintsFaker.Generate(6);
        context.Sprints.AddRange(sprints);

        var filesBaseFaker = new Faker<File>("pl")
            .RuleFor(f => f.Id, f => f.Random.Guid())
            .RuleFor(f => f.Description, f => 
            {
                if (f.Random.Bool())
                    return f.Lorem.Sentence();
                else
                    return null;
            })
            .RuleFor(f => f.OldFileName, f => f.Lorem.Word())
            .RuleFor(f => f.FilePath, f => f.Image.PicsumUrl())
            .RuleFor(f => f.IsPublic, f => true)
            .RuleFor(f => f.Labels, (f, currentFile) =>
            {
               var SelectedLabels = f.PickRandom(fileLabels, f.Random.Int(0,Math.Min(3, fileLabels.Count())));

               return SelectedLabels.Select(fileLabel => new FileFileLabelMTMRelation
               {
                   FileId = currentFile.Id,
                   FileLabelId = fileLabel.Id
               }).ToList();
            })
            .RuleFor(l => l.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f => 
            {
                if (f.Random.Bool())
                    return DateTimeOffset.Now;
                else
                    return now;
            });

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

        var fileAssignmentsFaker = filesBaseFaker.Clone();
        fileAssignmentsFaker.RuleFor(f => f.AssignmentId, f => f.PickRandom(assignments).Id)
        .RuleFor(f => f.ProjectId, (f, current) =>
        {
            return assignments.First(t => t.Id ==current.AssignmentId).ProjectId;
        })
        .RuleFor(f => f.AuthorId, (f, currentFile) => 
            {
                var selectedTeam = projects.First(p => p.Id == currentFile.ProjectId).TeamMembers.ToList();
                return f.PickRandom(selectedTeam).UserId;
            });
        var assignmentsFiles = fileAssignmentsFaker.Generate(4);
        context.Files.AddRange(assignmentsFiles);

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

        Func<Notification, List<Guid>> getValidUserIdsForResource = (n) => 
        {
            if (n.ResourceType == NotificationResourceType.Project && n.ResourceId.HasValue)
            {
                var project = projects.First(p => p.Id == n.ResourceId.Value);
                return project.TeamMembers.Select(tm => tm.UserId).ToList();
            }
            if (n.ResourceType == NotificationResourceType.Assignment && n.ResourceId.HasValue)
            {
                var assignment = assignments.First(a => a.Id == n.ResourceId.Value);
                var project = projects.First(p => p.Id == assignment.ProjectId);
                return project.TeamMembers.Select(tm => tm.UserId).ToList();
            }

            return users.Select(u => u.Id).ToList(); 
        };

        var notificationFaker = new Faker<Notification>("pl")
            .RuleFor(n => n.Id, f => f.Random.Guid())
            .RuleFor(n => n.Message, f => f.Lorem.Sentence(3, 5))
            .RuleFor(n => n.IsRead, f => f.Random.Bool(0.3f))
            .RuleFor(n => n.NotificationTypeId, f => f.PickRandom(notificationTypes).Id)
            .RuleFor(n => n.ResourceType, f => f.PickRandom<NotificationResourceType>())
            .RuleFor(n => n.ResourceId, (f, n) => 
            {
                return n.ResourceType switch
                {
                    NotificationResourceType.Assignment => f.PickRandom(assignments).Id,
                    NotificationResourceType.Project => f.PickRandom(projects).Id,
                    _ => null
                };
            })
            
            .RuleFor(n => n.NotifiedId, (f, n) => 
            {
                var validUserIds = getValidUserIdsForResource(n);
                
                if (!validUserIds.Any()) validUserIds = users.Select(u => u.Id).ToList();

                return f.PickRandom(validUserIds);
            })
            
            .RuleFor(n => n.AuthorId, (f, n) => 
            {
                if (f.Random.Bool(0.2f)) return null; 

                var validUserIds = getValidUserIdsForResource(n);
                
                var potentialAuthors = validUserIds.Where(id => id != n.NotifiedId).ToList();

                return potentialAuthors.Any() ? f.PickRandom(potentialAuthors) : null;
            })
            
            .RuleFor(n => n.SecondResourceId, (f, n) => 
            {
                if (n.ResourceType == NotificationResourceType.Assignment && n.ResourceId.HasValue)
                {
                    var relatedMessages = messages.Where(m => m.AssignmentId == n.ResourceId).ToList();

                    if (relatedMessages.Any())
                    {
                        return f.PickRandom(relatedMessages).Id;
                    }
                }
                return null;
            })
            .RuleFor(n => n.SecondResourceType, (f, n) => 
            {
                if (n.SecondResourceId != null)
                {
                    return NotificationResourceType.Message;
                }
                return null;
            })
            .RuleFor(n => n.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f =>
            {
                if (f.Random.Bool())
                    return now;
                else    
                    return DateTimeOffset.Now;
            })
            .RuleFor(n => n.IsDeleted, f => false);

        var notifications = notificationFaker.Generate(30);
        context.Notifications.AddRange(notifications);

        var raportFaker = new Faker<Raport>("pl")
            .RuleFor(r => r.Id, f => f.Random.Guid())
            .RuleFor(r => r.Name, f => f.PickRandom("Raport: ", "Podsumowanie: ", "Analiza: ") + f.Commerce.ProductName())
            .RuleFor(r => r.AuthorId, f => f.PickRandom(users).Id)
            .RuleFor(r => r.CreatedAt, f => now)
            .RuleFor(l => l.UpdatedAt, f =>
            {
                if (f.Random.Bool())
                    return now;
                else    
                    return DateTimeOffset.Now;
            })
            .RuleFor(r => r.IsDeleted, f => false);

        var raports = raportFaker.Generate(10);
        context.Raports.AddRange(raports);

        context.SaveChanges();
    }
}