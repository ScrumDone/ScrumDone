namespace ScrumDone.Api.Data
{
    public class File
    {
        public Guid Id { get; set; }
        public string OldFileName { get; set; }
        public string FilePath { get; set; }
        public bool Ispublic { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Guid? TaskId { get; set; }
        public Guid? ProjectId { get; set; }
        public Task Task { get; set; }
        public Guid? Project { get; set; }

    }
}
