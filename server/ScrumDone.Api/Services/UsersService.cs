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
    }
}