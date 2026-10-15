
namespace cse325_SharedTodoList.Models;

public class TodoListModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<TodoItemModel> Items { get; set; } = new();

    public int TotalTasks => Items.Count;

    public int CompletedTasks => Items.Count(item => item.IsCompleted);

    public int PendingTasks => TotalTasks - CompletedTasks;
}
