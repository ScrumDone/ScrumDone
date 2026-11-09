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

namespace ScrumDone.Api.Services
{
    public class UsersService : IUsersService
    {
        private readonly AppDbContext _context;

        public UsersService(AppDbContext context)
        {
            _context = context;
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
    }
}