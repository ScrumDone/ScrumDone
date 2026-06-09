using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class CompanyLogMapper
    {

        [MapProperty(nameof(CooperationLog.Author),nameof(CooperationLogDto.Author), Use = nameof(UserSummary))]
        public static partial CooperationLogDto ToListItemDto(this CooperationLog cooperationLog);

        private static UserSummaryDto UserSummary(User user)
        {
            return new UserSummaryDto(user.Id, user.Name, user.ProfilePictureUrl);
        }
    }
}
