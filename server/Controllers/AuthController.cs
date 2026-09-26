using Microsoft.AspNetCore.Mvc;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    public record LoginRequest(
        string Email,
        string Password);

    public record LoginResponse(
        string Token);

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        LoginRequest request)
    {
        var token = await _authService.LoginAsync(
            request.Email,
            request.Password);

        if (token is null)
        {
            return Unauthorized();
        }

        return Ok(new LoginResponse(token));
    }
}