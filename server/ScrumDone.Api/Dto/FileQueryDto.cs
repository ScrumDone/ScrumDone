    public class FileQueryDto : IPagination, ISort, ISearch
    {
        public List<string>? Labels { get; set; }
        public string? Search { get; set; } = null;

        public Guid? ProjectId { get; set; }
        public Guid? ClientId { get; set; }
        public Guid? AuthorId { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;

        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } 

        // optional includes, heavy data that may benefit some views
        // ensure clients know what possible includes there are
        // consider using enums on the backend
        // public List<string>? Include { get; set; } or some other structure
    }