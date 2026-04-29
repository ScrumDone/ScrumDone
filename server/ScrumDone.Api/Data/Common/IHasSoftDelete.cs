namespace ScrumDone.Api.Data.Common
{
    public interface IHasSoftDelete
    {
        bool IsDeleted { get; set; }
        DateTimeOffset? DeletedAt { get; set; }
    }
}
