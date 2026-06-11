using Riok.Mapperly.Abstractions;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Users;

namespace ScrumDone.Api.Mappers
{
    [Mapper]
    public static partial class AssignmentLabelMapper
    {
        public static partial AssignmentLabelDto ToDto(this AssignmentLabel label);

    }
}
