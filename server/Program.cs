using Microsoft.EntityFrameworkCore;
using server.Data;
using server.GraphQL;
using server.Services;
using Microsoft.AspNetCore.Identity;
using server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<TaskFlowDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("TaskFlowDatabase")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("Client", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddScoped<ITaskService, TaskService>();

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>(); 

builder.Services.AddScoped<AuthService>();

builder.AddGraphQL()
    .AddAuthorization()
    .AddQueryType<TaskQueries>()
    .AddMutationType<TaskMutations>();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT issuer is missing.");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT audience is missing.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)),

                ValidateLifetime = true
            };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("Client");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapGraphQL();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<TaskFlowDbContext>();

    var passwordHasher =
        scope.ServiceProvider
        .GetRequiredService<IPasswordHasher<User>>();

    if (!db.Users.Any())
    {
        var user = new User
        {
            Email = "karthik@taskflow.local",
            Role = "User"
        };

        user.PasswordHash =
            passwordHasher.HashPassword(
                user,
                "TaskFlow@123");

        db.Users.Add(user);
        db.SaveChanges();
    }
}

app.Run();