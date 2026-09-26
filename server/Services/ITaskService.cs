using server.Models;

namespace server.Services;

public interface ITaskService
{
    Task<List<TaskItem>> GetTasksAsync();

    Task<TaskItem?> GetTaskByIdAsync(int id);

    Task<TaskItem> CreateTaskAsync(TaskItem task);

    Task<TaskItem?> UpdateTaskAsync(
        int id,
        string title,
        string description,
        string status,
        string priority
    );

    Task<bool> DeleteTaskAsync(int id);
}