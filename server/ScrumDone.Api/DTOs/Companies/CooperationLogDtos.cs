using ScrumDone.Api.DTOs.Users;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Companies
{
    public record CooperationLogDto(
        Guid Id,
        string Title,
        string? Description,
        string? OldValue,
        string? NewValue,
        UserSummaryDto Author,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt
    );

    public class CooperationLogCreateDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
    }


    public class CooperationLogUpdateDto
    {
        private readonly HashSet<string> _setProperties = new();
        [JsonIgnore]
        public IReadOnlySet<string> SetProperties => _setProperties;

        public string? Title
        {
            get => field;
            set { field = value; if (value != null) _setProperties.Add(nameof(Title)); }
        }
        public string? Description
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Description)); }
        }

        public string? OldValue
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(OldValue)); }
        }

        public string? NewValue
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(NewValue)); }
        }
    }


    public class CooperationLogQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }
}
