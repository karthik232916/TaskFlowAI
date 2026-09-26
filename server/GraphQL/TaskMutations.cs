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
}