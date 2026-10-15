using cse325_SharedTodoList.Components;
using cse325_SharedTodoList.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.Cookies;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
// Initialize Firebase Admin SDK
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.GetApplicationDefault(),
    ProjectId = builder.Configuration["Firebase:ProjectId"]
        ?? throw new InvalidOperationException(
            "Firebase ProjectId is missing.")
});

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// HTTP client for Firebase Data Connect
builder.Services.AddHttpClient();
builder.Services.AddScoped<TodoListService>();

// Configure cookie authentication
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/login";
        options.AccessDeniedPath = "/login";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
    });

// Configure authorization services
builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();


app.MapPost("/api/auth/session", async (
    HttpContext context,
    AuthSessionRequest request) =>
{
    // Reject cross-origin session creation requests.
    var expectedOrigin = $"{context.Request.Scheme}://{context.Request.Host}";
    var requestOrigin = context.Request.Headers.Origin.ToString();

    if (!string.Equals(
        requestOrigin,
        expectedOrigin,
        StringComparison.OrdinalIgnoreCase))
    {
        return Results.StatusCode(StatusCodes.Status403Forbidden);
    }
    if (string.IsNullOrWhiteSpace(request.IdToken))
    {
        return Results.BadRequest(new
        {
            message = "An authentication token is required."
        });
    }

    try
    {
        // Verify the Firebase ID token.
        var decodedToken = await FirebaseAuth.DefaultInstance
            .VerifyIdTokenAsync(request.IdToken);

        // Create the authenticated user identity.
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid)
        };

        if (decodedToken.Claims.TryGetValue("email", out var email)
            && email is string emailAddress)
        {
            claims.Add(new Claim(ClaimTypes.Email, emailAddress));
        }

        if (decodedToken.Claims.TryGetValue("name", out var name)
            && name is string displayName)
        {
            claims.Add(new Claim(ClaimTypes.Name, displayName));
        }

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme);

        var principal = new ClaimsPrincipal(identity);

        // Establish an authenticated ASP.NET Core session.
        await context.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = false,
                AllowRefresh = true
            });

        return Results.Ok(new
        {
            message = "Authentication successful."
        });
    }
    catch (FirebaseAuthException)
    {
        return Results.Unauthorized();
    }
});

app.MapPost("/api/auth/logout", async (HttpContext context) =>
{
    // Only accept requests from the application's own origin.
    var expectedOrigin =
        $"{context.Request.Scheme}://{context.Request.Host}";

    var requestOrigin =
        context.Request.Headers.Origin.ToString();

    if (!string.Equals(
        requestOrigin,
        expectedOrigin,
        StringComparison.OrdinalIgnoreCase))
    {
        return Results.StatusCode(
            StatusCodes.Status403Forbidden);
    }

    // Remove the ASP.NET Core authentication cookie.
    await context.SignOutAsync(
        CookieAuthenticationDefaults.AuthenticationScheme);

    return Results.Ok(new
    {
        message = "Signed out successfully."
    });
});


app.Run();

record AuthSessionRequest(string IdToken);
