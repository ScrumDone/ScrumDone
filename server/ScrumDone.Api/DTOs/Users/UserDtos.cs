using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Users
{
    public record UserSummaryDto(
        Guid Id,
        string Name,
        string? ProfilePictureUrl // don't use it for now
    );

    public class UserCreateDto
    {
        public required string Name { get; set; }
        public required Guid RoleId { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class UserUpdateDto
    {
        private readonly HashSet<string> _setProperties = new();
        [JsonIgnore]
        public IReadOnlySet<string> SetProperties => _setProperties;

        // adds property when declared in body
        // helps support the PATCH partial update logic
        //    - omission in body -> no update, don't add to set properties
        //    - null -> set to empty, add to set properties
        //    - value -> set to value, add to set properties

        public string? Name
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Name)); }
        }
        public Guid? RoleId
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(RoleId)); }
        }
        public string? ProfilePictureUrl
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(ProfilePictureUrl)); }
        }
    }

    public class UserQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }

    public class UserPermissionDto
    {
        public required string PermissionName { get; set; }
        public required Guid Id { get; set; }
    }
}
