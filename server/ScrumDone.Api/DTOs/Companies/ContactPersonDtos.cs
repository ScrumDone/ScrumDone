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
    public record ContactPersonCreateDto(
        string? Name,
        string? Role,
        string? Email,
        string? Phone,
        bool? IsPrimary
    );

    public record ContactPersonUpdateDto(
        string? Name,
        string? Email,
        string? Phone,
        string? Role,
        bool? IsPrimary
    );

    public record ContactPersonQueryDto(
        int Page = 1,
        int Limit = 10
    );
}
