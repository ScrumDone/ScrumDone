using ScrumDone.Api.DTOs.Users;

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

    public class CompanyNoteCreateDto
    {
        public required string Content { get; set; }
    }

    public class CompanyNoteUpdateDto
    {
        public required string Content { get; set; }
    }

    public class CompanyNoteQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }
}
