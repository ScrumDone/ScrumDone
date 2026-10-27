using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Auth
{
    public class UserRegistrationDto
    {
        public required string Name { get; set; }
        public required string Password { get; set; }
        public required string Token { get; set; }
    }

}
