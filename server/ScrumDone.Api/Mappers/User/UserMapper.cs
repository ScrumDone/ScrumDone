using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Data;
using Riok.Mapperly.Abstractions;


namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class UserMapper
    {
        public static partial UserSummaryDto ToSummaryDto(this User user);

    }
}