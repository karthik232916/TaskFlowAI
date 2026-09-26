using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;

namespace server.Services;

public class TaskService : ITaskService
{
    private readonly TaskFlowDbContext _context;

    public TaskService(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskItem>> GetTasksAsync()
    {
        return await _context.Tasks
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<TaskItem?> GetTaskByIdAsync(int id)
    {
        return await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(task => task.Id == id);
    }

    public async Task<TaskItem> CreateTaskAsync(TaskItem task)
    {
        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<TaskItem?> UpdateTaskAsync(
        int id,
        string title,
        string description,
        string status,
        string priority)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(task => task.Id == id);

        if (task is null)
        {
            return null;
        }

        task.Title = title;
        task.Description = description;
        task.Status = status;
        task.Priority = priority;

        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<bool> DeleteTaskAsync(int id)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(task => task.Id == id);

        if (task is null)
        {
            return false;
        }

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return true;
    }
}