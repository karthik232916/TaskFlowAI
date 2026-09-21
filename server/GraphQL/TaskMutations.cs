using server.Models;
using server.Services;

namespace server.GraphQL;

public class TaskMutations
{
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
}