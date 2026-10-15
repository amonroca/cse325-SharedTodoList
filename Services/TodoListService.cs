
using cse325_SharedTodoList.Models;

namespace cse325_SharedTodoList.Services;

public class TodoListService
{
    private readonly List<TodoListModel> _lists = new();

    public IReadOnlyList<TodoListModel> GetLists()
    {
        return _lists.AsReadOnly();
    }

    public TodoListModel? GetListById(Guid id)
    {
        return _lists.FirstOrDefault(list => list.Id == id);
    }

    public TodoListModel CreateList(
        string title,
        string description = "")
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException(
                "List title is required.",
                nameof(title));
        }

        var newList = new TodoListModel
        {
            Title = title.Trim(),
            Description = description.Trim()
        };

        _lists.Add(newList);

        return newList;
    }

    
    public TodoItemModel AddTask(
        Guid listId,
        string title,
        string information = "")
    {
        var list = GetListById(listId);

        if (list is null)
        {
            throw new InvalidOperationException(
                "The requested list does not exist.");
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException(
                "Task title is required.",
                nameof(title));
        }

        var newTask = new TodoItemModel
        {
            Title = title.Trim(),
            Information = information.Trim(),
            CreatedDate = DateTime.UtcNow,
            IsCompleted = false
        };

        list.Items.Add(newTask);

        return newTask;
    }


    public int GetTotalLists()
    {
        return _lists.Count;
    }

    public int GetPendingTasks()
    {
        return _lists.Sum(list => list.PendingTasks);
    }

    public int GetCompletedTasks()
    {
        return _lists.Sum(list => list.CompletedTasks);
    }

    public bool ToggleTaskCompletion(Guid listId, Guid taskId)
    {
        var list = GetListById(listId);

        if (list is null)
            return false;

        var task = list.Items.FirstOrDefault(item => item.Id == taskId);

        if (task is null)
            return false;

        task.IsCompleted = !task.IsCompleted;

        return true;
    }

    public bool DeleteTask(Guid listId, Guid taskId)
    {
        var list = GetListById(listId);

        if (list is null)
            return false;

        var task = list.Items.FirstOrDefault(item => item.Id == taskId);

        if (task is null)
            return false;

        return list.Items.Remove(task);
    }

    public bool UpdateTask(
        Guid listId,
        Guid taskId,
        string title,
        string information)
    {
        var list = GetListById(listId);

        if (list is null || string.IsNullOrWhiteSpace(title))
            return false;

        var task = list.Items.FirstOrDefault(item => item.Id == taskId);

        if (task is null)
            return false;

        task.Title = title.Trim();
        task.Information = information?.Trim() ?? string.Empty;

        return true;
    }
    public bool UpdateList(Guid listId, string title, string description)
    {
        var list = GetListById(listId);

        if (list is null || string.IsNullOrWhiteSpace(title))
            return false;

        list.Title = title.Trim();
        list.Description = description?.Trim() ?? string.Empty;

        return true;
    }
    public bool DeleteList(Guid listId)
    {
        var list = GetListById(listId);

        if (list is null)
            return false;

        return _lists.Remove(list);
    }
}
