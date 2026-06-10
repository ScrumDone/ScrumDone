using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Companies
{
    public record CompanyListItemDto(
        Guid Id,
        string Name,
        string? Nip,

        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,

        ContactPersonDto? MainContact,

        int ContactPeopleCount,
        int ProjectsCount
    );

    public record CompanyDetailDto(
        Guid Id,
        string Name,
        string? Nip,
        string? Krs,
        string? Regon,
        string? Address,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,
        int ContactPeopleCount,
        int ProjectCount,
        IEnumerable<ContactPersonDto> Contacts
    );

    public class CompanyCreateDto
    {
        public required string Name { get; set; }
        public string? Nip { get; set; }
        public string? Krs { get; set; }
        public string? Regon { get; set; }
        public string? Address { get; set; }
    }

    public class CompanyUpdateDto
    {
        private readonly HashSet<string> _setProperties = new();
        [JsonIgnore]
        public IReadOnlySet<string> SetProperties => _setProperties;

        // adds property when declared in body
        // helps support the PATCH partial update logic
        //    - omission in body -> no update, don't add to set properties
        //    - null -> set to empty, add to set properties
        //    - value -> set to value, add to set properties
        // then the dto is passed to validation

        // if we ever find it cumbersome to maintain,
        // explore custom Optional<T> data type
        public string? Name
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Name)); }
        }
        public string? Nip
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Nip)); }
        }
        public string? Krs
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Krs)); }
        }
        public string? Regon
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Regon)); }
        }
        public string? Address
        {
            get => field;
            set { field = value; _setProperties.Add(nameof(Address)); }
        }
    }


    public class CompanyQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    };
}