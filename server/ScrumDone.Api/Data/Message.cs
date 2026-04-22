using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class Message : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }
        public string Text { get; set; }
        public bool IsEdited { get; set; } = false;

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid AuthorId { get; set; }
        public Guid TaskId { get; set; }
        public Guid? ParentMessageId { get; set; }
        public User Author { get; set; }
        public Task Task { get; set; }
        public Message? ParentMessage { get; set; }
        public List<Message> Responses { get; set; } = new();
        public List<File> Attachments { get; set; } = new();

    }
}
