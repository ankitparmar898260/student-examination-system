using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using server.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    try
    {
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }
    catch
    {
        // Fallback default to MySQL 8.0.43 if server is connecting during startup
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 43)));
    }
});

// Configure CORS for Vite React frontend (port 5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Auto-create database tables on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.EnsureCreated();
        Console.WriteLine("Database and tables verified successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization notice: {ex.Message}");
    }
}

// Configure HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReactApp");

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var exceptionFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        if (exceptionFeature?.Error != null)
        {
            logger.LogError(exceptionFeature.Error, "Unhandled exception occurred while processing {Path}", exceptionFeature.Path);
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { message = "An internal server error occurred. Please try again later." });
    });
});

app.UseAuthorization();

app.MapControllers();

app.Run();
