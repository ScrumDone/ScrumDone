using ScrumDone.Api.DTOs.Users;

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

    public record CooperationLogCreateDto(
        string? Title,
        string? Description
    );

    public record CooperationLogUpdateDto(
        string? Title,
        string? Description
    );

    public record CooperationLogQueryDto(
        int Page = 1,
        int Limit = 10
    );
}
