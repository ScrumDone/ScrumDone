using Bogus.DataSets;
using Bogus.Extensions.UnitedKingdom;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ScrumDone.Api.Data;
using ScrumDone.Api.DTOs.Auth;
using ScrumDone.Api.DTOs.Common;
using ScrumDone.Api.DTOs.Users;
using ScrumDone.Api.Exceptions;
using ScrumDone.Api.Mappers;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.NetworkInformation;
using System.Reflection.Emit;
using System.Security.Cryptography;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ScrumDone.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private SignInManager<User> _signInManager;
        private RoleManager<IdentityRole<Guid>> _roleManager;
        private UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, UserManager<User> userManager, 
            RoleManager<IdentityRole<Guid>> roleManager, SignInManager<User> signInManager, 
            IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        private static byte[] HashToken(string token) =>
            SHA256.HashData(Encoding.UTF8.GetBytes(token));

        public async Task InviteUser(UserInvitationDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            var userName = dto.UserName.Trim();
            var normalizedEmail = _userManager.NormalizeEmail(email);
            var normalizedUserName = _userManager.NormalizeName(userName);

            if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail))
                throw new ConflictException($"Some user already uses this email address: {email}");

            if (await _context.Users.AnyAsync(u => u.NormalizedUserName == normalizedUserName))
                throw new ConflictException($"Some user already uses this username: {userName}");

            if (await _context.Invitations.AnyAsync(i => i.UserName.ToLower() == userName.ToLower() && i.Email != email))
                throw new ConflictException($"This username is already reserved by a pending invitation: {userName}");

            var roleIds = dto.Roles.Distinct().ToList();
            if (roleIds.Count == 0)
                throw new BadRequestException("At least one role is required.");

            var found = await _roleManager.Roles.Where(r => roleIds.Contains(r.Id)).CountAsync();
            if (found != roleIds.Count)
                throw new BadRequestException("One or more roles were not found.");

            // in the future look out for expired invites
            var previous = await _context.Invitations.Where(i => i.Email == email).ToListAsync();
             _context.Invitations.RemoveRange(previous);

            var token = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

            var invitation = new UserInvitation
            {
                UserName = userName,
                Email = email,
                RoleIds = roleIds,
                TokenHash = HashToken(token)
            };

            _context.Invitations.Add(invitation);
            await _context.SaveChangesAsync();
            var baseUrl = _configuration["Frontend:BaseUrl"]!.TrimEnd('/');
            var invitationLink = $"{baseUrl}/auth/invite?id={invitation.Id}&token={token}";

            Console.WriteLine($"This invitation is: {invitationLink}");

            return;
        }

        public async Task RegisterUser(Guid id, UserRegistrationDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Id == id)
                ?? throw new BadRequestException("There is no invitation for this id.");

            var roleNames = await _roleManager.Roles
                .Where(r => invitation.RoleIds.Contains(r.Id))
                .Select(r => r.Name!)
                .ToListAsync();

            // we use fixed time equals to prevent timing attacks
            if (!CryptographicOperations.FixedTimeEquals(invitation.TokenHash, HashToken(dto.Token)))
            {
                throw new BadRequestException("There is no invitation for this id.");
            }

            if (invitation.ExpiresAt < DateTimeOffset.UtcNow)
            {
                throw new BadRequestException("This invitation has expired.");
            }

            if (await _context.Users.AnyAsync(u => u.Name.ToLower() == dto.Name.ToLower()))
            {
                throw new ConflictException($"Some user already uses this username: {dto.Name}");
            }

            var user = new User
            {
                Name = dto.Name,
                Email = invitation.Email,
                UserName = invitation.UserName,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                throw new BadRequestException(errors);
            }

            var roles = await _userManager.AddToRolesAsync(user, roleNames);
            if (!roles.Succeeded)
                throw new BadRequestException(string.Join(" ", roles.Errors.Select(e => e.Description)));

            _context.Invitations.Remove(invitation);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return;
        }

        public async Task ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user is null)
            {
                return;
            }

            var rawToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(rawToken));

            var baseUrl = _configuration["Frontend:BaseUrl"]!.TrimEnd('/');
            var resetLink = $"{baseUrl}/auth/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

            Console.WriteLine(resetLink);

            return;
        }

        public async Task ResetPassword(ResetPasswordDto dto)
        {
            const string invalidLink = "This reset link is invalid or has expired.";

            var user = await _userManager.FindByEmailAsync(dto.Email)
                ?? throw new BadRequestException(invalidLink);

            string decodedToken;
            try
            {
                var tokenBytes = WebEncoders.Base64UrlDecode(dto.Token);
                decodedToken = Encoding.UTF8.GetString(tokenBytes);
            }
            catch (FormatException)
            {
                throw new BadRequestException(invalidLink);
            }

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
            if (!result.Succeeded)
            {
                if (result.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.InvalidToken)))
                    throw new BadRequestException(invalidLink);

                throw new BadRequestException(string.Join(" ", result.Errors.Select(e => e.Description)));
            }
        }

        public async Task Login(LoginDto dto)
        {
            var result = await _signInManager.PasswordSignInAsync(
                userName: dto.UserName,
                password: dto.Password,
                isPersistent: dto.RememberMe,
                lockoutOnFailure: false);

            if (!result.Succeeded)
            {
                throw new BadRequestException("Incorrect username or password.");
            }

            return;
        }

        public async Task Logout()
        {
            await _signInManager.SignOutAsync();

            return;
        }

        public async Task<IEnumerable<RoleDto>> GetRoles()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            List<RoleDto> results = new List<RoleDto>();

            foreach (var role in roles)
            {
                results.Add(new RoleDto(role.Id, role.Name));
            }

            return results;
        }
    }
    
}
