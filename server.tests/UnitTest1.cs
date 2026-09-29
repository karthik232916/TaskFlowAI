using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using server.Data;
using server.Models;
using server.Services;

namespace server.tests;

public class TaskServiceTests
{
    [Fact]
    public async Task CreateTaskAsync_ShouldCreateTaskAndInvalidateCache()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TaskFlowDbContext>()
            .UseInMemoryDatabase(
                databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new TaskFlowDbContext(options);

        var cacheMock = new Mock<IDistributedCache>();

        var loggerMock =
            new Mock<ILogger<TaskService>>();

        var service = new TaskService(
            context,
            cacheMock.Object,
            loggerMock.Object);

        var task = new TaskItem
        {
            Title = "Test task",
            Description = "Test description",
            Status = "Todo",
            Priority = "High"
        };

        // Act
        var result = await service.CreateTaskAsync(task);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test task", result.Title);
        Assert.Equal("Test description", result.Description);
        Assert.Equal("Todo", result.Status);
        Assert.Equal("High", result.Priority);

        var savedTask = await context.Tasks
            .FirstOrDefaultAsync();

        Assert.NotNull(savedTask);
        Assert.Equal("Test task", savedTask.Title);

        cacheMock.Verify(
            cache => cache.RemoveAsync(
                "tasks:all",
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetTasksAsync_WhenCacheMiss_ShouldGetFromDatabaseAndSetCache()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TaskFlowDbContext>()
            .UseInMemoryDatabase(
                databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new TaskFlowDbContext(options);

        var task = new TaskItem
        {
            Title = "Cached task",
            Description = "Testing cache miss",
            Status = "Todo",
            Priority = "Medium"
        };

        context.Tasks.Add(task);
        await context.SaveChangesAsync();

        var cacheMock = new Mock<IDistributedCache>();

        cacheMock
            .Setup(cache => cache.GetAsync(
                "tasks:all",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((byte[]?)null);

        var loggerMock =
            new Mock<ILogger<TaskService>>();

        var service = new TaskService(
            context,
            cacheMock.Object,
            loggerMock.Object);

        // Act
        var result = await service.GetTasksAsync();

        // Assert
        Assert.Single(result);

        Assert.Equal(
            "Cached task",
            result[0].Title);

        cacheMock.Verify(
            cache => cache.SetAsync(
                "tasks:all",
                It.IsAny<byte[]>(),
                It.IsAny<DistributedCacheEntryOptions>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task GetTasksAsync_WhenCacheHit_ShouldReturnCachedTasks()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TaskFlowDbContext>()
            .UseInMemoryDatabase(
                databaseName: Guid.NewGuid().ToString())
            .Options;

        await using var context = new TaskFlowDbContext(options);

        var cachedTasks = new List<TaskItem>
        {
            new TaskItem
            {
                Id = 100,
                Title = "Cached task",
                Description = "Loaded from Redis",
                Status = "Todo",
                Priority = "High"
            }
        };

        var cachedJson = JsonSerializer.Serialize(cachedTasks);
        var cachedBytes = Encoding.UTF8.GetBytes(cachedJson);

        var cacheMock = new Mock<IDistributedCache>();

        cacheMock
            .Setup(cache => cache.GetAsync(
                "tasks:all",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedBytes);

        var loggerMock =
            new Mock<ILogger<TaskService>>();

        var service = new TaskService(
            context,
            cacheMock.Object,
            loggerMock.Object);

        // Act
        var result = await service.GetTasksAsync();

        // Assert
        Assert.Single(result);

        Assert.Equal(
            "Cached task",
            result[0].Title);

        Assert.Equal(
            "Loaded from Redis",
            result[0].Description);

        Assert.Equal(
            "High",
            result[0].Priority);

        cacheMock.Verify(
            cache => cache.GetAsync(
                "tasks:all",
                It.IsAny<CancellationToken>()),
            Times.Once);

        cacheMock.Verify(
            cache => cache.SetAsync(
                It.IsAny<string>(),
                It.IsAny<byte[]>(),
                It.IsAny<DistributedCacheEntryOptions>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
