using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;

namespace ScrumDone.Api.DTOs.Companies
{
    public record CompanyListItemDto(
        Guid Id,
        string Name,
        string? Nip,

        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt,

        ContactPersonDto MainContact,

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

    public record CompanyQueryDto(
        int Page = 1,
        int Limit = 10
    );
}