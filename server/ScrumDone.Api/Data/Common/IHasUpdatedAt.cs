namespace ScrumDone.Api.Data.Common
{
    public interface IHasUpdatedAt
    {
        DateTimeOffset UpdatedAt { get; set; }
    }
}
