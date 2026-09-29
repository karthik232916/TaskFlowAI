using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using server.Models;

namespace server.Services;

public class AiTaskService : IAiTaskService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AiTaskService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GenerateTaskAsync(string userPrompt)
    {
        var apiKey = _configuration["Groq:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "Groq API key is not configured.");
        }

        const string endpoint =
            "https://api.groq.com/openai/v1/chat/completions";

        var systemPrompt = """
            You are a task generation assistant.
            Convert the user's request into a JSON task object containing: "title", "description", "status", "priority".

            Rules:
            - Use only information provided by the user. Do not invent details.
            - If the user does not specify a status, use "Todo".
            - If the user does not specify a priority, use "Medium".
            - If there is no description, use an empty string.
            - Allowed status values: "Todo", "InProgress", "Completed".
            - Allowed priority values: "Low", "Medium", "High".
            """;

        var requestBody = new
        {
            model = "openai/gpt-oss-20b",

            messages = new[]
            {
                new
                {
                    role = "system",
                    content = systemPrompt
                },
                new
                {
                    role = "user",
                    content = userPrompt
                }
            },

            response_format = new
            {
                type = "json_object"
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = JsonContent.Create(requestBody);

        string responseBody;

        try
        {
            using var cancellationTokenSource =
                new CancellationTokenSource(TimeSpan.FromSeconds(30));

            using var response =
                await _httpClient.SendAsync(
                    request,
                    cancellationTokenSource.Token);

            responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Groq API request failed with status code {response.StatusCode}: {responseBody}");
            }
        }
        catch (OperationCanceledException)
        {
            throw new HttpRequestException(
                "Groq API request timed out after 30 seconds.");
        }

        using var document = JsonDocument.Parse(responseBody);

        var generatedText =
            document.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

        if (string.IsNullOrWhiteSpace(generatedText))
        {
            throw new InvalidOperationException(
                "Groq returned an empty response.");
        }

        // Validate that Groq output maps correctly to AiGeneratedTask
        var task = JsonSerializer.Deserialize<AiGeneratedTask>(
            generatedText,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (task is null)
        {
            throw new InvalidOperationException(
                "Groq returned an invalid task structure.");
        }

        return JsonSerializer.Serialize(task);
    }
}
