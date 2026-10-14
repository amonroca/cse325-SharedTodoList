namespace SharedTodoList.Components.Todo;

public static class DueDates
{
    public static DateOnly Today => DateOnly.FromDateTime(DateTime.Now);

    public static bool IsOverdue(DateOnly? date) => date < Today;

    public static string Format(DateOnly date)
    {
        if (date == Today) return "Today";
        if (date == Today.AddDays(1)) return "Tomorrow";
        return date.Year == Today.Year ? date.ToString("MMM d") : date.ToString("MMM d, yyyy");
    }
}
