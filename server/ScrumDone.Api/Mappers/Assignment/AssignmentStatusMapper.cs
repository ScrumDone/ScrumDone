using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Companies;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class AssignmentStatusMapper
    {
        public static partial AssignmentStatusDto ToDto(this AssignmentStatus label);

    }
}
