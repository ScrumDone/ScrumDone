using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.DTOs.Companies
{
    public record CompanyNoteDto(
        Guid Id,
        string Content,
        //bool IsEdited,
        UserSummaryDto Author,
        DateTimeOffset CreatedAt,
        DateTimeOffset UpdatedAt
    );

    public record CompanyNoteCreateDto(
        string Content
    );

    public record CompanyNoteUpdateDto(
        string Content
    );

    public record CompanyNoteQueryDto(
        int Page = 1,
        int Limit = 10
    );
}
