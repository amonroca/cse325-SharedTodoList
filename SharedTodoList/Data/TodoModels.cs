namespace SharedTodoList.Data;

public enum ListRole { Owner, Editor }

public enum TaskPriority { Low, Medium, High }

public class TodoList
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Color { get; set; } = "#6366f1";
    public string OwnerId { get; set; } = "";
    public ApplicationUser? Owner { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<ListMember> Members { get; set; } = [];
    public List<TodoTask> Tasks { get; set; } = [];
}

// A user's access to a list. The owner also has a row here with Role = Owner.
public class ListMember
{
    public int ListId { get; set; }
    public TodoList? List { get; set; }
    public string UserId { get; set; } = "";
    public ApplicationUser? User { get; set; }
    public ListRole Role { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}

public class TodoTask
{
    public int Id { get; set; }
    public int ListId { get; set; }
    public TodoList? List { get; set; }
    public string Title { get; set; } = "";
    public string Notes { get; set; } = "";
    public DateOnly? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public bool Completed { get; set; }
    public string? CreatedById { get; set; }
    public ApplicationUser? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
