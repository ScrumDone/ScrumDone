public class FileDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = "file.txt";
    public string? Description { get; set; }

    public string FileType { get; set; } = "TXT";  // "PDF", "PNG"

    public DateTimeOffset CreatedAt { get; set; }

    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = "Marek";

    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }

    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }

    public bool IsPublic { get; set; }

    public List<string> Labels { get; set; } = new();

    // optional includes (only filled if requested)
    public List<UserDto>? PermittedUsers { get; set; }
}