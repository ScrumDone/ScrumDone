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
        DbSet<ContactPerson> ContactPersons { get; set; }
    }
}
