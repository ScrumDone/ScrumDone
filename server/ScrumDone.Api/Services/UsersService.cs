using Bogus.Extensions.UnitedKingdom;
using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Assignments;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Projects;
using ScrumDone.Api.DTOs.Sprints;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Mappers;
using ScrumDone.Api.Exceptions;
using Bogus.DataSets;
using Bogus.Extensions.Extras;
using Microsoft.AspNetCore.Identity;

namespace ScrumDone.Api.Services
{
    public class UsersService : IUsersService
    {
        private readonly AppDbContext _context;
        private RoleManager<IdentityRole<Guid>> _roleManager;
        private UserManager<User> _userManager;

        public UsersService(AppDbContext context, RoleManager<IdentityRole<Guid>> roleManager, UserManager<User> userManager)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task<PagedResultDto<UserSummaryDto>> GetUsersAsync(UserQueryDto query)
        {
            var usersFromDb = await _context.Users
                .OrderByDescending(u => u.Name)
                .ToListAsync();
            
            var total = usersFromDb.Count();

            var users = usersFromDb
                .Skip((query.Page -1) * query.Limit)
                .Take(query.Limit)
                .Select(u => u.ToSummaryDto());

            return new PagedResultDto<UserSummaryDto>(users, query.Page, query.Limit, total);
        }

        public async Task<UserSummaryDto> GetUserAsync(Guid userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            {
                throw new NotFoundException(nameof(User), userId);
            }

            var userDto = user.ToSummaryDto();

            return userDto;
        }

        public async Task<UserSummaryDto> EditUserAsync(Guid userId, UserUpdateDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            {
                throw new NotFoundException(nameof(User), userId);
            }

            if (dto.SetProperties.Contains(nameof(dto.Name))) user.Name = dto.Name;
            if (dto.SetProperties.Contains(nameof(dto.ProfilePictureUrl))) user.ProfilePictureUrl = dto.ProfilePictureUrl;

            await _context.SaveChangesAsync();
            var userDto = user.ToSummaryDto();

            return userDto;
        }

        public async Task RemoveUserAsync(Guid id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user is null)
            {
                throw new NotFoundException(nameof(User), id);
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();
        } 

        public async Task ModifyRolesAsync(Guid id, UserAddRolesDto dto)
        {
            if (dto.RolesIds.Count == 0)
                throw new BadRequestException("At least one role is required.");

            var roleIds = dto.RolesIds.Distinct().ToList();

            var rolesNames = await _roleManager.Roles
                .Where(r => roleIds.Contains(r.Id))
                .Select(r => r.Name!)
                .ToListAsync();

            if (rolesNames.Count != roleIds.Count)
                throw new BadRequestException("One or more roles were not found.");

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user is null)
            {
                throw new NotFoundException(nameof(User), id);
            }

            var existingRoles = await _userManager.GetRolesAsync(user);
            var rolesToModify = rolesNames.ToList();

            if (rolesToModify.Count == 0)
                return;

            await using var transaction = await _context.Database.BeginTransactionAsync();

            foreach (var role in rolesToModify)
            {
                if (await _userManager.IsInRoleAsync(user, role))
                {
                    var result = await _userManager.RemoveFromRoleAsync(user, role);    
                    if (!result.Succeeded)
                        throw new BadRequestException(string.Join(" ", result.Errors.Select(e => e.Description)));
                }
                else
                {
                    var result = await _userManager.AddToRoleAsync(user, role);
                    if (!result.Succeeded)
                        throw new BadRequestException(string.Join(" ", result.Errors.Select(e => e.Description)));
                }
            }

            await transaction.CommitAsync();
        }
    }
}