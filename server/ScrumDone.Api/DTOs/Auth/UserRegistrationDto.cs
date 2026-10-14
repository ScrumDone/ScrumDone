using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Auth
{
    public class UserRegistrationDto
    {
        public required string DisplayName { get; set; }
        public required string Password { get; set; }
    }

}
