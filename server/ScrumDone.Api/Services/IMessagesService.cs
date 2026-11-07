using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Messages;

namespace ScrumDone.Api.Services
{
    public interface IMessagesService
    {
        Task<PagedResultDto<MessageDto>> GetMessagesForAssignmentAsync(Guid id, MessagesQueryDto query);

        Task<MessageDto> CreateMessageForAssignmentAsync(Guid id, MessageCreateDto dto, Guid authorId);

        Task<MessageDto> UpdateMessageAsync(Guid id, MessageUpdateDto dto);
        
        Task DeleteMessageAsync(Guid id);
    }
}