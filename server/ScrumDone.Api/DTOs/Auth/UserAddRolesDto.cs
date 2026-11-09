using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Auth
{
    public class UserAddRolesDto
    {
        public required List<Guid> RolesIds { get; set; }
    }

}
