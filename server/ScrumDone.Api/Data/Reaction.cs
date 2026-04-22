using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    // no control fields, as not business relevant and can add big overhead quickly
    public class Reaction : IHasCreatedAt 
    {
        public Guid Id { get; set; }
        public string Emoji { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public Guid AuthorId { get; set; }
        public Guid CommentId { get; set; }

    }
}
