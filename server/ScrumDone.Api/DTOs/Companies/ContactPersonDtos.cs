using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Companies
{
    public record ContactPersonDto(
        Guid Id,
        string? Name,
        string? Role,
        string? Email,
        string? Phone,
        bool? IsPrimary
    );
    public class ContactPersonCreateDto
    {
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public bool? IsPrimary { get; set; }
    }

    public class ContactPersonUpdateDto
    {
        private readonly HashSet<string> _setProperties = new();
        [JsonIgnore]
        public IReadOnlySet<string> SetProperties => _setProperties;

        public string? Name
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Name)); }
        }
        public string? Role
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Role)); }
        }
        public string? Email
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Email)); }
        }
        public string? Phone
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Phone)); }
        }
        public bool? IsPrimary
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(IsPrimary)); }
        }
    }

    public class ContactPersonQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }
}
