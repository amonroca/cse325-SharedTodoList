using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace SharedTodoList.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options), IDataProtectionKeyContext
{
    public DbSet<TodoList> TodoLists => Set<TodoList>();
    public DbSet<ListMember> ListMembers => Set<ListMember>();
    public DbSet<TodoTask> TodoTasks => Set<TodoTask>();

    // Keys that encrypt sign-in cookies; stored in the DB so logins survive restarts and redeploys.
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(e => e.Property(u => u.DisplayName).HasMaxLength(60));

        builder.Entity<TodoList>(e =>
        {
            e.Property(l => l.Name).HasMaxLength(100);
            e.Property(l => l.Color).HasMaxLength(9);
            e.HasOne(l => l.Owner).WithMany().HasForeignKey(l => l.OwnerId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ListMember>(e =>
        {
            e.HasKey(m => new { m.ListId, m.UserId });
            e.Property(m => m.Role).HasConversion<string>().HasMaxLength(10);
            e.HasOne(m => m.List).WithMany(l => l.Members).HasForeignKey(m => m.ListId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.User).WithMany().HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(m => m.UserId);
        });

        builder.Entity<TodoTask>(e =>
        {
            e.Property(t => t.Title).HasMaxLength(200);
            e.Property(t => t.Priority).HasConversion<string>().HasMaxLength(10);
            e.HasOne(t => t.List).WithMany(l => l.Tasks).HasForeignKey(t => t.ListId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.CreatedBy).WithMany().HasForeignKey(t => t.CreatedById).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
