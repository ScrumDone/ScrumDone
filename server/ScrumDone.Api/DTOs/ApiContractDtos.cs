namespace ScrumDone.Api.DTOs;

public class PagedQueryDto : IPagination, ISearch, ISort
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}

public abstract class EntityDto
{
    public Guid Id { get; set; }
}

public abstract class AuditedEntityDto : EntityDto
{
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}

public class CompanyDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
    public string? Nip { get; set; }
    public string? Krs { get; set; }
    public string? Regon { get; set; }
    public string? Address { get; set; }
}

public class CompanyCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Nip { get; set; }
    public string? Krs { get; set; }
    public string? Regon { get; set; }
    public string? Address { get; set; }
}

public class CompanyUpdateDto : CompanyCreateDto
{
}

public class CompanyQueryDto : PagedQueryDto
{
}

public class CompanyNoteDto : AuditedEntityDto
{
    public string Content { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid CompanyId { get; set; }
}

public class CompanyNoteCreateDto
{
    public string Content { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid CompanyId { get; set; }
}

public class CompanyNoteUpdateDto
{
    public string Content { get; set; } = string.Empty;
}

public class CompanyNoteQueryDto : PagedQueryDto
{
    public Guid? UserId { get; set; }
    public Guid? CompanyId { get; set; }
}

public class ContactPersonDto : AuditedEntityDto
{
    public Guid CompanyId { get; set; }
    public string? Email { get; set; }
    public bool IsPrimary { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
}

public class ContactPersonCreateDto
{
    public Guid CompanyId { get; set; }
    public string? Email { get; set; }
    public bool IsPrimary { get; set; }
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Role { get; set; }
}

public class ContactPersonUpdateDto : ContactPersonCreateDto
{
}

public class ContactPersonQueryDto : PagedQueryDto
{
    public Guid? CompanyId { get; set; }
}

public class CooperationLogDto : AuditedEntityDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public Guid AuthorId { get; set; }
    public Guid UserId { get; set; }
}

public class CooperationLogCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public Guid AuthorId { get; set; }
    public Guid UserId { get; set; }
}

public class CooperationLogUpdateDto : CooperationLogCreateDto
{
}

public class CooperationLogQueryDto : PagedQueryDto
{
    public Guid? AuthorId { get; set; }
    public Guid? UserId { get; set; }
}

public class FileDto : AuditedEntityDto
{
    public string OldFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? TaskId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? MessageId { get; set; }
}

public class FileCreateDto
{
    public string OldFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? TaskId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? MessageId { get; set; }
}

public class FileUpdateDto : FileCreateDto
{
}

public class FileQueryDto : PagedQueryDto
{
    public Guid? AuthorId { get; set; }
    public Guid? TaskId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? MessageId { get; set; }
    public bool? IsPublic { get; set; }
}

public class FileAccessDto : AuditedEntityDto
{
    public Guid FileId { get; set; }
    public Guid UserId { get; set; }
}

public class FileAccessCreateDto
{
    public Guid FileId { get; set; }
    public Guid UserId { get; set; }
}

public class MessageDto : AuditedEntityDto
{
    public string Text { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public Guid AuthorId { get; set; }
    public Guid TaskId { get; set; }
    public Guid? ParentMessageId { get; set; }
}

public class MessageCreateDto
{
    public string Text { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public Guid TaskId { get; set; }
    public Guid? ParentMessageId { get; set; }
}

public class MessageUpdateDto
{
    public string Text { get; set; } = string.Empty;
}

public class MessageQueryDto : PagedQueryDto
{
    public Guid? AuthorId { get; set; }
    public Guid? TaskId { get; set; }
    public Guid? ParentMessageId { get; set; }
}

public enum NotificationResourceTypeDto
{
    None,
    Task,
    Project
}

public class NotificationDto : AuditedEntityDto
{
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public Guid? AuthorId { get; set; }
    public Guid NotifiedId { get; set; }
    public Guid NotificationTypeId { get; set; }
    public Guid? ResourceId { get; set; }
    public NotificationResourceTypeDto ResourceType { get; set; }
    public Guid? SecondResourceId { get; set; }
}

public class NotificationCreateDto
{
    public string Message { get; set; } = string.Empty;
    public Guid? AuthorId { get; set; }
    public Guid NotifiedId { get; set; }
    public Guid NotificationTypeId { get; set; }
    public Guid? ResourceId { get; set; }
    public NotificationResourceTypeDto ResourceType { get; set; }
    public Guid? SecondResourceId { get; set; }
}

public class NotificationUpdateDto
{
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public Guid NotificationTypeId { get; set; }
    public Guid? ResourceId { get; set; }
    public NotificationResourceTypeDto ResourceType { get; set; }
    public Guid? SecondResourceId { get; set; }
}

public class NotificationQueryDto : PagedQueryDto
{
    public Guid? AuthorId { get; set; }
    public Guid? NotifiedId { get; set; }
    public Guid? NotificationTypeId { get; set; }
    public bool? IsRead { get; set; }
    public NotificationResourceTypeDto? ResourceType { get; set; }
    public Guid? ResourceId { get; set; }
}

public class NotificationTypeDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class NotificationTypeCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class NotificationTypeUpdateDto : NotificationTypeCreateDto
{
}

public class ProjectDto : AuditedEntityDto
{
    public Guid CompanyId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? ExpectedFinishDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsSetToScrum { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
}

public class ProjectCreateDto
{
    public Guid CompanyId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? ExpectedFinishDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsSetToScrum { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
}

public class ProjectUpdateDto : ProjectCreateDto
{
}

public class ProjectQueryDto : PagedQueryDto
{
    public Guid? CompanyId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsSetToScrum { get; set; }
}

public class ProjectUserDto : AuditedEntityDto
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
}

public class ProjectUserCreateDto
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
}

public class RaportDto : AuditedEntityDto
{
    public Guid AuthorId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class RaportCreateDto
{
    public Guid AuthorId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class RaportUpdateDto : RaportCreateDto
{
}

public class RaportQueryDto : PagedQueryDto
{
    public Guid? AuthorId { get; set; }
}

public class ReactionDto : EntityDto
{
    public string Emoji { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public Guid AuthorId { get; set; }
    public Guid CommentId { get; set; }
    public Guid? UserId { get; set; }
}

public class ReactionCreateDto
{
    public string Emoji { get; set; } = string.Empty;
    public Guid AuthorId { get; set; }
    public Guid CommentId { get; set; }
    public Guid? UserId { get; set; }
}

public class ReactionUpdateDto
{
    public string Emoji { get; set; } = string.Empty;
}

public class ReactionQueryDto : PagedQueryDto
{
    public Guid? AuthorId { get; set; }
    public Guid? CommentId { get; set; }
    public Guid? UserId { get; set; }
}

public class SprintDto : AuditedEntityDto
{
    public string? Name { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public bool IsKanban { get; set; }
    public Guid ProjectId { get; set; }
}

public class SprintCreateDto
{
    public string? Name { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public bool IsKanban { get; set; }
    public Guid ProjectId { get; set; }
}

public class SprintUpdateDto : SprintCreateDto
{
}

public class SprintQueryDto : PagedQueryDto
{
    public Guid? ProjectId { get; set; }
    public bool? IsKanban { get; set; }
}

public class TaskDto : AuditedEntityDto
{
    public Guid ProjectId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? DueDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid PriorityId { get; set; }
    public Guid? SprintId { get; set; }
    public Guid StatusId { get; set; }
    public decimal? TimeEstimate { get; set; }
    public Guid? UserId { get; set; }
    public Guid? ParentTaskId { get; set; }
}

public class TaskCreateDto
{
    public Guid ProjectId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset? DueDate { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid PriorityId { get; set; }
    public Guid? SprintId { get; set; }
    public Guid StatusId { get; set; }
    public decimal? TimeEstimate { get; set; }
    public Guid? UserId { get; set; }
    public Guid? ParentTaskId { get; set; }
    public List<Guid> AssigneeIds { get; set; } = [];
    public List<Guid> LabelIds { get; set; } = [];
}

public class TaskUpdateDto : TaskCreateDto
{
}

public class TaskQueryDto : PagedQueryDto
{
    public Guid? ProjectId { get; set; }
    public Guid? SprintId { get; set; }
    public Guid? StatusId { get; set; }
    public Guid? PriorityId { get; set; }
    public Guid? UserId { get; set; }
    public Guid? ParentTaskId { get; set; }
    public DateTimeOffset? DueBefore { get; set; }
    public DateTimeOffset? DueAfter { get; set; }
}

public class TaskAssigneeDto : AuditedEntityDto
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
}

public class TaskAssigneeCreateDto
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
}

public class TaskLabelAssignmentDto : AuditedEntityDto
{
    public Guid TaskId { get; set; }
    public Guid TaskLabelId { get; set; }
}

public class TaskLabelAssignmentCreateDto
{
    public Guid TaskId { get; set; }
    public Guid TaskLabelId { get; set; }
}

public class TaskLabelDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class TaskLabelCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class TaskLabelUpdateDto : TaskLabelCreateDto
{
}

public class TaskPriorityDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class TaskPriorityCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class TaskPriorityUpdateDto : TaskPriorityCreateDto
{
}

public class TaskStatusDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class TaskStatusCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string HexColor { get; set; } = string.Empty;
}

public class TaskStatusUpdateDto : TaskStatusCreateDto
{
}

public class UserDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public Guid UserPermissionsTypeId { get; set; }
}

public class UserCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public Guid UserPermissionsTypeId { get; set; }
}

public class UserUpdateDto : UserCreateDto
{
}

public class UserQueryDto : PagedQueryDto
{
    public Guid? UserPermissionsTypeId { get; set; }
}

public class UserPermissionsTypeDto : AuditedEntityDto
{
    public string Name { get; set; } = string.Empty;
}

public class UserPermissionsTypeCreateDto
{
    public string Name { get; set; } = string.Empty;
}

public class UserPermissionsTypeUpdateDto : UserPermissionsTypeCreateDto
{
}
