namespace SharedTodoList.Services;

// Singleton that tells every open dashboard when a list changes, so collaborators see updates live.
public class ListChangeNotifier
{
    public event Action<int>? ListChanged;

    public void Notify(int listId) => ListChanged?.Invoke(listId);
}
