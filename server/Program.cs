using Microsoft.EntityFrameworkCore;
using server.Data;
using server.GraphQL;
using server.Services;

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

builder.AddGraphQL()
    .AddQueryType<TaskQueries>()
    .AddMutationType<TaskMutations>();

var app = builder.Build();

app.UseCors("Client");

app.MapControllers();

app.MapGraphQL();

app.Run();