using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SharedTodoList.Data;

namespace SharedTodoList.Services;

/// <summary>A list as shown in the sidebar, with the current user's role and task counts.</summary>
public record ListSummary(int Id, string Name, string Color, ListRole Role, int TaskCount, int DoneCount, int MemberCount);

/// <summary>A person who has access to a list.</summary>
public record MemberInfo(string UserId, string Name, string Email, ListRole Role);

/// <summary>An expected error whose message is safe to show to the user (validation, permissions, not found).</summary>
public class TodoException(string message) : Exception(message);

/// <summary>
/// All reads and writes for lists, sharing, and tasks. Every method takes the signed-in user's id
/// and checks that they are allowed to perform the action, so the UI never has to.
/// After each change it notifies <see cref="ListChangeNotifier"/> so collaborators see it live.
/// </summary>
public partial class TodoService(IDbContextFactory<ApplicationDbContext> dbFactory, ListChangeNotifier notifier)
{
    public const int MaxListNameLength = 100;
    public const int MaxTitleLength = 200;
    public const int MaxNotesLength = 2000;

    // ---------- Lists ----------

    /// <summary>Returns every list the user owns or that has been shared with them, oldest first.</summary>
    public async Task<List<ListSummary>> GetListsAsync(string userId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        return await db.ListMembers
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.List!.CreatedAt)
            .Select(m => new ListSummary(
                m.ListId,
                m.List!.Name,
                m.List.Color,
                m.Role,
                m.List.Tasks.Count,
                m.List.Tasks.Count(t => t.Completed),
                m.List.Members.Count))
            .ToListAsync();
    }

    /// <summary>Creates a list owned by the user and returns its id.</summary>
    public async Task<int> CreateListAsync(string userId, string name, string color)
    {
        name = ValidateListName(name);
        color = ValidateColor(color);

        await using var db = await dbFactory.CreateDbContextAsync();
        var list = new TodoList { Name = name, Color = color, OwnerId = userId };
        list.Members.Add(new ListMember { UserId = userId, Role = ListRole.Owner });
        db.TodoLists.Add(list);
        await db.SaveChangesAsync();
        return list.Id;
    }

    /// <summary>Renames or recolors a list. Owner only.</summary>
    public async Task UpdateListAsync(string userId, int listId, string name, string color)
    {
        name = ValidateListName(name);
        color = ValidateColor(color);

        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireOwnerAsync(db, listId, userId);
        await db.TodoLists.Where(l => l.Id == listId)
            .ExecuteUpdateAsync(s => s.SetProperty(l => l.Name, name).SetProperty(l => l.Color, color));
        notifier.Notify(listId);
    }

    /// <summary>Deletes a list and all of its tasks for everyone. Owner only.</summary>
    public async Task DeleteListAsync(string userId, int listId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireOwnerAsync(db, listId, userId);
        await db.TodoLists.Where(l => l.Id == listId).ExecuteDeleteAsync();
        notifier.Notify(listId);
    }

    // ---------- Sharing ----------

    /// <summary>Returns everyone with access to the list, owner first.</summary>
    public async Task<List<MemberInfo>> GetMembersAsync(string userId, int listId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireMemberAsync(db, listId, userId);
        return await db.ListMembers
            .Where(m => m.ListId == listId)
            .OrderBy(m => m.Role).ThenBy(m => m.User!.DisplayName)
            .Select(m => new MemberInfo(m.UserId, m.User!.DisplayName, m.User.Email ?? "", m.Role))
            .ToListAsync();
    }

    /// <summary>Shares the list with an existing user, found by email. Owner only.</summary>
    public async Task AddMemberAsync(string userId, int listId, string email)
    {
        email = email.Trim();
        if (!EmailPattern().IsMatch(email)) throw new TodoException("Enter a valid email address.");

        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireOwnerAsync(db, listId, userId);

        var normalized = email.Trim().ToUpperInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalized)
            ?? throw new TodoException("No user with that email. Ask them to sign up first.");

        if (await db.ListMembers.AnyAsync(m => m.ListId == listId && m.UserId == user.Id))
            throw new TodoException($"{user.DisplayName} already has access.");

        db.ListMembers.Add(new ListMember { ListId = listId, UserId = user.Id, Role = ListRole.Editor });
        await db.SaveChangesAsync();
        notifier.Notify(listId);
    }

    /// <summary>
    /// Removes someone from a list. Owners can remove anyone except themselves;
    /// editors can only remove themselves (leave the list).
    /// </summary>
    public async Task RemoveMemberAsync(string userId, int listId, string targetUserId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var myRole = await RequireMemberAsync(db, listId, userId);
        if (targetUserId != userId && myRole != ListRole.Owner) throw new TodoException("Only the owner can remove people.");

        var target = await db.ListMembers.FindAsync(listId, targetUserId) ?? throw new TodoException("That person is not on this list.");
        if (target.Role == ListRole.Owner) throw new TodoException("The owner can't leave. Delete the list instead.");

        db.ListMembers.Remove(target);
        await db.SaveChangesAsync();
        notifier.Notify(listId);
    }

    // ---------- Tasks ----------

    /// <summary>Returns the list's tasks: open before done, then by due date (soonest first), then newest.</summary>
    public async Task<List<TodoTask>> GetTasksAsync(string userId, int listId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireMemberAsync(db, listId, userId);
        return await db.TodoTasks
            .AsNoTracking()
            .Include(t => t.CreatedBy)
            .Where(t => t.ListId == listId)
            .OrderBy(t => t.Completed)
            .ThenBy(t => t.DueDate == null)
            .ThenBy(t => t.DueDate)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    /// <summary>Adds a task to a list the user has access to.</summary>
    public async Task AddTaskAsync(string userId, int listId, string title, DateOnly? dueDate, TaskPriority priority)
    {
        title = ValidateTitle(title);

        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireMemberAsync(db, listId, userId);
        db.TodoTasks.Add(new TodoTask { ListId = listId, Title = title, DueDate = dueDate, Priority = priority, CreatedById = userId });
        await db.SaveChangesAsync();
        notifier.Notify(listId);
    }

    /// <summary>Updates a task's details.</summary>
    public Task UpdateTaskAsync(string userId, int taskId, string title, string notes, DateOnly? dueDate, TaskPriority priority)
    {
        title = ValidateTitle(title);
        notes = notes.Trim();
        if (notes.Length > MaxNotesLength) throw new TodoException($"Notes can be at most {MaxNotesLength} characters.");

        return ChangeTaskAsync(userId, taskId, t =>
        {
            t.Title = title;
            t.Notes = notes;
            t.DueDate = dueDate;
            t.Priority = priority;
        });
    }

    /// <summary>Marks a task as done or not done.</summary>
    public Task SetCompletedAsync(string userId, int taskId, bool completed) =>
        ChangeTaskAsync(userId, taskId, t => t.Completed = completed);

    /// <summary>Deletes a single task.</summary>
    public async Task DeleteTaskAsync(string userId, int taskId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var task = await FindTaskAsync(db, userId, taskId);
        db.TodoTasks.Remove(task);
        await db.SaveChangesAsync();
        notifier.Notify(task.ListId);
    }

    /// <summary>Deletes every completed task in a list.</summary>
    public async Task ClearCompletedAsync(string userId, int listId)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        await RequireMemberAsync(db, listId, userId);
        await db.TodoTasks.Where(t => t.ListId == listId && t.Completed).ExecuteDeleteAsync();
        notifier.Notify(listId);
    }

    // ---------- Validation ----------

    private static string ValidateListName(string name)
    {
        name = name.Trim();
        if (name.Length == 0) throw new TodoException("List name is required.");
        if (name.Length > MaxListNameLength) throw new TodoException($"List name can be at most {MaxListNameLength} characters.");
        return name;
    }

    private static string ValidateTitle(string title)
    {
        title = title.Trim();
        if (title.Length == 0) throw new TodoException("Task title is required.");
        if (title.Length > MaxTitleLength) throw new TodoException($"Task title can be at most {MaxTitleLength} characters.");
        return title;
    }

    private static string ValidateColor(string color) =>
        HexColorPattern().IsMatch(color) ? color : throw new TodoException("Pick one of the list colors.");

    [GeneratedRegex("^#[0-9a-fA-F]{6}$")]
    private static partial Regex HexColorPattern();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailPattern();

    // ---------- Helpers ----------

    private async Task ChangeTaskAsync(string userId, int taskId, Action<TodoTask> change)
    {
        await using var db = await dbFactory.CreateDbContextAsync();
        var task = await FindTaskAsync(db, userId, taskId);
        change(task);
        task.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        notifier.Notify(task.ListId);
    }

    private static async Task<TodoTask> FindTaskAsync(ApplicationDbContext db, string userId, int taskId)
    {
        var task = await db.TodoTasks.FindAsync(taskId) ?? throw new TodoException("That task no longer exists.");
        await RequireMemberAsync(db, task.ListId, userId);
        return task;
    }

    private static async Task<ListRole> RequireMemberAsync(ApplicationDbContext db, int listId, string userId)
    {
        var member = await db.ListMembers.AsNoTracking().FirstOrDefaultAsync(m => m.ListId == listId && m.UserId == userId);
        return member?.Role ?? throw new TodoException("You don't have access to that list.");
    }

    private static async Task RequireOwnerAsync(ApplicationDbContext db, int listId, string userId)
    {
        if (await RequireMemberAsync(db, listId, userId) != ListRole.Owner)
            throw new TodoException("Only the list owner can do that.");
    }
}
