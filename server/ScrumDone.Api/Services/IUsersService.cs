using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;


namespace ScrumDone.Api.Services
{
    public interface IUsersService
    {
        Task<PagedResultDto<UserSummaryDto>> GetUsersAsync();

        Task<UserSummaryDto> GetUserByIdAsync(Guid id); 
        
        Task<UserSummaryDto> CreateUserAsync(UserCreateDto dto);
        
        Task<UserSummaryDto> UpdateUserAsync(Guid id, UserUpdateDto dto);
        
        Task DeleteUserAsync(Guid id);
        
        Task<IEnumerable<UserPermissionDto>> GetUserRolesAsync();
    }
}