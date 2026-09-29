using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using server.Data;
using server.Models;

namespace server.Services;

public class TaskService : ITaskService
{
    private const string TasksCacheKey = "tasks:all";

    private readonly TaskFlowDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        TaskFlowDbContext context,
        IDistributedCache cache,
        ILogger<TaskService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<TaskItem>> GetTasksAsync()
    {
        var cachedTasks = await _cache.GetStringAsync(
            TasksCacheKey);

        if (cachedTasks is not null)
        {
            _logger.LogInformation(
                "CACHE HIT: {CacheKey}",
                TasksCacheKey);

            return JsonSerializer.Deserialize<List<TaskItem>>(
                cachedTasks) ?? new List<TaskItem>();
        }

        _logger.LogInformation(
            "CACHE MISS: {CacheKey}",
            TasksCacheKey);

        var tasks = await _context.Tasks
            .AsNoTracking()
            .ToListAsync();

        var serializedTasks =
            JsonSerializer.Serialize(tasks);

        var cacheOptions =
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow =
                    TimeSpan.FromMinutes(5)
            };

        await _cache.SetStringAsync(
            TasksCacheKey,
            serializedTasks,
            cacheOptions);

        _logger.LogInformation(
            "CACHE SET: {CacheKey}, TTL: 5 minutes",
            TasksCacheKey);

        return tasks;
    }

    public async Task<TaskItem?> GetTaskByIdAsync(int id)
    {
        return await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(task => task.Id == id);
    }

    public async Task<TaskItem> CreateTaskAsync(
        TaskItem task)
    {
        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        await _cache.RemoveAsync(TasksCacheKey);

        _logger.LogInformation(
            "CACHE INVALIDATED: {CacheKey} after task creation",
            TasksCacheKey);

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

        await _cache.RemoveAsync(TasksCacheKey);

        _logger.LogInformation(
            "CACHE INVALIDATED: {CacheKey} after task update for TaskId {TaskId}",
            TasksCacheKey,
            id);

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

        await _cache.RemoveAsync(TasksCacheKey);

        _logger.LogInformation(
            "CACHE INVALIDATED: {CacheKey} after task deletion for TaskId {TaskId}",
            TasksCacheKey,
            id);

        return true;
    }
}