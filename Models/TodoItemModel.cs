
namespace cse325_SharedTodoList.Models;

public class TodoItemModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string Information { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public bool IsCompleted { get; set; } = false;
}
