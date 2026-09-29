using HotChocolate.Authorization;
using server.Models;
using server.Services;

namespace server.GraphQL;

public class TaskMutations
{
    [Authorize]
    public async Task<TaskItem> CreateTaskAsync(
        string title,
        string description,
        string status,
        string priority,
        ITaskService taskService)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new GraphQLException(
                "Task title is required.");
        }

        var validStatuses = new[]
        {
            "Todo",
            "InProgress",
            "Completed"
        };

        if (!validStatuses.Contains(status))
        {
            throw new GraphQLException(
                $"Invalid task status: {status}");
        }

        var validPriorities = new[]
        {
            "Low",
            "Medium",
            "High"
        };

        if (!validPriorities.Contains(priority))
        {
            throw new GraphQLException(
                $"Invalid task priority: {priority}");
        }

        var task = new TaskItem
        {
            Title = title,
            Description = description,
            Status = status,
            Priority = priority
        };

        return await taskService.CreateTaskAsync(task);
    }

    [Authorize]
    public async Task<TaskItem?> UpdateTaskAsync(
        int id,
        string title,
        string description,
        string status,
        string priority,
        ITaskService taskService)
    {
        return await taskService.UpdateTaskAsync(
            id,
            title,
            description,
            status,
            priority
        );
    }

    [Authorize]
    public async Task<bool> DeleteTaskAsync(
        int id,
        ITaskService taskService)
    {
        return await taskService.DeleteTaskAsync(id);
    }

    [Authorize]
    public async Task<AiGeneratedTask> GenerateTask(
        string prompt,
        IAiTaskService aiTaskService)
    {
        var json = await aiTaskService.GenerateTaskAsync(prompt);

        var task = System.Text.Json.JsonSerializer.Deserialize<AiGeneratedTask>(
            json,
            new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (task is null)
        {
            throw new GraphQLException(
                "AI failed to generate a valid task.");
        }

        if (string.IsNullOrWhiteSpace(task.Title))
        {
            throw new GraphQLException(
                "AI generated task must have a title.");
        }

        var validStatuses = new[]
        {
            "Todo",
            "InProgress",
            "Completed"
        };

        if (!validStatuses.Contains(task.Status))
        {
            throw new GraphQLException(
                $"AI generated an invalid status: {task.Status}");
        }

        var validPriorities = new[]
        {
            "Low",
            "Medium",
            "High"
        };

        if (!validPriorities.Contains(task.Priority))
        {
            throw new GraphQLException(
                $"AI generated an invalid priority: {task.Priority}");
        }

        return task;
    }
}