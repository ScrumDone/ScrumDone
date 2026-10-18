namespace ScrumDone.Api.DTOs.Auth
{
    public class ResetPasswordDto
    {
        public required string Email { get; set; }
        public required string NewPassword { get; set; }
        public required string Token { get; set; }
    }

}