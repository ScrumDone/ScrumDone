using Microsoft.EntityFrameworkCore;
using ScrumDone.Api.Data;

namespace ScrumDone.Api.Services
{
    public class CompaniesService
    {
        private readonly AppDbContext _context;

        public CompaniesService(AppDbContext context)
        {
            _context = context;
        }
    }
}
