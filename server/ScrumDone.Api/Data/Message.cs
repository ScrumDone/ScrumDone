namespace ScrumDone.Api.Data
{
    public class Message
    {
        public Guid Id { get; set; }
        public string Text { get; set; }
        public bool IsEdited { get; set; } = false;

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? DeletedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Guid AuthorId { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid? ParentMessageId { get; set; }
        public User Author { get; set; }
        public Assignment Assignment { get; set; }
        public Message? ParentMessage { get; set; }
        public List<Message> Responses { get; set; } = new();
        public List<File> Attachments { get; set; } = new();

    }
}
