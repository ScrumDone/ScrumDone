namespace ScrumDone.Api.DTOs.Common
{
    public record PagedResultDto<T>(
        IEnumerable<T> Items,
        int Page,
        int PageSize,
        int TotalCount
    )
    {
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1 && Page <= TotalPages + 1;
    }
}
