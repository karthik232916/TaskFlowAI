using server.Models;
using server.Services;

namespace server.GraphQL;

public class TaskQueries
{
    public async Task<List<TaskItem>> GetTasksAsync(
        ITaskService taskService)
    {
        return await taskService.GetTasksAsync();
    }

    public async Task<TaskItem?> GetTaskByIdAsync(
        int id,
        ITaskService taskService)
    {
        return await taskService.GetTaskByIdAsync(id);
    }
}