using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Auth
{
    public class UserInvitationDto
    {
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required Guid RoleId { get; set; }
    }

}
