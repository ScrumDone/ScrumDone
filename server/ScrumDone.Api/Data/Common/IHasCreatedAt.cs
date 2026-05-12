namespace ScrumDone.Api.Data.Common
{
    public interface IHasCreatedAt
    {
        DateTimeOffset CreatedAt { get; set; }
    }
}
