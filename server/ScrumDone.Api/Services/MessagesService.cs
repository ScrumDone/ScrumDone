using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Messages;
using ScrumDone.Api.Exceptions;
using ScrumDone.Api.Mappers;

namespace ScrumDone.Api.Services
{
    public class MessagesService : IMessagesService
    {
        private readonly AppDbContext _context;

        public MessagesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<MessageDto>> GetMessagesForAssignmentAsync(Guid id, MessagesQueryDto query)
        {
            var baseQuery = _context.Messages.Where(n => n.AssignmentId == id);
            var total = await baseQuery.CountAsync();

            var messagesFromDb = await baseQuery
                .OrderByDescending(n => n.CreatedAt)
                .Skip((query.Page - 1) * query.Limit) 
                .Take(query.Limit)
                .Include(n => n.Author)
                .ToListAsync();
            
            var messages = messagesFromDb.Select(message => message.ToDto());

            var  messagesPaginated = new PagedResultDto<MessageDto>(messages, query.Page, query.Limit, total);
            return messagesPaginated;
            throw new NotImplementedException();
        }

        public async Task<MessageDto> CreateMessageForAssignmentAsync(Guid id, MessageCreateDto dto, Guid authorId)
        {
            var assignmentExist = await _context.Assignment.AnyAsync(a => a.Id == id);
            
            if (!assignmentExist) 
            {
                throw new NotFoundException(nameof(Assignment), id);
            }

            if (dto.ParentMessageId.HasValue)
            {
                var parentMessageExist = await _context.Messages.AnyAsync(m => m.Id == dto.ParentMessageId && m.AssignmentId == id);
                if (!parentMessageExist) 
                {
                    throw new NotFoundException(nameof(Message), dto.ParentMessageId.Value);
                }
            }
            

            var message = new Message
            {
                Id = Guid.NewGuid(),
                AssignmentId = id,
                ParentMessageId = dto.ParentMessageId,
                Text = dto.Text,
                AuthorId = authorId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsDeleted = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return message.ToDto(); 
        }

        public async Task<MessageDto> UpdateMessageAsync(Guid id, MessageUpdateDto dto)
        {
            var message = await _context.Messages
            .Include(m => m.Author)
            .FirstOrDefaultAsync(m => m.Id == id)
            ?? throw new NotFoundException(nameof(Message), id);

            message.Text = dto.Text;
            message.IsEdited = true;

            await _context.SaveChangesAsync();

            return message.ToDto();
        }

        public async Task DeleteMessageAsync(Guid id)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id)
            ?? throw new NotFoundException(nameof(CooperationLog), id);

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return;
        }
    }
}
