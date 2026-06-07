namespace ScrumDone.Api.DTOs.Users
{
    public record UserSummaryDto(
        Guid Id,
        string Name
        // string? ProfilePictureUrl // don't use it for now
    );
}
