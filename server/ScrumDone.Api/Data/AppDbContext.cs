using Microsoft.EntityFrameworkCore;

namespace ScrumDone.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<CooperationLog> CooperationLogs { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Raport> Raports { get; set; }
        public DbSet<ContactPerson> ContactPeople { get; set; }
        public DbSet<CompanyNote> CompanyNotes { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<File> Files { get; set; }
        public DbSet<TaskStatus> TaskStatuses { get; set; }
        public DbSet<TaskPriority> TaskPriorities { get; set; }
        public DbSet<UserPermissionsType> UserPermissionsTypes { get; set; }
        public DbSet<TaskLabel> TaskLabels { get; set; }
        public DbSet<Sprint> Sprints { get; set; }
        public DbSet<NotificationType> NotificationTypes { get; set; }
        public DbSet<ProjectUserMTMRelation> ProjectUserMTMTable { get; set; }
        public DbSet<TaskUserMTMRelation> TaskUserMTMTable { get; set; }
        public DbSet<TaskTaskLabelMTMRelation> TaskTaskLabelMTMTable { get; set; }
        public DbSet<FileAccessMTMRelation> FileAccessMTMTable { get; set; }

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
                .HasForeignKey(n => n.AuthorId)
                .IsRequired(false);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Notified)
                .WithMany(u => u.ReceivedNotifications)
                .HasForeignKey(n => n.NotifiedId);

            modelBuilder.Entity<File>()
                .HasOne(f => f.Author)
                .WithMany(u => u.AuthoredFiles)
                .HasForeignKey(f => f.AuthorId);
        }
    }
}
