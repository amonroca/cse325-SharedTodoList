using Microsoft.AspNetCore.Identity;

namespace SharedTodoList.Data;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = "";
}
