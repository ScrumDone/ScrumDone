using Microsoft.EntityFrameworkCore;

namespace ScrumDone.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        DbSet<User> Users { get; set; }
        DbSet<Company> Companies { get; set; }
        DbSet<CooperationLog> CooperationLogs { get; set; }
        DbSet<Project> Projects { get; set; }
        DbSet<Task> Tasks { get; set; }
        DbSet<Raport> Raports { get; set; }
        DbSet<ContactPerson> ContactPeople { get; set; }
        DbSet<CompanyNote> CompanyNotes { get; set; }
        DbSet<Message> Messages { get; set; }
        DbSet<Notification> Notifications { get; set; }
        DbSet<File> Files { get; set; }
        DbSet<TaskStatus> TaskStatuses { get; set; }
        DbSet<TaskPriority> TaskPriorities { get; set; }
        DbSet<UserPermissionsType> UserPermissionsTypes { get; set; }
        DbSet<TaskLabel> TaskLabels { get; set; }
        DbSet<Sprint> Sprints { get; set; }
        DbSet<NotificationType> NotificationTypes { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Message>()
               .HasOne(m => m.ParentMessage)
               .WithMany(m => m.Responses)
               .HasForeignKey(m => m.ParentMessageId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Author)
                .WithMany(u => u.AuthoredNotifications)
                .HasForeignKey(n => n.AuthorId);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Notified)
                .WithMany(u => u.ReceivedNotifications)
                .HasForeignKey(n => n.NotifiedId);

            modelBuilder.Entity<File>()
                .HasOne(f => f.Author)
                .WithMany(u => u.AuthoredFiles)
                .HasForeignKey(f => f.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<File>()
                .HasMany(f => f.AvailableUsers)
                .WithMany(u => u.AccessFiles)
                .UsingEntity(j => j.ToTable("FileAccess"));
        }
    }
}
