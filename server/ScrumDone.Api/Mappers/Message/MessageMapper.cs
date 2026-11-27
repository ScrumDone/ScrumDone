using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Messages;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class MessageMapper
    {
        [MapProperty(nameof(Message.Author),nameof(MessageDto.AuthorProfile), Use = nameof(UserSummary))]
        public static partial MessageDto ToDto(this Message message);

        private static UserSummaryDto UserSummary(User user)
        {
            return new UserSummaryDto(user.Id, user.Name);
        }

    }
}
