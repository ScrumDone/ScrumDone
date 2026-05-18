namespace ScrumDone.Api.DTOs.Companies
{
    public record CompanyNoteDto(
        Guid Id,
        string Content,
        bool IsEdited,
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
}
