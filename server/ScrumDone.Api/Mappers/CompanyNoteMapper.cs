using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class CompanyNoteMapper
    {
        [MapProperty(nameof(CompanyNote.User),nameof(CompanyNoteDto.Author), Use = nameof(UserSummary))]
        public static partial CompanyNoteDto ToListItemDto(this CompanyNote companyNote);

        private static UserSummaryDto UserSummary(User user)
        {
            return new UserSummaryDto(user.Id, user.Name, user.ProfilePictureUrl);
        }
    }
}
