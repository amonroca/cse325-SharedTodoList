# ---------- Build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so this layer is cached when only code changes.
COPY SharedTodoList/SharedTodoList.csproj SharedTodoList/
RUN dotnet restore SharedTodoList/SharedTodoList.csproj

COPY SharedTodoList/ SharedTodoList/
RUN dotnet publish SharedTodoList/SharedTodoList.csproj -c Release -o /app --no-restore

# ---------- Run ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .

# Render routes traffic to port 10000 and terminates HTTPS in front of the app.
ENV ASPNETCORE_HTTP_PORTS=10000 \
    ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
EXPOSE 10000

USER $APP_UID
ENTRYPOINT ["dotnet", "SharedTodoList.dll"]
