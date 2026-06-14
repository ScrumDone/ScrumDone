using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Sprints;

namespace ScrumDone.Api.Services
{
    public interface ISprintsService
    {
        Task<SprintDetailDto> GetSprintByIdAsync(Guid id);
        Task<SprintDetailDto> UpdateSprintAsync(Guid id, SprintUpdateDto dto);
        Task DeleteSprintAsync(Guid id);
    }
}
