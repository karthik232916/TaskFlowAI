using server.Models;

namespace server.Services;

public interface ITaskService
{
    Task<List<TaskItem>> GetTasksAsync();

    Task<TaskItem?> GetTaskByIdAsync(int id);

    Task<TaskItem> CreateTaskAsync(TaskItem task);
}