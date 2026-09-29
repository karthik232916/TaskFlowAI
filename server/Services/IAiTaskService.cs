namespace server.Services;

public interface IAiTaskService
{
    Task<string> GenerateTaskAsync(string userPrompt);
}