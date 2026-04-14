namespace ScrumDone.Api.Data
{
    public class CooperationLog
    {
        public Guid Id { get; set; }
        public DateTimeOffset Date { get; set; } = DateTimeOffset.UtcNow;
        public string Title { get; set; }
        public string Description { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
    }
}
