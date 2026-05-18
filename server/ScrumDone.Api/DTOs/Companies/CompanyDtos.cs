using ScrumDone.Api.Data;

namespace ScrumDone.Api.DTOs.Companies
{
    public record CompanyListItemDto(
        Guid Id,
        string Name,
        string? Nip,

        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,

        ContactPerson MainContact,

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
        int ProjectCount,
        IEnumerable<ContactPersonDto> Contacts
    );

    public record CompanyCreateDto(
        string Name,
        string? Nip,
        string? Krs,
        string? Regon,
        string? Address
    );

    public record CompanyUpdateDto(
        string? Name,
        string? Nip,
        string? Krs,
        string? Regon,
        string? Address
    );
}
