using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ScrumDone.Api.DTOs.Messages
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid? ParentMessageId { get; set; }
        public bool IsEdited { get; set; }
        public string Text { get; set; }
        public UserSummaryDto AuthorProfile { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class MessageCreateDto
    {
        public Guid? ParentMessageId { get; set; }
        public required string Text { get; set; }
    }

    public class MessageUpdateDto
    {
        public required string Text { get; set; }
    }

    public class MessagesQueryDto
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 50;
    };
}