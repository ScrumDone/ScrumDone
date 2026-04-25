using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data.Common;
using System.Linq.Expressions;

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
        DbSet<ProjectUserMTMRelation> ProjectUserMTMTable { get; set; }
        DbSet<TaskUserMTMRelation> TaskUserMTMTable { get; set; }
        DbSet<TaskTaskLabelMTMRelation> TaskTaskLabelMTMTable { get; set; }
        DbSet<FileAccessMTMRelation> FileAccessMTMTable { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Message>()
             .HasOne(m => m.ParentMessage)
             .WithMany(m => m.Responses)
             .HasForeignKey(m => m.ParentMessageId)
             .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Author)
                .WithMany(u => u.AuthoredNotifications)
                .HasForeignKey(n => n.AuthorId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Notified)
                .WithMany(u => u.ReceivedNotifications)
                .HasForeignKey(n => n.NotifiedId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<File>()
                .HasOne(f => f.Author)
                .WithMany(u => u.AuthoredFiles)
                .HasForeignKey(f => f.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Task>()
                .HasOne(t => t.ParentTask)
                .WithMany(u => u.SubTasks)
                .HasForeignKey(t => t.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);


            // Automaticaly disable soft deleted data from queries unless overriden
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(IHasSoftDelete).IsAssignableFrom(entityType.ClrType))
                {
                    var param = Expression.Parameter(entityType.ClrType, "e");
                    var body = Expression.Equal(
                        Expression.Property(param, nameof(IHasSoftDelete.IsDeleted)),
                        Expression.Constant(false)
                    );
                    var lambda = Expression.Lambda(body, param);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTimeOffset.UtcNow;

            foreach (var entry in ChangeTracker.Entries())
            {
                // Handle CreatedAt
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity is IHasCreatedAt createdAtEntity)
                    {
                        createdAtEntity.CreatedAt = now;
                    }

                    if (entry.Entity is IHasUpdatedAt updatedAtEntity)
                    {
                        updatedAtEntity.UpdatedAt = now;
                    }

                    if (entry.Entity is IHasSoftDelete softDeleteEntity)
                    {
                        softDeleteEntity.IsDeleted = false;
                        softDeleteEntity.DeletedAt = null;
                    }
                }

                // Handle UpdatedAt
                if (entry.State == EntityState.Modified)
                {
                    if (entry.Entity is IHasUpdatedAt updatedAtEntity)
                    {
                        updatedAtEntity.UpdatedAt = now;
                    }
                }

                // Handle SoftDelete
                if (entry.State == EntityState.Modified)
                {
                    if (entry.Entity is IHasSoftDelete softDeleteEntity)
                    {
                        var originalIsDeleted = (bool)entry.Property(nameof(IHasSoftDelete.IsDeleted)).OriginalValue;
                        var currentIsDeleted = (bool)entry.Property(nameof(IHasSoftDelete.IsDeleted)).CurrentValue;

                        // Trying to modify already deleted entity WITHOUT restoring -> block
                        if (originalIsDeleted && currentIsDeleted)
                        {
                            throw new InvalidOperationException("Cannot modify a soft-deleted entity.");
                        }

                        // Restoring (true -> false)
                        if (originalIsDeleted && !currentIsDeleted)
                        {
                            softDeleteEntity.DeletedAt = null;
                        }

                        // Deleting (false -> true)
                        if (!originalIsDeleted && currentIsDeleted)
                        {
                            softDeleteEntity.DeletedAt = now;
                        }
                    }
                }

                // Handle Hard Delete -> Soft Delete
                if (entry.State == EntityState.Deleted)
                {
                    if (entry.Entity is IHasSoftDelete softDeleteEntity)
                    {
                        if (!softDeleteEntity.IsDeleted)
                        {
                            entry.State = EntityState.Modified;
                            softDeleteEntity.IsDeleted = true;
                            softDeleteEntity.DeletedAt = now;
                        }
                    }
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
