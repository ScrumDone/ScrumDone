using Bogus.DataSets;
using Bogus.Extensions.UnitedKingdom;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ScrumDone.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private SignInManager<User> _signInManager;
        private UserManager<User> _userManager;

        public AuthService(AppDbContext context, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task InviteUser(UserInvitationDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var normalizedEmail = dto.Email.Trim().ToUpper();

            if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail))
            {
                throw new ConflictException($"Some user already uses this email address: {dto.Email}");
            }

            if (await _context.Invitations.AnyAsync(i => i.NormalizedEmail == normalizedEmail)){
                throw new ConflictException($"Invitation for this email address already exists: {dto.Email}");
            }

            var normalizedUserName = dto.UserName.Trim().ToUpper();

            if (await _context.Users.AnyAsync(u => u.NormalizedUserName == normalizedUserName))
            {
                throw new ConflictException($"Some user already uses this username: {dto.UserName}");
            }

            if (await _context.Invitations.AnyAsync(i => i.UserName.Trim().ToUpper() == normalizedUserName))
            {
                throw new ConflictException($"Invitation for this username already exists: {dto.UserName}");
            }

            var user = new User
            {
                UserName = dto.UserName,
                Email = dto.Email,
                EmailConfirmed = false,
                UserPermissionsTypeId = dto.RoleId
            };

            var userCreationResult = await _userManager.CreateAsync(user);
            if (!userCreationResult.Succeeded)
            {
                var errors = string.Join("; ", userCreationResult.Errors.Select(e => e.Description));
                throw new BadRequestException($"Could not create user: {errors}");
            }

            // może invitation powinno mieć id usera
            var invitation = new UserInvitation{
                UserName = dto.UserName,
                NormalizedEmail = normalizedEmail
            };

            _context.Invitations.Add(invitation);
            await _context.SaveChangesAsync();

            Console.WriteLine($"This invitation ID is: {invitation.Id}");

            await transaction.CommitAsync();

            return;
        }

        public async Task RegisterUser(Guid id, UserRegistrationDto dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Id == id);

            if (invitation is null)
            {
                throw new BadRequestException("There is no invitation for this id.");
            }

            var user = await _userManager.FindByNameAsync(invitation.UserName);
            if (user is null)
            {
                _context.Invitations.Remove(invitation);
                await _context.SaveChangesAsync();
                throw new BadRequestException("There is no user for which this inviation was created.");
            }

            user.Name = dto.DisplayName;

            var result = await _userManager.AddPasswordAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                throw new BadRequestException($"Password does not meet expectations: {errors}");
            }

            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);


            _context.Invitations.Remove(invitation);

            await _context.SaveChangesAsync();     

            await transaction.CommitAsync();       

            return;
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
    }

    
}
