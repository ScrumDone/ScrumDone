using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;


namespace ScrumDone.Api.Services
{
    public interface IUsersService
    {
        Task<PagedResultDto<UserSummaryDto>> GetUsersAsync(UserQueryDto query);

        Task<UserSummaryDto> GetUserAsync(Guid userId);
        
        Task<UserSummaryDto> EditUserAsync(Guid userId, UserUpdateDto dto);

        Task RemoveUserAsync(Guid userId);

        Task ModifyRolesAsync(Guid id, UserAddRolesDto dto);

        // Task<UserSummaryDto> GetUserByIdAsync(Guid id); 
        
        // Task<UserSummaryDto> CreateUserAsync(UserCreateDto dto);
        
        // Task<UserSummaryDto> UpdateUserAsync(Guid id, UserUpdateDto dto);
        
        // Task DeleteUserAsync(Guid id);
        
        // Task<IEnumerable<UserPermissionDto>> GetUserRolesAsync();
    }
}