using Microsoft.AspNetCore.Identity;
using ScrumDone.Api.Data.Common;

namespace ScrumDone.Api.Data
{
    public class UserInvitation : IHasCreatedAt, IHasUpdatedAt, IHasSoftDelete
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserName { get; set; }
        public string Email { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }

        public List<Guid> RoleIds { get; set; } = new();
    }
}
