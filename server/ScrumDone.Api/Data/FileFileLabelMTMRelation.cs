using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class FileFileLabelMTMRelation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.Now;
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public Guid FileId { get; set; }
        public Guid FileLabelId { get; set; }
        public File File { get; set; }
        public FileLabel FileLabel { get; set; }
    }
}
