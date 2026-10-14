# cse325-SharedTodoList

The application will allow users to create, manage, and share tasks with classmates, coworkers, or family members. This idea was chosen because it meets the assignment’s requirements (user authentication and CRUD functionality) while remaining simple enough to complete within the given timeframe.

## Group Members

- Samuel Yosias Sandoval Ramirez
- Angel David Arevalo Balcazar
- Victor Manuel Malpica Castro
- Amon Goes Roca

## Features

- **User Authentication:** Secure login system to manage individual accounts.
- **Task Management (CRUD):** Create, read, update, and delete tasks.
- **Shared Lists:** Ability to share task lists with classmates, coworkers, or family members.
- **Collaboration:** Multiple users can view and update shared tasks in real time.
- **Simple UI/UX:** Clean and intuitive interface to keep the project manageable within the course timeline.

## Target Audience

- **Students:** Organize group assignments and shared study tasks.
- **Families:** Manage household chores and responsibilities collaboratively.
- **Coworkers/Teams:** Track shared work tasks and deadlines.
- **General Users:** Anyone needing a straightforward tool to manage and share to‑do lists.

## Tech Stack

- **Frontend:** React + TypeScript (Vite) — `client/`
- **Backend:** Node.js + Express + TypeScript — `server/`
- **Database:** PostgreSQL (Neon)

## Running Locally

1. Install dependencies: `npm run install:all`
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `JWT_SECRET`.
3. Create the tables (optional; the server also does this on start): `npm run db:init`
4. Start both apps: `npm run dev`
5. Open http://localhost:5173

## Tech Stack

- **Framework:** ASP.NET Core Blazor Web App (.NET 10, Interactive Server rendering)
- **Authentication:** ASP.NET Core Identity
- **Database:** PostgreSQL (Neon) with Entity Framework Core (Npgsql)
- **Real-time collaboration:** changes are pushed to every open dashboard through Blazor Server's live connection

## Running Locally

1. Install the [.NET 10 SDK](https://dotnet.microsoft.com/download).
2. Restore the local tools (includes `dotnet-ef`):
   ```bash
   dotnet tool restore
   ```
3. Set the database connection string (stored outside the repo with user-secrets, ask the team for the value):
   ```bash
   cd SharedTodoList
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Database=...;Username=...;Password=...;SSL Mode=VerifyFull"
   ```
4. Run the app (database tables are created automatically on startup):
   ```bash
   dotnet watch
   ```
5. Open http://localhost:5051

## Project Structure

- `SharedTodoList/Data/` — EF Core models (`TodoList`, `ListMember`, `TodoTask`), `ApplicationDbContext`, and migrations
- `SharedTodoList/Services/TodoService.cs` — all list/task/sharing logic with permission checks
- `SharedTodoList/Components/Pages/Home.razor` — the main dashboard
- `SharedTodoList/Components/Todo/` — reusable UI components (task row, dialogs, composer)
- `SharedTodoList/Components/Account/` — login, registration, and account management (Identity)
- `SharedTodoList/wwwroot/app.css` — app styles (light and dark mode)

To change the database schema, edit the models and run:
```bash
dotnet ef migrations add <Name> --project SharedTodoList --output-dir Data/Migrations
```
